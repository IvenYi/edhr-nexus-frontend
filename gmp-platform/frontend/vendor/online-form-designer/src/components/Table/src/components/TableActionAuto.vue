<template>
  <div :class="[prefixCls, getAlign]" @click.stop="onCellClick">
    <template v-for="(action, index) in getActions" :key="`${index}-${action.label}`">
      <Tooltip v-if="action.tooltip" v-bind="getTooltip(action.tooltip)">
        <PopConfirmButton v-bind="action">
          <Icon :icon="action.icon" :class="{ 'mr-1': !!action.label }" v-if="action.icon" />
          <span v-if="action.label" class="text-14px">{{ action.label }}</span>
        </PopConfirmButton>
      </Tooltip>
      <PopConfirmButton v-else v-bind="action">
        <Icon :icon="action.icon" :class="{ 'mr-1': !!action.label }" v-if="action.icon" />
        <span v-if="action.label" class="text-14px">{{ action.label }}</span>
      </PopConfirmButton>
      <Divider
        type="vertical"
        class="action-divider"
        v-if="divider && index < getActions.length - 1"
      />
    </template>

    <Dropdown
      :trigger="['hover']"
      :dropMenuList="getDropdownList"
      popconfirm
      v-if="getDropdownList.length > 0"
    >
      <slot name="more"></slot>
      <a-button type="link" size="small" v-if="!$slots.more">
        <MoreOutlined class="icon-more" />
      </a-button>
    </Dropdown>
  </div>
</template>
<script setup lang="ts">
  import { PropType, computed, toRaw, unref } from 'vue';
  import { MoreOutlined } from '@ant-design/icons-vue';
  import { Divider, Tooltip, TooltipProps } from 'ant-design-vue';
  import Icon from '@/components/Icon/Icon.vue';
  import { ActionItem, TableActionType } from '/@/components/Table';
  import { PopConfirmButton } from '/@/components/Button';
  import { Dropdown } from '/@/components/Dropdown';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { useTableContext } from '../hooks/useTableContext';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { isBoolean, isFunction, isString } from '/@/utils/is';
  import { propTypes } from '/@/utils/propTypes';
  import { ACTION_COLUMN_FLAG } from '../const';

  const props = defineProps({
    actions: {
      type: Array as PropType<ActionItem[]>,
      default: null,
    },
    divider: propTypes.bool.def(true),
    outside: propTypes.bool,
    stopButtonPropagation: propTypes.bool.def(false),

    maxDispalyCount: propTypes.number.def(4),
  });
  const { prefixCls } = useDesign('basic-table-action');
  let table: Partial<TableActionType> = {};
  if (!props.outside) {
    table = useTableContext();
  }

  const { hasPermission } = usePermission();
  function isIfShow(action: ActionItem): boolean {
    const ifShow = action.ifShow ?? true;

    if (isFunction(ifShow)) {
      return ifShow(action);
    }

    return !!ifShow;
  }

  /**
   * 所有可用按钮
   */
  const validActions = computed(() => {
    return [...(toRaw(props.actions) || [])].filter((action) => {
      return hasPermission(action.auth) && isIfShow(action);
    });
  });

  /**
   * 展示的按钮
   */
  const getActions = computed(() => {
    let list: ActionItem[] = [];
    if (props.maxDispalyCount >= validActions.value.length) {
      list = [...validActions.value];
    } else {
      list = validActions.value.slice(0, props.maxDispalyCount);
    }
    return list.map((action) => {
      const { popConfirm } = action;
      return {
        getPopupContainer: () => unref((table as any)?.wrapRef) ?? document.body,
        type: 'link',
        size: 'small',
        ...action,
        ...(popConfirm || {}),
        onConfirm: popConfirm?.confirm,
        onCancel: popConfirm?.cancel,
        enable: !!popConfirm,
      };
    });
  });

  /**
   * 隐藏的按钮
   */
  const getDropdownList = computed((): any[] => {
    let list: ActionItem[] = [];
    if (props.maxDispalyCount >= validActions.value.length) {
      return [];
    } else {
      list = validActions.value.slice(props.maxDispalyCount);
    }
    return list.map((action, index) => {
      const { label, popConfirm } = action;
      return {
        ...action,
        ...popConfirm,
        onConfirm: popConfirm?.confirm,
        onCancel: popConfirm?.cancel,
        text: label,
        divider: index < list.length - 1 ? props.divider : false,
      };
    });
  });

  const getAlign = computed(() => {
    const columns = (table as TableActionType)?.getColumns?.() || [];
    const actionColumn = columns.find(
      (item) => item.dataIndex?.toString().toUpperCase() === ACTION_COLUMN_FLAG,
    );
    return actionColumn?.align ?? 'left';
  });

  function getTooltip(data: string | TooltipProps): TooltipProps {
    return {
      getPopupContainer: () => unref((table as any)?.wrapRef) ?? document.body,
      placement: 'bottom',
      ...(isString(data) ? { title: data } : data),
    };
  }

  function onCellClick(e: MouseEvent) {
    if (!props.stopButtonPropagation) return;
    const path = e.composedPath() as HTMLElement[];
    const isInButton = path.find((ele) => {
      return ele.tagName?.toUpperCase() === 'BUTTON';
    });
    isInButton && e.stopPropagation();
  }
</script>
<style lang="less">
  @prefix-cls: ~'@{namespace}-basic-table-action';

  .@{prefix-cls} {
    display: flex;
    align-items: center;

    .action-divider {
      display: table;
    }

    &.left {
      justify-content: flex-start;
    }

    &.center {
      justify-content: center;
    }

    &.right {
      justify-content: flex-end;
    }

    button {
      display: flex;
      align-items: center;

      span {
        margin-left: 0 !important;
      }
    }

    button.ant-btn-circle {
      span {
        margin: auto !important;
      }
    }

    .ant-divider,
    .ant-divider-vertical {
      margin: 0 10px;
    }

    .icon-more {
      transform: rotate(90deg);

      svg {
        font-size: 1.1em;
        font-weight: 700;
      }
    }
  }
</style>
