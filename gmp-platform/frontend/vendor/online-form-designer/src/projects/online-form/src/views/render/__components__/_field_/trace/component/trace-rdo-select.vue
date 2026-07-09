<template>
  <a-popover
    :visible="open"
    @update:visible="setVisible"
    trigger="click"
    placement="bottomLeft"
    overlayClassName="vxe-table--ignore-clear gct-edhr-custom-popover"
    @visibleChange="visibleChange"
    :autoAdjustOverflow="autoAdjustOverflow"
  >
    <template #content>
      <rdo-select-table
        ref="selectTableRef"
        :widget="widget"
        :modelValue="value"
        :parentToDefault="parentToDefault"
        :extraQuery="newQueryData"
        @change-select="onChangeSelect"
      />
    </template>
    <ParseSelect
      :class="['cell-trace-tree-select', showRequired && 'is-show-required', realFieldId]"
      v-model:value="currentValue"
      :searchValue="searchValue"
      :options="state.data"
      :disabled="showDisabled"
      v-bind="separatorAttr"
      @search="searchTable"
      @click.capture="openTreeModal"
      :formData="formData"
      :widget="widget"
      :allowSwitch="allowSwitch"
      v-model:mode="mode"
      @scan="handleEnter"
    >
      <template #clearIcon>
        <close-circle-filled @mousedown.stop="onClear" @click.stop />
      </template>
    </ParseSelect>
  </a-popover>
</template>

