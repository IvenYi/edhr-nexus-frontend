<template>
  <div v-if="readonly">{{ fieldlabel || emptyDisplayValue }}</div>
  <div class="ks-row-middle" v-else>
    <a-select v-if="!!useMore" disabled :value="t(`sys.model.${useMore}`)" />
    <div v-else :class="['search-select-box', moreOptions?.length ? 'use-more' : '']">
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
        @inputKeyDown="inputKeyDown"
        allowClear
        :disabled="disabled || !!useMore"
        maxTagCount="gct-responsive"
        :maxTagTextLength="attrObj.maxTagTextLength"
        showArrow
      >
        <template #tagRender="{ label, onClose, option }">
          <selectTag
            :label="label"
            :type="fieldType"
            :title="option?.label.length > attrObj.maxTagTextLength ? option?.label : ''"
            closable
            :tagWidgetStyle="{
              tagStyleOpen: false,
            }"
            :avatar="option?.avatar"
            :isDesign="false"
            style="margin-right: 3px"
            @on-close="onClose"
          />
        </template>
      </a-tree-select>
      <template v-else>
        <a-select
          v-if="!displayFields?.length || displayFields.length === 1"
          v-model:value="value"
          v-bind="separatorAttr"
          class="ks-col"
          :showSearch="showSearch"
          :disabled="disabled || !!useMore"
          @search="handleSearch"
          :dropdownClassName="
            multiple
              ? 'gct-project-select-dropdown gct-project-select-multiple'
              : 'gct-project-select-dropdown'
          "
          @inputKeyDown="inputKeyDown"
          @change="changeSelect"
          @popupScroll="popupScroll"
          @dropdownVisibleChange="onDropLoad"
          :filterOption="frontSearch ? filterOption : false"
          :options="selectOptions"
          :maxTagCount="edhrLabelExampleMode ? '' : 'gct-responsive'"
          :maxTagTextLength="attrObj.maxTagTextLength"
          showArrow
        >
          <template v-if="edhrLabelExampleMode" #option="{ _item }">
            <label-example :widget="widget" :formData="_item" />
          </template>

          <template #tagRender="{ value, label, onClose, option, closable }">
            <a-tag
              v-if="edhrLabelExampleMode"
              :closable="closable"
              @close="onClose"
              style="margin-right: 3px"
            >
              <label-example
                :widget="widget"
                :formData="option?._item"
                :label="label"
                :value="value"
                style="max-width: 270px"
                :options="selectOptions"
              />
            </a-tag>
            <selectTag
              v-else
              :label="label"
              :type="fieldType"
              :title="option?.label.length > attrObj.maxTagTextLength ? option?.label : ''"
              closable
              :tagWidgetStyle="{
                tagStyleOpen: false,
              }"
              :isDesign="false"
              style="margin-right: 3px"
              @on-close="onClose"
            />
          </template>
        </a-select>
        <!-- 多字段展示 -->
        <a-select
          v-else
          ref="cusSelectRef"
          v-model:value="value"
          style="width: 100%"
          :open="open"
          allowClear
          :placeholder="placeholder"
          :disabled="disabled || !!useMore"
          :options="selectOptions"
          :showSearch="showSearch"
          :searchValue="searchValue"
          showArrow
          maxTagCount="gct-responsive"
          :mode="multiple ? 'multiple' : undefined"
          :dropdownClassName="`gct-project-select-dropdown`"
          :dropdownMatchSelectWidth="false"
          :dropdownStyle="{
            minWidth: '600px',
          }"
          :defaultActiveFirstOption="false"
          @search="handleTableSearch"
          @change="changeSelect"
          @deselect="handleDeselect"
          @click.capture="openModal"
          @inputKeyDown="inputKeyDown"
          @clear="clearValue"
        >
          <template #tagRender="{ label, onClose, option }">
            <selectTag
              :label="label"
              :type="fieldType"
              :title="option?.label.length > attrObj.maxTagTextLength ? option?.label : ''"
              closable
              :tagWidgetStyle="{
                tagStyleOpen: false,
              }"
              :isDesign="false"
              style="margin-right: 3px"
              @on-close="onClose"
            />
          </template>
          <template #dropdownRender>
            <div class="relative" @click.stop>
              <selectTable
                ref="selectTableRef"
                :getAsyncOptions="load"
                :modelValue="value"
                :selectMode="selectMode"
                :tableColumns="displayFields"
                @changeSelect="tableChangeSelect"
                @changeAllSelect="tableAllChangeSelect"
                :searchValue="searchValue"
                :keywordFieldKeys="keywordFieldKeys"
              />
            </div>
          </template>
        </a-select>
      </template>
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
  import { computed, toRefs, toRef, nextTick, watch, ref, onBeforeMount } from 'vue';
  import {
    useAsyncOptions,
    getPageEvent,
    useAsyncFileAttrs,
  } from '/@page-designer/components/widgets/hooks/hooks';
  import { SearchSelect } from '/@page-designer/types/web';
  import { message, type SelectProps } from 'ant-design-vue';
  import moreOption from '../more_option.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import { ListTreeSearchTypeEnum } from '/@page-designer/enum';
  import {
    getQueryDateByKeyWord,
    useQueryfilter,
    getIKeywordFieldKeys,
    getIExp,
  } from '/@page-designer/components/widgets/hooks/listhook';
  import { debounce, difference } from 'lodash-es';
  import { isMultipleOperator } from '@gct/runtime';
  import LabelExample from '../../../../field/input/label-example.vue';
  import { selectTag } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { onClickOutside } from '@vueuse/core';
  import selectTable from '../../../../field/select/select-table.vue';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    modelCategory: string;
    formData: object;
  }>();
  const Event = getPageEvent();
  const searchValue = ref('');
  const open = ref(false);

  const { displayValue: emptyDisplayValue } = useGlobalSetting();

  // eslint-disable-next-line vue/no-setup-props-destructure
  const modelCategory = props.modelCategory;
  const {
    placeholder,
    fieldType,
    moreOptions,
    ignoreOptions,
    label,
    fieldName,
    field: fieldKey,
    selectType,
    bindModelKey,
    modelKey,
    searchField,
    refModelType,
    linkageField,
    ruleConfig,
    customMenu,
    customMenuFilter,
    datasourceConfig,
    customdataSource,
    datafilter,
    edhrLabelExampleMode,
    displayFields,
  } = props.widget.props;
  const queryfilter = useQueryfilter(datafilter);
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
  const { useMore, disabled, readonly, ope, enterSearch } = toRefs(props.widget.props);
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
  const { getRefOptionsByIds, getAsyncOptions, options, getNextOptions } = useAsyncOptions(
    fieldType!,
    {
      isTree: refModelType === EntityModelTypeEnum.TREE,
      customApi,
      isLinkage: () => isLinkageMode.value,
    },
  );
  /**前台搜索 */
  const frontSearch = !(fieldType === FIELD_TYPE.REF || fieldType === FIELD_TYPE.REF_MULTI);
  const multiple = isMultipleOperator(ope.value);
  const showSearch = frontSearch || !!props.widget.props.showSearch;
  const keywordFieldKeys = getIKeywordFieldKeys(searchField, ignoreOptions);
  const exp = getIExp(props.widget.props?.exp, ignoreOptions);
  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      mode: multiple ? 'multiple' : undefined,
      allowClear: true,
      showSearch,
    };
    return attr;
  });

  function load({ queryData = {}, pageNo, pageSize } = {}) {
    if (isLinkageMode.value) {
      return getAsyncOptions({
        modelCategory,
        fieldKey: props.widget.props.field,
        data: props.formData,
        linkageField,
        ruleConfig,
      });
    } else {
      return getAsyncOptions({
        modelKey,
        fieldKey,
        selectType,
        bindModelKey,
        modelCategory,
        exp: queryfilter.getExp(exp),
        queryData: { ...queryData, ...queryfilter.query },
        pageNo,
        pageSize,
      });
    }
  }

  load();

  function onDropLoad(isDropOpen): void {
    searchValue.value = '';
    open.value = isDropOpen;
    if (!isDropOpen) return;
    if (isLinkageMode.value) {
      let val = '';
      if (ruleConfig) {
        val = props.formData[ruleConfig.fieldId];
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
      load();
    } else {
      load();
    }
  }

  // 数据连接模式下，监控连接项的值。在值变更时清空自身
  if (isLinkageMode.value || (ruleConfig && ruleConfig.strongDependence === false)) {
    const key = ruleConfig ? ruleConfig.fieldId : linkageField[0].value;
    watch(
      () => props.formData[key],
      (v) => {
        value.value = null;
        options.value = [];
      },
    );
  }

  const emit = defineEmits(['update:modelValue', 'tableSearch', 'gctsearch']);

  const value = computed<any>({
    get() {
      return props.modelValue ?? undefined;
    },
    set(value: string[] | string) {
      emit('update:modelValue', value);
    },
  });

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
  });

  function getLabelByDict(item = {}, key) {
    const { _DICT = {} } = item;
    const value = item[key];
    return _DICT[key]?.[value]?.join('，') ?? value ?? item.id_;
  }
  const selectOptions = computed<any>(() => {
    let _options = [...options.value];
    if (customdataSource) {
      return _options;
    }
    if (customMenu) {
      _options = options.value.filter((item) => {
        return customMenuFilter.includes(item.value);
      });
    }
    return _options.map((item) => {
      return {
        ...item,
        label:
          displayFields?.length === 1
            ? getLabelByDict(item._item, displayFields[0]?.props?.field)
            : item.label,
      };
    });
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
      const queryData = getQueryDateByKeyWord({ searchField: keywordFieldKeys, keyword });
      const _exp = getExpByData(exp, queryData) || exp;
      getAsyncOptions({
        fieldKey,
        modelKey,
        bindModelKey,
        exp: queryfilter.getExp(_exp),
        queryData: { ...queryData, ...queryfilter.query },
        keyword,
        modelCategory,
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

  /**兼容老版本 */
  function getExpByData(exp, data) {
    const fileds = Object.keys(data);
    if (fileds.length && !exp) {
      return `OR(${fileds.join(',')})`;
    }
  }
  async function onLoadData(value) {
    await getAsyncOptions({
      fieldKey,
      modelKey,
      bindModelKey,
      searchType: ListTreeSearchTypeEnum.CHILDREN,
      parent_id_: value.id,
      modelCategory,
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
  const fieldlabel = toRef(() => {
    return options.value.find((i) => i.value === value.value)?.label;
  });
  const filterOption = (input: string, option: any) => {
    if (ignoreCase.value) {
      return option.label.toLowerCase().includes(input.toLowerCase());
    }
    return option.label.includes(input);
  };
  const inputKeyDown = async (e) => {
    if (enterSearch.value && e.code == 'Enter' && !options.value.length) {
      const keyword = e.target.value;

      if (!keyword) return;
      searchValue.value = '';
      const queryData = getQueryDateByKeyWord({ searchField: keywordFieldKeys, keyword });
      const _exp = getExpByData(exp, queryData) || exp;
      const res = await getAsyncOptions({
        fieldKey,
        modelKey,
        bindModelKey,
        exp: queryfilter.getExp(_exp),
        queryData: { ...queryData, ...queryfilter.query },
        keyword,
        modelCategory,
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
        emit('tableSearch');
        emit('gctsearch');
        open.value = false;
      }
    }
  };

  const cusSelectRef = ref();
  const selectTableRef = ref();
  const selectMode = computed(() => {
    return multiple ? 'multiple' : 'single';
  });

  /**获取缺失后需要查询的ids */
  function getNoneIds(ids: any): string[] | undefined {
    if (fieldType === FIELD_TYPE.REF && !options.value.find((i) => i.value === ids)) {
      return Array.isArray(ids) ? ids : [ids];
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
   * id补充查询
   * @param ids
   */
  async function getOptionsByIds(ids?: string[] | string) {
    if (!ids) {
      return;
    }
    if (fieldType === FIELD_TYPE.REF || fieldType === FIELD_TYPE.REF_MULTI) {
      const noneIds = getNoneIds(ids);
      if (noneIds?.length) {
        await getRefOptionsByIds({
          fieldKey,
          modelKey,
          bindModelKey,
          ids: noneIds,
          modelCategory,
        });
      }
    }
  }

  async function tableChangeSelect(node) {
    if (selectMode.value === 'multiple') {
      const _value = node.map((n) => n.id_);
      changeSelect(_value);
      await getOptionsByIds(_value);
      value.value = _value;
    } else {
      changeSelect(node?.id_);
      await getOptionsByIds(node?.id_);
      value.value = node?.id_;
      open.value = false;
    }
  }

  async function tableAllChangeSelect(checked, records) {
    if (checked) {
      const checkedRows = selectTableRef.value?.getCheckedRows();
      if (checkedRows?.length) {
        const ids = checkedRows.map((i) => i.id_);
        const addIds = (ids ?? ([] as any)).filter((it) => !value.value.includes(it));
        value.value = [...value.value, ...addIds];
      }
    } else {
      const ids = (records ?? []).map((it) => it.id_);
      value.value = difference(value.value, ids);
    }
    await nextTick();
    changeSelect(value.value);
    cusSelectRef.value?.change?.();
  }

  async function openModal(e) {
    if (open.value) {
      return;
    }
    open.value = true;
    selectTableRef.value?.search({ pageNo: 1 });
  }

  async function handleDeselect() {
    selectTableRef.value?.initSelected();
  }

  async function clearValue() {
    open.value = false;
    if (selectMode.value === 'multiple') {
      value.value = [];
    } else {
      value.value = undefined;
    }
  }

  const handleTableSearch = debounce(async (keyword?: string) => {
    searchValue.value = keyword || '';
    if (frontSearch) return;
    options.value = [];
    if (keyword) {
      const queryData = getQueryDateByKeyWord({ searchField: keywordFieldKeys, keyword });
      console.log(queryData);
      // const _exp = getExpByData(exp, queryData) || exp;
      selectTableRef.value.search({ queryData });
    } else {
      selectTableRef.value.search({ pageNo: 1 });
    }
  });

  onClickOutside(
    selectTableRef,
    () => {
      open.value = false;
    },
    {
      ignore: [cusSelectRef],
    },
  );
  onBeforeMount(async () => {
    if (multiple) {
      getmaxTagLength({ fieldKey, modelKey: modelKey });
    }
  });
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
