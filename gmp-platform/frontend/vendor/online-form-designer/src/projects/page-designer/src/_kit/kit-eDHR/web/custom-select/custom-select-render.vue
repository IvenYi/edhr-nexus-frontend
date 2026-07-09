<template>
  <a-form-item
    :label="label"
    :name="field"
    :rules="{
      required: !formReadonly && !readonly && !disabled && required,
      message: t('sys.notEmptySth', { sth: label }),
    }"
    :class="[disabled ? 'from-item--disabled' : null, readonly ? 'readonly-field-item' : '']"
    :style="wrapperStyle"
  >
    <FieldReadonly
      v-if="readonly"
      :tagWidgetStyle="props.widget.style"
      :label="fieldValue"
      :is-design="false"
    />

    <a-select
      v-else
      allowClear
      v-model:value="fieldValue"
      :mode="selectMode"
      :show-search="showSearch"
      :placeholder="placeholder"
      :search-value="searchValue"
      :options="options"
      :filter-option="frontSearch ? filterOption : false"
      :getPopupContainer="PopupContainer"
      :disabled="disabled"
      @change="onChange"
      @clear="onClear"
      @select="onSelect"
      @inputKeyDown="onEnter"
      @search="onSearch"
      @popupScroll="handlePopupScroll"
      @dropdownVisibleChange="onDropLoad"
    >
      <template #notFoundContent>
        <a-empty
          :description="noDataTip || t('sys.noData')"
          :image="Empty.PRESENTED_IMAGE_SIMPLE"
          style="margin: 12px 0"
        />
      </template>
    </a-select>
  </a-form-item>
</template>

