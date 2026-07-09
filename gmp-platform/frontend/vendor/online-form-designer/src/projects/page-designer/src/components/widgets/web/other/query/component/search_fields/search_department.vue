<template>
  <div v-if="readonly">{{ fieldlabel || emptyDisplayValue }}</div>
  <div class="ks-row-middle" v-else>
    <a-select v-if="!!useMore" disabled :value="t(`sys.model.${useMore}`)" />
    <div v-else :class="['search-select-box', moreOptions?.length ? 'use-more' : '']">
      <a-tree-select
        v-model:value="value"
        style="width: 100%"
        :treeData="treeoptions"
        :showSearch="showSearch"
        :placeholder="placeholder"
        tree-node-filter-prop="label"
        :treeNodeLabelProp="multiple ? 'label' : 'ch_full_path'"
        :multiple="multiple"
        @search="debonceSearch"
        @change="changeSelect"
        allowClear
        showArrow
        :maxTagTextLength="attrObj.maxTagTextLength"
        :treeCheckable="multiple"
        :treeCheckStrictly="multiple"
        :disabled="disabled || !!useMore"
        tree-default-expand-all
        :filter-tree-node="filterTreeNode"
        maxTagCount="responsive"
        :showCheckedStrategy="TreeSelect.SHOW_ALL"
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
      </a-tree-select>
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
  import { computed, toRefs, toRef, nextTick, watch, ref, h, onBeforeMount } from 'vue';
  import {
    useAsyncOptions,
    useAsyncFileAttrs,
  } from '/@page-designer/components/widgets/hooks/hooks';
  import { SearchSelect } from '/@page-designer/types/web';
  import moreOption from '../more_option.vue';
  import { FIELD_TYPE } from '/@/enums/appEnum';
  import { getQueryDateByKeyWord } from '/@page-designer/components/widgets/hooks/listhook';
  import { cloneDeep, debounce } from 'lodash-es';
  import { isMultipleOperator } from '@gct/runtime';
  import { list_to_tree } from '/@/utils/helper/treeHelper';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    taglabel,
    selectTag,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { TreeSelect } from 'ant-design-vue';

  const { t } = useI18n();

  const props = defineProps<{
    modelValue?: string;
    widget: SearchSelect;
    modelCategory: string;
    formData: IData;
  }>();

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
    exp,
    linkageField,
    ruleConfig,
  } = props.widget.props;

  const { useMore, disabled, readonly, ope, enterSearch } = toRefs(props.widget.props);
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();
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
  const { getAsyncOptions, options } = useAsyncOptions(fieldType!, {});
  /**前台搜索 */
  const frontSearch = !(fieldType === FIELD_TYPE.REF || fieldType === FIELD_TYPE.REF_MULTI);
  const multiple = isMultipleOperator(ope.value);
  const showSearch = frontSearch || !!props.widget.props.showSearch;
  const keywordFieldKeys = searchField || [];

  const treeoptions = computed(() => {
    const valueList = list_to_tree(cloneDeep(options.value.map((i) => i._item)), (node) => {
      return {
        _item: node,
        parentId: node.parentId,
        title: node.name,
        value: node.id,
        children: node.children,
      };
    });
    deepDepts(valueList);
    return valueList;
  });
  function deepDepts(trees, parentLabel?: string) {
    trees.forEach((i) => {
      const ch_full_path = parentLabel ? `${parentLabel}/${i.title}` : i.title;
      i.label = ch_full_path;
      i.ch_full_path = () =>
        h(taglabel, {
          tagWidgetStyle: props.widget.style,
          type: fieldType,
          label: ch_full_path,
        });
      if (i?.children?.length) {
        deepDepts(i.children, ch_full_path);
      }
    });
  }

  function load(): void {
    if (isLinkageMode.value) {
      getAsyncOptions({
        modelCategory,
        fieldKey: props.widget.props.field,
        data: props.formData,
        linkageField,
        ruleConfig,
      });
    } else {
      getAsyncOptions({ modelKey, fieldKey, selectType, bindModelKey, modelCategory });
    }
  }

  load();

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
      let val = Array.isArray(props.modelValue) ? props.modelValue?.join(',') : props.modelValue;
      return multiple ? val?.split(',').filter((i) => i) || [] : val || undefined;
    },
    set(value: string[] | string) {
      if (multiple) {
        emit('update:modelValue', value?.map((item: any) => item.value).join(','));
      } else {
        emit('update:modelValue', value || '');
      }
    },
  });

  /**值发生变化 */
  async function changeSelect(v) {
    searchValue.value = '';

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
      getAsyncOptions({
        fieldKey,
        modelKey,
        bindModelKey,
        exp: getExpByData(exp, queryData) || exp,
        queryData,
        keyword,
        modelCategory,
      });
    } else {
      load();
    }
  }, 300);

  /**兼容老版本 */
  function getExpByData(exp, data) {
    const fileds = Object.keys(data);
    if (fileds.length && !exp) {
      return `OR(${fileds.join(',')})`;
    }
  }

  const fieldlabel = toRef(() => {
    if (multiple) {
      const labelArr = value.value?.map((i) => {
        const findItem = options.value.find((v) => v.value === i);
        return findItem?.label;
      });
      return labelArr?.join();
    } else {
      return options.value.find((i) => i.value === value.value)?.label;
    }
  });

  const ignoreCase = computed(() => {
    return ignoreOptions?.[0] === 'ignoreCase' ? 1 : 0;
  });

  const filterTreeNode = (inputValue, treeNode) => {
    if (!inputValue) return true;
    if (ignoreCase.value) {
      return treeNode.title?.toLowerCase().includes(inputValue.toLowerCase());
    }
    return treeNode.title?.includes(inputValue);
  };

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
