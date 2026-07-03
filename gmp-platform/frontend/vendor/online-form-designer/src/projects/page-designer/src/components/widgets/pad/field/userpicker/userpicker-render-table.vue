<template>
  <tagFields v-bind="separatorAttr" class="ell">
    <!-- <template #prefix>
      <span class="gct-iconfont icon-ziduan-bumen primary-gct"></span>
    </template> -->
  </tagFields>
</template>

<script setup lang="ts" name="gct-readonlycmp">
  import { toRef, reactive } from 'vue';
  import { ReadonlyCmp } from '/@page-designer/types/web';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { tagFields } from '/@page-designer/components/widgets/pad/__components__';

  const props = defineProps<{
    modelValue?: string;
    widget: ReadonlyCmp;
    formData: { _DICT: any; [key: string]: any };
  }>();
  const { fieldType, field, isFieldModel, bindFieldLink } = reactive(props.widget.props);
  const fieldKey = isFieldModel ? bindFieldLink?.join('.') : field;
  const tagValue = toRef(() => {
    return props.formData?._DICT?.[fieldKey]?.[props.modelValue] || props.modelValue;
  });
  const separatorAttr = toRef(() => {
    // console.log(123, tagValue.value, props.formData, props.modelValue);
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      label: tagValue.value,
      valueOptions: tagValue?.value?.map((i) => {
        return { label: i, value: i };
      }),
    };
  });
</script>
<style scoped lang="less"></style>
