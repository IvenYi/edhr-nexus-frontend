<template>
  <RangeUserSelect
    :class="[ns.b()]"
    :model-value="value"
    @update:model-value="(v) => emit('update:value', v)"
  />
</template>

<script lang="ts" setup name="range-user-select">
  import { useNamespace } from '@gct/runtime';

  import RangeUserSelect from '/@app-designer/views/online-form/components/bpmn-setting/comps/approval-user-select-config.vue';

  const ns = useNamespace('range-user-select');

  withDefaults(
    defineProps<{
      value?: string;
    }>(),
    {
      value: undefined,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string): void;
  }>();
</script>

<style lang="scss" scoped>
  $range-user-select: (
    height: auto,
  );

  @include b(range-user-select) {
    @include set-component-css-var(range-user-select, $range-user-select);
    height: getCssVar(range-user-select, height);

    :deep(.ant-modal) {
      display: block;
      top: 100px;
    }
  }
</style>
