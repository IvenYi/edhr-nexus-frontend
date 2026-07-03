import { uuid2 } from '@gct/runtime-mobile-render';
import { ref } from 'vue';

const activeTabKey = ref<0 | 1 | 2>(0);
const refreshKey = ref(uuid2(32));

export function useAudit() {
  const search = () => {
    refreshKey.value = uuid2(32);
  };

  return {
    activeTabKey,
    refreshKey,
    search,
  };
}
