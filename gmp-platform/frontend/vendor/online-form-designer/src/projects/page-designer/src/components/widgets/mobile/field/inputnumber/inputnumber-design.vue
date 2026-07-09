<template>
  <taglabel v-if="rowReadonly || readonly" v-bind="separatorAttr" />
  <TimeInput
    v-else-if="!(rowReadonly || readonly) && bindCompStyleType === BindCmpStyleEnum.CMP_TIME"
    :widget="widget"
    ref="timeInput"
  />
  <van-field
    v-else-if="!(rowReadonly || readonly) && bindCompStyleType !== BindCmpStyleEnum.CMP_TIME"
    type="number"
    v-model="value"
    :placeholder="widget.props.placeholder"
  />
</template>

<script setup lang="ts" name="gct-inputnumber">
  import { computed, toRefs, ref } from 'vue';
  import { useWidget, widgetProps } from '/@page-designer/hooks/useWidget';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { BindCmpStyleEnum } from '/@/projects/page-designer/src/enum';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import TimeInput from './component/timeInput.vue';

  const props = defineProps(widgetProps);
  const { value } = useWidget(props);

  const { fieldType, readonly, bindCompStyleType, currency, displayTimeType } = toRefs(
    props.widget.props,
  );

  const { example } = transformField2Component(fieldType.value);

  const separatorAttr = computed(() => {
    let readyValue = example;
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_TIME) {
      const day = displayTimeType?.value?.includes('d') ? '0 天 ' : '';
      const hour = displayTimeType?.value?.includes('h') ? '00 时 ' : '';
      const minute = displayTimeType?.value?.includes('m') ? '00 分 ' : '';
      const second = displayTimeType?.value?.includes('s') ? '00 秒' : '';
      readyValue = `${day}${hour}${minute}${second}`;
    }
    if (bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY) {
      readyValue = `${currency?.value ?? ''}${example}`;
    }
    return {
      type: fieldType.value,
      tagWidgetStyle: props.widget.style,
      isDesign: true,
      label: readyValue,
    };
  });

  const timeInput = ref<HTMLElement | null>(null);
</script>

<style lang="less" scoped>
  .van-cell {
    padding: 0 !important;
  }
</style>
