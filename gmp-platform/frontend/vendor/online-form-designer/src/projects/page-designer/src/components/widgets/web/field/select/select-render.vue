<template>
  <a-tree-select
    v-if="refModelType === EntityModelTypeEnum.TREE && !readonly && !isLinkageMode"
    v-model:value="value"
    style="width: 100%"
    :treeData="treeOptions"
    tree-data-simple-mode
    :showSearch="showSearch"
    :placeholder="placeholder"
    :multiple="multiple"
    :load-data="isByIdLoaded ? undefined : onLoadData"
    allowClear
    class="w100%"
    :getPopupContainer="PopupContainer"
    @change="changeSelect"
    @select="selectValue"
    :treeNodeLabelProp="multiple ? 'label' : 'ch_full_path'"
    :show-checked-strategy="TreeSelect.SHOW_ALL"
    :treeCheckable="multiple"
    :treeCheckStrictly="multiple"
    :filterTreeNode="false"
    maxTagCount="responsive"
    :maxTagTextLength="attrObj.maxTagTextLength"
    dropdown-class-name="vxe-table--ignore-clear"
    @search="handleSearch"
    v-model:treeExpandedKeys="treeExpandedKeys"
    :treeLoadedKeys="treeLoadedKeys"
    :isTooltip="isTooltip"
    showArrow
    @focus="focus"
    @blur="blur"
    :class="{
      zIndex: isSelectFocused,
      edit: isSelectFocused,
      multiple: multiFieldType.includes(fieldType!),
    }"
  >
    <template #tagRender="{ label, onClose, option }">
      <selectTag
        :label="label"
        :type="fieldType"
        :title="option?.label.length > attrObj.maxTagTextLength ? option?.label : ''"
        closable
        :tagWidgetStyle="widget.style"
        :isDesign="false"
        class="ml3px"
        @on-close="onClose"
      />
    </template>
  </a-tree-select>
  <template v-else>
    <FieldSelect
      v-if="!displayFields?.length || displayFields.length === 1"
      ref="selectRef"
      v-model:value="value"
      :design="false"
      :readonly="readonly"
      :selectExtraProps="separatorAttr"
      :fieldType="fieldType"
      :type="widget.type"
      :tagStyle="widget.style"
      :options="
        customMenu && !(customdataSource && datasourceConfig?.name) ? customOption : options
      "
      :filterOption="frontSearch ? filterOption : false"
      :disabled="disabled"
      :placeholder="placeholder"
      :maxTagCount="maxTagCount"
      :maxTagTextLength="attrObj.maxTagTextLength"
      @change="changeSelect"
      @search="handleSearch"
      @popupScroll="popupScroll"
      :getPopupContainer="PopupContainer"
      @select="selectValue"
      @dropdownVisibleChange="onDropLoad"
      @inputKeyDown="inputKeyDown"
      :searchValue="searchValue"
      :open="open"
      :defaultActiveFirstOption="false"
      :selectOptionLabel="displayFieldsLabel"
      :isTooltip="isTooltip"
      @focus="focus"
      @blur="blur"
      :class="{
        zIndex: isSelectFocused,
        edit: isSelectFocused,
        'select-render-wrap': hasError,
        multiple: multiFieldType.includes(fieldType!),
        'select-render': true,
      }"
      :selectorWidth="
        tableCellHeight && tableCellHeight.cellHeightMode === TABLE_CELL_HEIGHT_MODE.ALL_ROW
          ? 1400
          : selectorWidth
      "
    />
    <a-popover
      trigger="click"
      placement="bottomLeft"
      v-model:visible="popoverVisible"
      @visibleChange="visibleChange"
      v-else
      overlayClassName="vxe-table--ignore-clear gct-custom-popover"
    >
      <template #content>
        <selectTable
          ref="selectTableRef"
          :selectMode="selectMode"
          :getAsyncOptions="getOptionsByquery"
          :modelValue="value"
          :tableColumns="displayFields"
          :emptyText="emptyText"
          @changeSelect="tableChangeSelect"
        />
      </template>
      <FieldSelect
        :isTooltip="isTooltip"
        v-model:value="value"
        :design="false"
        :readonly="readonly"
        :selectExtraProps="separatorAttr"
        :fieldType="fieldType"
        :type="widget.type"
        :tagStyle="widget.style"
        :options="
          customMenu && !(customdataSource && datasourceConfig?.name) ? customOption : options
        "
        :filterOption="frontSearch ? filterOption : false"
        :disabled="disabled"
        :placeholder="placeholder"
        :maxTagCount="maxTagCount"
        :maxTagTextLength="attrObj.maxTagTextLength"
        @change="changeSelect"
        @search="searchTable"
        @select="selectValue"
        @inputKeyDown="tableInputKeyDown"
        @click.capture="openModal"
        :searchValue="searchValue"
        dropdown-class-name="hidden"
        :defaultActiveFirstOption="false"
        :class="{
          zIndex: isSelectFocused,
          edit: isSelectFocused,
          'select-render-wrap': hasError,
          multiple: multiFieldType.includes(fieldType),
          'select-render': true,
        }"
      />
    </a-popover>
  </template>
  <div v-if="multiple" :style="{ height: height }"></div>
