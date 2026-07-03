<template>
  <BpmnDiagram :readonly="true" :inst-mode="true" />
</template>

<script setup lang="ts">
  import { watch, onBeforeUnmount } from 'vue';
  import { useGctFlow, NodeInstStatusMap } from '@gct/flow';
  import { BpmnDiagram, useGctBpmn } from '@gct/flow/src/plugins/bpmn';
  import { getProcessPathFindAllByProcessInstanceId } from '@/apis/gct-apaas/ProcessPathController';

  const { setNodeInstStatusMap, reset } = useGctFlow();
  const { init } = useGctBpmn();

  const props = defineProps<{
    procInstId: string; // 流程实例 Id
  }>();

  onBeforeUnmount(() => {
    reset();
  });

  watch(
    () => props.procInstId,
    async (value) => {
      if (!value) return;
      const res = await getProcessPathFindAllByProcessInstanceId({
        ofInstanceId: value,
        processInstanceId: value,
      });

      const paths = res?.paths || [];
      const defVerJson = res?.proDefVer?.json;
      init(defVerJson);
      const nodeStatusMap: NodeInstStatusMap = paths.reduce((total: NodeInstStatusMap, item) => {
        let ids: string[] = item.nodeKey ? [item.nodeKey] : item.caseId?.split(':');
        ids.forEach((id) => {
          total[id!] = {
            status: item.approveStatus,
            data: item,
          };
        });

        return total;
      }, {});
      setNodeInstStatusMap(nodeStatusMap);
    },
    {
      immediate: true,
    },
  );
</script>

<style></style>
