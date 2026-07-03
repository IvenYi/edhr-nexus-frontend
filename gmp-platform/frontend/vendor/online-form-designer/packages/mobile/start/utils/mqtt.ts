/*
 * @Author: wangming
 * @Date: 2022-06-30 10:24:12
 * @LastEditors: wangming
 * @LastEditTime: 2022-07-05 17:52:39
 * @FilePath: /hanma-application-designer-fed/Users/wm/瀚川/hanma-paas-mobile-fed/src/utils/mqtt.js
 * @Description:
 */
import dsBridge from 'dsBridge';

export class MqttServe {
  static topics: string[] = [];
  static async init() {
    try {
      this.topics = ['USER/c0b3c294-0fd4-11ee-bb99-0242ac120002/KICK_OUT'];
      await this.unsubscribe();
      await this.subscribe();
      this.onRegisterMQTT();
      this.onRegisterNOTIFY();
    } catch (error) {}
  }
  static async subscribe() {
    const { address, port, username, password } = {};
    return new Promise((resolve, reject) => {
      dsBridge.call(
        'MQTT.subscribe',
        {
          address: 'ws://paas.dev.gct-paas.com/mqtt',
          port: undefined,
          username: 'admin',
          password: 'bb123456',
          topics: ['USER/77e6340a214f44a297b572f6a42d3af0/KICK_OUT'],
        },
        function (res) {
          const { code } = JSON.parse(res);
          console.log(res, 'subscribe');
          if (code == 0) {
            resolve({});
          } else {
            reject();
          }
        },
      );
    });
  }
  static unsubscribe() {
    return new Promise((resolve, reject) => {
      dsBridge.call('MQTT.unsubscribe', function (res) {
        console.log(res);
        const { code } = JSON.parse(res);
        if (code == 0) {
          resolve({});
        } else {
          reject();
        }
      });
    });
  }
  static topic(topics: string[]) {
    console.log(topics);
    return new Promise((resolve, reject) => {
      dsBridge.call(
        'MQTT.topic',
        {
          topics,
        },
        function (ret) {
          console.log(ret, 'GctNative.MQTT.topic');
        },
      );
    });
  }
  static onRegisterMQTT() {
    dsBridge.register('MQTT', {
      tag: 'MQTT',
      onReceive: function (topic, message) {
        console.log('xxx', topic, message);
        // callback(topic, message);
      },
    });
  }
  static onRegisterNOTIFY() {
    dsBridge.register('NOTIFY', {
      tag: 'NOTIFY',
      onClick: (a, b, c) => {
        console.log(a, b, c, 'NOTIFY');
        dsBridge.call('WEBVIEW.open', {
          path: 'dist/index.html',
        });
      },
    });
  }
}
