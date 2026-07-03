import { ref } from 'vue';
import { TabEnum } from '../types';

const activeTab = ref<TabEnum>(TabEnum.Commit);

export function useAppDeployment() {
  return {
    activeTab,
  };
}
