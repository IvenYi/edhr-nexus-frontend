<template>
  <taglabel v-bind="separatorAttr" />
</template>

<script name="gct-agg" setup lang="ts">
  import { inject, reactive, toRefs, computed, ref } from 'vue';
  import { Agg } from '/@page-designer/types/mobile';
  import { BindCmpStyleEnum } from '/@/projects/page-designer/src/enum';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import taglabel from '/@page-designer/components/widgets/web/__components__/formcomponent/field-label/taglabel.vue';

  const defProps = defineProps<{ widget: Agg; rowReadonly?: boolean }>();

  const { style } = reactive(defProps.widget);

  const { returnType, bindCompStyleType, currency, displayTimeType } = toRefs(
    defProps.widget.props,
  );

  const { example } = transformField2Component(returnType.value);

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

  const separatorAttr = computed(() => {
    return {
      isDesign: true,
      tagWidgetStyle: style,
      type: returnType.value,
      label: readonlyValue.value,
    };
  });
</script>

<style scoped lang="less"></style>
