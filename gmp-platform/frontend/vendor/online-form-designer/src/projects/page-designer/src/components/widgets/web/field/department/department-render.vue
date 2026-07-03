<template>
  <taglabel
    v-if="readonly"
    :label="tagValue"
    :type="fieldType"
    :tagWidgetStyle="widget.style"
    :isDesign="false"
  />
  <a-tree-select
    class="w100%"
    v-else
    ref="selectRef"
    show-search
    showArrow
    v-model:value="value"
    v-bind="treeSelectAtrr"
    tree-node-filter-prop="label"
    :treeNodeLabelProp="multiple ? 'label' : 'ch_full_path'"
    :tree-data="treeoptions"
    tree-default-expand-all
    @click="openView"
    @change="changeSelect"
    :maxTagCount="maxTagCount"
    :maxTagTextLength="attrObj.maxTagTextLength"
    :getPopupContainer="PopupContainer"
    :dropdownMatchSelectWidth="180"
    @focus="focus"
    @blur="blur"
    :class="{
      zIndex: isSelectFocused,
      edit: isSelectFocused,
      'department-wrap': hasError,
      multiple: multiple,
    }"
  >
    <template #tagRender="{ label, onClose, option }">
      <selectTag
        :label="truncateText(label.slice(0, attrObj.maxTagTextLength + 3), selectorWidth)"
        :type="fieldType"
        :title="
          option?.label?.length > attrObj.maxTagTextLength ||
          measureText(option.label) >
            measureText(truncateText(label.slice(0, attrObj.maxTagTextLength + 3), selectorWidth))
            ? option?.label
            : ''
        "
        closable
        :tagWidgetStyle="widget.style"
        :isDesign="false"
        :maxTagTextLength="attrObj.maxTagTextLength"
        style="margin-right: 3px"
        @on-close="onClose"
      />
    </template>
  </a-tree-select>
  <div v-if="multiple" :style="{ height: height }"></div>
</template>

