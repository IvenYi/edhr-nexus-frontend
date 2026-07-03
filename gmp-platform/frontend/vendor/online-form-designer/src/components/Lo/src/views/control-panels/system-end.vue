<template>
  <div>
    <control-property name="outputToVariable" :form-state="formState" />
  </div>
</template>

<script lang="ts" setup>
  import { Control } from '../../types';
  import ControlProperty from '../control-property/index.vue';
  defineProps({
    formState: {
      type: Object as PropType<Control.ToolkitRequest>,
      default: () => ({}),
    },
  });
</script>

<style lang="less" scoped></style>
