import { ref, watch } from 'vue';
import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';

const openKeys = ref<string[]>([]);
const openKeysBak = ref<string[]>([]);
const selectedKeys = ref<string[]>([]);

const mixsiderSelected = ref<string[]>([]);

const { menuCollapsed } = useThemeSetting();

watch(menuCollapsed, (val) => {
  if (val) {
    openKeysBak.value = [...openKeys.value];
    openKeys.value = [];
  } else {
    openKeys.value = [...openKeysBak.value];
    openKeysBak.value = [];
  }
});

export function useMenu() {
  function addOpenKey(data) {
    const result = [...openKeys.value];
    if (Array.isArray(data)) {
      result.push(...data);
    } else {
      result.push(data);
    }
    openKeys.value = [...new Set([...openKeys.value, ...result])];
  }

  function setOpenKeys(data) {
    openKeys.value = data;
  }

  function deleteOpenKey(key) {
    const index = openKeys.value.findIndex((item) => item === key);
    openKeys.value.splice(index, 1);
  }

  function setSelectedKeys(data) {
    selectedKeys.value = data;
  }

  function setMixsiderSelected(data) {
    mixsiderSelected.value = data;
  }

  return {
    openKeys,
    setOpenKeys,
    addOpenKey,
    deleteOpenKey,
    selectedKeys,
    setSelectedKeys,
    mixsiderSelected,
    setMixsiderSelected,
  };
}
