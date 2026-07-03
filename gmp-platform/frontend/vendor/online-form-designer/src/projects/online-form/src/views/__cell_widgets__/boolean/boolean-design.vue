<template>
  <div>
    <SelectEx
      :disabled="disabled"
      :options="options"
      :value="fieldWidget.defaultValue"
      :is-multiple="false"
      :show-mode="fieldWidget.renderComp === CellWidgetRenderComp.Select ? 'select' : 'icon-label'"
      :icon-type="iconType"
      :direction="fieldWidget.direction"
      :label-position="fieldWidget.labelPosition"
      :null-value="nullValue"
      :style="styleVars"
      size="small"
    >
      <template #suffix="{ option }">
        <template v-if="option.value === true && fieldWidget.trueAttachFields?.length">
          <CellWidgetDesign
            v-for="field in fieldWidget.trueAttachFields"
            :key="field.fieldMeta.field"
            :field-meta="field.fieldMeta"
            :field-widget="field.fieldWidget"
          />
        </template>
        <template v-if="option.value === false && fieldWidget.falseAttachFields?.length">
          <CellWidgetDesign
            v-for="field in fieldWidget.falseAttachFields"
            :key="field.fieldMeta.field"
            :field-meta="field.fieldMeta"
            :field-widget="field.fieldWidget"
          />
        </template>
      </template>
    </SelectEx>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import { CellWidgetRenderComp } from '/@online-form/views/designer/enums';
  import { BooleanShowMode } from '@gct/nocode-base';
  import SelectEx from '@/components/SelectEx/select-ex';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CellWidgetDesign from '/@online-form/views/__cell_widgets__/cell-widget-design.vue';
  import { isNil } from 'lodash-es';

  const { t } = useI18n();

  const props = defineProps<{
    disabled?: boolean;
    fieldWidget: CellWidget.Boolean;
  }>();

  const iconType = computed(() => {
    return {
      [CellWidgetRenderComp.Radio]: 'radio',
      [CellWidgetRenderComp.Checkbox]: 'checkbox',
    }[props.fieldWidget.renderComp];
  });

  const options = computed(() => {
    const result: {
      label: string;
      value: boolean | null;
    }[] = [
      {
        label: props.fieldWidget.trueText || t('sys.real'),
        value: true,
      },
      {
        label: props.fieldWidget.falseText || t('sys.fake'),
        value: false,
      },
    ];

    // checkBox时，只显示真和只显示假时，删除对应的选项
    if (props.fieldWidget.renderComp === CellWidgetRenderComp.Checkbox) {
      if (props.fieldWidget.showMode === BooleanShowMode.OnlyTrue) {
        result.pop();
      } else if (props.fieldWidget.showMode === BooleanShowMode.OnlyFalse) {
        result.shift();
      }
    }

    if (props.fieldWidget.renderComp === CellWidgetRenderComp.Select) {
      result.unshift({
        label: t('sys.null'),
        value: null,
      });
    }

    return result;
  });

  const nullValue = computed(() => {
    if (props.fieldWidget.renderComp !== CellWidgetRenderComp.Checkbox) {
      return;
    }
    if (props.fieldWidget.showMode === BooleanShowMode.OnlyTrue) {
      return false;
    } else if (props.fieldWidget.showMode === BooleanShowMode.OnlyFalse) {
      return true;
    }
    return undefined;
  });

  const styleVars = computed(() => {
    const result = {};
    if (!isNil(props.fieldWidget.iconLabelSpace)) {
      result['--gct-select-ex-icon-label-space'] = props.fieldWidget.iconLabelSpace + 'px';
    }
    return result;
  });
</script>

<style lang="less" scoped>
  .boolean-design {
    display: flex;
    justify-content: center;
    width: 100%;
  }

  /** 【电子表单】枚举/布尔选项需要预留边距 */
  :deep(.gct-select-ex-option) {
    padding-left: 0;
  }
</style>
