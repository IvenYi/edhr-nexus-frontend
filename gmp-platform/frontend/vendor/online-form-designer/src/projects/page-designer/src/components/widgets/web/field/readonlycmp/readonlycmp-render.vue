<template>
  <select-label-example
    v-if="edhrLabelExampleMode"
    :widget="widget"
    :modelValue="modelValue"
    needRequest
    :title="tagValue"
  />
  <!-- <div v-else-if="fieldType === FIELD_TYPE.RDO_REF && tagValue && tagValue[0]" class="w100%">
    <FieldReadonly v-bind="separatorAttr" />
    <span v-if="!modelValue?.includes(':')" class="gct-custom-tag ml8px"> 默认 </span>
  </div> -->
  <FieldReadonly v-else v-bind="separatorAttr" />
</template>

<script setup lang="ts" name="gct-readonlycmp">
  import { toRefs, computed, toRef } from 'vue';
  import { ReadonlyCmp } from '/@page-designer/types/web';
  import FieldReadonly from '/@page-designer/components/widgets/web/__components__/formcomponent/field-readonly.vue';
  import { useRefCardData } from '/@page-designer/components/widgets/hooks/refCardList';
  import SelectLabelExample from '../select/select-label-example.vue';

  const props = defineProps<{
    modelValue?: string;
    widget: ReadonlyCmp;
    formData: { _DICT: any; [key: string]: any };
  }>();
  const { fieldType, field, isFieldModel, bindFieldLink, edhrLabelExampleMode } =
    props.widget.props;
  const fieldKey = isFieldModel ? bindFieldLink?.join('.') : field;
  const tagValue = computed(() => {
    if (fieldKey) {
      const value = props.modelValue ?? '';
      const val = props.formData?._DICT?.[fieldKey]?.[value] ?? value;
      return val;
    }

    return '';
  });

  const separatorAttr = computed(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      label: tagValue.value ?? '',
      modelValue: props.modelValue,
    };
  });
  fieldKey && useRefCardData(props);
</script>
<style scoped lang="less"></style>
