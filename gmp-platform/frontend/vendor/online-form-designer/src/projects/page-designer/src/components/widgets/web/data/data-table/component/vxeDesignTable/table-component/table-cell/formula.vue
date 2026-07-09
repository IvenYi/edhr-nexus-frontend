<template>
  {{ label }}
</template>

<script setup lang="ts">
  import { FormulaTable } from '/@page-designer/types/web';
  import { ref, toRaw, toRef } from 'vue';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import { useI18n } from '/@/hooks/web/useI18n';

  const props = defineProps<{
    widget: FormulaTable;
  }>();
  const { t } = useI18n();
  const { example } = transformField2Component(props.widget.props.fieldType);
  const label = (Array.isArray(example) ? example : [example]).map((i) => t(i)) + '';
</script>
<style scoped lang="less"></style>
