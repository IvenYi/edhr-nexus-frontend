import { ref } from 'vue';

const tab = ref<string>();

export function useMultiTabs() {
  function setTab(payload: string) {
    tab.value = payload;
  }

  return {
    tab,
    setTab,
  };
}
