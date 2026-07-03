<template>
  <a-dropdown :disabled="sheetReadonly" :trigger="['contextmenu']">
    <slot></slot>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <template v-if="type !== 'y'">
          <a-menu-item :key="ContextMenu.InsertColBefore">
            <template #icon>
              <i class="iconfont !text-[18px] icon-zuocecharulie"></i>
            </template>
            {{ $t('sys.onlineForm.insertColumnToLeft') }}
            <a-input-number v-bind="inputCommonProps" v-model:value="formState.leftColNum" />
          </a-menu-item>
          <a-menu-item :key="ContextMenu.InsertColAfter">
            <template #icon>
              <i class="iconfont !text-[18px] icon-youcecharulie"></i>
            </template>
            {{ $t('sys.onlineForm.insertColumnToRight') }}
            <a-input-number v-bind="inputCommonProps" v-model:value="formState.rightColNum" />
          </a-menu-item>
          <a-menu-item v-if="type !== 'paper'" :key="ContextMenu.SetColWidth">
            <template #icon>
              <i class="iconfont icon-shezhiliekuan"></i>
            </template>
            {{ $t('sys.onlineForm.setColumnWidth') }}
          </a-menu-item>
          <a-menu-item :key="ContextMenu.DeleteCol">
            <template #icon>
              <i class="iconfont !text-[18px] icon-shanchulie"></i>
            </template>
            {{ $t('sys.onlineForm.deleteColumn') }}
          </a-menu-item>
        </template>
        <template v-if="type !== 'x'">
          <a-menu-item :key="ContextMenu.InsertRowBefore">
            <template #icon>
              <i class="iconfont !text-[18px] icon-a-shangcharuhang1"></i>
            </template>
            {{ $t('sys.onlineForm.insertRowAbove') }}
            <a-input-number v-bind="inputCommonProps" v-model:value="formState.upRowNum" />
          </a-menu-item>
          <a-menu-item :key="ContextMenu.InsertRowAfter">
            <template #icon>
              <i class="iconfont !text-[18px] icon-a-xiacharuhang1"></i>
            </template>
            {{ $t('sys.onlineForm.insertRowBelow') }}
            <a-input-number v-bind="inputCommonProps" v-model:value="formState.downRowNum" />
          </a-menu-item>
          <a-menu-item v-if="type !== 'paper'" :key="ContextMenu.SetRowHeight">
            <template #icon>
              <i class="iconfont icon-shezhihanggao"></i>
            </template>
            {{ $t('sys.onlineForm.setRowHeight') }}
          </a-menu-item>
          <a-menu-item :key="ContextMenu.DeleteRow">
            <template #icon>
              <i class="iconfont !text-[18px] icon-shanchuhang"></i>
            </template>
            {{ $t('sys.onlineForm.deleteRow') }}
          </a-menu-item>
          <a-menu-item v-if="dataGroupAvailable" :key="ContextMenu.DataGroup">
            <template #icon>
              <i class="iconfont icon-shujufenzu"></i>
            </template>
            {{ $t('sys.onlineForm.dataGrouping') }}
          </a-menu-item>
          <a-menu-item v-if="!!current2DTable" :key="ContextMenu.DataGroup2D">
            <template #icon>
              <i class="iconfont text-[18px] icon-dongtaiguanlian"></i>
            </template>
            {{ $t('sys.onlineForm.dynamicAssociation') }}
          </a-menu-item>
          <template v-if="type === 'paper'">
            <a-menu-item v-if="!isSelectCell" :key="ContextMenu.MergeCell">
              <template #icon>
                <i class="iconfont icon-hebingdanyuange_merge-cells"></i>
              </template>
              {{ $t('sys.onlineForm.mergeCells') }}
            </a-menu-item>
            <a-menu-item v-if="isSelectCell && isMergeCell" :key="ContextMenu.SplitCell">
              <template #icon>
                <i class="iconfont icon-chaifendanyuange_split-cells"></i>
              </template>
              {{ $t('sys.onlineForm.splitCells') }}
            </a-menu-item>
          </template>
        </template>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
  import { computed, reactive } from 'vue';
  import { ContextMenu, SubTableType } from '/@online-form/views/designer/enums';
  import { isIn } from '/@online-form/views/designer/utils';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import ContextMenuModal from '../modals/context-menu-modal.vue';
  import { cloneDeep, range, times } from 'lodash-es';

  const props = defineProps<{
    type: 'x' | 'y' | 'paper';
  }>();

  const defaultValues = {
    upRowNum: 1,
    downRowNum: 1,
    leftColNum: 1,
    rightColNum: 1,
    rowHeight: 1,
    colWidth: 1,
  };

  const formState = reactive<typeof defaultValues>(Object.assign({}, defaultValues));

  const {
    insertRows,
    insertCols,
    deleteCol,
    deleteRow,
    setColWidth,
    setRowHeight,
    clearSelection,
    selection,
    paper,
    setDataGroup,
    setDataGroup2D,
    setMerge,
    cancelMerge,
    sheetReadonly,
    globalSubTables,
  } = useSpreadSheet();

  /**
   * 当前右击的是否是合并单元格
   */
  const isMergeCell = computed(() => {
    const { e } = selection;
    return props.type === 'paper' && (e._l !== e._r || e._t !== e._b);
  });

  /**
   * 当前右击的是否是某个单元格，而不是某块区域
   */
  const isSelectCell = computed(() => {
    const { l, r, t, b, e } = selection;
    return l === e._l && t === e._t && r === e._r && b === e._b;
  });

  /**
   * 选区所属固定表
   */
  const currentFixedTable = computed(() => {
    const fixedTable = paper.value.fixedTables?.find(
      (item) => item.type !== SubTableType.CHECK && isIn(selection, item.range),
    );
    return fixedTable;
  });

  /**
   * 数据分组可用
   */
  const dataGroupAvailable = computed(() => {
    return !!currentFixedTable.value;
  });

  /**
   * 二维表数据分组条件条件
   * -- 二维表
   * -- 未配置数据分组
   * -- 选区上下大于等于动态表
   * -- 选区左右小于等于动态表
   */
  const current2DTable = computed(() => {
    const table = globalSubTables.value.find(
      (item) =>
        [SubTableType._2D, SubTableType.CHECK].includes(item.type) &&
        item.colModel &&
        !item.dgRange &&
        selection.t <= item.range.t &&
        selection.b >= item.range.b &&
        selection.l >= item.range.l &&
        selection.r <= item.range.r,
    );
    return table;
  });

  /**
   * 重置菜单数据
   */
  const reset = (): void => {
    Object.assign(formState, defaultValues);
  };

  /** 打开模态 */
  const openModal = async (menuKey: ContextMenu) => {
    let title = '';
    let defaultValue = 0;
    const { l, t } = selection;
    if (menuKey === ContextMenu.SetRowHeight) {
      title = $t('sys.onlineForm.rowHeight');
      defaultValue = paper.value.rows[t - 1].height;
    } else {
      title = $t('sys.pageDesigner.columnWidth');
      defaultValue = paper.value.cols[l - 1].width;
    }

    const cloneSelection = cloneDeep(selection);
    const callback = (num: number) => {
      // 行列上操作时,可能是批量设置
      if (props.type === 'x' || props.type === 'y') {
        if (menuKey === ContextMenu.SetRowHeight) {
          range(cloneSelection.t, cloneSelection.b + 1).forEach((row) => {
            setRowHeight(row, num);
          });
        } else {
          range(cloneSelection.l, cloneSelection.r + 1).forEach((col) => {
            setColWidth(col, num);
          });
        }
      } else {
        if (menuKey === ContextMenu.SetRowHeight) {
          setRowHeight(t, num);
        } else {
          setColWidth(l, num);
        }
      }
    };

    const result = await gct.openUtil.modal(
      ContextMenuModal,
      {
        defaultValue,
        label: title,
      },
      {
        title: title,
        width: 640,
        height: 240,
        showFooter: true,
      },
    );
    if (result.ok && result.data) {
      const { num } = result.data[0];
      callback(num);
    }
  };

  const handleMenuClick = ({ key }) => {
    switch (key) {
      case ContextMenu.InsertColBefore:
        insertCols(selection.l, formState.leftColNum, selection.r);
        break;
      case ContextMenu.InsertColAfter:
        insertCols(selection.r + 1, formState.rightColNum, selection.r);
        break;
      case ContextMenu.InsertRowBefore:
        insertRows(selection.t, formState.upRowNum, selection.b);
        break;
      case ContextMenu.InsertRowAfter:
        insertRows(selection.b + 1, formState.downRowNum, selection.b);
        break;
      case ContextMenu.DeleteCol:
        times(selection.r - selection.l + 1, () => {
          deleteCol(selection.l);
        });
        break;
      case ContextMenu.DeleteRow:
        times(selection.b - selection.t + 1, () => {
          deleteRow(selection.t);
        });
        break;
      case ContextMenu.DataGroup:
        setDataGroup(currentFixedTable.value!, selection);
        break;
      case ContextMenu.DataGroup2D:
        setDataGroup2D(current2DTable.value!, selection);
        break;
      case ContextMenu.MergeCell:
        setMerge();
        break;
      case ContextMenu.SplitCell:
        cancelMerge();
        break;
      case ContextMenu.SetColWidth:
      case ContextMenu.SetRowHeight:
        openModal(key);
    }

    // 重置数据
    reset();
    // 清空选中，避免选中区域显示异常
    clearSelection();
  };
  const stopRefPropagation = (vm) => {
    if (!vm?.$el) {
      return;
    }
    vm.$el.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  };

  /** 数值输入框统一props */
  const inputCommonProps = {
    ref: stopRefPropagation,
    class: 'num-input',
    size: 'small',
    min: 1,
    precision: 0,
  } as const;
</script>

<style scoped>
  .num-input {
    margin-left: 25px;
    width: 50px !important;
  }
</style>
