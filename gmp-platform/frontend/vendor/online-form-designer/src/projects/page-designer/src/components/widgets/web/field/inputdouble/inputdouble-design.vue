<template>
  <tagelabel
    v-if="rowReadonly || readonly"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="true"
    :label="readonlyValue"
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

<script setup lang="ts" name="gct-inputdouble">
  import { ref, computed, toRefs } from 'vue';
  import { InputDouble } from '/@page-designer/types/web';
  import type { InputNumberProps } from 'ant-design-vue';
  import tagelabel from '../../__components__/formcomponent/field-label/taglabel.vue';
  import { BindCmpStyleEnum } from '/@/projects/page-designer/src/enum';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';

  const props = defineProps<{ widget: InputDouble; rowReadonly?: boolean }>();

  const { currency, placeholder, readonly, fieldType, bindCompStyleType } = toRefs(
    props.widget.props,
  );

  const { example } = transformField2Component(fieldType.value);

  const value = ref();
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
        prefix: currency.value || undefined,
      });
    }
    let attr: InputNumberProps = {
      placeholder: placeholder?.value,
      ...currencyAttr,
    };
    return attr;
  });

  const readonlyValue = computed(() => {
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
      return `${currency.value ?? ''}${example}`;
    }
    return example;
  });
</script>
<style scoped lang="less"></style>
