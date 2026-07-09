<template>
  <vxe-grid
    :class="[
      ns.b(),
      showPagination && ns.m('has-pagination'),
      isFitParent ? ns.m('fit-parent') : ns.m('fit-content'),
    ]"
    ref="gridRef"
    :columns="_columns"
    :data="data"
    @ToggleRowExpand="onToggleRowExpand"
    v-bind="{ ...vxeGridConfig, ...$attrs }"
  >
    <template #empty>
      <a-empty :image="emptyImage" />
    </template>
    <template v-for="(slot, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps"></slot>
    </template>
    <template v-if="showPagination" #pager>
      <GridPagination class="pagination-total-left" v-model:value="_pagination" />
    </template>
  </vxe-grid>
</template>

<script lang="ts" setup name="basic-grid">
  import { useNamespace } from '@gct/runtime';
  import { GridColumn, GridRowData } from './types';
  import { computed, nextTick, ref, watch } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { GridPaginationValue, GridPagination } from '../grid-pagination';
  import { VxeTableInstance, VxeGridProps } from 'vxe-table';

  const emptyImage = Empty.PRESENTED_IMAGE_SIMPLE;
  const gridRef = ref<VxeTableInstance>();

  const ns = useNamespace('basic-grid');

  const props = withDefaults(
    defineProps<{
      data: GridRowData[];
      columns: GridColumn[];
      /** 是否有行嵌入内容 */
      hasRowEmbed?: boolean;
      /** 分页参数 */
      pagination?: GridPaginationValue;
      /** 是否展开所有,每次数据变更的时候 */
      isExpandAll?: boolean;
      /** 高度是否占满父元素 */
      isFitParent?: boolean;
    }>(),
    {
      columns: () => [],
      hasRowEmbed: false,
      isExpandAll: false,
      isFitParent: false,
    },
  );

  const emit = defineEmits<{
    (e: 'update:value', value: string): void;
    (e: 'update:pagination', value: GridPaginationValue): void;
  }>();

  /** 当前展开的节点集合 */
  const expandedRowKeys = ref<string[]>([]);
  const onToggleRowExpand = (params) => {
    const { expanded, row } = params;
    if (expanded) {
      expandedRowKeys.value.push(row.id);
    } else {
      expandedRowKeys.value = expandedRowKeys.value.filter((id) => id !== row.id);
    }
  };

  /** 恢复展开的行 */
  const restoreRowExpand = () => {
    if (gridRef.value && expandedRowKeys.value.length) {
      const rows = props.data.filter((item) => expandedRowKeys.value.includes(item.id));
      gridRef.value.setRowExpand(rows, true);
    }
  };

  const _columns = computed(() => {
    const arr: GridColumn[] = [...props.columns];
    if (props.hasRowEmbed) {
      // 第一列的宽度如果是超过40的数字，减掉展开列的40
      if (typeof arr[0].width === 'number' && arr[0].width > 40) {
        arr[0].width = arr[0].width - 40;
      }
      arr.unshift({ type: 'expand', width: 40, slots: { content: 'row_embed' } });
    }
    return arr;
  });

  const showPagination = computed(() => {
    return !!props.pagination;
  });

  // 分页参数
  const _pagination = computed({
    get() {
      return props.pagination;
    },
    set(v) {
      emit('update:pagination', v!);
    },
  });

  const vxeGridConfig = computed(() => {
    const result: VxeGridProps = {};
    // 默认展开逻辑，只有第一次会生效
    if (props.isExpandAll) {
      Object.assign(result, {
        expandConfig: {
          expandAll: true,
        },
      });
    }
    if (props.isFitParent) {
      Object.assign(result, { height: 'auto' });
    } else {
      Object.assign(result, { maxHeight: '100%' });
    }
    return result;
  });

  const expandAll = () => {
    if (gridRef.value) {
      if (props.hasRowEmbed) {
        gridRef.value.setAllRowExpand(true);
      } else {
        gridRef.value.setAllTreeExpand(true);
      }
      setTimeout(() => {
        gridRef.value!.clearScroll();
      }, 100);
    }
  };

  watch(
    () => props.data,
    () => {
      nextTick(() => {
        if (props.isExpandAll) {
          // 默认展开逻辑，弥补后续不生效
          expandAll();
        } else {
          restoreRowExpand();
        }
      });
    },
  );
</script>

<style lang="scss" scoped>
  $basic-grid: (
    expand-col-width: 40px,
    pagination-height: 56px,
  );

  @include b(basic-grid) {
    @include set-component-css-var(basic-grid, $basic-grid);

    // 撑满父
    @include m(fit-parent) {
      height: 100%;
    }

    // 不撑满父
    @include m(fit-content) {
      // 解决高度超过100%时，分页高度多留了一倍
      :deep(.vxe-grid--pager-wrapper) {
        height: calc(getCssVar(basic-grid, pagination-height) / 2);
      }
    }

    // 展开列后面的一列的列头偏移
    :deep(.col--expand + .vxe-header--column) {
      > .vxe-cell {
        position: relative;
        left: calc(-1 * getCssVar(basic-grid, expand-col-width));
      }
    }

    // 修改默认UI组件的样式
    :deep(.vxe-table--render-default) {
      --vxe-font-color: #212528;
    }
  }

  :deep(.vxe-body--expanded-row) {
    @include b(basic-grid) {
      //嵌入表格的样式
      .vxe-table--border-line {
        border-width: 0;
      }
      // 还原表格头部的背景色
      table.vxe-table--header {
        background-color: transparent;
      }
      // 第一列缩进展开列的宽度
      .vxe-header--column:first-child,
      .vxe-body--column:first-child {
        > .vxe-cell {
          padding-left: 40px;
        }
      }
    }
  }
</style>
