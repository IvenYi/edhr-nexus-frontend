<template>
  <div class="cell-widget-formula">
    <form-item :inline="false" :label="$t('sys.appDesigner.expression')">
      <FormulaEditor
        :modelKey="fieldMeta.model!"
        :disabled="disabled"
        v-model:expr="formState.expr"
        v-model:expr-echo="formState.exprEcho"
      />
    </form-item>
  </div>
</template>

<script setup lang="ts" name="cell-widget-formula">
  import { computed, ref } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import type { IBindField } from '@gct/nocode-base';
  import { FormulaEditor } from './common/formula';

  const props = defineProps<{
    fieldMeta: IBindField;
    fieldWidget: CellWidget.Integer;
    disabled: boolean;
  }>();

  const formState = computed({
    get() {
      return props.fieldWidget;
    },
    set(v) {
      Object.assign(props.fieldWidget, v);
    },
  });
</script>

<style lang="less" scoped>
  .cell-widget-formula {
  }
</style>
