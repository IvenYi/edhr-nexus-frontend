<template>
  <BorderTD
    :id="'sheet-cell--' + tdName"
    class="sheet-cell"
    :class="[
      tdName,
      'sheet-cell--' + tdName,
      isEdit && 'sheet-cell--edit',
      // {
      //   'sheet-cell--edit': isEdit,
      // },
    ]"
    ref="TdRef"
    @dblclick="handleDbClick"
    @mousedown="handleCellClick"
    @dragover="handleDragOver"
    @drop="handleDrop"
    v-bind="tdAttrs"
    :style="{ ...realStyle, ...divStyle.varStyle }"
    :data-name="tdName"
    :border="actualBorder"
    :show-default-border="gridLineVisible"
  >
    <!-- 图片 -->
    <!-- <img
      v-else-if="cell.type === CellType.Image"
      :src="paperMedias[props.cell.value].src"
      alt=""
      srcset=""
      :style="imageStyle"
    /> -->
    <!-- 组合字段 -->
    <div
      v-if="cell.multiFields"
      class="multi-fields-area"
      :style="divStyle.style"
      :data-placeholder="$t('sys.onlineForm.group')"
    >
      <CellWidgetDesign
        v-for="item in cell.multiFieldsContent"
        :key="item.id"
        :field-widget="item.fieldWidget"
        :field-meta="item.fieldMeta"
      />
    </div>

    <!-- 文本数字 -->
    <template v-else-if="!cell.type || cell.type === CellType.Default">
      <template v-if="!isEdit">
        <div :style="divStyle.style">{{ props.cell.value }}</div>
      </template>
    </template>

    <!-- 字段 -->
    <div v-else-if="cell.type === CellType.Field" :style="divStyle.style">
      <CellWidgetDesign :field-widget="cell.fieldWidget" :field-meta="cell.fieldMeta" />
    </div>

    <!-- 组件 -->
    <!-- class="absolute h-full w-full top-0px left-0px" -->
    <div v-else-if="cell.type === CellType.Widget">
      <PaperWidgetDesign
        :paper-widget="cell.paperWidget"
        :field-meta="cell.fieldMeta"
        :is-in-cell="true"
      />
    </div>

    <div class="input" v-if="isEdit">
      <div class="input-auto-expand">{{ cellValue }}</div>
      <a-textarea
        class="input-component"
        ref="InputRef"
        type="text"
        @blur="handleBlur"
        @keydown.enter="handleEnterDown"
        @keyup.esc="handleBlur"
        @dblclick.stop=""
        v-model:value="cellValue2"
      />
    </div>
  </BorderTD>
</template>

