import { serverAddress } from '@mobile/stores/sessionHooks';
import { GctNative } from '@native/index';
import { _isAndroid } from '@mobile/utils/const';
import { getAppGetMobileDbFileUrlByAppId } from '/@/apis/gct-platform/AppController';
import { checkLicense } from '@mobile/utils/licenseHelper';

export class SqlitePage {
  static appId = '';
  static version = '';
  //更新db
  static async updateAppDB(appId: string, config = {}) {
    const res = checkLicense ? await checkLicense(appId, config) : null;
    if (!res) return Promise.reject();
    if (!_isAndroid) return;
    this.appId = appId;
    const dbpath = await getAppGetMobileDbFileUrlByAppId({ appId });
    this.version = dbpath?.split('/').at(-1) || '';
    if (!this.version) return Promise.reject();
    try {
      const appVn = await this.getAppVersion(appId);
      if (this.version === appVn) return;
      await this.updateAppVersion(appId, this.version);
    } catch (error) {
      await this.insertAppVersion(appId, this.version);
    }
    return new Promise((resolve, reject) => {
      GctNative.DATABASE.update({
        path: serverAddress.value + dbpath,
        app: appId,
        success: function () {
          resolve(true);
        },
        fail: function () {
          reject();
        },
      });
    });
  }
  static async getPageDb(pageId: string) {
    const res = await GctNative.SQLITE.query({
      database: this.version,
      sql: `SELECT * FROM mobile_page WHERE id_ = '${pageId}'`,
      results: [
        {
          key: 'key_',
          type: 'string',
        },
        {
          key: 'id_',
          type: 'string',
        },
        {
          key: 'name_',
          type: 'string',
        },
        {
          key: 'json_',
          type: 'string',
        },
      ],
    });
    try {
      const { data, code } = JSON.parse(res);
      if (code == 0 && !!data.length) {
        const { json_, name_: name } = data[0];
        const runtimeJson = GctNative.HTTP.urlDecodeSync(json_);
        return {
          data: {
            data: { name, runtimeJson },
            code: 200,
          },
        };
      }
    } catch (error) {}
    return Promise.reject();
  }
  /**获取服务地址 */
  static async getAppVersion(appId: string) {
    const res = await GctNative.SQLITE.query({
      database: 'gct_base_config.db',
      sql: `SELECT * FROM base_config  WHERE key = '${appId}'`,
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
        return base.value;
      }
    }
    return Promise.reject();
  }
  static async updateAppVersion(appId: string, version: string) {
    const res = await GctNative.SQLITE.execute({
      database: 'gct_base_config.db',
      sql: `UPDATE base_config SET value = '${version}' WHERE key = '${appId}'`,
    });
    const resData = JSON.parse(res);
    if (resData.code !== 0) {
      return Promise.reject();
    }
  }
  static async insertAppVersion(appId: string, version: string) {
    const res = await GctNative.SQLITE.execute({
      database: 'gct_base_config.db',
      sql: `INSERT INTO base_config (key,value) VALUES ('${appId}','${version}')`,
    });
    const resData = JSON.parse(res);
    if (resData.code !== 0) {
      return Promise.reject();
    }
  }
}
