<template>
  <div class="ks-row-middle">
    <a-select
      v-model:value="value"
      v-bind="separatorAttr"
      class="ks-col"
      :disabled="disabled || !!useMore"
      @search="handleSearch"
      :dropdownClassName="
        multiple
          ? 'gct-project-select-dropdown gct-project-select-multiple'
          : 'gct-project-select-dropdown'
      "
      @change="changeSelect"
      :filterOption="false"
      :options="selectOptions"
      showSearch
      maxTagCount="responsive"
      @dropdownVisibleChange="onDropLoad"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, toRefs, toRef, nextTick, watch, ref } from 'vue';
  import { useAsyncOptions } from '../../config.ts';
  import { SearchSelect } from '/@page-designer/types/web';
  import { message, type SelectProps } from 'ant-design-vue';
  import moreOption from '../more_option.vue';
  import { debounce } from 'lodash-es';
  import { isMultipleOperator } from '@gct/runtime';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';

  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    formData: IData;
    configByHeaders: object;
  }>();

  // eslint-disable-next-line vue/no-setup-props-destructure
  const { type: fieldType, name: label, key: fieldKey, modelKey, _ope } = props.widget;
  const { getAsyncOptions, options, multiple } = useAsyncOptions(fieldType!, props.configByHeaders);

  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: '请选择',
      mode: multiple ? 'multiple' : undefined,
      allowClear: true,
    };
    return attr;
  });

  const emit = defineEmits(['update:modelValue', 'tableSearch']);

  const value = computed<any>({
    get() {
      return props.modelValue ?? undefined;
    },
    set(value: string[] | string) {
      emit('update:modelValue', value);
    },
  });
  const selectOptions = computed<any>(() => options.value);
  /**值发生变化 */
  async function changeSelect(v) {
    await nextTick();
    /**列字段时候触发保存 */
    emit('tableSearch');
  }

  const debonceSearch = debounce(async (keyword: string = '') => {
    keyword = keyword.trim();
    getAsyncOptions({
      fieldKey,
      modelKey,
      keyword,
    });
  }, 300);

  const handleSearch = (keyword?: string) => {
    debonceSearch(keyword);
  };
  const fieldlabel = toRef(() => {
    return options.value.find((i) => i.value === value.value)?.label;
  });

  const onDropLoad = (v) => {
    if (v && !(multiple ? value.value?.length : value.value)) {
      getAsyncOptions({
        fieldKey,
        modelKey,
      });
    }
  };
  debonceSearch();

  defineExpose({});
</script>
