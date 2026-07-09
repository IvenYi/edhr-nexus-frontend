<template>
  <div>
    <NumberInputEx
      :disabled="disabled"
      :placeholder="fieldWidget.placeholder"
      :value="fieldWidget.defaultValue"
      :is-super-script="fieldWidget.isSuperScript"
      :script-value="fieldWidget.scriptValue"
    />
  </div>
</template>

<script setup lang="ts">
  import { CellWidget } from '../../designer/types/cell-widget';
  import NumberInputEx from '../common/number-input-ex/number-input-ex.vue';

  defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.Integer;
  }>();
</script>

<style></style>
