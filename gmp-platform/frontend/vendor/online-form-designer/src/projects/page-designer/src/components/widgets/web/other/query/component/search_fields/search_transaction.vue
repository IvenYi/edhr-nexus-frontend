<template>
  <div v-if="readonly">{{ fieldlabel || emptyDisplayValue }}</div>
  <div class="ks-row-middle" v-else>
    <a-select v-if="!!useMore" disabled :value="t(`sys.model.${useMore}`)" />
    <div v-else :class="['search-select-box', moreOptions?.length ? 'use-more' : '']">
      <a-select
        style="width: 100%"
        v-model:value="value"
        v-bind="separatorAttr"
        class="ks-col"
        :disabled="disabled"
        @change="emit('tableSearch')"
        optionFilterProp="label"
        :options="options"
        :filterOption="filterOption"
        maxTagCount="gct-responsive"
      />
    </div>
    <moreOption
      :disabled="disabled"
      @clear="$emit('update:modelValue', null)"
      v-model:useMore="useMore"
      v-model:ope="ope"
      :moreOptions="moreOptions"
      :label="label || fieldName"
      @change="emit('tableSearch')"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, reactive, toRefs, toRef } from 'vue';
  import { useAsyncOptions } from '/@page-designer/components/widgets/hooks/hooks';
  import { SearchSelect } from '/@page-designer/types/web';
  import type { SelectProps } from 'ant-design-vue';
  import { isMultipleOperator } from '@gct/runtime';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import moreOption from '../more_option.vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{ modelValue?: string; widget: SearchSelect }>();
  const state = reactive(props.widget.props);
  const {
    placeholder,
    fieldType,
    field: fieldKey,
    bindModelKey,
    modelKey,
    label,
    fieldName,
    moreOptions,
    ignoreOptions,
  } = state;
  const { useMore, disabled, readonly, ope } = toRefs(props.widget.props);
  const multiple = isMultipleOperator(ope);

  const { getAsyncOptions, options } = useAsyncOptions(fieldType!);
  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      mode: multiple ? 'multiple' : undefined,
      allowClear: true,
      showSearch: true,
    };
    return attr;
  });

  getAsyncOptions();

  const emit = defineEmits(['update:modelValue', 'tableSearch']);

  const value = computed<any>({
    get() {
      let value = props.modelValue;
      return multiple
        ? Array.isArray(value)
          ? value
          : value?.split(',').filter((i) => i) || []
        : value;
    },
    set(v) {
      emit('update:modelValue', multiple ? v?.join(',') : v);
    },
  });

  const fieldlabel = toRef(() => {
    return options.value.find((i) => i.value === value.value)?.label;
  });

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
  });

  const filterOption = (input: string, option: any) => {
    if (ignoreCase.value) {
      return option.label?.toLowerCase().includes(input.toLowerCase());
    }
    return option.label?.includes(input);
  };

  defineExpose({});
</script>
<style lang="less" scoped>
  .search-select-box {
    flex: 1;
    &.use-more {
      width: calc(100% - 26px);
    }
  }
</style>
