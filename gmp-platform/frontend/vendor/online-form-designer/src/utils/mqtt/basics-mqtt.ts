import MQTT, { type MqttClient, type IClientOptions } from 'mqtt';
import type { MqttCallFun } from './type';

/**mqtt 使用的基础类 */
export class MqttClientInstance {
  client?: MqttClient;
  config: IClientOptions;
  /**
   *订阅的主题事件集合
   *
   * @type {{topic:string,event:MqttCallFun}[]}
   * @memberof MqttClientInstance
   */
  eventListeners: { topic: string; event: MqttCallFun }[];
  constructor(config: IClientOptions) {
    this.config = config;
    this.eventListeners = [];
  }
  /**连接mqtt */
  connectMqtt(): Promise<void> {
    const { protocol, hostname, port } = location;
    const hostUrl = (
      process.env.NODE_ENV === 'development'
        ? import.meta.env.VITE_GLOBAL_HOST
        : `${protocol}//${hostname}${port ? ':' + port : ''}`
    )?.replace('http', 'ws');
    const connection = {
      // host: hostUrl,
      endpoint: '/mqtt', // 默认"/mqtt"，string
      clean: true, // 保留会话
      connectTimeout: 4000, // 超时时间
      reconnectPeriod: 4000, // 重连时间间隔
      lastWillTopic: 'maker',
      ...this.config,
    };

    const { endpoint, ...options } = connection;
    const connectUrl = `${hostUrl}${endpoint}`;

    this.client = MQTT.connect(connectUrl, options);

    this.client.on('disconnect', (error) => {
      console.info('服务器断开:', error);
    });
    // 收到后台发送的消息
    this.client.on('message', (topic, message) => {
      this.eventListeners.forEach((config) => {
        if (config.topic === topic) {
          config.event(message.toString());
        }
      });
    });
    return new Promise<void>((resolve) => {
      this.client?.on('connect', () => {
        console.log('连接成功！！！', this.config);
        resolve();
      });
    });
  }

  /**订阅主题 注册回调事件*/
  subscribe(topic: string, callback: MqttCallFun) {
    return new Promise((res, rej) => {
      this.client?.subscribe(topic, (error: any, _res: any) => {
        if (!error) {
          callback && this.eventListeners.push({ event: callback, topic });
          res(_res);
        } else {
          rej();
        }
      });
    });
  }
  /**断开连接 */
  unsubscribe() {
    this.client && this.client.end(true);
    this.client = undefined;
    console.log('unsubscribe');
  }
  /**发送消息 */
  publish(topic: string, message: string | Buffer, option, callback) {
    this.client && this.client.publish(topic, message, option, callback);
  }
}
