import { inject, ref, onMounted, computed } from 'vue';
import { useSOInstance } from './useSOInstance';

export function useNode() {
  const { soDataObject } = useSOInstance();

  const getNode = inject('getNode') as Function;
  const nodeId = ref<string>('');
  const nodeInGraph = ref<boolean>(false);
  const nodeData = computed(() => {
    return soDataObject.value.controls[nodeId.value] ?? {};
  });
  onMounted(() => {
    if (!getNode) return;
    const node = getNode() as Node;
    console.log(node);
    nodeId.value = node.id;
    nodeInGraph.value = node.data?.inGraph ?? true;
  });

  return {
    nodeId,
    nodeData,
    nodeInGraph,
  };
}
