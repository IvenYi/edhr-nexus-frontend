import MqttWeb from './web-env';
import type { MqttConfig } from './type';
import { useMitt } from '/@page-designer/hooks/useMitt';

const MqttSdk = MqttWeb;

const { mitt } = useMitt();

export const initMqtt = (props: MqttConfig) => {
  MqttSdk.init(props, (topic, message) => {
    const eventName = `mqtt-${topic}`;
    const msg = isJSON(message) ? JSON.parse(message) : message;
    mitt.emit(eventName, msg);
  });
};

function isJSON(str) {
  try {
    const obj = JSON.parse(str);
    if (obj && typeof obj === 'object') {
      return true;
    }
  } catch (e) {}
  return false;
}
export const mqttSubscribe = (topic: string): Promise<{ unTopic: Function }> => {
  return MqttSdk.subscribe(topic);
};
export const mqttPublish = (topic: string, message: string | Buffer) => {
  MqttSdk.publish(topic, message);
};
export const mqttUnSubscribe = (clientId?: string) => {
  MqttSdk.unsubscribe(clientId);
};
