<template>
  <div class="w100%" :class="[props.readonly ? 'pt9px pb9px' : 'pt4px pb4px']">
    <component
      class="design-data-table-field"
      :widget="fieldWidget"
      :is="defComponet"
      :disabled="widget.props.disabled"
      :formData="formData"
    />
  </div>
</template>

<script setup lang="ts">
  import { ColumnTable } from '/@page-designer/types/web';
  import { ref, onMounted, watchEffect, toRaw, toRef } from 'vue';
  import { getDesignComponentByType } from '/@page-designer/components/widgets/web/field/index';

  const props = defineProps<{
    widget: ColumnTable;
    rowReadonly?: boolean;
    readonly?: boolean;
    formData?: any;
  }>();
  const fieldWidget = ref({ ...props.widget, props: { ...props.widget.props } });
  if (props.rowReadonly) {
    fieldWidget.value.props.readonly = true;
  }
  const defComponet = toRef(() => getDesignComponentByType(props.widget.type));
</script>
<style scoped lang="less">
  .design-data-table-field {
    pointer-events: none;
  }
</style>
