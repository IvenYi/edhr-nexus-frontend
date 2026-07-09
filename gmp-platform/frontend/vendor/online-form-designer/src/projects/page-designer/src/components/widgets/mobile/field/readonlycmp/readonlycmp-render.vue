<template>
  <vantField
    :props="widget.props"
    :style="widget.style"
    :widget-type="widget.type"
    :modelValue="modelValue"
  >
    <template #input>
      <div class="flex" v-if="fieldType === FIELD_TYPE.RDO_REF && tagValue && tagValue[0]">
        <taglabel v-bind="separatorAttr" />
        <span v-if="!modelValue?.includes(':')" class="gct-custom-tag ml8px"> 默认 </span>
      </div>
      <taglabel v-else v-bind="separatorAttr" />
    </template>
  </vantField>
</template>

<script setup lang="ts" name="gct-readonlycmp">
  import { toRef, reactive } from 'vue';
  import { ReadonlyCmp } from '/@page-designer/types/web';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { FIELD_TYPE } from '@gct/runtime';

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
    };
  });
</script>
<style scoped lang="less"></style>
