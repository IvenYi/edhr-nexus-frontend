<template>
  <Diagonal :size="widget.size" :direction="widget.direction" :value="names" />
</template>

<script setup lang="ts">
  import type { PaperWidget } from '/@online-form/views/types/paper-widget';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';
  import Diagonal from '/@online-form/components/diagonal/diagonal.vue';
  import { computed } from 'vue';

  Diagonal;

  const { getFieldMeta } = useModelFields();

  const props = defineProps<{
    widget: PaperWidget.Diagonal;
  }>();

  const getNameByIndex = (index) => {
    const enableField = props.widget.enableFields?.[index];
    if (!enableField) {
      return props.widget.names[index];
    }
    const fieldMeta = props.widget.bindFields?.[index];
    if (fieldMeta) {
      return `\${${getFieldMeta(fieldMeta)?.name}}`;
    }
    return '';
  };

  const names = computed(() => {
    return [0, 1, 2].map((i) => getNameByIndex(i));
  });
</script>

<style lang="less" scoped>
  .column-name {
    position: absolute;
    white-space: pre-wrap;

    &--top {
      top: 0px;
      right: 0px;
    }
    &--bottom {
      left: 0px;
      bottom: 0px;
    }
    &--middle {
      top: 0px;
      left: 0px;
    }
  }
</style>
