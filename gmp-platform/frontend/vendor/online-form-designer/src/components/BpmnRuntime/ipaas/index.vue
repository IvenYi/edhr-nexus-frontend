<template>
  <iPaaSBpmnDiagram :readonly="true" :inst-mode="true" />
</template>

<script setup lang="ts">
  import { watch, onBeforeUnmount } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import { iPaaSBpmnDiagram } from '@gct/flow/src/plugins/ipaas-bpmn';
  import { getFlowDefByFuuidByVersion } from '/@/apis/gct-ipaas/IpaasDataFlowController';
  import { debounce } from 'lodash-es';
  import { useFlow } from '/@/projects/ipaas/src/hooks/useFlow';

  const { setGctFlowData, reset } = useGctFlow();
  // const { init } = useGctIPaaSBpmn();
  const { revisedData } = useFlow();

  const props = defineProps<{
    fuuid: string | undefined;
    version: string | undefined;
  }>();

  const getFlow = () => {
    const { fuuid, version } = props;
    if (!fuuid || !version) return;
    getFlowDefByFuuidByVersion({
      fuuid,
      version,
    }).then((res: any) => {
      if (res.viewMetaZip) {
        const nodeFlows = JSON.parse(res.viewMetaZip || {});
        setGctFlowData(revisedData(nodeFlows, res.meta?.elements));
      } else {
        setGctFlowData([] as any);
      }
    });
  };

  const getFlowDebounce = debounce(getFlow, 100);

  watch(
    () => props,
    () => {
      getFlowDebounce();
    },
    {
      immediate: true,
      deep: true,
    },
  );

  onBeforeUnmount(() => {
    reset();
  });
</script>

<style></style>
