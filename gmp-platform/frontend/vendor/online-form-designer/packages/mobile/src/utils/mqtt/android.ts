import MqttAndroid from './android-env';
import MqttWeb from './web-env';
import type { MqttConfig } from './type';
import { useMitt } from '/@page-designer/hooks/useMitt';
import { _isAndroid } from '@mobile/utils/const';

const MqttSdk = _isAndroid ? MqttAndroid : MqttWeb;

const { mitt } = useMitt();

export const initMqtt = (props: MqttConfig): Promise<void> => {
  console.log('================== initMQTT ==================');
  return new Promise((res, rej) => {
    MqttSdk.init(
      props,
      (topic, message) => {
        const eventName = `mqtt-${topic}`;
        mitt.emit(eventName, JSON.parse(message));
      },
      () => {
        res();
      },
    );
  });
};
export const mqttSubscribe = (topics: Array<string> | string) => {
  return MqttSdk.subscribe(topics);
};
export const mqttPublish = (topic: string, message: string | Buffer) => {
  MqttSdk.publish(topic, message);
};
export const mqttUnSubscribe = (clientId?: string) => {
  MqttSdk.unsubscribe(clientId);
};
