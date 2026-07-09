<template>
  <div class="form-tmpl-flow">
    <BpmnVersions :readonly="true" class="absolute top-16px left-16px z-10" />
    <BpmnDiagram :readonly="true" />
  </div>
</template>

<script setup lang="ts">
  import { watch, onBeforeUnmount, onMounted, h } from 'vue';
  import { useGctFlow } from '@gct/flow';
  import { BpmnDiagram } from '@gct/flow/src/plugins/bpmn';
  import { useBpmnSetting } from '/@app-designer/views/online-form/components/bpmn-setting/hooks/useBpmnSetting';
  import BpmnVersions from '/@app-designer/views/online-form/components/bpmn-setting/comps/bpmn-versions.vue';
  import { useFlowNodeUserEcho } from './logic';

  const { init, calcNodeStatusMap } = useFlowNodeUserEcho();

  const { setNodeInstStatusMap, reset, isReadonly, setReadonly, gctFlowData } = useGctFlow();

  // 强制所有都设置为只读
  watch(
    () => isReadonly.value,
    (value) => {
      console.log('isReadonly', value);
      setReadonly(true);
    },
    {
      immediate: true,
    },
  );

  const { loadBpmnDef } = useBpmnSetting();

  const props = defineProps<{
    ofTmplId: string; // 表单实例 id
    /** 所属模型key */
    modelKey: string;
  }>();

  onBeforeUnmount(() => {
    reset();
  });

  watch(
    () => props.ofTmplId,
    async (value) => {
      if (!value) return;
      await init(props.modelKey);
      loadBpmnDef(props.ofTmplId);
    },
    {
      immediate: true,
    },
  );

  watch(
    () => gctFlowData.value,
    async (flow) => {
      console.log('gctFlowData', flow);
      if (!flow) return;
      const nodeStatusMap =  await calcNodeStatusMap(flow);
      setNodeInstStatusMap(nodeStatusMap);
    },
  );
</script>

<style scoped lang="less">
  .form-tmpl-flow {
    width: 100%;
    height: 100%;
    position: relative;
  }
</style>