<script setup lang="ts">
  import { ref, nextTick, computed, StyleValue, CSSProperties } from 'vue';
  import { message } from 'ant-design-vue';
  import { isEmpty, has } from 'lodash-es';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { PanelType } from '/@online-form/views/designer/enums';
  import { NumColMap } from '/@online-form/views/designer/constants';
  import type { ICell } from '/@online-form/views/designer/types';
  import BorderTD from './local-border-td.vue';

  import CellWidgetDesign from '/@online-form/views/__cell_widgets__/cell-widget-design.vue';
  import PaperWidgetDesign from '/@online-form/views/__widgets__/paper-widget-design.vue';
  import { CellBorder } from '../../utils/cell-border';
  import { TransferType, useDrop } from '../base/drag/use-drop';

  const CellType = {
    Default: 'Default',
    Widget: 'Widget',
    Field: 'Field',
  } as const;

  const props = defineProps<{
    x: number;
    y: number;
    cell: ICell;
  }>();

  const tdName = computed(() => {
    return `${NumColMap[props.x]}${props.y}`;
  });

  const isEdit = ref(false);
  const cellValue = ref('');
  const {
    paper,
    handleCellClick,
    gridLineVisible,
    sheetReadonly,
    judgeCellInfo,
    judgeFieldDragInCell,
    bindFieldToCell,
    bindWidgetToCell,
    hasCellValueEditing,
    reverseModelingToCell,
  } = useSpreadSheet();

  const InputRef = ref();
  const TdRef = ref();

  const { handleDragOver, handleDrop } = useDrop(
    [TransferType.Field, TransferType.Widget, TransferType.ReverseModeling],
    {
      onFieldDrop(fieldMeta, _fieldWidget) {
        if (sheetReadonly.value) {
          return;
        }

        const notDragInCell = judgeFieldDragInCell(fieldMeta, {
          cellX: props.x,
          cellY: props.y,
        });

        if (notDragInCell) return;

        bindFieldToCell(fieldMeta, props.x, props.y);
      },
      onWidgetDrop(widgetMeta) {
        if (sheetReadonly.value) {
          return;
        }

        const currentCellInfo = judgeCellInfo(props.x, props.y);
        if (!currentCellInfo) return;
        if (currentCellInfo.data && currentCellInfo.data.multiFields) {
          message.warn('组合字段只能绑定字段!');
          return;
        }
        if (widgetMeta.dragToPos.includes(PanelType.Cell)) {
          bindWidgetToCell(widgetMeta, props.x, props.y);
        } else {
          message.warn(`${widgetMeta.name}组件不能拖入单元格`);
        }
      },
      async onReverseModelingDrop(item) {
        await reverseModelingToCell({
          x: props.x,
          y: props.y,
          item,
        });
      },
    },
  );

  const absoluteStyle: StyleValue = {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '100%',
  };
  const isTl = computed(() => {
    const mergedCells = paper.value.mergedCells;
    return !!mergedCells.find((c) => c.t === props.y && c.l === props.x);
  });

  const isMerged = computed(() => {
    const mergedCells = paper.value.mergedCells;
    return !!mergedCells.find(
      (e) => e.t <= props.y && e.b >= props.y && e.l <= props.x && e.r >= props.x,
    );
  });

  const actualBorder = computed(() => {
    return CellBorder.getCellBorder(props.x, props.y, paper.value);
  });

  const tdAttrs = computed(() => {
    const attrs: any = {};
    if (isTl.value) {
      const mergedCells = paper.value.mergedCells;
      const mCell = mergedCells.find((c) => c.t === props.y && c.l === props.x)!;
      Object.assign(attrs, { colspan: mCell.r - mCell.l + 1, rowspan: mCell.b - mCell.t + 1 });
    }
    if (isMerged.value && !isTl.value) {
      attrs.hidden = true;
    }
    return attrs;
  });

  const realStyle = computed(() => {
    if (!props.cell) return {};
    const styles = { ...props.cell.style };

    // 改用td hidden属性
    // if (isMerged.value && !isTl.value) {
    //   styles['display'] = 'none';
    // }

    if (
      !isEmpty(props.cell.style) &&
      has(props.cell.style, 'white-space') &&
      has(props.cell.style, 'word-break') &&
      props.cell.style['white-space'] === 'pre-wrap' &&
      props.cell.style['word-break'] === 'break-all'
    ) {
      styles['--auto-line-break'] = 'wrap';
    }

    return styles;
  });

  const divStyle = computed<{
    style: StyleValue;
    varStyle: CSSProperties;
  }>(() => {
    const style = {
      ...absoluteStyle,
    };
    const varStyle = {};

    const vAlign = realStyle.value['vertical-align'];
    const tAlign = realStyle.value['text-align'];
    if (vAlign || tAlign) {
      Object.assign(style, {
        display: 'flex',
      });
      switch (vAlign) {
        case 'top':
          style['align-items'] = 'flex-start';
          varStyle['--alignItems'] = 'flex-start';
          break;
        case 'middle':
          style['align-items'] = 'center';
          varStyle['--alignItems'] = 'center';
          break;
        case 'bottom':
          style['align-items'] = 'flex-end';
          varStyle['--alignItems'] = 'flex-end';
          break;
      }
      switch (tAlign) {
        case 'left':
          style['justify-content'] = 'flex-start';
          varStyle['--justifyContent'] = 'flex-start';
          break;
        case 'center':
          style['justify-content'] = 'center';
          varStyle['--justifyContent'] = 'center';
          break;
        case 'right':
          style['justify-content'] = 'flex-end';
          varStyle['--justifyContent'] = 'flex-end';
          break;
      }
    }

    style['text-align'] = realStyle.value['text-align'] as any;
    style['text-decoration'] = realStyle.value['text-decoration'] as any;
    // style['text-align-last'] = realStyle.value['text-align-last'] as any;
    return { style, varStyle };
  });

  async function handleDbClick() {
    if (sheetReadonly.value) return;
    if (!props.cell.type || props.cell.type === CellType.Default) {
      cellValue.value = props.cell.value;
      isEdit.value = true;
      hasCellValueEditing.value = true;
      await nextTick();
      InputRef.value.focus({ preventScroll: true });
    }
  }

  async function handleBlur() {
    paper.value.cells[props.y - 1][props.x - 1].value = cellValue.value;
    isEdit.value = false;
    hasCellValueEditing.value = false;
  }

  const cellValue2 = computed({
    get() {
      return cellValue.value;
    },
    set(v) {
      console.log('[ setcellValue ] >', v);
      cellValue.value = v;
    },
  });

  const handleEnterDown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter') {
      return;
    }
    console.log('[ handleEnterDown ] >', cellValue);
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      // 获取光标位置
      const textarea = e.target as HTMLTextAreaElement;
      console.log('[ textarea ] >', textarea);
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // 插入换行符
      const newValue = [textarea.value.slice(0, start), '\n', textarea.value.slice(end)].join('');
      textarea.value = newValue;
      cellValue2.value = newValue;

      // 将光标移动到新行的开头
      textarea.setSelectionRange(start + 1, start + 1);
      textarea.focus();
    } else {
      handleBlur();
    }
  };
</script>

<style lang="less" scoped>
  .absolute() {
    position: absolute;
    top: 0;
    left: 0;
  }

  td {
    position: relative;
    // overflow: hidden;

    &.sheet-cell--edit {
      overflow: visible;
    }

    & .input {
      .absolute();
      z-index: 299;
      // height: 100%;
      width: fit-content;
      height: fit-content;
      min-width: 100%;
      min-height: 100%;

      & > .input-auto-expand,
      & > .input-component {
        padding: 4px 11px;
        line-height: 1.5715;
        min-height: 32px;
        transition:
          all 0.3s,
          height 0s;
        vertical-align: bottom;
        border-radius: 4px;
        border: 1px solid #d9d9d9;
        font-size: 14px;
        box-sizing: border-box;
        white-space: pre;
      }

      & > .input-component {
        .absolute();
        height: 100%;
        width: 100%;
        max-width: none;
        overflow: hidden;
        resize: none;

        &:focus {
          outline: 2px solid var(--ant-primary-color); /* 移除默认的外边框 */
          border: none; /* 移除边框颜色 */
          box-shadow: none; /* 移除阴影 */
          outline-offset: -1px;
          border-radius: 2px;
        }
      }
    }
    & > span {
      visibility: hidden;
    }

    .multi-fields-area {
      flex-wrap: var(--auto-line-break, no-wrap);
      &::before {
        content: attr(data-placeholder);
        position: absolute;
        top: 0;
        right: 0;
        color: #fff;
        font-size: 12px;
        pointer-events: none;
        z-index: 9;
        background: #7cdfc3;
        padding: 2px 10px;
        border-bottom-left-radius: 4px;
        line-height: 18px;
      }
    }
  }
</style>
