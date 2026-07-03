<template>
  <FieldSelect
    ref="selectRef"
    v-model:value="value"
    :design="false"
    :readonly="readonly"
    :fieldType="fieldType"
    :type="widget.type"
    :tagStyle="widget.style"
    :selectExtraProps="separatorAttr"
    @change="chnageSelect"
    @deselect="deselect"
    @click="openView"
    :options="options"
    class="w100%"
    :getPopupContainer="PopupContainer"
    @dropdownVisibleChange="onDropLoad"
    :maxTagTextLength="12"
    :maxTagCount="maxTagCount"
    @search="fetchUser"
    :filter-option="false"
    @focus="focus"
    @blur="blur"
    :class="{
      zIndex: isSelectFocused,
      edit: isSelectFocused,
      multiple: multiple,
      'select-render': true,
    }"
    :selectorWidth="selectorWidth"
  />
  <div v-if="multiple" :style="{ height: height }"></div>
</template>

<script setup lang="ts" name="gct-department">
  import {
    ref,
    computed,
    reactive,
    toRefs,
    toRaw,
    nextTick,
    onBeforeMount,
    watch,
    toRef,
    onMounted,
    onUnmounted,
    inject,
  } from 'vue';
  import { useAsyncOptions, getPageEvent } from '/@page-designer/components/widgets/hooks/hooks';
  import { useUserStore } from '/@/store/modules/user';
  import { Userpicker } from '/@page-designer/types/web';
  import type { SelectProps } from 'ant-design-vue';
  import { BindCmpStyleEnum } from '/@page-designer/enum';
  import { useModalPicker, PickType } from '/@/components/UserPick';
  import FieldSelect from '../../__components__/formcomponent/FieldSelect';
  import { FieldSysVarDefaultValueEnum } from '@/projects/app-designer/src/enum';
  import { FieldSchema } from '/@page-designer/hooks/getFieldSchema';
  import { get, debounce } from 'lodash-es';
  import { getParentPopupContainer } from '/@page-designer/components/widgets/hooks/listhook';
  import { Form } from 'ant-design-vue';
  import { IUserpickerComponentExpose } from '/@/projects/page-designer/src/interface/web';
  import { calcMutiLineTags, isNotSignalLine, isSingleLine } from '../../../hooks/useTag';
  import { TABLE_CELL_HEIGHT_MODE } from '@gct/runtime';

  const { onFieldChange } = Form.useInjectFormItemContext();
  const props = withDefaults(
    defineProps<{
      modelValue?: string;
      widget: Userpicker;
      formData: Object;
      getPopupContainer?: (triggerNode) => HTMLElement;
    }>(),
    {
      //getPopupContainer: (triggerNode) => document.body,
    },
  );
  const tableCellHeight: any = inject('tableCellHeight');
  const PopupContainer = getParentPopupContainer(props);
  const {
    placeholder,
    clearable,
    fieldType,
    enableAutofill,
    autofillRules,
    modelKey,
    field: fieldKey,
    selectType,
    defaultMain,
    enableDepScope,
    departmentScope,
    isFieldModel,
  } = reactive(props.widget.props);

  const { readonly } = toRefs(props.widget.props);
  const { getAsyncOptions, multiple, options } = useAsyncOptions(fieldType!);
  const emit = defineEmits(['update:modelValue', 'saveTableRow']);
  onBeforeMount(() => {
    !props.widget?.props.enableDepScope && setDefaultMain();
  });

  // 设置默认值
  async function setDefaultMain() {
    await getAsyncOptions({ fieldKey, modelKey });
    const userStore = useUserStore();
    const fieldInfo = await FieldSchema.getConfigByField(modelKey, fieldKey);
    if (
      userStore.getUserInfo &&
      !props.formData.id_ &&
      props.formData[fieldKey] === undefined &&
      !isFieldModel
    ) {
      const _defaultMain = defaultMain ?? get(fieldInfo, 'defaultValue.value');
      if (_defaultMain === FieldSysVarDefaultValueEnum.CURRENT_USER) {
        emit('update:modelValue', userStore.getUserInfo.userId);
        chnageValue(userStore.getUserInfo.userId);
      }
    }
  }

  const { openPickerByUser } = useModalPicker({
    type: PickType.APP,
    fieldKey,
    modelKey,
  });
  const Event = getPageEvent();

  const { formData } = toRefs(props);
  const separatorAttr = computed(() => {
    let attr: SelectProps = {
      placeholder: placeholder,
      mode: multiple ? 'multiple' : undefined,
      optionLabelProp: multiple ? undefined : 'showTitle',
      allowClear: clearable,
      showSearch: true,
    };
    if (selectType === BindCmpStyleEnum.CMP_MODAL) {
      attr.dropdownClassName = 'hidden';
    }
    return attr;
  });

  const deptValue = toRef(() => {
    const enableDepScope = props.widget?.props.enableDepScope;
    if (enableDepScope) {
      const departmentScope = props.widget?.props.departmentScope.split('$')[0];
      return formData.value[departmentScope];
    }
  });
  watch(deptValue, (orgIds) => {
    if (orgIds) {
      getAsyncOptions({ fieldKey, modelKey, orgIds });
    } else {
      options.value = [];
    }
  });

  const value = props.widget.props.field
    ? computed<any>({
        get() {
          let value = props.modelValue;
          return multiple ? value?.split(',').filter((i) => i) || [] : value || undefined;
        },
        set(value: string[]) {
          emit('update:modelValue', multiple ? value?.join(',') : value || '');
        },
      })
    : ref();
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
  /**选择人员 */
  async function chnageSelect(v) {
    const data = await chnageValue(v);
    Event.runEventByName('onChange', props.widget.events, value.value, data, formData.value);
    /**列字段时候触发保存 */
    emit('saveTableRow');
  }
  /**值变化 */
  async function chnageValue(v) {
    await nextTick();
    let data = getOptionValue(v);
    if (enableAutofill && !multiple) {
      autofillRules.forEach(({ fromField, toField }) => {
        formData.value[toField] = data?._item?.[fromField];
      });
    }
    !!formData.value._DICT || (formData.value._DICT = {});
    if (data) {
      /**填充翻译后的值 */
      formData.value._DICT[fieldKey] = {
        [value.value]: multiple ? data.map((i) => i.label) : data.label,
      };
    }
    onFieldChange();
    return data;
  }
  function deselect(clearValue) {
    Event.runEventByName('afterClear', props.widget.events, clearValue, formData.value);
  }

  const onDropLoad = (v) => {
    if (enableDepScope && departmentScope && !deptValue.value && v) {
      const departmentId = departmentScope.split('$')[1] || '';
      departmentId && Event.context.$ref(departmentId)?.setError();
      return;
    }
    //影响部门范围时，不自动加载
    if (v && !(multiple ? value.value?.length : value.value)) {
      getAsyncOptions({
        fieldKey,
        modelKey,
        orgIds: deptValue.value,
      });
    }
  };

  function openView() {
    if (selectType === BindCmpStyleEnum.CMP_DROPDOWN_SELECT) return;
    openPickerByUser({
      userIds: value.value,
      multiple,
      callback(a) {
        value.value = multiple ? a : a[0];
        chnageSelect(value.value);
      },
    });
  }
  const fetchUser = debounce((keyword) => {
    keyword = keyword.trim();
    getAsyncOptions({
      fieldKey,
      modelKey,
      keyword,
    });
  }, 300);

  const selectLabel = ref([]);
  const selectRef = ref();
  const maxTagCount = ref<'responsive' | null | number>('responsive');
  const isSelectFocused = ref(false);
  const height = ref(0);
  let resizeObserver: ResizeObserver | null = null;
  const selectorWidth = ref(1400);

  const getSelectLabel = () => {
    // 按照选中的顺序 一一对应找 label
    return (value.value || [])
      .map((val) => {
        const option = options.value.find((item) => item.value === val);
        return option
          ? {
              ...option,
              type: 'user',
            }
          : option;
      })
      .filter(Boolean);
  };

  const focus = () => {
    // if (isNotSignalLine(tableCellHeight)) return;
    const el = selectRef.value?.$el;
    if (!el) return;
    const selector = el.querySelector('.ant-select-selector');
    height.value = selector.offsetHeight + 'px'; // 记录当前选择框的高度，避免被标签撑高
    maxTagCount.value = null; // 聚焦时先不限制标签数量，等下一次更新后再计
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

    maxTagCount.value = calcMutiLineTags(selectLabel.value, maxRow, selectWidth, 12);
  }

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
      selectorWidth.value = selector.offsetWidth - 30 - 6;

      if (!value.value || !value.value.length) return;

      resizeObserver = new ResizeObserver((entries) => {
        if (multiple) {
          calcTwoLineTags();
        }
      });
      resizeObserver.observe(selector);
    });
  });

  watch(
    value,
    async () => {
      if (!value.value || !value.value.length) return;
      if (isNotSignalLine(tableCellHeight)) return;
      selectLabel.value = multiple && getSelectLabel();
      await nextTick();
      if (multiple) {
        calcTwoLineTags();
      }
      // 选中时自动滚动到最底部
      const el = selectRef.value?.$el;
      if (!el) return;
      const selector = el.querySelector('.ant-select-selector');
      selector.scrollTop = selector.scrollHeight;
    },
    { deep: true, immediate: true },
  );
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
  });
  defineExpose<IUserpickerComponentExpose>({
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
  });
</script>
<style scoped lang="less">
  :deep(.ant-select-selector) {
    height: 100%;
  }

  .multiple {
    height: 100% !important;
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
</style>
