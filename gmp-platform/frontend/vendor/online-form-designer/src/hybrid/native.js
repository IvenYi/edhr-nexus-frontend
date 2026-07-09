/**
 * GctNative类，用于定义应用与基座的交互Api
 */
class GctNative {
  /**
   * 开启webview页面，并打开指定文件
   * @example
   * dsBridge.call("openWebview", config);
   * @param {Object} config
   * @param {string} config.path - 静态资源地址
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static open(config = {}) {
    console.log('open', config);
    dsBridge.call('WEBVIEW.open', config);
  }

  /**
   * 重新加载webview页面
   * @example
   * dsBridge.call("reload", config);
   * @param {Object} config
   * @param {string} config.path - 静态资源地址
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static reload(config = {}) {
    dsBridge.call('reload', config);
  }

  /**
   * 图片选择接口
   * @example
   * dsBridge.call("chooseImage", config);
   * @param {Object} config
   * @param {number} [config.count=1] - 最多可以选择的图片张数
   * @param {string} [config.sizeType=original] - 尺寸，original原图、compressed压缩图
   * @param {string} [config.sourceType=album] - 来源，album相册、camera相机
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static chooseImage(config = {}) {
    dsBridge.call('IMAGE.choose', config, function (ret) {
      if (ret) {
        try {
          let { data } = JSON.parse(ret);
          config.success && config.success(data);
        } catch (error) {
          console.warn(error);
        }
      }
    });
  }

  /**
   * 视频选择接口
   * @example
   * dsBridge.call("chooseVideo", config);
   * @param {Object} config
   * @param {string} [config.sourceType=album] - 来源，album相册、camera相机
   * @param {number} [config.maxDuration=60] - 最长拍摄时间，单位秒
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static chooseVideo(config = {}) {
    dsBridge.call('VIDEO.choose', config, function (res) {
      try {
        let { code, data } = JSON.parse(res);
        code === 0 && data && config.success && config.success(data);
      } catch (error) {
        console.warn(error);
      }
    });
  }

  /**
   * 文件选择接口
   * @example
   * dsBridge.call("chooseFile", config);
   * @param {Object} config
   * @param {number} [config.count=1] - 最多可选文件数量
   * @param {Array} [config.ext] - 根据文件扩展名过滤，默认不过滤
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   *
   */
  static chooseFile(config = {}) {
    dsBridge.call('FILE.choose', config, function (res) {
      try {
        let { code, data } = JSON.parse(res);
        code === 0 && data && config.success && config.success(data);
      } catch (error) {
        console.warn(error);
      }
    });
  }

  /**
   * 文件上传接口，基座执行上传动作并且返回相关接口数据
   * @example
   * dsBridge.call("upload", config);
   * @param {Object} config
   * @param {string} config.url - url
   * @param {Object} config.headers - 请求头
   * @param {string[]} config.paths - 文件本地路径
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static upload(config = {}) {
    dsBridge.call('upload', config);
  }

  /**
   * 下载文件到本地，返回本地地址
   * @example
   * dsBridge.call("download", config);
   * @param {object} config
   * @param {string} config.path - 下载地址
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static download(config = {}) {
    dsBridge.call('download', config);
  }

  /**
   * 读取本地文件内容
   * @example
   * dsBridge.call("readFile", config);
   * @param {object} config
   * @param {string} config.path - 本地文件地址
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static readFile(config = {}) {
    dsBridge.call('readFile', config);
  }

  /**
   * 执行db下的sql，success中包含执行结果
   * @example
   * dsBridge.call("sqliteExecute", config);
   * @param {Object} config
   * @param {string} config.db
   * @param {string} config.sql
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static sqliteExecute(config = {}) {
    dsBridge.call('sqliteExecute', config);
  }

  /**
   * 扫码接口
   * @example
   * dsBridge.call("scanCode", config);
   * @param {Object} config
   * @param {boolean} [config.onlyFromCamera=false] - 是否只能从相机扫码，不允许从相册选择图片
   * @param {string[]} [config.scanType=['qrCode','barCode']] - 扫码类型，qrCode二维码、barCode一维码
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static scanCode(config = {}) {
    dsBridge.call(
      'CAMERA.scanCode',
      {
        ourceType: ['album', 'camera'],
        scanType: ['qrCode', 'barCode'],
      },
      function (res) {
        try {
          let { code, data } = JSON.parse(res);
          console.log(res);
          // code === 0 && data && config.success && config.success(data);
        } catch (error) {
          console.warn(error);
        }
      },
    );
  }

  /**
   * Mqtt订阅
   * @example
   * dsBridge.call("mqttSubscribe", config);
   * @param {Object} config
   * @param {string} config.address
   * @param {string} config.port
   * @param {string} config.username
   * @param {string} config.password
   * @param {string[]} config.topics - 主题
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static mqttSubscribe(config = {}) {
    dsBridge.call('mqttSubscribe', config);
  }

  /**
   * Mqtt取消订阅
   * @example
   * dsBridge.call("mqttUnsubscribe", config);
   * @param {Object} config
   * @param {string[]} config.topics - 主题
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static mqttUnsubscribe(config = {}) {
    dsBridge.call('mqttUnsubscribe', config);
  }

  /**
   * 监听Mqtt消息
   * @example
   * dsBridge.resister("onMqttMesssage", () => {});
   */
  static onMqttMessage() {
    dsBridge.resister('onMqttMesssage', () => {});
  }

  /**
   * 基座更新
   * @example
   * dsBridge.call("updateNative", config);
   * @param {Object} config
   * @param {string} config.path - 下载地址
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static updateNative(config = {}) {
    dsBridge.call('updateNative', config);
  }

  /**
   * 应用更新
   * @example
   * dsBridge.call("updateApp", config);
   * @param {Object} config
   * @param {string} config.path - 下载地址
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static updateApp(config = {}) {
    dsBridge.call('updateApp', config);
  }

  /**
   * 获取系统语言
   * @example
   * dsBridge.call("getLang", config);
   * @param {Object} config
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static getLang(config = {}) {
    dsBridge.call('getLang', config);
  }

  /**
   * 获取经纬度
   * @example
   * dsBridge.call("getLocation", config);
   * @param {Object} config
   * @param {Function} [config.success] - 执行成功的回调
   * @param {Function} [config.fail] - 执行失败的回调
   * @param {Function} [config.complete] - 执行完成的回调
   */
  static getLocation(config = {}) {
    dsBridge.call('getLocation', config);
  }

  /**
   * 监听系统消息点击
   * @example
   * dsBridge.resister("onNotifyClick", () => {});
   */
  static onNotifyClick() {
    dsBridge.resister('onNotifyClick', () => {});
  }

  // openBluetoothAdapter() {}
  // startBluetoothDevicesDiscovery() {}
  // onBluetoothDeviceFound() {}
  // stopBluetoothDevicesDiscovery() {}
  // onBluetoothAdapterStateChange() {}
}

console.log('GctNative init...');

// 退出到index
// 基座升级
// 获取基座版本
// 执行器升级
// 应用升级