</template>

<script name="gct-select" setup lang="ts">
  import {
    computed,
    toRefs,
    toRaw,
    nextTick,
    reactive,
    toRef,
    h,
    onMounted,
    ref,
    watch,
    onBeforeMount,
    onUnmounted,
    inject,
  } from 'vue';
  import { TreeSelect, message as Message, message, Form } from 'ant-design-vue';
  import {
    useAsyncOptions,
    getPageEvent,
    RetrunList,
    useAsyncFileAttrs,
  } from '/@page-designer/components/widgets/hooks/hooks';
  import { Select } from '/@page-designer/types/web';
  import type { SelectProps } from 'ant-design-vue';
  import { FIELD_TYPE } from '@/enums/appEnum';
  import { ListTreeSearchTypeEnum } from '/@page-designer/enum';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import {
    taglabel,
    selectTag,
    FieldSelect,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import {
    useQueryfilter,
    getQueryDateByKeyWord,
    getParentPopupContainer,
  } from '/@page-designer/components/widgets/hooks/listhook';
  import { cloneDeep, debounce } from 'lodash-es';
  import { watchDebounced } from '@vueuse/core';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ISelectComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { useRefCardData } from '/@page-designer/components/widgets/hooks/refCardList';
  import selectTable from './select-table.vue';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { calcMutiLineTags, isNotSignalLine, isSingleLine } from '../../../hooks/useTag';
  import { TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';

  const formItemContext = Form.useInjectFormItemContext();
  const { t } = useI18n();
  const tableCellHeight: any = inject('tableCellHeight');

  const searchValue = ref('');
  const open = ref(false);
  /** 关联模型状态字段信息 */
  const bindStateInfo = ref();
  /** 关联模型字段 状态exp和筛选项 */
  const bindStateQuery = ref();
  const props = defineProps<{
    modelValue?: string;
    widget: Select;
    formData: Object;
    getPopupContainer?: (triggerNode) => HTMLElement;
    isTooltip?: boolean;
  }>();
  /**注入信息卡逻辑 */
  useRefCardData(props);
  const PopupContainer = getParentPopupContainer({});
  const disabled = computed(() => props.widget.props.disabled);
  /**数据加载 */
  const loading = ref(false);
  /**完整的选中对象 */
  const lastOptionValue = reactive<{ modelValue?: string; options?: object | object[] }>({
    modelValue: '',
    options: [],
  });
  // 自定义枚举值选项
  let customOption = ref<RetrunList[]>([]);
  const treeExpandedKeys = ref([]);
  const treeLoadedKeys = ref([]);
  const isByIdLoaded = ref(false);
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const Event = getPageEvent();
  const { formData } = toRefs<{ [key: string]: any }>(props);
  const {
    placeholder,
    fieldType,
    field,
    autofillRules,
    enableAutofill,
    modelKey,
    bindModelKey,
    searchField,
    exp,
    valueField,
    rangeField,
    refModelType,
    initNotLoad,
    initLoad,
    datasourceConfig,
    customdataSource,
    datafilter,
    linkageField,
    label,
    fieldName,
    modeldata,
    ruleConfig,
    customMenu,
    customMenuFilter,
    showSearch,
    emptyText,
    displayFields,
    clearable,
  } = toRaw(props.widget.props);
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();

  /**前端单显示字段下拉框显示逻辑 */
  const displayFieldsLabel =
    displayFields?.length === 1 ? displayFields[0]?.props?.field : undefined;
  /**前台搜索 */
  const frontSearch =
    fieldType === FIELD_TYPE.ENUM ||
    fieldType === FIELD_TYPE.ENUM_MULTI ||
    fieldType === FIELD_TYPE.MESSAGE_TMPL;
  //需不需初始化要自动加载 状态 initLoad 新的字段
  const readyOnload = ref(true);
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
  //父表单获取模型大类型
  const modelCategory = modeldata?.modelCategory;
  const { readonly } = toRefs(props.widget.props);
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
  const {
    getAsyncOptions,
    getRefOptionsByIds,
    options,
    multiple,
    getNextOptions,
    getStateRefOptionsByIds,
    getStateRefOptions,
    extraOptions,
  } = useAsyncOptions(fieldType!, {
    isTree: refModelType === EntityModelTypeEnum.TREE,
    customApi,
    isLinkage: () => isLinkageMode.value,
  });
  const treeOptions = toRef(() => {
    const rootOptions = options.value;
    const trees = rootOptions.map((item) => {
      const fullPaths = item.full_path_.split('/');
      const ch_full_path = fullPaths
        .map((path) => {
          const n = rootOptions.find((k) => k.value === path);
          if (n) {
            return n.label;
          }
          return null;
        })
        .filter((i) => i)
        .join('/');
      return {
        ...item,
        label: ch_full_path,
        title: item.label,
        /**单选模式下渲染的*/
        ch_full_path: () =>
          h(taglabel, {
            tagWidgetStyle: props.widget.style,
            type: fieldType,
            label: ch_full_path,
          }),
      };
    });
    return trees;
  });

  const onDropLoad = (v) => {
    searchValue.value = '';
    open.value = v;
    if (!v) return;
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
          message.error(`请先选择：${ruleConfig.fieldLabel}`);
          return;
        }
      } else {
        const first = linkageField[0];
        val = props.formData[first.value];
        if (!val) {
          message.error(`请先选择：${first.label}`);
          return;
        }
      }
    }
    getOptionsByquery();
  };

  const hasError = ref<boolean>(false);

  /**下拉框异步请求统一入口 */
  async function getOptionsByquery({
    queryData,
    searchType,
    parent_id_,
    exp,
    pageNo,
    pageSize,
  }: {
    queryData?: object;
    searchType?: ListTreeSearchTypeEnum;
    parent_id_?: string;
    exp?: string;
    pageNo?: number;
    pageSize?: number;
  } = {}) {
    const _queryData = { ...queryData, ...queryfilter.query, ...bindStateQuery.value?.query };
    const _exp = queryfilter.getExp(
      bindStateQuery.value?.exp
        ? exp
          ? `AND(${exp}, ${bindStateQuery.value?.exp})`
          : bindStateQuery.value?.exp
        : exp
          ? exp
          : '',
    );
    if (isLinkageMode.value) {
      return getAsyncOptions({
        modelCategory,
        fieldKey: field,
        data: props.formData,
        linkageField,
        ruleConfig,
        queryData: _queryData,
        exp: _exp,
      });
    } else {
      return getAsyncOptions({
        fieldKey: field,
        modelKey,
        bindModelKey,
        queryData: _queryData,
        searchType,
        parent_id_,
        exp: _exp,
        modelCategory,
        pageNo,
        pageSize,
      });
    }
  }

  async function onLoadData(value) {
    if (readyOnload.value) {
      treeLoadedKeys.value.push(value.id);
      await getOptionsByquery({
        searchType: ListTreeSearchTypeEnum.CHILDREN,
        parent_id_: value.id,
      });
    }
  }
  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      mode: multiple ? 'multiple' : undefined,
      optionLabelProp: multiple ? undefined : 'showTitle',
      allowClear: clearable,
      showSearch: frontSearch || !!showSearch,
      emptyText: emptyText,
    };
    return attr;
  });

  const value = computed<any>({
    get() {
      let value = props.modelValue || undefined;
      const valueArr = multiple
        ? Array.isArray(value)
          ? value
          : value?.split(',').filter((i) => i) || []
        : value;
      if (multiple) {
        return (valueArr || []).map((i) => {
          const filter = options.value.filter((p) => p.value === i);
          const extra = extraOptions.value.filter((p) => p.value === i);
          return filter.length ? i : extra.length ? extra[0].label : i;
        });
      } else {
        const filter = options.value.filter((p) => p.value === valueArr);
        const extra = extraOptions.value.filter((p) => p.value === valueArr);
        return filter.length ? valueArr : extra.length ? extra[0].label : valueArr;
      }
    },
    set(v) {
      if (multiple) {
        if (refModelType === EntityModelTypeEnum.TREE && !isLinkageMode.value) {
          emit('update:modelValue', v?.map((item: any) => item.value).join(','));
        } else {
          emit('update:modelValue', v?.join(','));
        }
      } else {
        emit('update:modelValue', v || '');
      }
    },
  });

  // 数据连接模式下，监控连接项的值。在值变更时清空自身
  if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false)) {
    const key = ruleConfig ? ruleConfig.fieldKey : linkageField[0].value;
    watch(
      () => props.formData[key],
      (v) => {
        value.value = null;
        options.value = [];
      },
    );
  }

  onMounted(async () => {
    await getBindModelstate();
    // 初始化不加载 或者 配置数据联动的时候不加载
    const _iniLoad = initLoad === undefined ? initNotLoad !== true : initLoad;
    if (_iniLoad && readyOnload.value && (!valueField || !rangeField)) {
      await getOptionsByquery();
    }

    /**补差id */
    await getOptionsByIds(value.value);
    if (customMenu && !(customdataSource && datasourceConfig?.name)) {
      customOption.value = options.value.filter((item) => {
        return customMenuFilter.includes(item.value);
      });
    }
    if (tableCellHeight && tableCellHeight.cellHeightMode === TABLE_CELL_HEIGHT_MODE.ALL_ROW) {
      maxTagCount.value = null;
      return;
    }
    if (!multiFieldType.includes(fieldType) || isNotSignalLine(tableCellHeight)) return;
    nextTick(() => {
      const el = selectRef.value?.$el;
      if (!el) return;
      const selector = el.querySelector && el.querySelector('.ant-select-selector');
      if (!selector) return;
      selectorWidth.value = selector.offsetWidth - 30 - 6;

      resizeObserver = new ResizeObserver((entries) => {
        if (multiple) {
          calcTwoLineTags();
        }
      });
      resizeObserver.observe(selector);
    });
  });

  const rangeValue = toRef(() => {
    return valueField && rangeField ? formData.value[valueField.split('$')[0]] : '';
  });

  watchDebounced(
    rangeValue,
    async () => {
      if (rangeValue.value && valueField && rangeField) {
        const queryData: any = {};
        const rangeKey = `${rangeField}.eq`;
        queryData[rangeKey] = rangeValue.value;
        await getOptionsByquery({ queryData });
      } else {
        options.value = [];
      }
    },
    {
      debounce: 200,
    },
  );

  watchDebounced(
    value,
    async () => {
      /**补差id */
      await getOptionsByIds(value.value);
      if (!value.value?.length && refModelType === EntityModelTypeEnum.TREE) {
        handleSearch();
      }
    },
    {
      debounce: 200,
    },
  );

  /**
   * id补充查询
   * @param ids
   */
  async function getOptionsByIds(ids?: string[] | string) {
    if (!ids) {
      if (isByIdLoaded.value) {
        isByIdLoaded.value = false;
      }
      return;
    }
    if (bindModelKey && [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(fieldType)) {
      // 如果是模型关联、模型多选且关联模型是命名模型或版本模型且数据状态为开启的时候不需要补差查询
      bindStateInfo.value = await FieldSchema.getConfigByModel(bindModelKey);
    }
    if (bindStateInfo.value && bindStateInfo.value.specificConfig.operatingStateEnabled) {
      const _queryData = { ...queryfilter.query, ...bindStateQuery.value?.query };
      const _exp = queryfilter.getExp(
        bindStateQuery.value?.exp
          ? exp
            ? `AND(AND(${exp}, ${bindStateQuery.value?.exp}),id_.in)`
            : `AND(${bindStateQuery.value?.exp},id_.in)`
          : exp
            ? `AND(${exp},id_.in)`
            : 'id_.in',
      );
      // 手动调接口
      getStateRefOptionsByIds({
        fieldKey: field,
        modelKey,
        bindModelKey,
        queryData: { ..._queryData, 'id_.in': Array.isArray(ids) ? ids : [ids] },
        exp: _exp,
        modelCategory,
      });
      // 获取所有选择字段，用于回显名称
      const noneIds = getNoneIds(ids);
      if (noneIds?.length) {
        getStateRefOptions({
          fieldKey: field,
          modelKey,
          bindModelKey,
          ids: noneIds,
          modelCategory,
        });
      }
      return;
    }

    if (fieldType === FIELD_TYPE.REF || fieldType === FIELD_TYPE.REF_MULTI) {
      const noneIds = getNoneIds(ids);

      if (noneIds?.length) {
        await getRefOptionsByIds({
          fieldKey: field,
          modelKey,
          bindModelKey,
          ids: noneIds,
          modelCategory,
        });
        if (refModelType === EntityModelTypeEnum.TREE) {
          treeExpandedKeys.value = options.value.map((i) => i.value);
          treeLoadedKeys.value = options.value.map((i) => i.value);
          isByIdLoaded.value = true;
        }
      }
    }
  }

  /**获取缺失后需要查询的ids */
  function getNoneIds(ids: any): string[] | undefined {
    if (fieldType === FIELD_TYPE.REF && !options.value.find((i) => i.value === ids)) {
      return [ids];
    }
    if (fieldType === FIELD_TYPE.REF_MULTI) {
      const idarg = ids.filter((id) => !options.value.find((i) => i.value === id));
      if (idarg.length) {
        /**如果是tree 就查询选中的所有id */
        return refModelType === EntityModelTypeEnum.TREE ? ids : idarg;
      }
    }
  }
  /**
   * 获取选中的options
   */
  function getOptionValue(v = value.value) {
    if (multiple) {
      return options.value.filter((i) => v.indexOf(i.value) > -1).map((i) => toRaw(i));
    } else {
      let data = options.value.find((i) => i.value === v);
      return toRaw(data);
    }
  }
  /**选中后 */
  async function selectValue() {
    await nextTick();
    if (value.value) hasError.value = false;
    const modelValue = value.value,
      options = getOptionValue();
    try {
      await Event.runEventByName(
        'afterSelect',
        props.widget.events,
        modelValue,
        options,
        formData.value,
      );
      lastOptionValue.modelValue = modelValue;
      lastOptionValue.options = options;
    } catch (error) {
      value.value = lastOptionValue.modelValue;
      changeSelect(lastOptionValue.modelValue);
    }
  }
  /**值发生变化 */
  async function changeSelect(v) {
    v =
      multiple && refModelType === EntityModelTypeEnum.TREE ? v?.map((item: any) => item.value) : v;
    if (!v || !v.length) {
      deselect(value.value);
    }
    await nextTick();
    let data = getOptionValue(v);
    Event.runEventByName('onChange', props.widget.events, value.value, data, formData.value);
    /**列字段时候触发保存 */
    emit('saveTableRow');
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      const labelvalue = multiple ? data.map((i) => i.label) : data.label;
      formData.value._DICT[field] = { [value.value]: labelvalue };
    }
    searchValue.value = '';
    /**数据填充 */
    if (!enableAutofill || multiple) return;
    const info = await Event.context.$httpBizService(
      {
        action: 'getOne',
        key: bindModelKey!,
        modelCategory: modelCategory,
      },
      {
        query: { 'id_.eq': value.value },
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
    let data = getOptionValue(clearValue);
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
    formData.value._DICT[field] = undefined;
  }
  const handleSearch = (keyword?: string) => {
    searchValue.value = keyword || '';
    if (frontSearch) return;
    options.value = [];
    treeExpandedKeys.value = [];
    treeLoadedKeys.value = [];
    debonceSearch(keyword);
  };

  const inputKeyDown = async (e) => {
    /**扫码枪回车事件场景下逻辑 */
    if (e.code == 'Enter' || e.keyCode === 13) {
      const keyword = e.target.value;
      if (!options.value.length && keyword) {
        searchValue.value = '';
        const queryData = getQueryDateByKeyWord({ searchField, keyword });
        const res = await getOptionsByquery({
          exp: getExpByData(exp, queryData) || exp,
          queryData,
        });
        const { valueList } = res || {};
        if (valueList?.length) {
          const result = valueList.find((item) => item.label === keyword);
          const v = result?.value ?? valueList[0].value;
          if (multiple) {
            if (value.value.includes(v)) return;
            value.value = [...value.value, v];
          } else {
            if (value.value === v) return;
            value.value = v;
          }
          await nextTick();
          await changeSelect(value.value);
          open.value = false;
        }
      }
      Event.runEventByName(
        'onEnter',
        props.widget.events,
        value.value,
        keyword,
        options.value,
        formData.value,
      );
    }
  };
  /**初始化选项 */
  const resetOptions = () => {
    if (readyOnload.value) {
      getOptionsByquery();
    }
  };
  const debonceSearch = debounce((keyword) => {
    if (keyword && keyword.trim()) {
      const queryData = getQueryDateByKeyWord({ searchField, keyword });
      getOptionsByquery({
        exp: getExpByData(exp, queryData) || exp,
        queryData,
      }).then(() => {
        treeExpandedKeys.value = options.value.map((i) => i.value);
        treeLoadedKeys.value = options.value.map((i) => i.value);
      });
    }
    if (!keyword) {
      /**清空输入选项的时候重置输入框 */
      resetOptions();
    }
  }, 300);
  /**兼容老版本 */
  function getExpByData(exp, data) {
    const fileds = Object.keys(data);
    if (fileds.length && !exp) {
      return `OR(${fileds.join(',')})`;
    }
  }

  /**下拉分页事件 */
  async function popupScroll(e) {
    //初始化不加载 和 手动设置值的不需要执行
    if (!readyOnload.value || loading.value) return;
    const { target } = e;
    if (target.scrollTop + target.offsetHeight + 30 >= target.scrollHeight) {
      loading.value = true;
      try {
        await getNextOptions();
        await nextTick();
      } catch (error) {}
      loading.value = false;
    }
  }
  const filterOption = (input: string, option: any) => {
    return option.label.includes(input);
  };

  const selectTableRef = ref();
  const popoverVisible = ref(false);

  const selectMode = computed(() => {
    return multiple ? 'multiple' : 'single';
  });

  async function tableChangeSelect(node) {
    if (selectMode.value === 'multiple') {
      const _value = node.map((n) => n.id_);
      changeSelect(_value);
      value.value = _value;
    } else {
      changeSelect(node?.id_);
      value.value = node?.id_;
      popoverVisible.value = false;
    }
    formItemContext.onFieldChange();
  }
  async function openModal(e) {
    selectTableRef.value?.initSelected();
    popoverVisible.value && e.stopPropagation();
  }

  const searchTable = debounce((keyword) => {
    searchValue.value = keyword || '';
    const queryData = getQueryDateByKeyWord({ searchField, keyword });
    const _exp = getExpByData(exp, queryData) || exp;
    selectTableRef.value.search({ queryData, exp: _exp });
  }, 200);

  const tableInputKeyDown = async (e) => {
    const keyword = e.target.value;
    const tableData = selectTableRef.value?.tableData || [];
    if (e.code === 'Enter' || e.keyCode === 13) {
      if (keyword && !tableData?.length) {
        searchValue.value = '';
        popoverVisible.value = false;
      }

      Event.runEventByName(
        'onEnter',
        props.widget.events,
        value.value,
        keyword,
        tableData,
        formData.value,
      );
    }
  };
  const getBindModelstate = async () => {
    if (bindModelKey && [FIELD_TYPE.REF, FIELD_TYPE.REF_MULTI].includes(fieldType)) {
      bindStateInfo.value = await FieldSchema.getConfigByModel(bindModelKey);
      if (bindStateInfo.value && bindStateInfo.value.specificConfig.operatingStateEnabled) {
        bindStateQuery.value = {
          exp: 'operating_state_.eq',
          query: {
            'operating_state_.eq': true,
          },
        };
      }
    }
  };

  const visibleChange = async (v) => {
    isSelectFocused.value = v;
    if (!v) return;
    if (props.widget.props.disabled) {
      popoverVisible.value = false;
      return;
    }
    if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false) || customApi) {
      let val = '';
      if (ruleConfig) {
        val = props.formData[ruleConfig.fieldKey];
        if (isLinkageMode.value && !val) {
          message.error(`请先选择：${ruleConfig.fieldLabel}`);
          popoverVisible.value = false;
          return;
        }

        selectTableRef.value?.search();
      }
    }
  };

  onBeforeMount(async () => {
    if (multiple) {
      getmaxTagLength({ fieldKey: field, modelKey: modelKey });
    }
  });

  /******************* 表格多行逻辑分割线 *************************/

  const selectLabel = ref([]);
  const selectRef = ref();
  const maxTagCount = ref<'responsive' | null | number>('responsive');
  const isSelectFocused = ref(false);
  const height = ref(0);
  let resizeObserver: ResizeObserver | null = null;
  const selectorWidth = ref(1400);

  const multiFieldType = [FIELD_TYPE.ENUM_MULTI, FIELD_TYPE.REF_MULTI];
  const focus = () => {
    if (!multiFieldType.includes(fieldType)) return;
    const el = selectRef.value?.$el;
    if (!el) return;

    const selector = el.querySelector('.ant-select-selector');
    height.value = selector.offsetHeight + 'px'; // 记录当前选择框的高度，避免被标签撑高
    maxTagCount.value = null; // 聚焦时先不限制标签数量，等下一次更新后再计算
    const selectWidth = selector.offsetWidth - 30;
    selectorWidth.value = selectWidth - 6;
    isSelectFocused.value = true;
    // 自动滚动到最底部
    nextTick(() => {
      selector.scrollTop = selector.scrollHeight;
    });
  };
  const blur = () => {
    isSelectFocused.value = false;
    height.value = 0;
    if (!multiFieldType.includes(fieldType)) return;
    if (isSingleLine(tableCellHeight)) {
      maxTagCount.value = 'responsive';
    }
    if (isNotSignalLine(tableCellHeight)) return;

    if (multiple) {
      calcTwoLineTags();
    }
  };
  const getSelectLabel = () => {
    // 按照选中的顺序 一一对应找 label
    return (value.value || [])
      .map((val) => {
        const option = options.value.find((item) => item.value === val);
        return option;
      })
      .filter(Boolean);
  };

  const selectHeight = computed(() => {
    if (tableCellHeight && tableCellHeight.cellHeightMode === TABLE_CELL_HEIGHT_MODE.ALL_ROW)
      return 'auto';
    if (tableCellHeight && tableCellHeight.cellHeightMode === TABLE_CELL_HEIGHT_MODE.ONE_ROW) {
      return '92px';
    }
    if (tableCellHeight && tableCellHeight.cellHeight && tableCellHeight.cellHeight > 3) {
      return 32 + (tableCellHeight.cellHeight - 1) * 30 + 'px';
    }
    return '92px';
  });
  function calcTwoLineTags(maxRow = tableCellHeight.cellHeight || 2) {
    const el = selectRef.value?.$el;
    if (!el) return;

    if (selectLabel.value.length === 0) {
      // maxTagCount.value = 'responsive';
      return;
    }
    const selector = el.querySelector('.ant-select-selector');
    const selectWidth = selector.offsetWidth - 30;
    selectorWidth.value = selectWidth - 6;

    if (isSelectFocused.value) return;

    maxTagCount.value = calcMutiLineTags(
      selectLabel.value,
      maxRow,
      selectWidth,
      attrObj.value?.maxTagTextLength || 8,
    );
  }

  watch(
    () => options.value,
    () => {
      if (!multiFieldType.includes(fieldType) || isNotSignalLine(tableCellHeight)) return;
      if (options.value.length && multiple) {
        selectLabel.value = getSelectLabel();
        nextTick(() => {
          calcTwoLineTags();
        });
      }
    },
    { deep: true, immediate: true },
  );
  watch(
    value,
    async () => {
      if (!value.value || !value.value.length) return;
      if (!multiFieldType.includes(fieldType) || isNotSignalLine(tableCellHeight)) return;
      selectLabel.value = multiple && getSelectLabel();
      await nextTick();
      if (multiple) {
        calcTwoLineTags();
        // 选中时自动滚动到最底部
        const el = selectRef.value?.$el;
        if (!el) return;
        const selector = el.querySelector('.ant-select-selector');
        selector.scrollTop = selector.scrollHeight;
      }
    },
    { deep: true, immediate: true },
  );

  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });

  defineExpose<ISelectComponentExpose>({
    getValue({ option }: { option?: boolean } = {}) {
      if (option) {
        return getOptionValue();
      } else {
        return value.value;
      }
    },
    setValue(v) {
      value.value = v;
    },
    setOptions(data) {
      options.value = data?.map((i) => {
        return { label: i.__LABEL__ || i.label, value: i.id_ || i.id || i.value, _item: i };
      });
      readyOnload.value = false;
    },
    getOptions() {
      return cloneDeep(options.value);
    },
    async reload(queryData = {}) {
      if (!displayFields?.length || displayFields.length === 1) {
        await getOptionsByquery({ query: queryData });
        readyOnload.value = true;
      } else {
        selectTableRef.value?.search();
      }
      return cloneDeep(options.value);
    },
    setError() {
      hasError.value = true;
      Message.error(t('sys.pageDesigner.pleaseSelectFirstSth', { sth: label || fieldName }));
    },
  });
</script>
<style lang="less">
  .select-render-wrap.ant-select {
    &:not(.ant-select-customize-input) {
      .ant-select-selector {
        border: 1px solid #f00;
      }
    }
  }
</style>
<style scoped lang="less">
  :deep(.ant-select-selection-overflow) {
    padding-top: 3px;
  }

  :deep(.ant-select-selection-overflow-item-suffix) {
    width: 0;
  }

  .multiple {
    height: 100% !important;
  }

  .edit {
    position: absolute;
    z-index: 2;
    top: 0;
    height: auto !important;

    :deep(.ant-select-selector) {
      min-height: v-bind('height');
      max-height: v-bind('selectHeight');
      overflow-y: auto;
    }

    :deep(.ant-select-selection-overflow-item-suffix) {
      width: 4px;
    }
  }
  :deep(.ant-select-multiple .ant-select-selection-item) {
    margin-top: -1px;
  }

  .zIndex {
    z-index: 10;
  }
</style>
