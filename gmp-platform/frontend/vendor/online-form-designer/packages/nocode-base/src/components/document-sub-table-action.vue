<template>
  <a-popover
    v-if="!noPopover"
    placement="right"
    ref="tooltipRef"
    overlayClassName="document-sub-table-action-popover"
  >
    <template #content>
      <div class="document-sub-table-action-content">
        <div
          v-if="showQuickFillBtn"
          class="sub-table-btn quick-fill-btn"
          @click="handleMenuClick({ key: 'quickFillRowCurrent' })"
        >
          <i class="iconfont icon-kuaisutianbao quick-fill-row-icon"></i>
        </div>
        <div
          v-if="showEditBtn"
          class="sub-table-btn quick-fill-btn"
          @click="handleMenuClick({ key: 'rowEdit' })"
        >
          <i class="iconfont icon-kuaisutianbao quick-fill-row-icon"></i>
        </div>
        <div
          :class="{ 'rounded-0!': showQuickFillBtn }"
          @click="handleMenuClick({ key: 'insertRowAfter' })"
          class="sub-table-btn quick-fill-btn"
        >
          <i class="iconfont icon-tianjia add-row-icon"></i>
        </div>
        <a-dropdown-button
          v-if="showInsertMultiple"
          @click="handleMenuClick({ key: 'copyRowAfter' })"
          class="sub-table-dropdown-button is-combination"
          :getPopupContainer="(trigger) => trigger.parentNode"
        >
          <i class="iconfont icon-fuzhihang"></i>
          <template #overlay>
            <a-menu @click="handleMenuClick">
              <a-menu-item key="insertRowBefore">
                在上方插入行
                <a-input-number v-bind="inputCommonProps" v-model:value="formState.upRowNum" />
              </a-menu-item>
              <a-menu-item key="insertRowAfter">
                在下方插入行
                <a-input-number v-bind="inputCommonProps" v-model:value="formState.downRowNum" />
              </a-menu-item>
            </a-menu>
          </template>
          <template #icon>
            <i class="iconfont icon-gengduo1"></i>
          </template>
        </a-dropdown-button>
        <div
          v-else
          class="sub-table-btn quick-fill-btn"
          @click="handleMenuClick({ key: 'copyRowAfter' })"
        >
          <i class="iconfont icon-fuzhihang quick-fill-row-icon"></i>
        </div>

        <div
          v-if="showDelBtn"
          class="sub-table-btn ml-4px"
          @click="handleMenuClick({ key: 'deleteRowCurrent' })"
        >
          <i class="iconfont icon-shanchu1 del-row-icon"></i>
        </div>
      </div>
    </template>
    <div class="document-sub-table-action-bar">
      <div class="sub-table-btn">
        <i class="iconfont icon-neibuyingyong"></i>
      </div>
    </div>
  </a-popover>
  <div v-else class="document-sub-table-action-bar">
    <div class="sub-table-btn" @click="handleMenuClick({ key: 'default' })">
      <i class="iconfont icon-neibuyingyong"></i>
    </div>
  </div>
</template>

