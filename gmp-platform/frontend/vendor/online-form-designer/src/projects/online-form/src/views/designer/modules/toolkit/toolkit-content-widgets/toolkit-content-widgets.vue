<template>
  <div class="toolkit-content-widgets">
    <FormWidgets v-if="showFormWidgets" />
    <DisplayWidgets />
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import DisplayWidgets from './display-widgets.vue';
  import FormWidgets from './form-widgets.vue';

  const { isTextOnlineForm, isEasyEdition } = useSpreadSheet();

  const showFormWidgets = computed(() => isEasyEdition.value && !isTextOnlineForm.value);
</script>

<style lang="less" scoped>
  .toolkit-content-widgets {
    max-height: 60vh;
    overflow-y: auto;
  }
</style>
