// 应用配置详情
import { reactive } from 'vue';

const appSetting = reactive({});

export function useAppSetting() {
  return {
    appSetting,
  };
}
