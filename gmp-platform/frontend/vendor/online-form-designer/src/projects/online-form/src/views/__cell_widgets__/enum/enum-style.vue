<template>
  <SelectRenderTypeEditor v-model:render-comp="formState.renderComp" :disabled="disabled" />
  <BaseFontEditor
    v-model:font-size="formState.fontSize"
    v-model:letter-space="formState.iconLabelSpace"
    :disabled="disabled"
  />
  <CheckBoxStyleEditor
    v-model:label-position="formState.labelPosition"
    v-model:direction="formState.direction"
    :renderComp="formState.renderComp"
    :disabled="disabled"
  />
</template>

<script setup lang="ts">
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import BaseFontEditor from '../common/base-font-editor/base-font-editor.vue';
  import CheckBoxStyleEditor from '../common/check-box-style-editor/check-box-style-editor.vue';
  import SelectRenderTypeEditor from '../common/select-render-type-editor/select-render-type-editor.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { computed } from 'vue';

  const { t } = useI18n();

  const props = defineProps<{
    widget: CellWidget.Enum;
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
