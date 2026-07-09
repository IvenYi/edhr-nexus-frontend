import { ref, onMounted, computed } from 'vue';

export function usePadTeleport() {
  const teleport = ref('body');
  onMounted(() => {
    if (/\/PagePreview\//i.test(location.hash)) {
      teleport.value = '#gctPageLayout';
    }
  });

  return { teleport };
}
