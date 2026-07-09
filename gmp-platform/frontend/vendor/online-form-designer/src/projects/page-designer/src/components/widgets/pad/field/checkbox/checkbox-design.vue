<template>
  <FieldCheckbox
    v-model:value="value"
    :disabled="disabled || readonly"
    :readonly="rowReadonly || readonly"
    :fieldType="fieldType"
    :tagStyle="props.widget.style"
    :options="currentOptions"
    :design="true"
  />
</template>

<script setup lang="ts" name="gct-checkbox">
  import { computed, reactive, toRefs, inject } from 'vue';
  import { Checkbox } from '/@page-designer/types/mobile';
  import FieldCheckbox from '../../__components__/FieldCheckbox';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const props = defineProps<{ modelValue?: string; widget: Checkbox; rowReadonly?: boolean }>();
  const { fieldType } = reactive(props.widget.props);

  const { readonly, defaultValue, disabled } = toRefs(props.widget.props);

  const currentOptions = computed(() => {
    const { exampleOptions } = transformField2Component(fieldType!);
    return (Array.isArray(exampleOptions) ? exampleOptions : [exampleOptions ?? '']).map(
      (item, index) => {
        return {
          label: t(item ?? ''),
          value: index,
        };
      },
    );
  });

  const value = computed(() => {
    // return defaultValue?.value.split(',');
    return defaultValue?.value ?? globFieldInfo.defaultValue;
  });
</script>
<style scoped lang="less"></style>
