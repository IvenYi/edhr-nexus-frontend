<template>
  <PaasBpamRuntime :instanceId="instanceId" />
</template>
<script setup lang="ts">
  import PaasBpamRuntime from '/@/components/BpmnRuntime/paas/index.vue';
  import { toRefs, ref } from 'vue';
  import { FlowDiagram } from '/@page-designer/types/web';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const defProps = defineProps<{ widget: FlowDiagram }>();

  const { props } = toRefs(defProps.widget);
  const refForm = props.value.refForm!;
  const instanceId = ref();

  const Event = getPageEvent();
  Event.initSearchs(refForm, reload, defProps.widget.id);
  const form = Event.getComponent(refForm);
  if (form?.getValue) {
    const data = form.getValue!();
    reload(data?.process_instance_id_);
  }

  function reload(id) {
    if (!id) return;
    instanceId.value = id;
  }

  defineExpose({
    reload,
  });
</script>
<style lang="less" scoped>
  :deep(.gct-flow) {
    min-height: 472px;
  }
</style>