<script setup lang="ts" name="gct-device-select">
  import { computed, reactive, ref, onMounted, inject, nextTick } from 'vue';
  import { debounce } from 'lodash-es';
  import { Empty } from 'ant-design-vue';
  import { ICusSelect } from './schema';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useStyle } from '/@page-designer/hooks/useStyle';
  import { getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import FieldReadonly from '/@page-designer/components/widgets/web/__components__/formcomponent/field-readonly.vue';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { transformData } from '/@page-designer/components/widgets/hooks/utils';

  const { t } = useI18n();
  const emit = defineEmits(['update:modelValue']);

  const Event = getPageEvent();
  const props = defineProps<{
    modelValue?: string;
    widget: ICusSelect;
    formData: Object;
  }>();

  const {
    displayLabelText,
    initLoad,
    frontSearch,
    selectMode,
    readonly,
    required,
    field,
    refFieldModel,
    placeholder,
    noDataTip,
    showSearch,
    customdataSource,
    datasourceConfig,
  } = reactive(props.widget?.props);

  const disabled = computed(() => props.widget.props.disabled);
  const formReadonly = inject('formReadonly');
  const labelLayout = inject('labelLayout');
  const { wrapperStyle, labelFont, contentFont } = useStyle(props.widget);
  const PopupContainer = getParentPopupContainer({});

  const fieldValue = computed({
    get() {
      let value = props.modelValue || undefined;
      if (selectMode === 'multiple') {
        return value?.split(',').filter((i) => i) || [];
      }
      return value;
    },
    set(val) {
      const newVal = selectMode === 'multiple' ? (val as Array<string>).join(',') : val;
      emit('update:modelValue', newVal);
    },
  });

  const label = computed(() => {
    if (!displayLabelText) {
      return '';
    }
    return props.widget.props.label;
  });

  const loadMore = ref<boolean>(false);
  const pagination = reactive({
    pageNo: 1,
    pageSize: 30,
    totalPage: 0,
  });

  const searchValue = ref('');
  const itemData = ref({});
  const options = ref<any[]>([]);

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

  async function queryOptionData(queryParam?) {
    try {
      if (!initLoad) return;

      const res = customApi
        ? await customApi(
            Object.assign({}, queryParam, {
              pageNo: pagination.pageNo,
              pageSize: pagination.pageSize,
            }),
          )
        : await queryRefOption(queryParam);
      await nextTick();
      transformOptionData(res?.data || [], res?.dict || {});
      loadMore.value = res?.totalPage > pagination.pageNo;
      pagination.totalPage = res?.totalPage;
      pagination.pageNo = res?.pageNo;
      pagination.pageSize = res?.pageSize;
    } catch (err) {
      loadMore.value = false;
      pagination.totalPage = 0;
      pagination.pageNo = 1;
      pagination.pageSize = 30;
    } finally {
      Event.runEventByName('onLoaded', props.widget.events, options.value);
    }
  }

  async function queryRefOption(queryParam?: any) {
    const res = (await postBizServiceByModelKeyByBsKey(
      {
        modelKey: refFieldModel,
        bsKey: 'listByPage',
      },
      {
        query: {
          ...queryParam,
        },
        pageNo: pagination.pageNo,
        pageSize: pagination.pageSize,
      },
    )) as any;

    return res;
  }
  const filterOption = (inputValue, option) => {
    return option.label.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
  };

  /**
   * 滚动到底部，加载下一页数据
   * @param e 滚动事件
   */
  function handlePopupScroll(e) {
    const target = e.target as HTMLElement;
    if (target.scrollTop + target.clientHeight >= target.scrollHeight) {
      if (!loadMore.value) return;
      pagination.pageNo++;
      queryOptionData();
    }
  }

  function onDropLoad(visible) {
    if (!visible) return;
    queryOptionData();
  }

  function onChange(value, option) {
    const { _item } = option || {};
    console.log('onChange', value, option, _item);
    itemData.value = _item;
    Event.runEventByName('onChange', props.widget.events, value, option, props.formData);
  }

  function onSelect(value, option) {
    const { _item } = option;
    itemData.value = _item;
    Event.runEventByName('afterSelect', props.widget.events, value, option, props.formData);
  }

  function onEnter(e) {
    if (e.keyCode !== 13) return;

    searchValue.value = e.target.value;
    if (!e.target.value && options.value.length) return;

    fieldValue.value = selectMode === 'multiple' ? [searchValue.value] : searchValue.value;

    Event.runEventByName(
      'onEnter',
      props.widget.events,
      fieldValue.value,
      searchValue.value,
      props.formData,
    );
  }

  function onSearch(keyword?: string) {
    searchValue.value = keyword || '';
    if (frontSearch) return;

    debounceSearch(keyword);
  }

  function onClear() {
    Event.runEventByName('afterClear', props.widget.events);
  }

  const transformOptionData = (data: any[], dict?: any) => {
    const _options = options.value;
    if (!data || !data?.length) return;

    data?.forEach((item) => {
      const exist = _options.find((i) => i.value === item.id_);
      if (!exist) {
        options.value.push({
          label: item.name_,
          value: item.id_,
          _item: transformData(item, dict),
        });
      }
    });
  };

  const debounceSearch = debounce((keyword) => {
    pagination.pageNo = 1;
    options.value = [];
    queryOptionData({ 'name_.like': keyword });
  }, 300);

  // 获取缺失的选项
  async function getMissingOption() {
    const res = await getOptionByIds(props.modelValue);
    transformOptionData(res?.data, res?.dict);
  }

  async function getOptionByIds(ids?: string) {
    if (!ids) return [];
    const res = (await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
      {
        modelKey: refFieldModel,
        bsKey: 'listByIds',
        modelCategory: EntityModelCategoryEnum.ENTITY,
      },
      {
        ids,
      },
      {
        ids,
      },
    )) as any;

    return res || { data: [], dict: {} };
  }

  onMounted(() => {
    queryOptionData();
    getMissingOption();
  });

  defineExpose({
    setValue(value: string | string[]) {
      fieldValue.value = value;
    },
    getValue() {
      return fieldValue.value;
    },
    setOptions(data: any[]) {
      options.value = data;
    },
    async reload(params?) {
      await queryOptionData(params);
    },
  });
</script>

<style lang="less" scoped>
  :deep(.ant-form-item-label) {
    width: v-bind('labelLayout?.width');
    text-align: v-bind('labelFont.textAlign');

    > label {
      color: v-bind('labelFont.color');
      font-size: v-bind('labelFont.fontSize');
      font-style: v-bind('labelFont.fontStyle');
      font-weight: v-bind('labelFont.fontWeight');
      text-decoration-line: v-bind('labelFont.textDecorationLine');
    }

    &:has(div.label-wrap) {
      overflow: visible;
      white-space: wrap;

      > label {
        align-items: start;
        max-height: none;
        margin-top: 5px;
      }
    }

    .label-ellipsis {
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }

  :deep(.ant-form-item-control) {
    .ant-form-item-control-input {
      .ant-form-item-control-input-content {
        text-align: v-bind('contentFont.textAlign');

        .ant-input,
        .ant-select .ant-select-selector,
        .ant-picker .ant-picker-input input {
          text-align: v-bind('contentFont.textAlign');
        }
      }
    }
  }
  .from-item--disabled {
    :deep(.ant-form-item-label > label) {
      color: rgb(0 0 0 / 25%);
    }
  }
</style>
