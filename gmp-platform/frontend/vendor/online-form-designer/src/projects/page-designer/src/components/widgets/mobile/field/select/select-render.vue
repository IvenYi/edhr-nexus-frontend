<template>
  <vantField
    v-model="validateField"
    :error="hasError"
    :error-message="!fieldValue && hasError ? hasErrorTxt : ''"
    :props="widget.props"
    :style="widget.style"
    @click="openView"
    :isLink="!validateField"
    readonly
    clearable
    @clearValue="handleClear"
    :formData="formData"
  >
    <template #input v-if="validateField">
      <FieldSelect
        v-bind="separatorAttr"
        v-model:value="fieldValue"
        :maxTagTextLength="readonly ? undefined : attrObj.maxTagTextLength"
      />
    </template>
  </vantField>
</template>
<script name="gct-select" setup lang="ts">
  import { ref, computed, toRefs, toRaw, nextTick, toRef, reactive, onMounted, watch } from 'vue';
  import {
    useAsyncOptions,
    getPageEvent,
    type RetrunList,
  } from '/@page-designer/components/widgets/hooks/hooks';
  // import { showNotify } from 'vant';
  import { Select } from '/@page-designer/types/web';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { FieldSelect } from '/@page-designer/components/widgets/mobile/__components__';
  import { createListPopup } from '/@page-designer/components/widgets/mobile/__components__/listPopup';
  import vantField from '../../__components__/vantField.vue';
  import { EntityModelTypeEnum } from '@/projects/app-designer/src/enum';
  import { useDisabled } from '../../../hooks/useReadyonly';
  import {
    useQueryfilter,
    getQueryDateByKeyWord,
  } from '/@page-designer/components/widgets/hooks/listhook';
  import { ListTreeSearchTypeEnum } from '/@page-designer/enum';
  // import { debounce } from 'lodash-es';
  import { i18n } from '@mobile/locales/setupI18n';
  import { postModelComprehensiveQueryRefDataByIdsByModelCategory } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { IMobSelectComponentExpose } from '/@/projects/page-designer/src/interface/mobile';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { useAsyncFileAttrs } from '/@page-designer/components/widgets/hooks/useFileAttrsHooks';

  const { t } = i18n.global;
  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Select;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      getPopupContainer: (triggerNode) => triggerNode.parentNode,
    },
  );
  const Event = getPageEvent();
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
  /** 关联模型字段 状态exp和筛选项 */
  const bindStateQuery = ref();
  const showDisabled = computed(() => useDisabled(props.widget.props.disabled));
  // 用于表单校验的字段
  const validateField = computed(() => {
    return fieldValue.value && String(fieldValue.value);
  });
  const emit = defineEmits(['update:modelValue']);
  const { formData } = toRefs<{ [key: string]: any }>(props);
  const {
    fieldType,
    field,
    label,
    fieldName,
    autofillRules,
    enableAutofill,
    modelKey,
    bindModelKey,
    searchField,
    exp,
    showSearch,
    valueField,
    rangeField,
    refModelType,
    initNotLoad,
    initLoad,
    customdataSource,
    datasourceConfig,
    datafilter,
    modeldata,
    linkageField,
    ruleConfig,
    customMenu,
    customMenuFilter,
    readonly,
  } = reactive(props.widget.props);
  //父表单获取模型大类型
  const modelCategory = modeldata?.modelCategory || 'entity';
  const queryfilter = useQueryfilter(datafilter);
  const customApi =
    customdataSource && datasourceConfig?.name
      ? (queryData) =>
          Event.runExportByName(
            datasourceConfig?.name,
            queryData,
            formData.value,
            datasourceConfig?.extraParams,
          )
      : undefined;

  // 是否为数据连接模式
  const isLinkageMode = computed<boolean>(() => {
    if (
      ruleConfig &&
      ruleConfig.strongDependence === false &&
      !props.formData[ruleConfig.fieldKey]
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

  const isLazy = ref([FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(fieldType!));
  const isTree = ref<boolean>(refModelType === EntityModelTypeEnum.TREE && !isLinkageMode.value);
  const { getAsyncOptions, options, multiple, getNextOptions, getRefOptionsByIds } =
    useAsyncOptions(fieldType!, {
      isTree: isTree.value,
      customApi,
      isLinkage: () => isLinkageMode.value,
    });
  // const treeExpandedKeys = ref<any[]>([]);
  // const checkedMap = ref(new Map<string | number, RetrunList>());
  const checkeOpts = ref<RetrunList[]>([]);
  //需不需初始化要自动加载 状态 initLoad 新的字段
  const readyOnload = ref(initLoad === undefined ? initNotLoad !== true : initLoad);
  const hasError = ref<boolean>(false);
  let hasErrorTxt = t('sys.pageDesigner.pleaseSelectFirstSth', { sth: label || fieldName });
  // 字段范围取值范围的查询条件，后期会将字段范围取值范围功能删除
  const rangeQueryData = ref({});
  // 自定义枚举值选项
  let customOption = ref<RetrunList[]>([]);
  // 数据连接模式下，监控连接项的值。在值变更时清空自身
  if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false)) {
    const key = ruleConfig ? ruleConfig.fieldKey : linkageField?.[0].value;
    // eslint-disable-next-line vue/no-setup-props-destructure
    let val = props.formData[key];
    watch(props.formData, () => {
      if (val != props.formData[key]) {
        val = props.formData[key];
        fieldValue.value = null;
        options.value = [];
      }
    });
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
    const { keyword, searchType, parent_id_, pageNo, pageSize, ids } = params;
    let exp = params.exp;
    let queryData = params.queryData;
    if (keyword && !searchType) {
      options.value = [];
    }
    if (keyword || parent_id_ || searchType) {
      queryData = keyword ? getQueryDateByKeyWord({ searchField, keyword }) : {};
      exp = getExpByData(exp, queryData) || exp;
    }
    if (isLinkageMode.value) {
      const res = await getAsyncOptions({
        modelCategory,
        fieldKey: field,
        data: props.formData,
        linkageField,
        ruleConfig,
        pageNo,
        pageSize,
      });
      return res.finished;
    } else {
      const res = await getAsyncOptions({
        fieldKey: field,
        modelKey,
        bindModelKey,
        queryData: {
          ...queryData,
          ...queryfilter.query,
          ...rangeQueryData.value,
          ...bindStateQuery.value?.query,
        },
        searchType,
        parent_id_,
        exp: queryfilter.getExp(
          bindStateQuery.value?.exp
            ? exp
              ? `AND(${(exp, bindStateQuery.value?.exp)})`
              : bindStateQuery.value?.exp
            : exp
              ? exp
              : '',
        ),
        modelCategory,
        pageNo,
        pageSize,
        ids,
      });
      return res.finished;
    }
  }

  const separatorAttr = computed(() => {
    return {
      disabled: showDisabled.value,
      readonly: readonly,
      fieldType: fieldType,
      tagStyle: props.widget.style,
      // options: isTree.value ? options.value : checkeOpts.value,
      options: checkeOpts.value,
      multiple: multiple,
      refModelType: refModelType,
      isLinkageMode: isLinkageMode.value,
    };
  });

  onMounted(async () => {
    await getBindModelstate();
    //初始化不加载 或者 配置数据联动的时候不加载
    if (multiple) {
      await getmaxTagLength({ fieldKey: field, modelKey: modelKey });
    }

    if (
      readyOnload.value &&
      (!valueField || !rangeField) &&
      ![FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(fieldType!)
    ) {
      await getOptionsByquery();
      checkeOpts.value = options.value.filter((e) =>
        multiple ? fieldValue.value.includes(e.value) : e.value == fieldValue.value,
      );
      if (customMenu && !(customdataSource && datasourceConfig?.name)) {
        customOption.value = options.value.filter((item) => {
          return customMenuFilter.includes(item.value);
        });
      }
    }
    /**补差id */
    // await getOptionsByIds(fieldValue.value);
    // setOptionsByRefField(fieldValue.value);
  });
  const getBindModelstate = async () => {
    if (bindModelKey && [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(fieldType)) {
      const bindStateInfo = await FieldSchema.getConfigByModel(bindModelKey);
      if (bindStateInfo && bindStateInfo.specificConfig.operatingStateEnabled) {
        bindStateQuery.value = {
          exp: 'operating_state_.eq',
          query: {
            'operating_state_.eq': true,
          },
        };
      }
    }
  };
  /**字段范围取值范围功能开始 后期会删除 */
  const rangeValue = toRef(() => {
    return valueField && rangeField ? formData.value[valueField.split('$')[0]] : '';
  });
  watch(rangeValue, async (value, oldVal) => {
    if (value && valueField && rangeField) {
      const rangeKey = `${rangeField}.eq`;
      rangeQueryData.value[rangeKey] = value;
    } else {
      options.value = [];
    }
    if (!value || !fieldValue.value || oldVal) {
      emit('update:modelValue', undefined);
    }
  });
  /**字段范围取值范围功能结束 */

  /**初始化选项 */
  const resetOptions = () => {
    if (readyOnload.value) {
      getOptionsByquery();
    }
  };

  // /**防抖处理搜索 */
  // const debonceSearch = debounce((keyword, searchType, parent_id_) => {
  //   if (keyword?.trim() || parent_id_ || searchType) {
  //     const queryData = keyword?.trim() ? getQueryDateByKeyWord({ searchField, keyword }) : {};
  //     getOptionsByquery({
  //       searchType,
  //       parent_id_,
  //       exp: getExpByData(exp, queryData) || exp,
  //       queryData,
  //     });
  //   }
  //   if (!(keyword?.trim() || parent_id_ || searchType)) {
  //     /**清空输入选项的时候重置输入框 */
  //     resetOptions();
  //   }
  // }, 300);
  /**兼容老版本 */
  function getExpByData(exp, data) {
    const fileds = Object.keys(data);
    if (fileds.length && !exp) {
      return `OR(${fileds.join(',')})`;
    }
  }
  /**搜索 */
  const handleSearch = (
    params: {
      keyword?: string;
      searchType?: ListTreeSearchTypeEnum;
      parent_id_?: string;
      pageNo?: number;
      pageSize?: number;
    } = {},
  ) => {
    const { keyword, searchType, parent_id_, pageNo, pageSize } = params;
    if (keyword && !searchType) {
      options.value = [];
    }
    // debonceSearch(keyword, searchType, parent_id_);
    if (keyword?.trim() || parent_id_ || searchType) {
      const queryData = keyword?.trim() ? getQueryDateByKeyWord({ searchField, keyword }) : {};
      getOptionsByquery({
        searchType,
        parent_id_,
        exp: getExpByData(exp, queryData) || exp,
        queryData,
        pageNo,
        pageSize,
      });
    }
    if (!(keyword?.trim() || parent_id_ || searchType)) {
      /**清空输入选项的时候重置输入框 */
      resetOptions();
    }
  };

  // /**下拉分页事件 */
  // function popupScroll(e) {
  //   //初始化不加载 和 手动设置值的不需要执行
  //   if (!readyOnload.value) return;
  //   const { target } = e;
  //   if (target.scrollTop + target.offsetHeight === target.scrollHeight) {
  //     getNextOptions();
  //   }
  // }
  // 是否分页加载
  const { openListPopup } = createListPopup({
    api: isLazy.value ? getOptionsByquery : undefined,
    options: customMenu && !(customdataSource && datasourceConfig?.name) ? customOption : options,
    title: label || fieldName,
    fieldKey: field,
    fieldType,
    isTree: isTree.value,
    multiple: multiple,
    lazy: isLazy.value,
    selectedOptions: checkeOpts,
    iconNode: [FIELD_TYPE.ENUM, FIELD_TYPE.ENUM_MULTI].includes(fieldType!),
    remote: [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(fieldType!),
    showSearch: [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(fieldType!) ? !!showSearch : true,
    onloadMore: isLazy.value ? getNextOptions : undefined,
    modelKey: modelKey,
  });

  const fieldValue = props.widget.props.field
    ? computed<any>({
        get() {
          let value = props.modelValue || undefined;
          return multiple
            ? Array.isArray(value)
              ? value
              : value?.split(',').filter((i) => i) || []
            : value;
        },
        set(value: string[]) {
          emit('update:modelValue', multiple ? value && value?.join(',') : value);
        },
      })
    : ref();

  watch(
    () => fieldValue.value,
    async (val) => {
      const opts = [...options.value];
      const ids = multiple ? val : val ? [val] : [];
      checkeOpts.value = options.value.filter((e) => ids.includes(e.value));
      if (isLazy.value && ids.length && ids.some((e) => !opts.find((f) => f.value === e))) {
        await getRefOptsByIds(ids);
      }
    },
    { immediate: true },
  );

  // watchDebounced(
  //   fieldValue,
  //   async (newValue) => {
  //     /**补差id */
  //     // await getOptionsByIds(newValue);
  //     await getRefOptsByIds(newValue);
  //     // setOptionsByRefField(newValue);
  //     if (!newValue?.length && isTree.value) {
  //       handleSearch();
  //     }
  //   },
  //   {
  //     debounce: 200,
  //   },
  // );
  /**
   * 关联模型关联字段的补充
   */
  // function setOptionsByRefField(newValue) {
  //   if (
  //     fieldType === FIELD_TYPE.REF &&
  //     Array.isArray(checkeOpts.value) &&
  //     checkeOpts.value?.length &&
  //     newValue
  //   ) {
  //     const data = getCheckedOpts();
  //     /**关联模型关联字段 */
  //     formData.value._OPCT || (formData.value._OPCT = {});
  //     formData.value._OPCT[field] = data?._item || {};
  //   }
  // }
  /**
   * id补充查询
   * @param ids
   */
  // async function getOptionsByIds(ids?: string[] | string) {
  //   if (!ids) return;
  //   if (fieldType === FIELD_TYPE.REF || fieldType === FIELD_TYPE.REF_MULTI) {
  //     const noneIds = getNoneIds(ids);
  //     if (noneIds?.length) {
  //       const result =
  //         (await getRefOptionsByIds({
  //           fieldKey: field,
  //           modelKey,
  //           bindModelKey,
  //           ids: noneIds,
  //           includeDeleted: true,
  //         })) || {};
  //       checkeOpts.value = [...checkeOpts.value, ...result.valueList!];
  //     }
  //   }
  // }

  async function getRefOptsByIds(ids) {
    const query = {};
    if (ids?.length) {
      query['id_.in'] = ids;
    }
    const { data = [] } =
      (await postModelComprehensiveQueryRefDataByIdsByModelCategory(
        { modelCategory },
        {
          query: { ...query },
          ids,
          modelKey,
          fieldKey: field,
          includeDeleted: true,
          refModelKey: bindModelKey,
        },
      )) || {};
    //deleted_ 表示被软删除的数据
    const valueList = (data || []).map((i: any) => {
      return { disabled: !!i.deleted_, label: i.__LABEL__, value: i.id_ || i.id, _item: i };
    });
    checkeOpts.value.push(...valueList);
    // return { valueList };
  }

  /**获取缺失后需要查询的ids */
  // function getNoneIds(ids: any): string[] | undefined {
  //   if (fieldType === FIELD_TYPE.REF && !checkeOpts.value.find((i) => i.value === ids)) {
  //     return [ids];
  //   }
  //   if (fieldType === FIELD_TYPE.REF_MULTI) {
  //     const idarg = ids.filter((id) => !checkeOpts.value.find((i) => i.value === id));
  //     if (idarg.length) {
  //       /**如果是tree 就查询选中的所有id */
  //       return isTree.value ? ids : idarg;
  //     }
  //   }
  // }
  /**
   * 设置返回的选中options
   */
  function getCheckedOpts() {
    if (multiple) {
      return checkeOpts.value.map((i) => toRaw(i));
    } else {
      return toRaw(checkeOpts.value[0]);
    }
  }

  async function changeSelect(v: any) {
    if (!v || !v.length) {
      deselect(fieldValue.value);
    }
    await nextTick();
    // let data = getOptionValue(v);
    let data: any = getCheckedOpts();
    Event.runEventByName('onChange', props.widget.events, fieldValue.value, data, formData.value);
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = {
        [props.modelValue!]: multiple ? data.map((i: any) => i.label) : data?.label,
      };
    }
    // 自动填充
    if (!enableAutofill || multiple) return;
    const info = await Event.context.$httpBizService(
      {
        action: 'getOne',
        key: bindModelKey!,
        modelCategory: modelCategory,
      },
      {
        query: { 'id_.eq': fieldValue.value },
      },
      {
        includeSubModel: 1,
      },
    );
    autofillRules.forEach(({ fromField, toField }) => {
      formData.value[toField] = info?.data?.[fromField];
    });
  }

  function deselect(clearValue) {
    // let data = getOptionValue(clearValue);
    let data = getCheckedOpts();
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
    formData.value._OPCT[field] = undefined;
    formData.value._DICT[field] = undefined;
    handleSearch();
  }

  async function handleClear() {
    emit('update:modelValue', null);
    deselect(fieldValue.value);
    fieldValue.value = multiple ? [] : '';
    await nextTick();
  }

  let lastVal = '';

  // 打开选择弹框
  async function openView() {
    if (valueField && rangeField && !rangeValue.value) {
      const valueId = valueField.split('$')[1] || '';
      valueId && Event.context.$ref(valueId)?.setError();
      return;
    }
    if (isLinkageMode.value) {
      let val = '';
      if (ruleConfig) {
        val = props.formData[ruleConfig.fieldKey];
        if (!val) {
          hasErrorTxt = t('sys.pageDesigner.pleaseSelectFirstSth', {
            sth: ruleConfig.fieldLabel,
          });
          hasError.value = true;
          // Event.context.$ref(ruleConfig.fieldId)?.setError();
          // showNotify({ type: 'danger', message: `请先选择：${ruleConfig.fieldLabel}` });
          return;
        }
      } else {
        const first: any = linkageField?.[0];
        const val = props.formData[first.value];
        if (!val) {
          hasErrorTxt = t('sys.pageDesigner.pleaseSelectFirstSth', {
            sth: linkageField?.[0].label,
          });
          hasError.value = true;
          // showNotify({ type: 'danger', message: `请先选择：${linkageField?.[0].label}` });
          return;
        }
      }
      if (lastVal !== val) {
        lastVal = val;
        await getOptionsByquery();
      }
    } else {
      if (
        customApi ||
        (fieldValue.value &&
          ((multiple && fieldValue.value?.length == options.value?.length) ||
            (!multiple && options.value?.length == 1)))
      ) {
        await getOptionsByquery();
      }
    }
    // if (isTree.value && fieldValue.value) {
    //   await getOptionsByIds(fieldValue.value);
    //   console.log(checkeOpts.value, 'checkeOpts.value----====');
    // }
    openListPopup({
      ids: fieldValue.value,
      callback({ a, checkOptions }) {
        fieldValue.value = a;
        hasError.value = false;
        checkeOpts.value = checkOptions;
        changeSelect(a);
      },
    });
  }

  defineExpose<IMobSelectComponentExpose>({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getCheckedOpts();
      } else {
        return fieldValue.value;
      }
    },
    setValue(v) {
      fieldValue.value = v;
    },
    setOptions(data) {
      options.value = data;
      readyOnload.value = false;
    },
    async reload(queryData = {}) {
      await getOptionsByquery({ queryData });
      readyOnload.value = false;
    },
    setError() {
      hasError.value = true;
    },
  });
</script>
<style lang="less" scoped>
  :deep(.van-field__control--error::placeholder) {
    color: var(--van-field-placeholder-text-color);
  }
</style>
