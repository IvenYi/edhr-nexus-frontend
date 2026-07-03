<template>
  <taglabel v-bind="separatorAttr" class="ell" :title="tagValue" />
</template>
<script setup lang="ts">
  import { toRef, reactive, onMounted, ref } from 'vue';
  import { getParameterByField } from '/@page-designer/components/widgets/hooks/useSelectorByFieldHooks';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { taglabel } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';

  const props = defineProps<{
    modelValue?: string;
    tagValue: string;
    fieldType: FIELD_TYPE;
    widget: any;
  }>();
  const { fieldKey, modelKey } = reactive(props.widget);
  const iconExtraProps = ref({});
  console.log('props', props);

  const separatorAttr = toRef(() => {
    return {
      type: props.fieldType,
      label: props.tagValue,
      iconExtraProps: iconExtraProps.value,
    };
  });

  onMounted(async () => {
    if ([FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(props.fieldType)) {
      const { getOptionsUseCache } = getParameterByField({
        modelKey,
        fieldKey,
        modelCategory: 'entity',
        fieldType: props.fieldType,
      });
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
