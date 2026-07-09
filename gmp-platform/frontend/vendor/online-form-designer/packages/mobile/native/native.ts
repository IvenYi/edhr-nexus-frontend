import dsBridge from 'dsbridge';
import type { InternalAxiosRequestConfig } from 'axios';
import qs from 'qs';

type ARG = (arg?: any) => void;
interface BridgeParmise {
  [key: string]: any;
  path?: string;
  success?: ARG;
  fail?: ARG;
}

export const GctNative = {
  NATIVE: {
    toolbarController: function (show: boolean) {
      return dsBridge.call('NATIVE.toolbarController', { show });
    },
    getVersion: function (OBJECT: BridgeParmise) {
      const { success } = OBJECT;
      dsBridge.call('NATIVE.getVersion', function (ret: string) {
        if (ret) {
          try {
            const { data } = JSON.parse(ret);
            success && success(data);
          } catch (error) {}
        }
      });
      console.log('GctNative.NATIVE.getVersion');
    },
    getVersionSync: function () {
      return dsBridge.call('NATIVE.getVersionSync');
    },
    update: function (OBJECT: BridgeParmise) {
      const { path, success, fail } = OBJECT;
      console.log('GctNative.NATIVE.update');
      dsBridge.call(
        'NATIVE.update',
        {
          path: path,
        },
        function (ret) {
          if (ret) {
            success &&
              success({
                data: ret,
              });
          } else {
            fail &&
              fail({
                error: 'error',
              });
          }
        },
      );
    },
  },
  DATABASE: {
    update: function (OBJECT: BridgeParmise) {
      const { path, success, fail, app } = OBJECT;
      dsBridge.call(
        'DATABASE.update',
        {
          path,
          app,
        },
        function (ret) {
          const data = JSON.parse(ret);
          if (data.code === 0) {
            success && success(data);
          } else {
            fail && fail(data);
          }
        },
      );
    },
  },
  APP: {
    /**是否ipad */
    isTabletSync: function (): boolean {
      try {
        const jsonstr = dsBridge.call('APP.isTabletSync');
        const { data, code } = JSON.parse(jsonstr);
        if (code === 0) {
          return data;
        }
      } catch (error) {
        // return true;
      }
      return false;
    },
    getVersionNameSync: function () {
      const jsonstr = dsBridge.call('APP.getVersionNameSync');
      const { data, code } = JSON.parse(jsonstr);
      if (code === 0) {
        return data;
      }
    },
    getVersion: function (OBJECT: BridgeParmise) {
      const { success, fail } = OBJECT;
      dsBridge.call('APP.getVersion', function (ret: string) {
        if (ret) {
          success &&
            success({
              data: ret,
            });
        } else {
          fail &&
            fail({
              error: 'error',
            });
        }
      });
      console.log('GctNative.APP.getVersion');
    },
    getVersionSync: function () {
      console.log('GctNative.APP.getVersionSync');
      return dsBridge.call('APP.getVersionSync');
    },
    update: function (OBJECT: BridgeParmise) {
      const { path, success, fail } = OBJECT;
      console.log('GctNative.APP.update');
      dsBridge.call(
        'APP.update',
        {
          path: path,
        },
        function (ret) {
          const data = JSON.parse(ret);
          if (data.code === 0) {
            success && success(data);
          } else {
            fail && fail(data);
          }
        },
      );
    },

    getLang: function (OBJECT: BridgeParmise) {
      const { success } = OBJECT;
      dsBridge.call('APP.getLang', function (ret: string) {
        if (ret) {
          success &&
            success({
              lang: ret,
            });
        }
      });
      console.log('GctNative.APP.getLang');
    },
    getLangSync: function () {
      console.log('GctNative.APP.getLangSync');
      return dsBridge.call('APP.getLangSync');
    },
  },
  IMAGE: {
    choose: function (OBJECT: BridgeParmise) {
      const { count, extension, sourceType, success, fail } = OBJECT;
      dsBridge.call(
        'IMAGE.choose',
        {
          count, //最大上传数量
          extension, //上传格式
          sourceType, //["album", "camera"]
        },
        function (ret) {
          if (ret) {
            try {
              const { data } = JSON.parse(ret);
              success && success(data);
            } catch (error) {
              fail && fail();
            }
          }
        },
      );
    },
    preview: function (OBJECT: BridgeParmise) {
      const { current, paths, success } = OBJECT;
      dsBridge.call(
        'IMAGE.preview',
        {
          current: current,
          paths: paths,
        },
        function (ret) {
          if (ret) {
            success &&
              success({
                data: ret,
              });
          }
        },
      );
      console.log('GctNative.IMAGE.preview');
    },
  },
  VIDEO: {
    choose: function (OBJECT: BridgeParmise) {
      const { extension, sourceType, success } = OBJECT;
      dsBridge.call(
        'VIDEO.choose',
        {
          extension: extension,
          sourceType: sourceType,
        },
        function (ret) {
          if (ret) {
            try {
              const { data } = JSON.parse(ret);
              success && success(data);
            } catch (error) {}
          }
        },
      );
    },
    preview: function (OBJECT: BridgeParmise) {
      const { path, success } = OBJECT;
      dsBridge.call(
        'VIDEO.preview',
        {
          path: path,
        },
        function (ret) {
          if (ret) {
            success &&
              success({
                data: ret,
              });
          }
        },
      );
      console.log('GctNative.VIDEO.preview');
    },
  },
  FILE: {
    readAppFileAsText(OBJECT: BridgeParmise) {
      const { path, success, fail } = OBJECT;
      dsBridge.call(
        'FILE.readAppFileAsText',
        {
          path,
        },
        function (ret) {
          const { data } = JSON.parse(ret);
          try {
            const vdata = JSON.parse(data);
            success && success(vdata.data);
          } catch (error) {
            fail && fail();
          }
        },
      );
    },
    delete(OBJECT: BridgeParmise) {
      const { path, success } = OBJECT;
      dsBridge.call(
        'FILE.delete',
        {
          path,
        },
        function (ret) {
          const { data } = JSON.parse(ret);
          if (ret) {
            success &&
              success({
                localPath: data,
              });
          }
        },
      );
    },
    unzip(OBJECT: { source: string; target: string } & BridgeParmise) {
      const { source, success, target } = OBJECT;
      dsBridge.call(
        'FILE.unzip',
        {
          source,
          target,
        },
        function () {
          success && success();
        },
      );
    },
    readFileByLine(OBJECT: BridgeParmise) {
      const { path, fail, success } = OBJECT;
      dsBridge.call(
        'FILE.readFileByLine',
        {
          path,
        },
        function (ret) {
          console.log(ret);
          try {
            const { data } = JSON.parse(ret);
            success && data && success(data);
          } catch (error) {}
        },
      );
    },
    readAsText(OBJECT: BridgeParmise) {
      const { path, fail, success } = OBJECT;
      dsBridge.call(
        'FILE.readAsText',
        {
          path,
        },
        function (ret) {
          console.log(ret);
          try {
            const { data } = JSON.parse(ret);
            success && data && success(data);
          } catch (error) {}
        },
      );
    },
    choose: function (OBJECT: BridgeParmise) {
      const { count, extension, success, fail } = OBJECT;
      dsBridge.call(
        'FILE.choose',
        {
          count: count,
          extension: extension,
        },
        function (ret) {
          try {
            const { data } = JSON.parse(ret);
            success && success(data);
          } catch (error) {
            fail && fail();
          }
        },
      );
      console.log('GctNative.FILE.choose');
    },
    download: function (OBJECT: BridgeParmise) {
      const { path, success } = OBJECT;
      dsBridge.call(
        'FILE.download',
        {
          path,
        },
        function (ret) {
          if (ret) {
            const { data } = JSON.parse(ret);
            success &&
              success({
                localPath: data,
              });
          }
        },
      );
      console.log('GctNative.FILE.download');
    },
    Upload: function (object: {
      uploadUrl: string;
      headers: any;
      path: string;
      success: (arg: any) => void;
      fail?: ARG;
    }) {
      const { uploadUrl, headers, path, success, fail } = object;
      dsBridge.call(
        'FILE.upload',
        {
          uploadUrl,
          headers,
          path,
        },
        function (res) {
          console.log(res);
          try {
            const { code, data } = JSON.parse(res);
            code === 0 && data && success && success(data);
          } catch (error) {
            fail && fail();
          }
        },
      );
    },
  },
  AUDIO: {
    startRecord: function (OBJECT: BridgeParmise) {
      const { success } = OBJECT;
      dsBridge.call('AUDIO.startRecord', function (ret: string) {
        try {
          const { data } = JSON.parse(ret);
          success && success(data);
        } catch (error) {}
      });
    },
    endRecord: function (OBJECT: BridgeParmise) {
      const { success } = OBJECT;
      dsBridge.call('AUDIO.endRecord', function (ret: string) {
        try {
          const { data } = JSON.parse(ret);
          success && success(data);
        } catch (error) {}
      });
    },
    play: function (OBJECT: BridgeParmise) {
      const { path, success } = OBJECT;
      dsBridge.call(
        'AUDIO.play',
        {
          path: path,
        },
        function (ret) {
          if (ret) {
            success &&
              success({
                data: ret,
              });
          }
        },
      );
      console.log('GctNative.AUDIO.play');
    },
  },
  CAMERA: {
    scanCode: function (OBJECT: BridgeParmise) {
      const { sourceType, scanType, success, fail } = OBJECT;
      dsBridge.call(
        'CAMERA.scanCode',
        {
          sourceType: ['camera'],
          scanType: ['qrCode', 'barCode'],
        },
        function (ret) {
          if (ret) {
            try {
              const { data } = JSON.parse(ret);
              success && success(data);
            } catch (error) {
              fail && fail();
            }
          }
        },
      );
      console.log('GctNative.CAMERA.scanCode');
    },
  },
  SQLITE: {
    execute: function (OBJECT: { database: string; sql: string } & BridgeParmise): Promise<string> {
      const { database, sql } = OBJECT;
      return new Promise((resolve, reject) => {
        dsBridge.call(
          'SQLITE.execute',
          {
            database: database,
            sql: sql,
          },
          function (ret) {
            if (ret) {
              resolve(ret);
            } else {
              reject();
            }
          },
        );
      });
    },
    query: function (
      OBJECT: {
        database: string;
        sql: string;
        results: { key: string; type: string }[];
      } & BridgeParmise,
    ): Promise<string> {
      const { database, sql, results } = OBJECT;
      return new Promise((resolve, reject) => {
        dsBridge.call(
          'SQLITE.query',
          {
            database: database,
            sql: sql,
            results: results,
          },
          function (ret) {
            if (ret) {
              resolve(ret);
            } else {
              reject();
            }
          },
        );
      });
    },
  },
  MQTT: {
    subscribe: function (OBJECT: BridgeParmise) {
      const { address, port, username, password, topics, success, fail, complete, will, clientId } =
        OBJECT;
      dsBridge.call(
        'MQTT.subscribe',
        {
          address,
          port,
          username,
          password,
          topics,
          will,
          clientId,
        },
        function (ret) {
          console.log(ret, 'GctNative.MQTT.subscribe');
          if (ret) {
            success && success(ret);
          } else {
            fail &&
              fail({
                error: 'error',
              });
          }
        },
      );
    },
    subscribeTopic: function (OBJECT: BridgeParmise) {
      const { topics, success, fail, clientId } = OBJECT;
      dsBridge.call(
        'MQTT.topic',
        {
          topics,
          clientId,
        },
        function (ret) {
          if (ret) {
            success && success(ret);
          } else {
            fail &&
              fail({
                error: 'error',
              });
          }
          console.log(ret, 'GctNative.MQTT.topic');
        },
      );
    },
    unsubscribe: function (clientId?: string): Promise<void> {
      return new Promise((resolve, reject) => {
        dsBridge.call('MQTT.unsubscribe', { clientId }, function (res: string) {
          console.log(res);
          resolve();
        });
      });
    },
    publish: function (OBJECT: BridgeParmise) {
      const { topic, clientId, message } = OBJECT;
      dsBridge.call(
        'MQTT.publish',
        {
          topic,
          message,
          clientId,
        },
        function (ret) {
          console.log(ret, 'GctNative.MQTT.publish');
        },
      );
    },
    onReceive: function (callback: (data: { topic: string; message: string }) => void) {
      dsBridge.register('MQTT', {
        tag: 'MQTT',
        onReceive: function (topic: string, message: string) {
          callback({ topic, message });
        },
      });
    },
  },
  NOTIFY: {
    onClick: function (callback: (arg: any) => void) {
      dsBridge.register('NOTIFY', {
        tag: 'NOTIFY',
        onClick: (ret: string) => {
          callback(ret);
        },
      });
    },
  },
  HTTP: {
    request: function (querydata: InternalAxiosRequestConfig) {
      const { method, url, timeout, params, headers, data, baseURL } = querydata;
      const pathparam = '?' + qs.stringify(params);
      const allurl = (baseURL! + url).replace(/([^:])\/\//g, '$1/') + pathparam;
      console.info(allurl + '>>HTTP', querydata);
      const startTime = performance.now();
      return new Promise((resolve, reject) => {
        dsBridge.call(
          'HTTP.' + method,
          {
            url: allurl,
            timeout,
            headers,
            data: data && typeof data === 'string' ? JSON.parse(data) : data,
          },
          function (res) {
            const data = JSON.parse(res);
            console.info(allurl + `>>HTTP.response-耗时：${performance.now() - startTime}`, data);
            if (data.code === 0 && data.http_code === 200) {
              resolve({ ...data, config: querydata });
            } else {
              const response = { message: data.message, status: data.http_code };
              reject({ response, config: querydata });
            }
          },
        );
      });
    },
    urlDecode: function (arg: string): Promise<string> {
      return new Promise((resolve, reject) => {
        return dsBridge.call('HTTP.urlDecode', arg, function (res) {
          if (res) {
            const data = JSON.parse(res);
            if (data.code === 0) {
              resolve(data.data);
            }
          }
          reject();
        });
      });
    },
    urlDecodeSync: function (arg: string): string {
      if (!arg) return '';
      const res = dsBridge.call('HTTP.urlDecodeSync', arg);
      if (res) {
        const data = JSON.parse(res);
        if (data.code === 0) {
          return data.data;
        }
      }
    },
  },
  WEBVIEW: {
    relaunch: function ({ replace = false, hash = '' } = {}) {
      dsBridge.call(
        'WEBVIEW.relaunch',
        {
          replace: replace,
          hash,
        },
        function (res) {
          console.log(res);
        },
      );
      console.log('GctNative.WEBVIEW.relaunch');
    },
    open: function (Object: BridgeParmise) {
      const { path } = Object;
      dsBridge.call('WEBVIEW.open', {
        path: path,
      });
      console.log('GctNative.WEBVIEW.open');
    },
    close: function () {
      return dsBridge.call('WEBVIEW.close');
    },
    replace: function (Object: BridgeParmise) {
      const { path, success } = Object;
      dsBridge.call(
        'WEBVIEW.replace',
        {
          path: path,
        },
        function (ret) {
          if (ret) {
            success &&
              success({
                data: ret,
              });
          }
        },
      );
      console.log('GctNative.WEBVIEW.replace');
    },
    onShow: function (callback: () => void) {
      dsBridge.register('WEBVIEW', {
        tag: 'WEBVIEW.onShow',
        onShow: () => {
          callback();
        },
      });
    },
    onBack: function (callback: () => void) {
      console.log('WEBVIEW.onBack');
      dsBridge.register('WEBVIEW', {
        tag: 'WEBVIEW.onBack',
        onBack: () => {
          console.log('xxxxx');
          callback();
        },
      });
    },
    onBackIntercept: function () {
      dsBridge.register('WEBVIEW', {
        tag: 'WEBVIEW',
        onBackIntercept: () => {
          return false;
        },
      });
    },
  },
};
