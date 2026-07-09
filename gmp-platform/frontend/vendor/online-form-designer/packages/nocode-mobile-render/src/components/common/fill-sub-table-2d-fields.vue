<template>
  <div class="subtable-2d-container">
    <div class="matrix-grid" v-if="displayMode === 'horizontal'">
      <template v-for="(tdId, idx) in layoutMatrix.horizontal" :key="tdId">
        <template v-if="typeof tdId === 'string'">
          <div class="matrix-cell">
            <WidgetComponent
              :key="tdId"
              :widget="widgetCenter[tdId].cellWidget"
              v-bind="getWidgetAttributes(tdId, visibleData.data?.[currentIndex])"
              :isField="true"
            />
          </div>
        </template>
        <template v-else-if="isHorizontalGroup(tdId)">
          <div class="horizontal-group" v-for="(group, gIndex) in tdId" :key="`hg-${group}`">
            <div class="group-header">列 {{ gIndex + 1 }}</div>
            <WidgetComponent
              v-for="tid in group"
              :key="tid"
              :widget="widgetCenter[tid].cellWidget"
              v-bind="getWidgetAttributes(tid, visibleData.data?.[currentIndex])"
              :isField="true"
            />
          </div>
        </template>
      </template>
    </div>
    <div class="matrix-grid" v-else-if="displayMode === 'vertical'">
      <template v-for="(tdId, index) in layoutMatrix.vertical?.[currentIndex]" :key="tdId">
        <template v-if="typeof tdId === 'string'">
          <div class="matrix-cell">
            <WidgetComponent
              :key="tdId"
              :widget="widgetCenter[tdId].cellWidget"
              v-bind="getWidgetAttributes(tdId)"
              :isField="true"
            />
          </div>
        </template>
        <template v-else-if="isVerticalGroup(tdId)">
          <div
            class="vertical-group"
            v-for="(dataItem, dataIdx) in visibleData.data"
            :key="`vg-${dataIdx}`"
          >
            <div class="group-header">行 {{ dataIdx + 1 }}</div>
            <WidgetComponent
              v-for="tid in tdId"
              :key="tid"
              :widget="widgetCenter[tid].cellWidget"
              v-bind="getWidgetAttributes(tid, dataItem)"
              :isField="true"
            />
          </div>
        </template>
      </template>
    </div>

    <Teleport to="#fill-in-modal-header-title">
      <span class="cursor-pointer ks-row-middle">
        <span class="max-w400px ell inline-block leading-24px">
          {{ displayMode === 'horizontal' ? '横向填报' : '纵向填报' }}
        </span>

        <van-popover v-model:show="showPopover" placement="bottom">
          <div class="switch-menu">
            <div
              v-for="tab in switchIcons"
              :key="tab.key"
              class="switch-item"
              :class="{ selected: displayMode === tab.value }"
              @click.stop="onChangeTypeTab(tab)"
            >
              {{ tab.label }}
            </div>
          </div>

          <template #reference>
            <van-button class="toggle-btn" hairline size="small" round plain>
              <template #icon> <i class="iconfont icon-qiehuan1"></i> </template>切换
            </van-button>
          </template>
        </van-popover>
      </span>
    </Teleport>

    <Teleport to="#fill-in-modal-footer-right">
      <SubTableBtn
        :is-inserting-before="isInsertingBefore"
        :is-inserting-after="isInsertingAfter"
        :is-deleting="isDeleting"
        :show-delete="displayMode === 'horizontal' && visibleData.data.length > 1"
        @before="handleAddRow({ index: currentIndex, position: 'before' })"
        @after="handleAddRow({ index: currentIndex, position: 'after' })"
        @copy="handleAddRow({ index: currentIndex,actionType:'copyRow', position: 'after',rowData:currentData })"
        @delete="handleDeleteRow(currentData, currentIndex)"
      />
    </Teleport>
  </div>
</template>

