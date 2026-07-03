<template>
  <!-- <div v-if="readonly">{{ fieldlabel }}</div> -->
  <div class="ks-row-middle">
    <a-tree-select
      v-if="refModelType === EntityModelTypeEnum.TREE"
      v-model:value="value"
      style="width: 100%"
      :treeData="options"
      tree-data-simple-mode
      :showSearch="showSearch"
      :placeholder="placeholder"
      :multiple="multiple"
      :load-data="onLoadData"
      @search="debonceSearch"
      @change="changeSelect"
      allowClear
      maxTagCount="gct-responsive"
    />
    <a-select
      v-else
      v-model:value="value"
      v-bind="separatorAttr"
      class="ks-col"
      @search="handleSearch"
      :dropdownClassName="
        multiple
          ? 'gct-project-select-dropdown gct-project-select-multiple'
          : 'gct-project-select-dropdown'
      "
      @change="changeSelect"
      @popupScroll="popupScroll"
      @dropdownVisibleChange="onDropLoad"
      :filterOption="frontSearch ? filterOption : false"
      :options="selectOptions"
      maxTagCount="responsive"
    />
  </div>
</template>

<script setup lang="ts">
  import { computed, toRefs, toRef, nextTick, watch, ref } from 'vue';
  import { useAsyncOptions } from '../../config.ts';
  import { SearchSelect } from '/@page-designer/types/web';
  import { message, type SelectProps } from 'ant-design-vue';
  import moreOption from '../more_option.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import { ListTreeSearchTypeEnum } from '/@page-designer/enum';
  import { getQueryDateByKeyWord } from '/@page-designer/components/widgets/hooks/listhook';
  import { debounce } from 'lodash-es';
  import { isMultipleOperator } from '@gct/runtime';

  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    formData: IData;
    configByHeaders: object;
  }>();

  const searchValue = ref('');
  const open = ref(false);
  const placeholder = '请选择';
  const {
    type: fieldType,
    name: label,
    key: fieldKey,
    bindModelKey,
    modelKey,
    refModelType,
    _ope,
  } = props.widget;

  const { getAsyncOptions, options, getNextOptions, multiple } = useAsyncOptions(
    fieldType!,
    props.configByHeaders,
  );
  /**前台搜索 */
  const frontSearch = !(fieldType === FIELD_TYPE.REF || fieldType === FIELD_TYPE.REF_MULTI);
  const showSearch = frontSearch;
  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      mode: multiple ? 'multiple' : undefined,
      allowClear: true,
      showSearch,
    };
    return attr;
  });

  function load(): void {
    getAsyncOptions({ modelKey, fieldKey, bindModelKey });
  }

  load();

  function onDropLoad(isDropOpen): void {
    searchValue.value = '';
    open.value = isDropOpen;
    if (!isDropOpen) return;

    load();
  }

  const emit = defineEmits(['update:modelValue', 'tableSearch']);

  const value = computed<any>({
    get() {
      return props.modelValue ?? '';
    },
    set(value: string[] | string) {
      emit('update:modelValue', value);
    },
  });
  const selectOptions = computed<any>(() => {
    return options.value;
  });
  /**值发生变化 */
  async function changeSelect(v) {
    searchValue.value = '';
    v =
      multiple && refModelType === EntityModelTypeEnum.TREE ? v?.map((item: any) => item.value) : v;
    if (!v || !v.length) {
      deselect(value.value);
    }
    await nextTick();
    /**列字段时候触发保存 */
    emit('tableSearch');
  }

  function deselect() {
    if (!frontSearch) options.value = [];
    debonceSearch();
  }

  const debonceSearch = debounce(async (keyword?: string) => {
    if (frontSearch) return;
    if (keyword && keyword.trim()) {
      const queryData = {};
      getAsyncOptions({
        fieldKey,
        modelKey,
        bindModelKey,
        queryData,
        keyword,
      });
    } else {
      load();
    }
  }, 300);

  const handleSearch = (keyword?: string) => {
    searchValue.value = keyword || '';
    if (frontSearch) return;
    options.value = [];
    debonceSearch(keyword);
  };

  async function onLoadData(value) {
    await getAsyncOptions({
      fieldKey,
      modelKey,
      bindModelKey,
    });
  }
  /**下拉事件 */
  function popupScroll(e) {
    if (frontSearch) return;
    const { target } = e;
    if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
      getNextOptions();
    }
  }

  const filterOption = (input: string, option: any) => {
    return option.label.includes(input);
  };

  defineExpose({});
</script>
