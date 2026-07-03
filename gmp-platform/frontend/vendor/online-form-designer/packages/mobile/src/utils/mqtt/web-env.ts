import MQTT, { type MqttClient } from 'mqtt';
import type { MqttConfig } from './type';

export default class MqttWeb {
  static clientArray: MqttClient[] = [];
  static client?: MqttClient;
  static init(
    props: MqttConfig,
    callback: (topic: string, message: string) => void,
    success: Function = () => {},
  ) {
    // 可以连接多个mqtt
    if (this.client?.options?.clientId === props.opts.clientId) {
      return;
    }
    if (this.client) this.clientArray.push(this.client);
    const { protocol, hostname, port } = location;
    const hostUrl = (
      process.env.NODE_ENV === 'development'
        ? import.meta.env.VITE_GLOBAL_HOST
        : `${protocol}//${hostname}${port ? ':' + port : ''}`
    )?.replace('http', 'ws');
    const { username, password, topics = [], opts } = props;
    const connection = {
      // host: hostUrl,
      endpoint: '/mqtt', // 默认"/mqtt"，string
      clean: true, // 保留会话
      connectTimeout: 4000, // 超时时间
      reconnectPeriod: 4000, // 重连时间间隔
      username: username, // 用户名和密码根据实际情况而定
      password: password,
      lastWillTopic: 'maker',
      ...opts,
    };

    const { endpoint, ...options } = connection;
    const connectUrl = `${hostUrl}${endpoint}`;

    this.client = MQTT.connect(connectUrl, options);
    this.client.on('connect', () => {
      console.log('连接成功！！！');
      success();
      topics.forEach((i) => {
        this.subscribe(i);
      });
    });
    this.client.on('disconnect', (error) => {
      console.info('服务器断开:', error);
    });
    // 后台发送的消息
    this.client.on('message', (topic, message) => {
      console.log('topic', topic, message.toString());
      callback(topic, message.toString());
    });
  }

  /**订阅主题 */
  static subscribe(topics: string | string[], clientId?: string): Promise<{ unTopic: Function }> {
    const client =
      this.clientArray.find((client) => client.options.clientId === clientId) || this.client;
    const res = {
      /**
       * 取消订阅
       */
      unTopic() {
        return new Promise((resolve, reject) => {
          client
            ? client.unsubscribe(topics, (error: any, _res: any) => {
                if (error) {
                  console.error('Subscribe to topics error', error);
                } else {
                  console.log('unTopic', _res);
                }
                resolve();
              })
            : resolve();
        });
      },
    };
    return new Promise((resolve, reject) => {
      client &&
        client.subscribe(topics, (error: any, _res: any) => {
          if (error) {
            console.error('Subscribe to topics error', error);
            reject(error);
          } else {
            console.log('subscribe success', topics, res);
            resolve(res);
          }
        });
    });
  }
  /** 关闭连接 */
  static unsubscribe(clientId?: string) {
    this.clientArray = this.clientArray.filter((client) => {
      const isDelete = clientId ? client?.options?.clientId === clientId : true;
      isDelete && client.end(true);
      return !isDelete;
    });
    if (!clientId || this.client?.options?.clientId === clientId) {
      this.client && this.client.end(true);
      this.client = this.clientArray[0];
    }
    console.log('unsubscribe', clientId);
  }

  static publish(topic: string, message: string | Buffer, clientId?: string) {
    const client =
      this.clientArray.find((client) => client.options.clientId === clientId) || this.client;
    client && client.publish(topic, message);
  }
}