<script setup lang="ts" name="trace-rdo-select">
  import { computed, watch, reactive, ref, h, inject } from 'vue';
  import { cloneDeep, debounce, isNil } from 'lodash-es';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { useWidgetStaticAttrs, renderUtils, NCB_PROVIDE } from '@gct/nocode-base';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import RdoSelectTable from '../common/rdo-select-table.vue';
  import { message, type TreeSelectProps } from 'ant-design-vue';
  import type { ITrace } from '@gct/nocode-base';
  import ParseSelect from '../common/parse-select.vue';
  import { useRuleProps } from '../utils/use-rule-props';
  import { transformTreeData } from '../utils/columns';

  const props = withDefaults(
    defineProps<{
      value?: string;
      widget: ITrace;
      formData: Object;
      realFieldId?: string;
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault?: boolean;
      /** 当产品只有一个的版本时，是否隐藏版本号 */
      hideSingleVersion?: boolean;
    }>(),
    {
      /** 是否选中父级实际选中默认子版本 */
      parentToDefault: true,
      /** 当产品只有一个的版本时，是否隐藏版本号 */
      hideSingleVersion: true,
    },
  );

  const emit = defineEmits(['update:value', 'change']);

  const {
    field,
    refModelKey,
    placeholder,
    showRequired,
    showDisabled,
    newQueryData,
    newDisplayRule,
    modelKey,
  } = useWidgetStaticAttrs(props.widget);

  const { autofillRules } = props.widget.props;
  const autoAdjustOverflow = document.body.clientHeight > 800;
  const open = ref(false);
  const searchValue = ref();
  const selectTableRef = ref<InstanceType<typeof RdoSelectTable> | null>(null);

  const state = reactive<{ data: Array<{ label: string; value: string } | any> }>({
    data: [],
  });

  const currentValue = computed<string | undefined>({
    get() {
      return (props.value ?? undefined) as string | undefined;
    },
    set(val: string | undefined) {
      emit('update:value', val ?? null);
    },
  });

  const separatorAttr = computed<TreeSelectProps>(() => ({
    placeholder: placeholder || $t('sys.chooseText'),
    dropdownClassName: 'hidden',
    allowClear: true,
    showSearch: true,
    virtual: false,
    open: false,
    showArrow: true,
    filterTreeNode: false,
    optionLabelProp: 'full_path',
  }));

  watch(
    () => currentValue.value,
    async (newVal) => {
      // 补全 option
      await checkInitialValue(newVal);

      if (!isNil(newVal)) {
        const labels = renderUtils.getSelectOptions({
          value: newVal,
          options: state.data,
          key: 'label',
        })?.labels;

        const newLb = JSON.stringify(labels);
        const lbKey = `${field}_lb_`;
        if (props.formData?.[lbKey] !== newLb) {
          props.formData[lbKey] = newLb;
        }
      }
    },
    { immediate: true },
  );

  const { allowSwitch, mode, handleEnter } = useRuleProps({
    props,
    selectByCode: async (code) => {
      const res = await renderUtils.requestRefOptions({
        modelKey,
        fieldKey: field,
        refModelKey,
        isRdo: true,
        exp: `OR(code_.eq)`,
        queryData: {
          ['code_.eq']: code,
          operating_state_: true,
        },
        pageSize: 30,
      });
      console.log('res', res);
      if (!res.options?.[0]) {
        message.error($t('sys.onlineForm.noCorrespondingDataFound'));
        return false;
      }
      const transformData = transformTreeData(res?.options ?? [], props.value ?? undefined);
      const info = transformData.data[0];
      if (info) {
        onChangeSelect(info);
      }
      return true;
    },
  });

  const searchTable = debounce((keyword: string) => {
    searchValue.value = keyword;
    selectTableRef.value?.search?.(keyword);
  }, 300);

  const onClearSearchValue = () => {
    if (searchValue.value && String(searchValue.value).trim()) {
      searchValue.value = undefined;
      selectTableRef.value?.search?.('');
      return false;
    }
    return true;
  };

  const onClear = () => {
    if (onClearSearchValue()) {
      emit('update:value', null);
    }
  };

  /** 设置下拉显隐 */
  function setVisible(visible) {
    if (open.value === visible) {
      return;
    }
    /** 扫码的时候不显示下拉 */
    if (visible === true && mode.value === 'scan') {
      return;
    }
    open.value = visible;
  }
  function visibleChange(visible) {
    if (!visible) {
      onClearSearchValue();
    }
  }

  const makeFullPath =
    (label, addDefaultTag = false) =>
    () =>
      h('div', [
        h('span', label),
        ...(addDefaultTag ? [h('span', { class: 'gct-custom-tag ml8px' }, $t('sys.default'))] : []),
      ]);

  /** 判断是否存在 不存在需要拼接 */
  async function checkInitialValue(value?: string | undefined) {
    const val = value ?? currentValue.value;
    if (!val) {
      return;
    }

    // 如果已经存在就不拉取
    if (state.data?.some((o) => o?.value === val)) return;

    const remoteChildren = await getChildrenByIds(val);

    if (remoteChildren && remoteChildren.length) {
      // 把补全的放在前面，保持可选项展示
      state.data = [...remoteChildren, ...(state.data || [])];
    }
  }

  async function getChildrenByIds(id_: string) {
    if (!id_) return [];

    const [fId] = id_.split(':');

    const res: any =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'rdoListVersionByRefIdsWithParent',
          modelKey: refModelKey,
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        { foreignFields: [] },
        {
          refIds: id_,
          includeDeleted: 1,
        },
      )) || {};

    const data = res?.data?.[0] || {};
    const rdoLabel = data?.__LABEL__ || data?.name_ || '';

    const childRes: any =
      (await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'rdoListVersionById',
          modelKey: refModelKey,
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        { foreignFields: [] },
        { id: fId },
      )) || {};

    const childList = Array.isArray(childRes?.data) ? childRes.data : [];
    const hasOneChild = childList.length === 1;
    const shouldHideName = props.hideSingleVersion && hasOneChild;

    const children = childList.map((child: any) => {
      const label = shouldHideName
        ? rdoLabel
        : `${rdoLabel}:${child?.__LABEL__ || child?.version_ || ''}`;
      const value = `${fId}:${child?.id_}`;
      return {
        label,
        value,
        full_path: makeFullPath(label),
        __raw__: child,
      };
    });

    return [
      {
        label: rdoLabel,
        value: fId,
        full_path: makeFullPath(rdoLabel, true),
      },
    ].concat(children);
  }

  function openTreeModal(event: Event) {
    if (open.value) {
      event.stopPropagation();
    }
  }

  function onChangeSelect(record: any) {
    const {
      id_,
      __VALUE__,
      __DEFAULT__,
      __HAS_ONE_CHILD__,
      __SHOW_LABEL__,
      __RDO_LABEL__,
      __VERSION_NAME__,
    } = record || {};

    const value = __VALUE__ || id_ || null;

    let showValue;
    let showLabel;
    let showFullPath;

    const shouldHideName = props.hideSingleVersion && __HAS_ONE_CHILD__;
    const _displayLabel = (versionName?: string) => {
      if (newDisplayRule) {
        // 选中父级时按默认版本的显示规则显示
        return __DEFAULT__ ? __DEFAULT__.__SHOW_LABEL__ : __SHOW_LABEL__;
      }
      return !shouldHideName && versionName ? `${__RDO_LABEL__}:${versionName}` : __RDO_LABEL__;
    };

    // 选择了父版本
    if (__DEFAULT__) {
      if (props.parentToDefault) {
        showLabel = _displayLabel(__DEFAULT__.__VERSION_NAME__);
        showFullPath = makeFullPath(showLabel);
        showValue = `${value}:${__DEFAULT__.id_}`;
      } else {
        showLabel = _displayLabel();
        showFullPath = makeFullPath(showLabel, true);
        showValue = value;
      }
    } else {
      showLabel = _displayLabel(__VERSION_NAME__);
      showFullPath = makeFullPath(showLabel);
      showValue = value;
    }

    // 设置当前下拉数据为选中项
    state.data = [
      {
        label: showLabel,
        value: showValue,
        full_path: showFullPath,
      },
    ];

    emit('update:value', showValue);

    // 数据填充
    if (autofillRules && autofillRules.length !== 0) {
      autofillRules.forEach(({ fromField, toField }) => {
        props.formData[toField!] = __DEFAULT__?.[fromField] || record?.[fromField];
      });
    }
    // 关闭 popover 并通知变更
    open.value = false;
    emit('change');

    onClearSearchValue();
  }

  /** 用来返回完整路径id */
  function onChange(value, _, node) {
    if (value) {
      const [_fId, _cId] = value?.split(':');

      /** 当没有子版本id时，拼接默认子版本id */
      if (!_cId) {
        emit('update:value', `${value}:${node.triggerNode.props._info.id_}`);
      } else {
        emit('update:value', value);
      }
    } else {
      emit('update:value', null);
    }
  }

  defineExpose({
    getOptions: () => state.data,
  });
</script>

<style scoped lang="less">
  .cell-trace-tree-select {
    width: var(--cmp-width, 100%);
    min-width: 30px;
    vertical-align: middle;
    :deep(.ant-select-selector) {
      height: 28px;
      padding: 0 2px;
      border-radius: 2px !important;

      border-color: var(--required-border-color, #e9e9e9);
      background-color: var(--required-background-color, transparent);
      &:hover {
        border-color: var(--required-border-hover-color, var(--ant-primary-color));
      }

      .ant-select-selection-search {
        left: 2px;
        right: 16px;
        z-index: 1;
        > input {
          height: 28px;
        }
      }
      .ant-select-selection-item,
      .ant-select-selection-placeholder {
        line-height: 26px;
        padding-right: 0;
        margin-right: 15px;
        font-size: var(--size, 12px);
        text-align: left;
      }
    }

    &.ant-select-disabled {
      .ant-select-selector {
        background: #f5f5f5;
      }
    }
  }
</style>
