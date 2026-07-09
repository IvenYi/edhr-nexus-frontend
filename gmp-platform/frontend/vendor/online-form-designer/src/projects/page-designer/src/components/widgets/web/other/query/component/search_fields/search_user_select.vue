<template>
  <div v-if="readonly">{{ fieldlabel || emptyDisplayValue }}</div>
  <div class="ks-row-middle" v-else>
    <a-select v-if="!!useMore" disabled :value="t(`sys.model.${useMore}`)" />
    <div v-else :class="['search-select-box', moreOptions?.length ? 'use-more' : '']">
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
        showArrow
        maxTagCount="responsive"
        @dropdownVisibleChange="onDropLoad"
        :maxTagTextLength="12"
      >
        <template #option="option">
          <div class="flex items-center">
            <Avatar
              class="flex-shrink-0"
              :size="30"
              style="margin: 0 8px"
              :src="transformUrl(option._item.avatar)"
            />
            <div class="flex-grow-1">
              <div>{{ option.label }}</div>
              <div class="text-[#8F8F8F] text-[12px] mt2px">{{ option._item.masterOrgName }}</div>
            </div>
          </div>
        </template>
      </a-select>
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
  import { computed, toRefs, toRef, nextTick, watch, ref } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { SearchSelect } from '/@page-designer/types/web';
  import { message, type SelectProps } from 'ant-design-vue';
  import moreOption from '../more_option.vue';
  import { debounce } from 'lodash-es';
  import { isMultipleOperator } from '@gct/runtime';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { Avatar } from 'ant-design-vue';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    formData: IData;
  }>();

  // eslint-disable-next-line vue/no-setup-props-destructure
  const {
    placeholder,
    fieldType,
    moreOptions,
    ignoreOptions,
    label,
    field: fieldKey,
    modelKey,
    datasourceConfig,
    customdataSource,
    fieldName,
  } = props.widget.props;
  const { useMore, disabled, readonly, ope } = toRefs(props.widget.props);
  const Event = getPageEvent();
  const customApi =
    customdataSource && datasourceConfig?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            props.formData,
            datasourceConfig?.extraParams,
          )
      : undefined;

  const { getAsyncOptions, options } = useAsyncOptions(fieldType!, { customApi });
  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  const multiple = isMultipleOperator(ope.value);

  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      mode: multiple ? 'multiple' : undefined,
      allowClear: true,
    };
    return attr;
  });

  const emit = defineEmits(['update:modelValue', 'tableSearch']);
  const value = computed<any>({
    get() {
      let val = Array.isArray(props.modelValue) ? props.modelValue?.join(',') : props.modelValue;
      return multiple ? val?.split(',').filter((i) => i) || [] : val || undefined;
    },
    set(value: string[] | string) {
      emit('update:modelValue', value);
    },
  });

  const selectOptions = computed<any>(() => options.value);

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
  });

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
      ignoreCase: ignoreCase.value,
    });
  }, 300);

  const handleSearch = (keyword?: string) => {
    debonceSearch(keyword);
  };
  const fieldlabel = toRef(() => {
    if (multiple) {
      const labelArr = value.value?.map((i) => {
        const findItem = options.value?.find((v) => v.value === i);
        return findItem?.label;
      });
      return labelArr?.join();
    } else {
      return options.value?.find((i) => i.value === value.value)?.label;
    }
  });

  const onDropLoad = (v) => {
    if (v && !(multiple ? value.value?.length : value.value)) {
      getAsyncOptions({
        fieldKey,
        modelKey,
        ignoreCase: ignoreCase.value,
      });
    }
  };
  debonceSearch();

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
