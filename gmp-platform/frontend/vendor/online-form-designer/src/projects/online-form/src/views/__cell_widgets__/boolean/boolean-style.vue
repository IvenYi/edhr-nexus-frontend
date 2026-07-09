<template>
  <SelectRenderTypeEditor v-model:render-comp="formState.renderComp" :disabled="disabled" />
  <form-item
    v-if="
      [CellWidgetRenderComp.Checkbox, CellWidgetRenderComp.Radio].includes(formState.renderComp)
    "
    :label="$t('sys.onlineForm.displayForm')"
    :inline="false"
  >
    <a-select
      size="small"
      type="icon"
      :options="ShowModeOptions"
      :disabled="disabled"
      v-model:value="formState.showMode"
    />
  </form-item>
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
  import { BooleanShowMode } from '@gct/nocode-base';
  import FormItem from '/@online-form/views/designer/modules/base/form-item.vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import BaseFontEditor from '../common/base-font-editor/base-font-editor.vue';
  import CheckBoxStyleEditor from '../common/check-box-style-editor/check-box-style-editor.vue';
  import SelectRenderTypeEditor from '../common/select-render-type-editor/select-render-type-editor.vue';
  import { CellWidgetRenderComp } from '/@online-form/views/designer/enums/index';
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    widget: CellWidget.Boolean;
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

  const ShowModeOptions = [
    {
      label: t('sys.component.fieldTypeProps.bothTrueAndFalse'),
      value: BooleanShowMode.Both,
    },
    {
      label: t('sys.component.fieldTypeProps.onlyTrue'),
      value: BooleanShowMode.OnlyTrue,
    },
    {
      label: t('sys.component.fieldTypeProps.onlyFalse'),
      value: BooleanShowMode.OnlyFalse,
    },
  ];
</script>

<style lang="less" scoped></style>
