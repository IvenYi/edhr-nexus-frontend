import { ref } from 'vue';

const loading = ref(false);

export function usePrint() {
  return {
    loading,
    initialize: async () => undefined,
  };
}
