<template>
  <tagelabel
    v-if="rowReadonly || readonly"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="true"
    :label="readonlyValue"
  />
  <template v-else>
    <TimeInput
      v-if="bindCompStyleType === BindCmpStyleEnum.CMP_TIME"
      :widget="widget"
      :disabled="disabled"
      ref="timeInput"
      :style="style"
    />
    <a-input-number
      v-else
      id="inputNumber"
      style="width: 100%"
      v-model:value="value"
      v-bind="inputNumberAttr"
      :style="style"
    />
  </template>
</template>

<script setup lang="ts" name="gct-inputnumber">
  import { ref, computed, toRefs } from 'vue';
  import { InputNumber } from '/@page-designer/types/web';
  import type { InputNumberProps } from 'ant-design-vue';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { BindCmpStyleEnum } from '/@/projects/page-designer/src/enum';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import TimeInput from './component/timeInput.vue';

  const props = defineProps<{ widget: InputNumber; rowReadonly?: boolean }>();
  const {
    currency,
    placeholder,
    disabled,
    readonly,
    fieldType,
    bindCompStyleType,
    displayTimeType,
  } = toRefs(props.widget.props);

  if (displayTimeType?.value === undefined) {
    props.widget.props.displayTimeType = 'd:h:m:s';
  }

  const { example } = transformField2Component(fieldType.value);

  const value = ref();
  const timeInput = ref<HTMLElement | null>(null);
  const style = computed(() => {
    const styleProp = props.widget.style;
    return {
      textAlign: styleProp.contentFont?.align || 'left',
      textAlignLast: styleProp.contentFont?.align || 'left',
    };
  });
  const inputNumberAttr = computed(() => {
    const currencyAttr = {};

    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
      Object.assign(currencyAttr, {
        prefix: currency?.value || undefined,
      });
    }
    let attr: InputNumberProps = {
      placeholder: placeholder?.value,
      ...currencyAttr,
    };
    return attr;
  });

  const readonlyValue = computed(() => {
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_TIME) {
      const day = displayTimeType?.value?.includes('d') ? '0 天 ' : '';
      const hour = displayTimeType?.value?.includes('h') ? '00 时 ' : '';
      const minute = displayTimeType?.value?.includes('m') ? '00 分 ' : '';
      const second = displayTimeType?.value?.includes('s') ? '00 秒' : '';
      return `${day}${hour}${minute}${second}`;
    }
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
      return `${currency?.value ?? ''}${example}`;
    }
    return example;
  });
</script>
<style scoped lang="less"></style>
