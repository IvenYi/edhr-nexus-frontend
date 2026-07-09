<template>
  <taglabel v-bind="separatorAttr" class="ell" />
</template>

<script setup lang="ts" name="gct-readonlycmp">
  import { toRef, reactive, onMounted, ref } from 'vue';
  import { ReadonlyCmp } from '/@page-designer/types/web';
  import vantField from '../../__components__/vantField.vue';
  import taglabel from '../../__components__/taglabel.vue';
  import { getParameterByField } from '/@page-designer/components/widgets/hooks/useSelectorByFieldHooks';
  import { FIELD_TYPE } from '/@/enums/appEnum';

  const props = defineProps<{
    modelValue?: string;
    widget: ReadonlyCmp;
    formData: { _DICT: any; [key: string]: any };
  }>();
  const { modelKey, fieldType, field, isFieldModel, bindFieldLink, modeldata } = reactive(
    props.widget.props,
  );
  const iconExtraProps = ref({});
  const fieldKey = isFieldModel ? bindFieldLink?.join('.') : field;
  const tagValue = toRef(() => {
    return props.formData?._DICT?.[fieldKey]?.[props.modelValue] || props.modelValue;
  });
  const separatorAttr = toRef(() => {
    return {
      type: fieldType,
      tagWidgetStyle: props.widget.style,
      label: tagValue.value,
      iconExtraProps: iconExtraProps.value,
    };
  });
  const modelCategory = modeldata?.modelCategory || 'entity';
  const { getOptionsUseCache } = getParameterByField({
    modelKey,
    fieldKey: field,
    modelCategory,
    fieldType,
  });
  onMounted(async () => {
    if ([FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(fieldType)) {
      const { options } = await getOptionsUseCache();
      options.forEach((item: any) => {
        iconExtraProps.value[item.label] = {
          icon: item.icon || '',
          iconColor: item.iconColor || '',
          textColor: item.textColor || '',
        };
      });
    }
  });
</script>
<style scoped lang="less"></style>
