<template>
  <taglabel v-if="rowReadonly || readonly" v-bind="separatorAttr" />
  <van-field v-else type="number" v-model="value" :placeholder="widget.props.placeholder" />
</template>

<script setup lang="ts" name="gct-inputdouble">
  import { computed, toRefs } from 'vue';
  import { useWidget, widgetProps } from '/@page-designer/hooks/useWidget';
  import { BindCmpStyleEnum } from '/@/projects/page-designer/src/enum';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';

  const props = defineProps(widgetProps);
  const { value } = useWidget(props);

  const { fieldType, readonly, bindCompStyleType, currency } = toRefs(props.widget.props);

  const { example } = transformField2Component(fieldType.value);

  const separatorAttr = computed(() => {
    return {
      type: fieldType.value,
      tagWidgetStyle: props.widget.style,
      isDesign: true,
      label:
        bindCompStyleType?.value === BindCmpStyleEnum.CMP_CURRENCY
          ? `${currency.value ?? ''}${example}`
          : example,
    };
  });
</script>

<style lang="less" scoped>
  .van-cell {
    padding: 0;
  }
</style>
