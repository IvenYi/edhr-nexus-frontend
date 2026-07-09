<template>
  <IPaasFlow :readonly="true" />
</template>
<script setup lang="ts" name="">
  import { watch } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import IPaasFlow from '/@ipaas/comps/ipaas-flow';
  import { getFlowDefByFuuidByVersion } from '/@/apis/gct-ipaas/IpaasDataFlowController';
  import { debounce } from 'lodash-es';

  const { setGctFlowData } = useGctFlow();

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
        setGctFlowData(nodeFlows);
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
</script>
<style lang="less" scoped></style>
