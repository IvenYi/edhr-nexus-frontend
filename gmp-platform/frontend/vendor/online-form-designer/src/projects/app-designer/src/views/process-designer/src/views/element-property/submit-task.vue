<template>
  <div class="-ml-16px -mr-16px">
    <bpmn-form-items :forms="(formState as any)" />
  </div>
</template>

<script lang="ts" setup>
  import { computed, watch } from 'vue';
  import { BpmnNode } from '../../types';
  import { useBpmn } from '../../hooks/useBpmn';

  import BpmnFormItems from '../components/bpmn-form-items.vue';

  const { setProperties } = useBpmn();

  const props = defineProps<{
    id: string;
    formState: BpmnNode.UserTask | BpmnNode.ApprovalTask;
  }>();

  const formState = computed({
    get() {
      return props.formState;
    },
    set(value) {
      console.log(value);
      Object.assign(props.formState, value);
    },
  });

  watch(
    () => props.formState,
    (value) => {
      console.log(value);
      setProperties(props.id, value);
    },
    {
      deep: true,
    },
  );
</script>

<style lang="less" scoped></style>
