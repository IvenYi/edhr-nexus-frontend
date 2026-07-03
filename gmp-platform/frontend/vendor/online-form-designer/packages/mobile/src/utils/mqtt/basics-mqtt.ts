/**创建独立mqtt连接  支持 开关 */
import MqttAndroid from './android-env';
import MqttWeb from './web-env';
import type { MqttConfig } from './type';
import { _isAndroid } from '@mobile/utils/const';

export { UserData } from '../../stores/loginHooks';

const MqttSdk = _isAndroid ? MqttAndroid : MqttWeb;

/**mqtt class */
export class MqttSingleLinkInstance {
  config: MqttConfig;
  clientId?: string;
  constructor(config: MqttConfig) {
    this.config = config;
  }

  connectMqtt(options = {}, onTopic?: (message: any) => void) {
    this.clientId = options.clientId;
    this.config.opts = options;
    this.config.clientId = this.clientId;
    return new Promise((res, rej) => {
      MqttSdk.init(
        this.config,
        (topic, message) => {
          this.config.topics?.includes(topic) && onTopic && onTopic(JSON.parse(message));
        },
        () => {
          res();
        },
      );
    });
  }
  /**断开*/
  unsubscribe() {
    if (!this.clientId) return;
    MqttSdk.unsubscribe(this.clientId);
    this.clientId = undefined;
  }
  /**发消息*/
  publish(topic: string, message: string | Buffer) {
    if (!this.clientId) return;
    MqttSdk.publish(topic, message, this.clientId);
  }
}
