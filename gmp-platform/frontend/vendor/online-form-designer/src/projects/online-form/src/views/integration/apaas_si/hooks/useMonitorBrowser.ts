import { onMounted, onUnmounted } from 'vue';

interface MonitorOptions {
  /**
   * 页面卸载前的回调函数，可以执行特殊业务逻辑
   * 如果需要显示确认对话框（提示用户保存数据），请返回一个字符串
   */
  beforeUnload?: any;

  /**
   * 页面卸载时的回调函数，用于执行清理操作
   * 可以使用 navigator.sendBeacon 发送最后的数据
   */
  onUnload?: (e: Event) => void;
}

/**
 * 监听浏览器关闭和标签页关闭事件的钩子函数
 * @param options 配置选项
 */
export const useMonitorBrowser = (options?: MonitorOptions) => {
  const { beforeUnload, onUnload } = options || {};

  // 处理页面即将关闭事件
  const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
    // 执行用户传入的业务逻辑
    const result = await beforeUnload?.(e);

    // 如果返回字符串，则显示浏览器确认对话框
    if (result) {
      e.preventDefault();
      // 设置返回值以显示浏览器确认对话框
      e.returnValue = result;
      return result;
    }
  };

  // 处理页面卸载事件
  const handleUnload = (e: Event) => {
    // 执行卸载时的业务逻辑
    onUnload?.(e);
  };

  onMounted(() => {
    // 监听页面即将关闭事件
    window.addEventListener('beforeunload', handleBeforeUnload);

    // 监听页面卸载事件
    window.addEventListener('unload', handleUnload);
  });

  onUnmounted(() => {
    // 移除事件监听器
    window.removeEventListener('beforeunload', handleBeforeUnload);
    window.removeEventListener('unload', handleUnload);
  });

  return {
    // 提供手动添加和移除监听器的方法
    addEventListeners: () => {
      window.addEventListener('beforeunload', handleBeforeUnload);
      window.addEventListener('unload', handleUnload);
    },
    removeEventListeners: () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('unload', handleUnload);
    },
  };
};
