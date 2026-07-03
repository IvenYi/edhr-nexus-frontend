<template>
  <component
    :is="nocodeWidgetRenderMap[componentType]"
    :key="widget.id"
    :widget="fieldWidget"
    :formData="formRowData"
    :subtableFieldId="subtableFieldId"
    :realRowIndex="realRowIndex"
    :pageRowIndex="pageRowIndex"
    :childSubTableDataIndex="childSubTableDataIndex"
    v-model:modelValue="value"
    :style="widgetStyles"
    :dynamicConfig="dynamicConfig"
    @focus="onFocus"
    @blur="onBlur"
  />
</template>

<script setup lang="ts" name="WidgetComponent">
  import { computed, toRef } from 'vue';
  import { nocodeWidgetRenderMap } from '../widgetIndex';
  import {
    useValidator,
    useDependency,
    ComponentTypeEnum,
    useFormTmplConfig,
  } from '@gct/nocode-base';
  import type { BaseCoreComponent } from '@gct/nocode-base';

  const tmplConfigC = useFormTmplConfig().injectController();

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
  }>();
  const { value, formRowData, fieldWidget } = useDependency(props.widget, props);
  const { widgetStyles } = useValidator({ ...props, widget: fieldWidget.value });

  const componentType = toRef(() => {
    return props.dynamicConfig?.isDynRo ? ComponentTypeEnum.DynRo : props.widget.component;
  });

  // 延迟执行赋值操作，避免浏览器bug导致数据填入
  let timerId;
  // 设备互联逻辑处理
  const onFocus = (e) => {
    console.log('focus', props.widget.id, e);
    const { field, subModelKey } = props.widget.props;
    // 非子表模型处理
    if (tmplConfigC && field && !subModelKey) {
      const connector = tmplConfigC.deviceConnector;
      connector.state.focusFieldKey = field;

      if (timerId) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        if (field in connector.state.cacheFieldData) {
          value.value = connector.state.cacheFieldData[field];
          delete connector.state.cacheFieldData[field];
        }
      }, 200);
    }
  };

  const onBlur = () => {
    console.log('blur', props.widget.id);
    if (tmplConfigC) {
      const { field, subModelKey } = props.widget.props;
      // 非子表模型处理
      if (tmplConfigC && field && !subModelKey) {
        if (timerId) {
          clearTimeout(timerId);
        }
        // 只清空自己的焦点字段，其他字段不受影响
        if (field === tmplConfigC.deviceConnector.state.focusFieldKey) {
          tmplConfigC.deviceConnector.state.focusFieldKey = null;
        }
      }
    }
  };
</script>
