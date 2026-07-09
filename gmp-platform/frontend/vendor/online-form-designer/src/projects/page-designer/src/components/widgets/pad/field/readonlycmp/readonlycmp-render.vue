<template>
  <vantField
    :props="widget.props"
    :style="widget.style"
    :widget-type="widget.type"
    :modelValue="modelValue"
  >
    <template #input>
      <taglabel v-bind="separatorAttr" />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-readonlycmp">
  import { toRef, reactive } from 'vue';
  import { ReadonlyCmp } from '/@page-designer/types/web';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { useFiledLabels } from '/@page-designer/components/widgets/pad/__components__';

  const props = defineProps<{
    modelValue?: string;
    widget: ReadonlyCmp;
    formData: { _DICT: any; [key: string]: any };
  }>();
  const { fieldType } = reactive(props.widget.props);
  const { labelArr } = useFiledLabels(props);
  const separatorAttr = toRef(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      label: labelArr.value,
    };
  });
</script>
<style scoped lang="less"></style>
