<template>
  <FieldRadio
    v-model:value="value"
    :disabled="disabled || readonly"
    :readonly="rowReadonly || readonly"
    :fieldType="fieldType"
    :tagStyle="props.widget.style"
    :design="true"
    :options="currentOptions"
  />
</template>

<script setup lang="ts" name="gct-radio">
  import { computed, toRefs, reactive, inject } from 'vue';
  import { Radio } from '/@page-designer/types/web';
  import FieldRadio from '../../__components__/FieldRadio';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import { useI18n } from '/@/hooks/web/useI18n';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const { t } = useI18n();

  const props = defineProps<{ modelValue?: string; widget: Radio; rowReadonly?: boolean }>();
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
    return defaultValue?.value ?? globFieldInfo.defaultValue;
  });
</script>
<style scoped lang="less"></style>