<script setup lang="ts" name="fill-sub-table-2d-fields">
  import { computed, reactive, ref, toRef } from 'vue';
  import WidgetComponent from '../_common_/widget-component.vue';
  import SubTableBtn from './sub-table-btn.vue';
  import { usePaginationControl, useSubTableData, useMatrixData } from '../../hooks';
  import type { ITd, ISubTable2DInfo } from '@gct/nocode-base';

  const props = defineProps<{
    /** 点击的单元格 id */
    clickTdId: string;
    /** 动态表点击的所属数据行数 */
    clickSbRowIndex: number;
    /** tdIds集合(主模型、固定表、动态表、二维表、检验表) */
    mainWidgetIds: string[];
    /** tdIds集合(二维表关联子表、检验表关联子表) */
    linkWidgetIds: string[];
    /** 子表的信息 */
    subInfo: ISubTable2DInfo & { childInitRowLen: number };
    /** 组件信息中心 */
    widgetCenter: Record<string, ITd>;
    /** 表单数据 */
    formState: Record<string, any>;
  }>();

  const switchIcons = [
    { value: 'horizontal', label: '横向填报', key: 'horizontal' },
    { value: 'vertical', label: '纵向填报', key: 'vertical' },
  ];

  const {
    rowSubFieldKey: subFieldId = '',
    crossFieldKeys,
    childInitRowLen,
  } = reactive(props.subInfo);

  const showPopover = ref(false);
  const isInsertingBefore = ref(false);
  const isInsertingAfter = ref(false);
  const isDeleting = ref(false);

  const { visibleData, handleAddRow, handleDeleteRow } = useSubTableData(
    toRef(props, 'formState'),
    {
      subField: subFieldId,
      isRowSubTable2d: true,
      childInitRowLen,
      crossFieldKeys,
      lockMap: {
        before: isInsertingBefore,
        after: isInsertingAfter,
        delete: isDeleting,
      },
      callback: () => {
        if (!currentData.value) {
          currentIndex.value = visibleData.value.data.length - 1;
        }
      },
    },
  );

  // 二维数据分组
  const { displayMode, layoutMatrix, toggleMode } = useMatrixData({
    mode: 'subTable2d',
    mainWidgetIds: props.mainWidgetIds,
    linkWidgetIds: props.linkWidgetIds,
    widgetCenter: props.widgetCenter,
    callback: () => {
      currentIndex.value = 0;
    },
  });

  // 分页控制
  const { currentIndex, handlePagination, paginationStatus } = usePaginationControl(
    computed(() => {
      if (displayMode.value === 'horizontal') {
        return visibleData.value.data.length;
      }
      if (displayMode.value === 'vertical') {
        return layoutMatrix.value.vertical.length;
      }
      return 0;
    }),
    Math.max(0, props.clickSbRowIndex ?? -1),
  );

  const currentData = computed(() => visibleData.value.data?.[currentIndex.value]);

  const isHorizontalGroup = (item: unknown): item is string[][] => {
    return Array.isArray(item) && item.every((i) => Array.isArray(i));
  };

  const isVerticalGroup = (item: unknown): item is string[] => {
    return Array.isArray(item) && item.every((i) => typeof i === 'string');
  };

  const onChangeTypeTab = (data) => {
    showPopover.value = false;
    toggleMode();
  };

  const getWidgetAttributes = (tdId, data?: any) => {
    const td = props.widgetCenter[tdId];
    const { cellFixedTableDataIdx = 0, props: tdProps } = td || {};
    const { isNewFixedTableInDyn, isNewFixedTableTd, fixedTableFieldId } = tdProps;

    const field = fixedTableFieldId ?? subFieldId;
    const rowIndex = isNewFixedTableInDyn ? currentIndex.value : cellFixedTableDataIdx;

    const formData = isNewFixedTableInDyn
      ? data?.['_2DTABLE_']?.[cellFixedTableDataIdx] ?? {}
      : isNewFixedTableTd
      ? props.formState?.[field]?.[cellFixedTableDataIdx] ?? {}
      : data;

    return {
      subtableFieldId: field,
      formData,
      realRowIndex: rowIndex,
      pageRowIndex: rowIndex,
      ...(isNewFixedTableInDyn && { childSubTableDataIndex: cellFixedTableDataIdx }),
    };
  };

  defineExpose({
    currentIndex: () => currentIndex.value,
    paginationStatus,
    handlePagination,
    handleAddRow: (position) => handleAddRow({ index: currentIndex.value, position }),
    handleDeleteRow: () => handleDeleteRow(currentData, currentIndex.value),
  });
</script>

<style scoped lang="less">
  .toggle-btn {
    height: 28px;
    padding: 0px 12px;
    color: #026ac8;
    border-color: #026ac8;
    background: rgba(2, 106, 200, 0.08);
    vertical-align: middle;
    margin-left: 12px;
  }

  .switch-menu {
    padding: 8px;
    width: 120px;
  }

  .switch-item {
    padding: 8px 16px;
    font-size: 14px;
    color: #212528;
    text-align: center;
  }

  .switch-item.selected {
    color: #026ac8;
    font-weight: 600;
  }

  .subtable-2d-container {
    .matrix-cell {
      .van-field {
        border-radius: 8px;
      }
    }

    .matrix-cell + .matrix-cell {
      margin-top: 8px;
    }

    .horizontal-group,
    .vertical-group {
      margin-top: 8px;
      border-radius: 8px;
      overflow: hidden;

      .group-header {
        padding: 8px 12px;
        background-color: #e8ebf0;
      }
    }
  }
</style>
