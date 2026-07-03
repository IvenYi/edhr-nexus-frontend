<template>
  <FieldCheckbox
    v-model:value="value"
    :disabled="disabled"
    :readonly="rowReadonly || readonly"
    :fieldType="fieldType"
    :tagStyle="widget.style"
    :options="optionsList.length ? optionsList : currentOptions"
    :design="true"
    ref="checkboxRef"
  />
</template>

<script setup lang="ts" name="gct-checkbox">
  import {
    computed,
    reactive,
    toRefs,
    inject,
    ref,
    onMounted,
    onUnmounted,
    watch,
    nextTick,
  } from 'vue';
  import { Checkbox } from '/@page-designer/types/web';
  import { FieldCheckbox } from '../../__components__/formcomponent';
  import { transformField2Component } from '/@page-designer/schema/field/form/utils';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { calcMutiLineTags, isNotSignalLine } from '../../../hooks/useTag';

  const globFieldInfo = inject<any>('globFieldInfo', {});

  const tableCellHeight = inject('tableCellHeight', {});

  const checkboxRef = ref();

  const optionsList = ref([]);

  let resizeObserver: ResizeObserver | null = null;

  const { t } = useI18n();

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
          type: 'checkbox',
        };
      },
    );
  });

  const value = computed(() => {
    return defaultValue?.value ?? globFieldInfo.defaultValue;
  });

  const caclulateOptions = () => {
    optionsList.value = [];
    if (isNotSignalLine(tableCellHeight)) return;
    const el = checkboxRef.value?.$el;
    if (!el) return;

    if (currentOptions.value && currentOptions.value.length) {
      const maxTagCount = calcMutiLineTags(
        currentOptions.value,
        tableCellHeight.cellHeight,
        el.offsetWidth,
      );
      optionsList.value = currentOptions.value.slice(0, maxTagCount);
    }
  };

  onMounted(() => {
    const el = checkboxRef.value?.$el;
    if (!el) return;
    nextTick(() => {
      resizeObserver = new ResizeObserver((entries) => {
        caclulateOptions();
      });
      resizeObserver.observe(el);
    });
  });
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
</script>
<style scoped lang="less"></style>
