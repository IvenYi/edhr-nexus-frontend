const activeTabKey = ref<string | number>(0);

export function useFilling() {
  return {
    activeTabKey,
  };
}
