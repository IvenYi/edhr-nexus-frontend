import { ref, reactive } from 'vue';

// 脚本历史面板状态
const historyPanelVisible = ref<boolean>(true);

export function useEditor() {
  /**
   * 脚本历史面板切换
   */
  function toggleHistoryPanel() {
    historyPanelVisible.value = !historyPanelVisible.value;
  }

  return {
    historyPanelVisible,
    toggleHistoryPanel,
  };
}
