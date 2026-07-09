import { GctNative } from '../../../native/native';
import type { MqttConfig } from './type';
import { serverAddress } from '../../stores/sessionHooks';

export default class MqttAndroid {
  static clientArray: string[] = [];
  static callbackMap: {} = {};
  static clientId;
  static async init(
    props: MqttConfig,
    callback: (topic: string, message: string) => void,
    success: Function = () => {},
  ) {
    const { username, password, topics = [], opts } = props;
    if (this.clientId === opts.clientId) return;
    if (this.clientId) this.clientArray.push(this.clientId);
    this.clientId = opts.clientId;
    let hostUrl = '';
    const NODE_ENV = process.env.NODE_ENV;
    if (NODE_ENV === 'development') {
      hostUrl = 'ws://' + import.meta.env.VITE_GLOBAL_HOST!.replace(/https?:\/\//, '');
    } else {
      hostUrl = (serverAddress.value || location.host).replace('http', 'ws');
    }
    const connectUrl = hostUrl.endsWith('/') ? `${hostUrl}mqtt` : `${hostUrl}/mqtt`;
    console.log('================== android-MQTT-config ==================', connectUrl, NODE_ENV);
    await GctNative.MQTT.subscribe({
      address: connectUrl,
      username,
      password,
      topics,
      ...opts,
      success: (res) => {
        success();
        this.callbackMap[this.clientId] = callback;
        GctNative.NOTIFY.onClick(() => {
          console.log('notify');
        });
        const { code } = JSON.parse(res);
        if (code == 0) {
          /**监听主题 */
          GctNative.MQTT.onReceive(({ topic, message }) => {
            console.log(topic, message, callback);
            this.callbackMap[this.clientId](topic, message);
          });
        }
      },
    });
  }
  /**订阅主题 */
  static subscribe(topics: Array<string> | string, clientId?: string) {
    console.log(topics, clientId, this.clientId, this.clientArray);
    return new Promise((resolve, rej) => {
      GctNative.MQTT.subscribeTopic({
        topics: typeof topics === 'string' ? [topics] : topics,
        clientId: clientId || this.clientId,
        success: (res) => {
          const { code } = JSON.parse(res);
          if (code == 0) {
            resolve();
          } else {
            rej();
          }
        },
      });
    });
  }
  /** 关闭连接 */
  static unsubscribe(clientId?: string) {
    this.clientArray = this.clientArray.filter((i) => i !== clientId);
    if (this.clientId === clientId) {
      this.clientId = this.clientArray.pop();
    }
    console.log(this.clientId, clientId, this.clientArray);
    return GctNative.MQTT.unsubscribe(clientId);
  }

  static publish(topic: string, message: string | Buffer, clientId?: string) {
    return GctNative.MQTT.publish({ topic, clientId: clientId || this.clientId, message });
  }
}
