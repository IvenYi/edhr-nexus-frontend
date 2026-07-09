<template>
  <workflow-nodes
    ref="WorkflowNodesRef"
    :widget-id="widget.id"
    :model-key="widget.props.modelKey"
    :readonly="props.widget.props.readonly"
    :design-mode="true"
  />
</template>

<script setup lang="ts" name="gct-workflow-nodes">
  import { ref } from 'vue';
  import WorkflowNodes from './component/index.vue';

  const props = defineProps<{
    modelValue?: Array<any>;
    widget: any;
    formData: any;
  }>();

  const WorkflowNodesRef = ref();
</script>

<style lang="less" scoped></style>
