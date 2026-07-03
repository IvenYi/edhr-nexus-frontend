import { ref } from 'vue';

type ConfigValue = {
  tableTotalCount?: number;
};

const configValueMap = ref<Record<string, ConfigValue>>({});

export function useAppDynamicTabs() {
  async function setTableTotalCount(id: string, value: number) {
    if (!id) return;
    if (configValueMap.value[id]) {
      configValueMap.value[id].tableTotalCount = value;
    } else {
      configValueMap.value[id] = {
        tableTotalCount: value,
      };
    }
  }

  function removeConfigValue(id: string) {
    if (!id) return;
    delete configValueMap.value[id];
  }

  return {
    configValueMap,
    setTableTotalCount,
    removeConfigValue,
  };
}
