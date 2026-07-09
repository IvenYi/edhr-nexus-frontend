import { MqttClientInstance } from './basics-mqtt';
import { useUserStore } from '/@/store/modules/user';
import { type IClientOptions } from 'mqtt';

/**平台mqtt 调度中心 */
export class GctMqttCenter {
  static mqttClientInstanceMap = {};
  /**
   *  初始化mqtt实例
   * @param key 随机 clientId
   * @param mqttOptions mqtt 配置参数
   * @returns
   */
  static async createMqttClientInstance(
    key: string,
    mqttOptions: IClientOptions = {},
  ): Promise<MqttClientInstance> {
    if (!this.mqttClientInstanceMap[key]?.client) {
      const userStore = useUserStore();
      const { mqttProperties } = userStore.getUserInfo;
      const clientId = `web.${key}.${userStore?.getUserInfo?.userId}.${Math.random()}`;
      const client = new MqttClientInstance({
        clientId,
        username: mqttProperties.username as string,
        password: mqttProperties.password as string,
        ...mqttOptions,
      });
      await client.connectMqtt();
      //连接成功
      this.mqttClientInstanceMap[key] = client;
    }
    return this.mqttClientInstanceMap[key];
  }
  /**mqtt经常会用到用户信息 */
  static getUserInfo() {
    const userStore = useUserStore();
    return userStore.getUserInfo;
  }
}
