<template>
  <component
    :is="nocodeMobileWidgetRenderMap[componentType]"
    :key="widget.id"
    :widget="widget"
    :formData="realFormState"
    :subtableFieldId="subtableFieldId"
    :realRowIndex="realRowIndex"
    :pageRowIndex="pageRowIndex"
    :childSubTableDataIndex="childSubTableDataIndex"
    v-model:modelValue="value"
    :style="widgetStyles"
    :dynamicConfig="dynamicConfig"
  />
</template>

<script setup lang="ts" name="WidgetComponent">
  import { computed, toRef } from 'vue';
  import { nocodeMobileWidgetRenderMap } from '../widgetMobileIndex';
  import { ComponentTypeEnum, useValidator, type BaseCoreComponent } from '@gct/nocode-base';

  const props = defineProps<{
    widget: BaseCoreComponent.BasicSchema;
    formData: { [key: string]: any };
    /** 子表fieldkey */
    subtableFieldId?: string;
    /** 子表实际行数 */
    realRowIndex?: number;
    /** 子表在分页情况下，当前页面的行数 */
    pageRowIndex?: number;
    /** 二维子表数据行数index */
    childSubTableDataIndex?: number;
    /** 引用信息 */
    referenceInfo?: { belongFieldId: string; optionValue: string; multiple: boolean };
    /** 行高自适应配置 */
    dynamicConfig?: { visibleText: string; sourceTdId: string; isDynRo: boolean };
    /** 是否是移动端表单的字段 */
    isField?: boolean;
  }>();

  const { targetFieldId, isFieldModel, widgetStyles } = useValidator(props);

  const componentType = toRef(() => {
    if (props.isField) {
      return `${props.widget.component}-field`;
    }
    return props.dynamicConfig?.isDynRo ? ComponentTypeEnum.DynRo : props.widget.component;
  });

  const realFormState = toRef(() => {
    if (isFieldModel) {
      return props.formData._OPCT;
    }
    return props.formData;
  });

  const value = computed({
    get() {
      if (targetFieldId) {
        return realFormState.value?.[targetFieldId];
      }
      return '';
    },
    set(val: any) {
      if (targetFieldId) {
        realFormState.value[targetFieldId] = val;
      }
    },
  });
</script>
