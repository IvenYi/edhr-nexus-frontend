<template>
  <BaseFontEditor
    v-model:font-size="formState.fontSize"
    v-model:letter-space="formState.letterSpace"
    :no-letter-space="true"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import BaseFontEditor from '../common/base-font-editor/base-font-editor.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';

  const { t } = useI18n();

  const props = defineProps<{
    widget: CellWidget.Expression;
    disabled: boolean;
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
