<template>
  <div class="checktable-2d-container">
    <div class="matrix-grid">
      <template v-for="(tdId, index) in currentLayoutMatrix?.[currentIndex]" :key="tdId">
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
        <template v-else-if="isMatrixGroup(tdId)">
          <div class="matrix-group" v-for="(group, gIndex) in tdId" :key="`mg-${gIndex}`">
            <div class="group-header"
              >{{ displayMode === 'horizontal' ? '列' : '行' }} {{ gIndex + 1 }}</div
            >
            <WidgetComponent
              v-for="tid in group"
              :key="tid"
              :widget="widgetCenter[tid].cellWidget"
              v-bind="getWidgetAttributes(tid)"
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
  </div>
</template>

<script setup lang="ts" name="fill-check-table-2d-fields">
  import { computed, ref } from 'vue';
  import WidgetComponent from '../_common_/widget-component.vue';
  import { usePaginationControl, useMatrixData } from '../../hooks';
  import type { ITd, ICheckTable2DInfo } from '@gct/nocode-base';

  const props = defineProps<{
    /** tdIds集合(主模型、固定表、动态表、二维表、检验表) */
    mainWidgetIds: string[];
    /** tdIds集合(二维表关联子表、检验表关联子表) */
    linkWidgetIds: string[];
    /** 子表的信息 */
    subInfo: ICheckTable2DInfo & { childInitRowLen: number };
    /** 组件信息中心 */
    widgetCenter: Record<string, ITd>;
    /** 表单数据 */
    formState: Record<string, any>;
  }>();

  const switchIcons = [
    { value: 'horizontal', label: '横向填报', key: 'horizontal' },
    { value: 'vertical', label: '纵向填报', key: 'vertical' },
  ];

  const showPopover = ref(false);

  // 二维数据分组
  const { displayMode, currentLayoutMatrix, toggleMode } = useMatrixData({
    mode: 'checkTable2d',
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
      return currentLayoutMatrix.value.length;
    }),
  );

  const onChangeTypeTab = (data) => {
    showPopover.value = false;
    toggleMode();
  };

  const isMatrixGroup = (item: unknown): item is string[][] => {
    return Array.isArray(item) && item.every((i) => Array.isArray(i));
  };

  const getWidgetAttributes = (tdId) => {
    const td = props.widgetCenter[tdId];

    const attrInfo: any = {};

    const field = td.props.fixedTableFieldId ?? '';

    if (td.props.isNewCheckTable2D) {
      const { checkTableType } = td.props;
      const rowIdx = td.cellCheckTableDataRowIdx ?? 0;
      const colIdx = td.cellCheckTableDataColIdx ?? 0;

      const baseInfo: any = {
        subtableFieldId: field,
        realRowIndex: rowIdx,
        pageRowIndex: rowIdx,
      };

      switch (checkTableType) {
        case 'col':
          baseInfo.formData = props.formState?.[field]?.[colIdx] ?? {};
          baseInfo.realRowIndex = colIdx;
          baseInfo.pageRowIndex = colIdx;
          break;
        case 'row':
          baseInfo.formData = props.formState?.[field]?.[rowIdx] ?? {};

          break;
        case 'child':
          baseInfo.formData = props.formState?.[field]?.[rowIdx]?.['_2DTABLE_']?.[colIdx] ?? {};
          baseInfo.childSubTableDataIndex = colIdx;
          break;
      }

      Object.assign(attrInfo, baseInfo);
    }
    return attrInfo;
  };

  defineExpose({
    currentIndex: () => currentIndex.value,
    paginationStatus,
    handlePagination,
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

  .checktable-2d-container {
    .matrix-cell {
      .van-field {
        border-radius: 8px;
      }
    }

    .matrix-cell + .matrix-cell {
      margin-top: 8px;
    }

    .matrix-group {
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
