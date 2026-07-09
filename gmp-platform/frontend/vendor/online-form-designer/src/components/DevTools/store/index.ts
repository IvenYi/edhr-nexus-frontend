import { defineStore } from 'pinia';
import { reactive } from 'vue';

export const useDevToolStore = defineStore('dev-tool', () => {
  const enableDevTool = localStorage.getItem('GCT_ENABLE_DEV_TOOL') === 'true';
  console.log('enableDevTool', enableDevTool);
  const state = reactive({
    enableDevTool: enableDevTool,
  });

  return {
    state,
  };
});

/**
 * 是否启用开发工具
 * @export
 * @return {*}
 */
export function isEnableDevTool() {
  return useDevToolStore().state.enableDevTool;
}
