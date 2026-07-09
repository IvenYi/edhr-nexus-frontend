<template>
  <div
    class="nocode-base-vxe-table-wrapper"
    :style="{ height: wrapperHeight + 'px' }"
    @scroll.stop
    @wheel.stop
  >
    <div class="nocode-base-vxe-table-area">
      <vxe-grid
        class="gct-edhr-vxetable vxetable"
        :column-config="{ minWidth: 100, useKey: true, resizable: true }"
        :show-header-overflow="true"
        :row-config="{ isHover: true, useKey: true }"
        :scroll-y="{ enabled: true, scrollToTopOnChange: true, oSize: 5, gt: 30 }"
        min-height="88"
        :height="height"
        ref="xTable"
        :data="tableData"
        :loading="loading"
        :columns="columns"
        :auto-resize="autoResize"
        :tree-config="treeConfig"
        :row-class-name="rowClassName"
        @cell-click="onCellClick"
        @radio-change="onRadioClick"
        @checkbox-change="onCheckboxClick"
        @checkbox-all="onSelectAllClick"
      >
        <template #default="{ column, row }">
          <span>{{ renderWithFormatter(column, row) }}</span>
        </template>
        <template #rdo_version_render="{ column, row: record, rowIndex }">
          <slot name="rdo_version_render" v-bind="{ record, column, rowIndex }"></slot>
        </template>
        <template #empty>
          <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
        </template>
      </vxe-grid>
    </div>

    <div class="text-right mt10px" v-if="tableData?.length">
      <a-pagination class="pagination-total-left" v-bind="paginationAttr" @change="onSizeChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, toRaw } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { renderWithFormatter } from '../utils/columns';
  import type { TablePaginationConfig } from 'ant-design-vue';

  const props = withDefaults(
    defineProps<{
      columns: any[];
      tableData: any[];
      modelValue?: string;
      loading: boolean;
      paginationAttr: TablePaginationConfig;
      height?: string;
      wrapperHeight?: number;
      autoResize?: boolean;
      treeConfig?: Record<string, any> | boolean;
      /** 显示行操作按钮 */
      showRowSelectionMode?: boolean;
      rowSelectionMode?: 'single' | 'multiple';
    }>(),
    {
      height: '100%',
      wrapperHeight: 360,
      autoResize: true,
      showRowSelectionMode: false,
      rowSelectionMode: 'single',
    },
  );

  const emit = defineEmits(['change-select', 'request']);

  const xTable = ref();

  const selectedIds = computed(() => {
    const result = new Set<string>();

    if (!props.modelValue) {
      return result;
    }

    if (Array.isArray(props.modelValue)) {
      for (const v of props.modelValue) {
        if (v != null) {
          const s = String(v).trim();
          if (s !== '') result.add(s);
        }
      }
      return result;
    }

    const str = String(props.modelValue);
    const s = str.trim();
    result.add(s);

    return result;
  });

  // 行高亮
  const rowClassName = ({ row }: { row: any }) => {
    return selectedIds.value.has(row.__VALUE__) ? 'row--active' : '';
  };

  const onCellClick = ({ row }: { row: any }) => {
    if (props.rowSelectionMode === 'multiple') {
      xTable.value!.toggleCheckboxRow(row);
      const checked = xTable.value!.isCheckedByCheckboxRow(row);
      emit('change-select', [toRaw(row)], checked);
    } else {
      emit('change-select', toRaw(row));
      if (props.showRowSelectionMode) {
        xTable.value?.setRadioRow(row);
      }
    }
  };

  const onRadioClick = ({ row }: { row: any }) => {
    emit('change-select', toRaw(row));
  };

  const onCheckboxClick = ({ row }: { row: any }) => {
    const checked = xTable.value!.isCheckedByCheckboxRow(row);
    emit('change-select', [toRaw(row)], checked);
  };

  const onSelectAllClick = ({ checked }) => {
    const rows = xTable.value?.data?.map((row) => toRaw(row));
    emit('change-select', rows, checked);
  };

  const onSizeChange = async (current, pageSize) => {
    emit('request', current, pageSize);
  };

  defineExpose({
    getRef: () => xTable.value,
  });
</script>

<style scoped lang="less">
  .nocode-base-vxe-table-wrapper {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;
    // overscroll-behavior: contain;
    // contain: layout style paint;
    width: 800px;

    .nocode-base-vxe-table-area {
      flex: 1;
      overflow: hidden;

      :deep(.gct-edhr-vxetable) {
        .row--active {
          background: #e6f7ff;
        }
      }
    }
  }
</style>