<script setup lang="ts" name="document-sub-table-action">
  import { computed, reactive, toRaw } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import { FIELD_TYPE, IModalData } from '@gct/runtime';
  import { CellType, ComponentTypeEnum } from '../constant';
  import { getSubTableQuickFillInfo } from '../hooks';
  import DocumentQuickFillModal from './document-quick-fill-modal.vue';

  const props = withDefaults(
    defineProps<{
      showDelBtn: boolean;
      showQuickFillBtn: boolean;
      showEditBtn: boolean;
      /** 是否显示插入多行操作 */
      showInsertMultiple: boolean;
      subTableFieldId: string;
      mobileTdIdGroups: Map<any, any>;
      widgetCenter: any;
      handleMenuClick: Function;
      noPopover?: boolean;
    }>(),
    {
      showInsertMultiple: true,
    },
  );

  const defaultValues = {
    upRowNum: 1,
    downRowNum: 1,
  };

  const formState = reactive<typeof defaultValues>(Object.assign({}, defaultValues));

  const stopRefPropagation = (vm) => {
    if (!vm?.$el) {
      return;
    }
    vm.$el.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  };

  /**
   * 重置菜单数据
   */
  const reset = (): void => {
    Object.assign(formState, defaultValues);
  };

  /** 数值输入框统一props */
  const inputCommonProps = {
    ref: stopRefPropagation,
    class: 'sub-table-menu-num-input',
    size: 'small',
    min: 1,
    precision: 0,
  } as const;

  const fieldColumn = computed(() => {
    const info = getSubTableQuickFillInfo(props.subTableFieldId, props.mobileTdIdGroups);
    if (!info?.mainWidgetIds?.length) return [];

    const allowed = new Set([
      FIELD_TYPE.TEXT,
      FIELD_TYPE.LONG_TEXT,
      FIELD_TYPE.INTEGER,
      FIELD_TYPE.LONG,
      FIELD_TYPE.DOUBLE,
      FIELD_TYPE.DECIMAL,
      FIELD_TYPE.DATE,
      FIELD_TYPE.TIME,
      FIELD_TYPE.DATE_TIME,
      FIELD_TYPE.OPTION,
      FIELD_TYPE.OPTION_MULTI,
      FIELD_TYPE.MATERIAL_NO,
      FIELD_TYPE.RELATED_LOT_NO,
      FIELD_TYPE.SCRAP_MATERIAL_NO,
    ]);

    return info.mainWidgetIds.flatMap((tdId) => {
      const widget = props.widgetCenter?.[tdId];
      if (!widget) return [];

      const { cellWidget, cellValueType } = widget;
      if (cellValueType !== CellType.Field) return [];
      if (!cellWidget || cellWidget.component === ComponentTypeEnum.CombineFields) return [];

      const wProps = cellWidget.props || {};
      const { isFieldModel, field, fieldType, newSpecificConfig } = wProps;

      if (isFieldModel) return [];
      if (!allowed.has(fieldType)) return [];

      return {
        fieldType,
        field,
        name: newSpecificConfig?.newFieldName,
        prop: field,
        newOptions: newSpecificConfig?.newOptions,
      };
    });
  });

  const handleMenuClick = async ({ key }) => {
    if (key === 'quickFillRowCurrent') {
      const res = await gct.openUtil.modal<IModalData>(
        DocumentQuickFillModal,
        { columns: fieldColumn.value },
        { title: '快速填报', width: '1060px' },
      );
      console.log('res', res);
      if (res.ok && res.params && res.params.data.length) {
        props.handleMenuClick?.({
          key: 'insertRowCurrent',
          actionValue: {
            upRowNum: 1,
            downRowNum: res.params.data.length,
            data: res.params.data,
          },
        });
        // 重置数据
        reset();
      }
    } else {
      props.handleMenuClick?.({ key, actionValue: cloneDeep(toRaw(formState)) });
      // 重置数据
      reset();
    }
  };
</script>

<style scoped lang="less">
  .document-sub-table-action-bar {
    display: flex;
    // position: absolute;
    // z-index: 99;
    // bottom: 1px;
    align-items: center;
    margin-left: 4px;
  }

  .document-sub-table-action-content {
    display: flex;
    align-items: center;
  }

  .document-sub-table-action-bar,
  .document-sub-table-action-content {
    .sub-table-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      white-space: nowrap;
      cursor: pointer;
      box-shadow: 0px 4px 4px 0px rgba(143, 143, 143, 0.25);

      .iconfont {
        line-height: 1;

        &.icon-neibuyingyong {
          font-size: 14px;
        }
      }

      &.quick-fill-btn {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }
  }

  .document-sub-table-action-content {
    .sub-table-btn {
      width: 24px;
      height: 24px;
      background-color: #5378ff;
      color: #fff;
    }
  }

  .document-sub-table-action-bar {
    .sub-table-btn {
      border: 1px solid #026ac8;
      color: #026ac8;
      &:hover {
        background: rgba(2, 106, 200, 0.16);
      }
    }
  }
</style>

<style lang="less">
  .ant-popover.document-sub-table-action-popover {
    .ant-popover-content {
      .ant-popover-inner {
        border-radius: 0;
        box-shadow: none;

        .ant-popover-inner-content {
          padding: 4px;
        }
      }
    }
  }

  .ant-dropdown-button.sub-table-dropdown-button {
    > .ant-btn {
      width: 24px;
      height: 24px;
      padding: 0;
      border: none;
      background-color: #5378ff;
      color: #fff;

      &.ant-dropdown-trigger {
        border-top-right-radius: 4px;
        border-bottom-right-radius: 4px;
      }
    }

    &.is-combination {
      > .ant-btn:first-child:not(:last-child) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }

  .ant-input-number.sub-table-menu-num-input {
    width: 70px !important;
    margin-left: 24px;
  }
</style>
