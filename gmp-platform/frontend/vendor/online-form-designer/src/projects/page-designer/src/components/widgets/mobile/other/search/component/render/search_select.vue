<template>
  <van-field
    v-bind="formAttr"
    v-model="showValue"
    :error-message="errMsg"
    style="padding: 0; background-color: transparent"
    :class="useMore && 'is-disabled'"
    @click="openView"
  >
    <template #input v-if="showValue">
      <div>{{ showValue }}</div>
    </template>
    <template #button v-if="!showIcon">
      <van-icon v-if="showValue" name="clear" size="20" color="#c8c9cc" @click.stop="onClear" />
    </template>
  </van-field>
</template>

<script setup lang="ts">
  import { computed, reactive, toRefs, ref, onBeforeMount, toRaw, watch } from 'vue';
  import {
    RetrunList,
    useAsyncOptions,
    getPageEvent,
  } from '/@page-designer/components/widgets/hooks/hooks';
  import { SearchSelect } from '/@page-designer/types/web';
  import { type FieldProps } from 'vant';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { createTreePopup } from '@mobile/components/treePopup';
  import { BindCmpStyleEnum, ListTreeSearchTypeEnum } from '/@page-designer/enum';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import { EntityModelTypeEnum } from '@/projects/app-designer/src/enum';
  import {
    getQueryDateByKeyWord,
    useQueryfilter,
    getIKeywordFieldKeys,
    getIExp,
  } from '/@page-designer/components/widgets/hooks/listhook';
  import { intersection } from 'lodash-es';
  import { SEARCH_SEVICE } from '/@/enums/designEnum';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';
  import { useI18n } from '@mobile/utils/useI18n';

  const { t } = useI18n();

  const { displayValue: emptyDisplayValue } = useGlobalSetting();
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
  // 非单选算子
  const notSingleArr = [
    SEARCH_SEVICE.IN,
    SEARCH_SEVICE.NOTIN,
    SEARCH_SEVICE.CONTAINANY,
    SEARCH_SEVICE.CONTAINALL,
    SEARCH_SEVICE.VERSIONIN,
    SEARCH_SEVICE.VERSIONNOTIN,
  ];

  /**
   * 是否完全为多选算子
   *
   * @description 只有全部是多选算子时，下拉才可以算是多选
   * @author zhanghanrui
   * @date 2024-09-20 11:09:47
   * @export
   * @param {string[]} arr
   * @return {*}  {boolean}
   */
  function isMultipleOperator(arr: string[]): boolean {
    // 计算多选算子交集
    const items = intersection(arr, notSingleArr) as string[];
    // 给入算子全是多选算子，返回 true
    if (items.length > 0 && items.length === arr.length) {
      return true;
    }
    return false;
  }

  const errMsg = ref<string>('');
  const Event = getPageEvent();
  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    modelCategory: string;
    showIcon: boolean;
    formData: IData;
  }>();

  const emit = defineEmits(['update:modelValue']);

  const state = reactive(props.widget.props);
  const {
    label,
    field: fieldKey,
    fieldType,
    placeholder,
    moreOptions,
    ignoreOptions,
    bindModelKey,
    modelKey,
    refModelType,
    linkageField,
    ruleConfig,
    searchField,
    showSearch,
    customMenu,
    customMenuFilter,
    datasourceConfig,
    customdataSource,
    datafilter,
    // exp,
    readonly,
  } = state;
  const queryfilter = useQueryfilter(datafilter);
  // 是否为数据连接模式
  const isLinkageMode = computed<boolean>(() => {
    if (
      ruleConfig &&
      ruleConfig.strongDependence === false &&
      !props.formData[ruleConfig.fieldId]
    ) {
      return false;
    }
    if (linkageField && linkageField.length > 0) {
      return true;
    }
    if (ruleConfig) {
      return true;
    }
    return false;
  });
  // 自定义枚举值选项
  let customOption = ref<RetrunList[]>([]);
  const { ope, useMore } = toRefs(state);
  const isTree = ref<boolean>(refModelType === EntityModelTypeEnum.TREE);
  const multiple = isMultipleOperator(ope.value);
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
  const { getAsyncOptions, options, getNextOptions } = useAsyncOptions(fieldType!, {
    isTree: isTree.value,
    customApi,
    isLinkage: () => isLinkageMode.value,
  });

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
  });

  /**兼容老版本 */
  function getExpByData(exp, data) {
    const fileds = Object.keys(data);
    if (fileds.length && !exp) {
      return `OR(${fileds.join(',')})`;
    }
  }

  /**下拉框异步请求统一入口 */
  async function getOptionsByquery(
    params: {
      keyword?: string;
      queryData?: object;
      searchType?: ListTreeSearchTypeEnum;
      parent_id_?: string;
      exp?: string;
      pageNo?: number;
      pageSize?: number;
      ids?: [];
    } = {},
  ) {
    const { keyword, searchType, parent_id_, pageNo, pageSize } = params;
    // let exp = params.exp;
    let exp = getIExp(params?.exp, ignoreOptions);
    let queryData = params.queryData;
    if (keyword && !searchType) {
      options.value = [];
    }
    if (keyword || parent_id_ || searchType) {
      const keywordFieldKeys = getIKeywordFieldKeys(searchField, ignoreOptions);
      queryData = keyword ? getQueryDateByKeyWord({ searchField: keywordFieldKeys, keyword }) : {};
      exp = getExpByData(exp, queryData) || exp;
    }
    if (isLinkageMode.value) {
      const res = await getAsyncOptions({
        modelCategory: props.modelCategory,
        fieldKey,
        data: props.formData,
        linkageField,
        ruleConfig,
        pageNo,
        pageSize,
      });
      return res.finished;
    } else {
      const res = await getAsyncOptions({
        fieldKey: fieldKey,
        modelKey,
        bindModelKey,
        queryData: { ...queryData, ...queryfilter.query },
        searchType,
        parent_id_,
        exp: queryfilter.getExp(exp),
        modelCategory: props.modelCategory,
        pageNo,
        pageSize,
        ignoreCase: ignoreCase.value,
        keyword,
      });
      return res.finished;
    }
  }

  // 数据连接模式下，监控连接项的值。在值变更时清空自身
  if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false)) {
    const key = ruleConfig ? ruleConfig.fieldId : linkageField[0].value;
    // eslint-disable-next-line vue/no-setup-props-destructure
    let val = props.formData[key];
    watch(props.formData, () => {
      if (val != props.formData[key]) {
        val = props.formData[key];
        fieldValue.value = null;
        options.value = [];
        errMsg.value = '';
      }
    });
  }

  onBeforeMount(async () => {
    if (multiple) {
      await getmaxTagLength({ fieldKey: fieldKey, modelKey: modelKey });
    }

    if ([FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI].includes(fieldType as FIELD_TYPE)) {
      await getAsyncOptions({
        modelKey,
        fieldKey,
        bindModelKey,
        selectType: BindCmpStyleEnum.CMP_TREE_SELECTION,
      });
    } else {
      !isTree.value && (await getOptionsByquery());
      if (customMenu) {
        customOption.value = options.value.filter((item) => {
          return customMenuFilter.includes(item.value);
        });
      }
    }
  });

  const formAttr = computed(() => {
    return {
      name: props.widget.id,
      placeholder: useMore.value
        ? $t(`sys.model.${useMore.value}`)
        : placeholder || $t('sys.pleaseSelectSth'),
      inputAlign: 'right',
      readonly,
      clickable: false,
      border: false,
    } as FieldProps;
  });

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          let value = props.modelValue;
          if (multiple && value) {
            let arr: string[] = [];
            if (typeof value === 'string') {
              arr = value.split(',');
            } else {
              arr = value;
            }
            return arr.filter((i) => i) || [];
          }
          return value || undefined;
        },
        set(value: string[]) {
          emit('update:modelValue', multiple ? value?.join(',') : value);
        },
      })
    : ref();

  const handleLabel = (label) => {
    if (readonly) {
      return label;
    }
    const maxTagTextLength = attrObj.value?.maxTagTextLength || 12;
    if (label?.length > maxTagTextLength) {
      return label.slice(0, maxTagTextLength) + '...';
    }
    return label;
  };

  const showValue = computed(() => {
    if (!options.value) {
      if (props.widget.props.readonly) {
        return emptyDisplayValue.value;
      }
      return '';
    }
    const optionList = options.value;
    const key = 'value';
    if (multiple) {
      const info = optionList
        .filter((i: any) => {
          if (!fieldValue.value || fieldValue.value.length == 0) {
            return false;
          }
          if (typeof fieldValue.value === 'string') {
            return fieldValue.value.indexOf(i[key]) > -1;
          }
          return fieldValue.value.includes(i[key]);
        })
        .map((i) => toRaw(i));

      if (info && info.length) {
        return info.map((item) => handleLabel(item?.label || item?.name)).join(',');
      }
    } else {
      let data = toRaw(optionList.find((i: any) => i[key] === fieldValue.value));
      if (data) {
        return handleLabel(data.label || data.name);
      }
    }
    if (props.widget.props.readonly) {
      return emptyDisplayValue.value;
    }
    return '';
  });

  const isLazy = ref(
    [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI].includes(
      fieldType!,
    ),
  );

  const { openTreePopup } = createTreePopup({
    api: getAsyncOptions,
    options: options,
    title: label,
    fieldKey: fieldKey,
    modelKey: modelKey,
    ignoreCase: ignoreCase.value,
  });

  const { openListPopup } = createListPopup({
    // api: getOptionsByquery,
    api: isLazy.value ? getOptionsByquery : undefined,
    options: customMenu && !customdataSource ? customOption : options,
    title: label,
    fieldKey: fieldKey,
    fieldType,
    multiple: multiple,
    showSearch: [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(fieldType!) ? !!showSearch : true,
    isTree: isTree.value,
    lazy: isLazy.value,
    // selectedOptions: checkeOpts,
    iconNode: [FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(fieldType!),
    remote: [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI, FIELD_TYPE.USER, FIELD_TYPE.USER_MULTI].includes(
      fieldType!,
    ),
    onloadMore: isLazy.value ? getNextOptions : undefined,
    ignoreCase: ignoreCase.value,
    modelKey: modelKey,
  });

  let lastVal = '';

  async function openView() {
    if (useMore?.value || props.showIcon) return;
    if (isLinkageMode.value) {
      let val = '';
      if (ruleConfig) {
        val = props.formData[ruleConfig.fieldId];
        if (!val) {
          errMsg.value = `请先选择：${ruleConfig.fieldLabel}`;
          return;
        }
      } else {
        const first = linkageField[0];
        const val = props.formData[first.id];
        if (!val) {
          errMsg.value = `请先选择：${linkageField[0].label}`;
          return;
        }
      }
      if (lastVal !== val) {
        lastVal = val;
        await getOptionsByquery();
      }
    }
    errMsg.value = '';
    if ([FIELD_TYPE.ORG, FIELD_TYPE.ORG_MULTI].includes(fieldType as FIELD_TYPE)) {
      openTreePopup({
        ids: fieldValue.value,
        type: multiple ? 'multiple' : 'single',
        callback(a: any) {
          fieldValue.value = a;
        },
      });
    } else {
      openListPopup({
        ids: fieldValue.value,
        callback({ a, checkOptions }) {
          fieldValue.value = a;
          console.log(checkOptions);
        },
      });
    }
  }

  const onClear = () => {
    emit('update:modelValue', undefined);
  };

  defineExpose({});
</script>
<style scoped lang="less">
  .is-disabled {
    :deep(.van-field__control) {
      opacity: 0.5;
    }
  }
</style>
