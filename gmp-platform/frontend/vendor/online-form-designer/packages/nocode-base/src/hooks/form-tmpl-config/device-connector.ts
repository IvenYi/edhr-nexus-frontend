import { reactive, computed, watch, onMounted, ref } from 'vue';

/**
 * 设备连接器(定义接口和部分逻辑,具体实现由pc和平板完成)
 * @export
 * @class DeviceConnector
 */
export class DeviceConnector {
  state = reactive<{
    /** mqtt取消订阅回调 */
    unMqttTopicMap: Record<string, Function | undefined>;
    /** 当前聚焦的字段key */
    focusFieldKey: string | null;
    /** 缓存的需要聚焦才修改的值 */
    cacheFieldData: Record<string, any>;
  }>({
    unMqttTopicMap: {},
    focusFieldKey: null,
    cacheFieldData: {},
  });

  /** 初始化连接器,重置清空数据 */
  init() {
    // 处理一些初始化逻辑,如清空数据
    this.clear();
  }

  /**
   * 取消订阅mqtt
   * @param id
   */
  unsubscribeMqtt(id: string) {
    // 取消订阅部分mqtt
    const unMqtt = this.state.unMqttTopicMap[id];
    if (unMqtt) {
      unMqtt();
      Reflect.deleteProperty(this.state.unMqttTopicMap, id);
    }
  }

  /**
   * 清空数据,清楚mqtt订阅等
   */
  clear() {
    // 清空所有mqtt订阅
    Object.keys(this.state.unMqttTopicMap).forEach((id) => {
      this.unsubscribeMqtt(id);
    });
    this.state.unMqttTopicMap = {};
    this.state.cacheFieldData = {};
    this.state.focusFieldKey = null;
  }
}
