<template>
  <fieldWidget
    v-if="showComponet"
    :widget="fieldWidgetData"
    :rowValue="props.rowValue"
    :index="props.index"
  />
</template>

<script setup lang="ts">
  import { ref, useSlots, provide } from 'vue';
  import { ColumnTable } from '/@page-designer/types/web';
  import fieldWidget from './field-widget.vue';
  import { dependencyToShow } from '/@web-render/render/Event/Dependency/useDependencyToShow';
  import { useDependencyByRequired } from '/@web-render/render/Event/Dependency/useDependency';
  const props = defineProps<{
    widget: ColumnTable;
    rowValue: {
      _DICT: object;
      _STYLE: object;
      [key: string]: string | number | undefined | object;
    };
    index: number;
  }>();
  const fieldWidgetData = ref({
    ...props.widget,
    props: { ...props.widget.props },
  });

  const showComponet = dependencyToShow(fieldWidgetData.value, props.rowValue);
  useDependencyByRequired(fieldWidgetData.value);
  /**vant 支持 自定义 field slot 依赖注入 */
  const Fieldslots = useSlots();
  provide('Fieldslots', Fieldslots);
</script>
