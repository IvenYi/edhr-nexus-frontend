<template>
  <span v-if="value === '**'">**</span>
  <component v-else :widget="widget" :is="defComponet" v-model="value" :formData="formRowData" />
</template>

<script setup lang="ts">
  import { ColumnTable } from '/@page-designer/types/web';
  import { computed, onMounted, reactive, toRaw, toRef } from 'vue';
  import { useDependency } from '/@web-render/render/Event/Dependency/useDependency';
  import { getRenderComponentByType } from '/@page-designer/components/widgets/pad/field/render';

  const props = defineProps<{
    widget: ColumnTable;
    rowValue: {
      _DICT: object;
      _STYLE: object;
      [key: string]: string | number | undefined | object;
    };
    index: number;
  }>();

  const defComponet = toRef(() =>
    getRenderComponentByType(
      props.widget.type,
      props.widget.props.fieldType!,
      !!props.widget.props.readonly,
      'form',
    ),
  );
  const { value, formRowData } = useDependency(props.widget, props.rowValue, true);
</script>
<style scoped lang="less"></style>
