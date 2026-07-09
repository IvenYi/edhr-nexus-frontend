<template>
  <form-item :label="$t('sys.onlineForm.initialValue')" :inline="false">
    <a-input-number
      :disabled="disabled"
      v-model:value="formState.initialValue"
      size="small"
      :placeholder="$t('sys.onlineForm.pleaseEnterInitialValue')"
      :min="0"
      :max="999"
      :step="1"
      :precision="0"
    />
  </form-item>
  <form-item :label="$t('sys.onlineForm.autoIncrementStep')" :inline="false">
    <a-input-number
      :disabled="disabled"
      v-model:value="formState.autoAddValue"
      size="small"
      :placeholder="$t('sys.onlineForm.pleaseEnterAutoIncrementStep')"
      :min="1"
      :max="999"
      :step="1"
      :precision="0"
    />
  </form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';

  import type { PaperWidget } from '/@online-form/views/types/paper-widget';

  const props = defineProps<{
    widget: PaperWidget.Serialnumber;
    disabled?: boolean;
  }>();

  const formState = computed({
    get() {
      return props.widget;
    },
    set(v) {
      Object.assign(props.widget, v);
    },
  });
</script>

<style></style>
