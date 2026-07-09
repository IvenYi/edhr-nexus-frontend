<template>
  <div class="cell-widget-props">
    <EmptySymbolEditor v-model:empty-symbol="formState.emptySymbol" :disabled="disabled" />

    <InputPropEditor
      v-if="showInputPropEditor"
      v-model:disabled="formState.disabled"
      v-model:required="formState.required"
      :fieldRequired="fieldRequired"
      :disabledAll="disabled"
    />
    <ViewStatusEditor
      v-if="showViewStatus"
      v-model:viewState="formState.viewState"
      :disabled="disabled"
    />
    <component
      v-if="showFieldConfig"
      :is="CellWidgetPropsMap[FieldTypeToCellWidgetMap[fieldMeta.fieldType!]]"
      :widget="fieldWidget"
      :fieldMeta="fieldMeta"
      :fieldType="fieldMeta.fieldType"
      :readonly="readonly"
      :disabled="disabled"
    />
    <AffixEditor
      v-if="showAffixEditor"
      :disabled="disabled"
      v-model:prefix="formState.prefix"
      v-model:suffix="formState.suffix"
    />
  </div>
</template>

<script setup lang="ts">
  import { asyncImportWidgetProps } from '/@online-form/views/__cell_widgets__/index';
  import type { CellWidget } from '/@online-form/views/designer/types/cell-widget';
  import {
    FieldTypeToCellWidgetMap,
    OnlineFormTraceTypes,
  } from '/@online-form/views/designer/constants';
  import { computed, onMounted } from 'vue';
  import AffixEditor from './common/affix-editor/affix-editor.vue';
  import EmptySymbolEditor from './common/empty-symbol-editor/empty-symbol-editor.vue';
  import InputPropEditor from './common/input-prop-editor/input-prop-editor.vue';
  import ViewStatusEditor from './common/view-status-editor/view-status-editor.vue';
  import { CellWidgetCategory } from '../designer/enums';
  import { useModelFields } from '/@online-form/views/designer/hooks/useModelFields';

  import type { IBindField } from '@gct/nocode-base';

  const CellWidgetPropsMap = asyncImportWidgetProps();

  const { getFieldMeta } = useModelFields();

  const props = defineProps<{
    fieldMeta: IBindField;
    fieldWidget: CellWidget.BasicSchema;
    readonly: boolean;
    disabled: boolean;
    isViewModel: boolean;
  }>();

  const fieldRequired = computed(() => {
    const fieldInfo = getFieldMeta(props.fieldMeta);
    return Boolean(fieldInfo?.required);
  });

  const formState = computed({
    get() {
      return props.fieldWidget;
    },
    set(v) {
      Object.assign(props.fieldWidget, v);
    },
  });

  const isTraceField = computed(() => {
    return OnlineFormTraceTypes.includes(props.fieldMeta.fieldType!);
  });

  /** 显示控制符配置 */
  const showEmptySymbol = computed(() => {
    return !isTraceField.value;
  });

  /** 显示查看时渲染方式配置 */
  const showViewStatus = computed(() => {
    return !isTraceField.value;
  });

  /** 是否显示字段配置 */
  const showFieldConfig = computed(() => {
    if (props.isViewModel) {
      return false;
    }
    // 打印或者关联模型字段的时候 不需要显示一些字段配置
    if (
      props.readonly &&
      [
        CellWidgetCategory.Boolean,
        CellWidgetCategory.Image,
        CellWidgetCategory.File,
        CellWidgetCategory.User,
        CellWidgetCategory.Org,
        CellWidgetCategory.Enum,
        CellWidgetCategory.Signature,
      ].includes(props.fieldWidget.category)
    ) {
      return false;
    }

    return true;
  });

  /** 是否显示输入属性 */
  const showInputPropEditor = computed(() => {
    if (props.isViewModel) {
      return false;
    }
    // 只有打印或者关联模型字段的时候需要隐藏，填报的时候都需要
    if (props.readonly) {
      return false;
    }
    return [
      CellWidgetCategory.Text,
      CellWidgetCategory.Integer,
      CellWidgetCategory.Double,
      CellWidgetCategory.Decimal,
      CellWidgetCategory.Boolean,
      CellWidgetCategory.DateTime,
      CellWidgetCategory.Image,
      CellWidgetCategory.File,
      CellWidgetCategory.User,
      CellWidgetCategory.Org,
      CellWidgetCategory.Enum,
      CellWidgetCategory.Signature,
      CellWidgetCategory.Ref,
      CellWidgetCategory.Trace,
    ].includes(props.fieldWidget.category);
  });

  /** 是否显示前后缀 */
  const showAffixEditor = computed(() => {
    return [
      CellWidgetCategory.Text,
      CellWidgetCategory.Integer,
      CellWidgetCategory.Double,
      CellWidgetCategory.Decimal,
      CellWidgetCategory.DateTime,
      CellWidgetCategory.Org,
      CellWidgetCategory.User,
      CellWidgetCategory.Trace,
      CellWidgetCategory.Ref,
    ].includes(props.fieldWidget.category);
  });
</script>

<style lang="less" scoped>
  .cell-widget-props {
    // 统一样式压制
    :deep(.ant-input) {
      font-size: 12px;
    }
    :deep(.ant-select) {
      font-size: 12px;
    }
    :deep(.ant-input-number) {
      font-size: 12px;
    }
    :deep(.ant-checkbox-wrapper) {
      font-size: 12px;
      .ant-checkbox-inner {
        height: 12px;
        width: 12px;
        &:after {
          height: 7.42857px;
          width: 4.314286px;
        }
      }
    }
  }
</style>
