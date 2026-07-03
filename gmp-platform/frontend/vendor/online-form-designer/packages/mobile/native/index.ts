import { gt } from 'semver';
import { getApkGetActiveApp, getAppVersion, getEdhrVersion, MODULE_ENUMS } from './api';
import { GctNative } from './native';

export { GctNative, getApkGetActiveApp };

export interface ServeConfig {
  serverAddress: string;
  tenantId?: string;
  appTag?: string;
  branchId?: string;
  env?: string;
  isPreview?: boolean | string;
  singleApp?: boolean;
  appName?: string;
  logo?: string;
}
export class ServeStart {
  static serverConfig: ServeConfig = { serverAddress: '' };
  /**清空基础数据库的表 */
  static async clearSql(name: string) {
    const res = await GctNative.SQLITE.execute({
      database: 'gct_base_config.db',
      sql: `DELETE FROM ${name}`,
    });
    this.serverConfig = { serverAddress: '' };
    const resData = JSON.parse(res);
    if (resData.code === 0) {
      return resData.data;
    } else {
      return Promise.reject();
    }
  }
  /**获取服务地址 */
  static async getServeConfig(): Promise<ServeConfig> {
    if (this.serverConfig.serverAddress) {
      return this.serverConfig;
    }
    const res = await GctNative.SQLITE.query({
      database: 'gct_base_config.db',
      sql: `SELECT * FROM base_config  WHERE key = 'serve_config'`,
      results: [
        {
          key: 'key',
          type: 'string',
        },
        {
          key: 'value',
          type: 'string',
        },
      ],
    });
    const resData = JSON.parse(res);
    if (resData.code === 0) {
      const [base] = resData.data;
      if (base) {
        this.serverConfig = JSON.parse(base.value);
        return this.serverConfig;
      }
    }
    return Promise.reject();
  }
  /**
   * 更新服务地址
   * @param value
   * @returns
   */
  static async updateServeConfig(value: Partial<ServeConfig>) {
    const serverConfig = await this.getServeConfig();
    const str = JSON.stringify({ ...serverConfig, ...value });
    const res = await GctNative.SQLITE.execute({
      database: 'gct_base_config.db',
      sql: `UPDATE base_config SET value = '${str}' WHERE key = 'serve_config'`,
    });
    const resData = JSON.parse(res);
    this.serverConfig = { ...serverConfig, ...value };
    if (resData.code === 0) {
      return resData.data;
    }
    return Promise.reject();
  }
  /**
   * 新增字段地址
   * @param value
   * @returns
   */
  static async insertServeConfig(value: ServeConfig) {
    const str = JSON.stringify(value);
    const res = await GctNative.SQLITE.execute({
      database: 'gct_base_config.db',
      sql: `INSERT INTO base_config (key,value) VALUES ('serve_config','${str}')`,
    });
    const resData = JSON.parse(res);
    if (resData.code !== 0) {
      return Promise.reject();
    }
  }

  /**
   * 更新html
   * @param serveAddress
   * @param path
   * @returns
   */
  static async unpadateHtml() {
    const { serverAddress, suiteKey } = await this.getServeConfig();
    const path = `${serverAddress}/${this.getModuleKey(suiteKey)}/app?${Math.random()}`;
    console.log('unpadateHtml', path);
    return new Promise((resolve, reject) => {
      GctNative.APP.update({
        path,
        success: function (res) {
          resolve(true);
        },
        fail: function (err) {
          reject();
        },
      });
    });
  }

  /**
   * 对比版本决定是否下载执行器
   */
  static async updateApp(callback) {
    const { serverAddress, suiteKey } = await this.getServeConfig();
    const [newVersion, version] = await Promise.all([
      this.getVersion(),
      getAppVersion(serverAddress, this.getModuleKey(suiteKey)),
    ]);
    // const newVersion = await this.getVersion();
    // const version = await getAppVersion(serverAddress, getModuleKey(suiteKey));
    console.log('newVersion', newVersion, 'version', version);
    if (newVersion !== version) {
      await callback();
    }
  }
  /**
   * 获取本地html 版本号
   * @returns
   */
  static async getVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
      GctNative.FILE.readAppFileAsText({
        path: 'dist/version.json',
        success(version: string) {
          resolve(version);
        },
        fail() {
          resolve('');
        },
      });
    });
  }
  /**
   * 更新apk
   */
  static async updateApk() {
    const { serverAddress } = await this.getServeConfig();
    const { apkVersion, apkUrl } = await getApkGetActiveApp(serverAddress);
    const res = GctNative.APP.getVersionNameSync();
    console.log('线上：' + apkVersion, res);
    // 线上版本大于本地版本时更新
    if (gt(apkVersion, res)) {
      GctNative.NATIVE.update({
        path: serverAddress + '/minio/' + apkUrl,
      });
      return Promise.reject();
    }
  }
  /**获取模块key  */
  static getModuleKey(suiteKey: string): MODULE_ENUMS {
    if (suiteKey === 'eDHR') {
      return MODULE_ENUMS.EDHR;
    }
    if (GctNative.APP.isTabletSync()) {
      return MODULE_ENUMS.IPAD;
    } else {
      return MODULE_ENUMS.MOBILE;
    }
  }
}
