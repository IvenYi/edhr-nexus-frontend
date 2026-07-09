import { mqttSubscribe } from '@mobile/utils/mqtt/web';
import { useUserStore } from '/@/store/modules/user';
import { useMitt } from '/@page-designer/hooks/useMitt';
import { ref, onUnmounted } from 'vue';
/**
 * 设备互联 主题数据中心
 */
export function useTopicDataCenter({ key }: { key: string }, callback: (msg: any) => void) {
  const userStore = useUserStore();
  const { mitt } = useMitt();
  let topicKey;

  /**
   * 订阅主题
   * @param param0
   * @returns
   */
  async function subscribeTopic({ deviceKey }: { deviceKey: string }): Promise<void> {
    if (topicKey) {
      await unsubscribeTopic();
    }
    topicKey = `/device/interconnection/frontend/${userStore.getTenant}/${deviceKey}`;

    let topicState = topicStore.get(topicKey);
    if (!topicState) {
      /**用平台连接的Mqtt订阅主题 */
      const { unTopic } = await mqttSubscribe(topicKey);
      topicState = new DeviceIntegrationTopicState(topicKey, async () => {
        mitt.off(`mqtt-${topicKey}`);
        await unTopic();
      });
      topicStore.set(topicKey, topicState);
      mitt.on(`mqtt-${topicKey}`, (msg: any) => {
        topicState!.emit(msg);
      });
    }
    topicState.addSubscriber(key, callback);
  }
  async function unsubscribeTopic(): Promise<void> {
    if (!topicKey) return;
    const topicState = topicStore.get(topicKey);
    if (topicState) {
      await topicState.removeSubscriber(key);
    }
    topicKey = null;
  }
  onUnmounted(() => {
    unsubscribeTopic();
  });
  return { subscribeTopic, unsubscribeTopic };
}
const topicStore = new Map<string, DeviceIntegrationTopicState>();
/**
 * 设备互联订阅主题实例
 */
class DeviceIntegrationTopicState {
  /** 引用计数 */
  refCount = 0;
  /** 订阅的字段组件 key */
  subscribers = new Map<string, (msg: any) => void>();

  constructor(
    /** 主题 */
    public topic: string,
    /** 销毁函数 */
    public unsubscribeFn: () => Promise<void>,
  ) {}
  addSubscriber(key: string, callback: (msg: any) => void) {
    if (this.subscribers.has(key)) return;
    this.subscribers.set(key, callback);
    this.refCount++;
  }
  async removeSubscriber(key: string) {
    if (!this.subscribers.has(key)) return;
    this.subscribers.delete(key);
    this.refCount--;
    if (this.refCount <= 0) {
      await this.unsubscribeFn();
      topicStore.delete(this.topic);
    }
    if (this.refCount < 0) {
      this.refCount = 0;
      console.log('设备互联主题订阅引用计数异常');
    }
  }
  emit(msg: any) {
    this.subscribers.forEach((cb) => cb(msg));
  }
}