<script setup lang="ts" name="gct-department">
  import {
    ref,
    computed,
    toRefs,
    toRaw,
    nextTick,
    reactive,
    onBeforeMount,
    h,
    onMounted,
    onUnmounted,
    inject,
    watch,
  } from 'vue';
  import {
    useAsyncOptions,
    getPageEvent,
    useAsyncFileAttrs,
  } from '/@page-designer/components/widgets/hooks/hooks';
  import { Department } from '/@page-designer/types/web';
  import type { TreeSelectProps } from 'ant-design-vue';
  import { useUserStore } from '/@/store/modules/user';
  import { TreeSelect, message as Message } from 'ant-design-vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { useModalPicker, PickType } from '/@/components/UserPick';
  import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
  import { list_to_tree, treeToList } from '/@/utils/helper/treeHelper';
  import { cloneDeep, get } from 'lodash-es';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import {
    taglabel,
    selectTag,
  } from '/@page-designer/components/widgets/web/__components__/formcomponent/index';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { IDepartmentComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { calcMutiLineTags, isNotSignalLine, isSingleLine } from '../../../hooks/useTag';
  import { TABLE_CELL_HEIGHT_MODE, truncateText, measureText } from '@gct/runtime';

  const { t } = useI18n();

  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Department;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      // getPopupContainer: (triggerNode) => triggerNode.parentNode,
    },
  );
  const PopupContainer = getParentPopupContainer(props);
  const { formData } = toRefs(props);
  const {
    placeholder,
    selectType,
    fieldType,
    autofillRules,
    enableAutofill,
    modelKey,
    field,
    defaultMain,
    label,
    fieldName,
    isFieldModel,
  } = reactive(props.widget.props);
  const { readonly } = toRefs(props.widget.props);
  const { openPickerByDept } = useModalPicker({
    type: PickType.APP,
    fieldKey: field,
    modelKey,
  });
  const { getAsyncOptions, multiple, options } = useAsyncOptions(fieldType!);
  const { getmaxTagLength, attrObj } = useAsyncFileAttrs();

  const treeSelectAtrr = computed(() => {
    let dropdownClassName = 'gct-custom-select-dropdown vxe-table--ignore-clear';
    if (selectType === BindCmpStyleEnum.CMP_MODAL) {
      dropdownClassName += ' hidden';
    }
    let attr: TreeSelectProps = {
      placeholder: placeholder,
      multiple: multiple,
      allowClear: true,
      showCheckedStrategy: TreeSelect.SHOW_ALL,
      treeCheckable: multiple,
      treeCheckStrictly: multiple,
      treeNodeLabelProp: multiple ? undefined : 'showTitle',
      dropdownClassName,
    };
    return attr;
  });

  const Event = getPageEvent();
  const hasError = ref<boolean>(false);

  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  const value = computed({
    get() {
      let value = props.modelValue;
      return multiple ? value?.split(',').filter((i) => i) || [] : value || undefined;
    },
    set(value: string | string[]) {
      if (multiple) {
        if (selectType === BindCmpStyleEnum.CMP_MODAL) {
          emit('update:modelValue', value?.join(','));
        } else {
          emit('update:modelValue', value?.map((item: any) => item.value).join(','));
        }
      } else {
        emit('update:modelValue', value || '');
      }
    },
  });
  onBeforeMount(async () => {
    if (multiple) {
      getmaxTagLength({ fieldKey: field, modelKey: modelKey });
    }
    await getAsyncOptions({ selectType });
    const userStore = useUserStore();
    const info = userStore.getTenantUserInfo;
    if (info) {
      const fieldInfo = await FieldSchema.getConfigByField(modelKey, field);
      if (!props.formData.id_ && props.formData[field] === undefined && !isFieldModel) {
        const _defaultMain = defaultMain ?? get(fieldInfo, 'defaultValue.value');
        if (_defaultMain === FieldSysVarDefaultValueEnum.CURRENT_ORG) {
          emit('update:modelValue', info.masterOrgId);
          changeValue(info.masterOrgId);
        }
      }
    }
  });

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
  /**选择新的人员 */
  async function changeSelect(v) {
    if (!v) {
      deselect(value.value);
    }
    const data = await changeValue(v);
    Event.runEventByName('onChange', props.widget.events, value.value, data, formData.value);
    /**列字段时候触发保存 */
    emit('saveTableRow');
  }
  /**值发生变化 */
  async function changeValue(v) {
    await nextTick();
    if (v) hasError.value = false;
    let data = getOptionValue(
      multiple && selectType === BindCmpStyleEnum.CMP_TREE_SELECTION
        ? v?.map((item: any) => item.value)
        : v,
    );
    if (enableAutofill && !multiple) {
      /**单选模式下可能有数据填充 */
      autofillRules.forEach(({ fromField, toField }) => {
        formData.value[toField] = data?._item?.[fromField];
      });
    }
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[field] = {
        [value.value]: multiple ? data.map((i) => i.label) : data.label,
      };
    }
    return data;
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
  function deselect(clearValue) {
    let data = getOptionValue(clearValue);
    Event.runEventByName('afterClear', props.widget.events, clearValue, data, formData.value);
  }

  function openView() {
    if (selectType === BindCmpStyleEnum.CMP_TREE_SELECTION) return;
    openPickerByDept({
      deptIds: value.value,
      multiple,
      callback(a) {
        value.value = multiple ? a : a[0];
        changeSelect(value.value);
      },
    });
  }
  const tagValue = computed(() => {
    if (Array.isArray(value.value)) {
      return options.value.filter((e) => value.value.includes(e.value)).map((e) => e.label);
    } else {
      return options.value.filter((e) => e.value === value.value).map((e) => e.label);
    }
  });

  /******************* 表格多行逻辑分割线 *************************/
  const tableCellHeight: any | undefined = inject('tableCellHeight');

  const selectLabel = ref([]);
  const selectRef = ref();
  const maxTagCount = ref<'responsive' | number | null>('responsive');
  const isSelectFocused = ref(false);
  const height = ref(0);
  let resizeObserver: ResizeObserver | null = null;
  const selectorWidth = ref(1400);
  const focus = () => {
    // if (isNotSignalLine(tableCellHeight)) return;
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
        const option = treeToList(treeoptions.value).find((item) => item.value === val);
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
    selectorWidth.value = selectWidth - 29 - 6;
    if (isSelectFocused.value) return;

    maxTagCount.value = calcMutiLineTags(
      selectLabel.value,
      maxRow,
      selectWidth,
      attrObj.maxTagTextLength,
    );
  }

  watch(
    () => options.value,
    () => {
      if (isNotSignalLine(tableCellHeight)) return;
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
    async (oldVal, newVal) => {
      if (!value.value || !value.value.length) return;
      if (isNotSignalLine(tableCellHeight)) return;
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
  onMounted(() => {
    if (tableCellHeight && tableCellHeight.cellHeightMode === TABLE_CELL_HEIGHT_MODE.ALL_ROW) {
      maxTagCount.value = null;
      return;
    }
    if (isNotSignalLine(tableCellHeight)) return;
    nextTick(() => {
      const el = selectRef.value?.$el;
      if (!el) return;
      const selector = el.querySelector('.ant-select-selector');
      if (!selector) return;
      selectorWidth.value = selector.offsetWidth - 29 - 30 - 6;
      if (!value.value || !value.value.length) return;

      resizeObserver = new ResizeObserver((entries) => {
        if (multiple) {
          calcTwoLineTags();
        }
      });
      resizeObserver.observe(selector);
    });
  });
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });

  defineExpose<IDepartmentComponentExpose>({
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
    setError() {
      hasError.value = true;
      Message.error(t('sys.pageDesigner.pleaseSelectFirstSth', { sth: label || fieldName }));
    },
  });
</script>
<style lang="less">
  .department-wrap.ant-select {
    &:not(.ant-select-customize-input) {
      .ant-select-selector {
        border: 1px solid #f00;
      }
    }
  }
</style>
<style scoped lang="less">
  // :deep(.ant-select) {
  //   height: 100%;
  // }
  .multiple {
    height: 100% !important;

    :deep(.ant-select-selector) {
      height: 100%;
    }
  }

  :deep(.ant-select-multiple .ant-select-selector) {
    align-items: flex-start;
  }

  :deep(.ant-select-selection-overflow) {
    padding-top: 3px;
  }

  :deep(.ant-select-selection-overflow-item-suffix) {
    width: 0;
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

  .zIndex {
    z-index: 10;
  }
  :deep(.ant-select-multiple .ant-select-selection-item) {
    margin-top: -1px;
  }
</style>
