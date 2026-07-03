<template>
  <div class="ks-row-middle">
    <van-cell
      title-class="custom-cell-title"
      style="width: auto; flex: 1"
      v-bind="formAttr"
      label-align="top"
      :class="useMore && 'more-disabled'"
    >
      <template #title>
        <span :class="{ 'tag-label-disabled': disabled }"> {{ computedLabel }}</span>
      </template>
      <template #value>
        <component
          :disabled="disabled || readonly"
          v-model="modelValue"
          :is="renderRef"
          :widget="widget"
          :modelCategory="modelCategory"
          :showIcon="disabled || readonly"
          :formData="formData"
          :rules="rules"
        />
      </template>
      <!-- <template #label v-if="isUseMore">
        <span style="color: #0daa9c">{{ label + t(`sys.model.${useMore}`) }}</span>
      </template> -->
    </van-cell>
    <moreOption
      v-if="showMoreOptions"
      v-model:useMore="useMore"
      v-model:ope="ope"
      :moreOptions="moreOptions"
      :fieldType="fieldType"
      :disabled="disabled"
      @change="modelValue = null"
      @clear="handleClear"
    />
  </div>
</template>

<script setup lang="ts">
  import { defineAsyncComponent, computed, reactive, toRefs } from 'vue';
  import { SearchWidgets } from '/@page-designer/types/web/search-widget-types';
  import { SearchComponents } from '/@page-designer/enum';
  import { useI18n } from '@mobile/utils/useI18n';
  import { useDependency } from '/@web-render/render/Event/Dependency/useDependency';
  import moreOption from '../more_option.vue';

  const SearchInput = defineAsyncComponent(() => import('./search_input.vue'));
  const SearchNumberInput = defineAsyncComponent(() => import('./search_number.vue'));
  const SearchSelect = defineAsyncComponent(() => import('./search_select.vue'));
  const SearchSwitch = defineAsyncComponent(() => import('./search_switch.vue'));
  //
  const SearchTime = defineAsyncComponent(() => import('./search_time.vue'));
  const SearchDateTime = defineAsyncComponent(() => import('./search_datetime.vue'));
  const SearchDate = defineAsyncComponent(() => import('./search_date.vue'));
  const SearchRdoSelect = defineAsyncComponent(() => import('./search_rdo_select.vue'));
  const SearchPrinter = defineAsyncComponent(() => import('./search_printer.vue'));
  const SearchTmplTreeSelect = defineAsyncComponent(() => import('./search_tmpl_tree_select.vue'));
  const SearchUserSelect = defineAsyncComponent(() => import('./search_select.vue'));
  const SearchSelectDepartment = defineAsyncComponent(() => import('./search_select.vue'));
  const SearchTransaction = defineAsyncComponent(() => import('./search_select.vue'));

  const WidgetsMap = {
    SearchInput,
    SearchSelect,
    SearchSwitch,
    SearchNumberInput,
    SearchStringNumberInput: SearchNumberInput,
    SearchDateTime,
    SearchDate,
    SearchTime,
    SearchRdoSelect,
    SearchPrinter,
    SearchTmplTreeSelect,
    SearchUserSelect,
    SearchSelectDepartment,
    SearchTransaction,
  };

  const { t } = useI18n();

  const props = defineProps<{
    value: any;
    widget: SearchWidgets;
    modelCategory: string;
    formData: IData;
    rules: any;
  }>();

  const emit = defineEmits(['update:value']);

  const { type, i18n } = reactive(props.widget);
  // const { fieldType, moreOptions } = reactive(props.widget.props);
  useDependency(props.widget as any, {});
  const {
    label,
    moreOptions,
    displayLabelText,
    readonly,
    useMore,
    isRang,
    disabled,
    ope,
    fieldType,
  } = toRefs(props.widget.props);

  /* eslint-disable */
  const showMoreOptions = computed(() => {
    return moreOptions && moreOptions.value && moreOptions.value.length > 0 && !readonly.value;
  });
  /* eslint-enable */ // 重新开启校验

  const renderRef = computed(() => {
    console.log('type', type, props.widget);
    return WidgetsMap[type];
  });

  const isUseMore = computed(() => {
    return (
      [SearchComponents.SearchSelect, SearchComponents.SearchSwitch].includes(type) &&
      useMore?.value
    );
  });

  const formAttr = computed(() => {
    const res = {};

    if (
      [
        SearchComponents.SearchNumberInput,
        SearchComponents.SearchSwitch,
        SearchComponents.SearchDate,
        SearchComponents.SearchDateTime,
        SearchComponents.SearchTime,
        SearchComponents.SearchSelect,
        SearchComponents.SearchTransaction,
        SearchComponents.SearchRdoSelect,
        SearchComponents.SearchUserSelect,
        SearchComponents.SearchSelectDepartment,
        SearchComponents.SearchPrinter,
        SearchComponents.SearchTmplTreeSelect,
      ].includes(type)
    ) {
      Object.assign(res, {
        isLink: !(readonly.value || disabled.value),
        clickable: !(disabled.value || readonly.value),
      });

      if (
        ([
          SearchComponents.SearchDate,
          SearchComponents.SearchDateTime,
          SearchComponents.SearchTime,
        ].includes(type) &&
          isRang?.value) ||
        SearchComponents.SearchNumberInput === type
      ) {
        Object.assign(res, {
          isLink: false,
        });
      }
    }

    if (isUseMore.value) {
      Object.assign(res, {
        isLink: true,
        clickable: false,
      });
    }

    return {
      ...res,
    };
  });

  const modelValue = computed<any>({
    get() {
      return props.value;
    },
    set(value) {
      emit('update:value', value);
    },
  });

  const handleClear = () => {
    modelValue.value = null;
  };

  const computedLabel = computed(() => {
    return displayLabelText.value || displayLabelText.value === undefined
      ? i18n?.label
        ? t(i18n.label)
        : label.value
      : '';
  });
</script>

<style scoped lang="less">
  :deep(.custom-cell-title) {
    box-sizing: border-box;
    flex: none;
    width: var(--van-field-label-width);
    margin-right: var(--van-field-label-margin-right);
    color: var(--van-field-label-color);
    text-align: left;
    word-wrap: break-word;
  }

  :deep(.van-field__value) {
    height: auto !important;
  }

  .tag-label-disabled {
    color: var(--van-field-input-disabled-text-color);
  }

  :deep(.van-cell:after) {
    border-bottom: 0;
  }

  :deep(.van-cell__right-icon) {
    display: flex;
    align-items: center;
    height: auto;
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
    line-height: inherit;
  }
  .more-disabled {
    :deep(.van-cell__right-icon.van-icon-arrow) {
      opacity: 0.3;
    }
  }
</style>
