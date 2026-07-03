<template>
  <div ref="rootEl" class="w-full h-full relative">
    <a-spin v-if="loading" size="large" />
    <div
      ref="SpreadSheetRef"
      class="spread-sheet"
      :class="{ 'spread-sheet--paper-canvas': isPaperCanvas }"
      :style="{
        '--paper-width': paperLayout.w + 'mm',
        '--paper-height': paperFitHeight + 'mm',
      }"
    >
      <template v-if="!isPaperCanvas">
        <spread-sheet-tl class="spread-sheet__tl" />
        <spread-sheet-x class="spread-sheet__x" />
        <spread-sheet-y class="spread-sheet__y" />
        <SheetStatus />
      </template>

      <div class="spread-sheet__viewport" ref="ViewPortScrollRef" @click="handleViewPortClick">
        <div class="spread-sheet__canvas">
          <paper-canvas v-if="isPaperCanvas" :key="activeSheet.sheetId" />
          <spread-sheet-paper
            v-else
            :key="activeSheet.sheetId"
            class="spread-sheet__paper"
            @click="(e) => e.stopPropagation()"
          />
        </div>
      </div>
    </div>
    <SheetsComp v-if="!isPaperCanvas" />
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed, onUnmounted } from 'vue';
  import SpreadSheetTl from './sheet/sheet-tl.vue';
  import SpreadSheetX from './sheet/sheet-x.vue';
  import SpreadSheetY from './sheet/sheet-y.vue';
  import SpreadSheetPaper from './sheet/sheet-paper.vue';
  import PaperCanvas from './paper-canvas/paper-canvas.vue';
  import SheetStatus from './sheet/sheet-status.vue';
  import SheetsComp from './sheets/index.vue';
  import { useScroll } from '/@/hooks/event/useScroll';
  import { useSpreadSheet } from '/@online-form/views/designer/hooks/useSpreadSheet';
  import { useViewport } from '/@online-form/views/designer/hooks/useViewport';
  import { useClickOutside } from '/@/utils/click-outside';
  import { SubTableType } from '/@online-form/views/designer/enums';
  import { useAllSpreadSheets } from '../hooks/useAllSpreadSheets';
  import { CanvasMode } from '../types';

  defineProps<{
    loading?: boolean;
  }>();

  const SpreadSheetRef = ref();
  const ViewPortScrollRef = ref();

  const {
    paperLayout,
    currentCell,
    selectSurroundingCell,
    clearSelection,
    copy,
    paste,
    paperFitHeight,
    hasCellValueEditing,
    undo,
    save,
    setThead,
    setCurrentDataGroup,
    resetRange,
    setSubTable,
    selection,
    paper,
  } = useSpreadSheet();

  const { activeSheet } = useAllSpreadSheets();
  const isPaperCanvas = computed(() => paper.value.canvasMode === CanvasMode.Paper);
  const domRef = computed(() => {
    return ViewPortScrollRef.value?.querySelector('.scrollbar__wrap') || ViewPortScrollRef.value;
  });
  const { refY, refX } = useScroll(domRef);
  const { updateScrollY, updateScrollX } = useViewport();

  // onMounted(() => {
  //   init(SpreadSheetRef.value, props.dataId);
  // });

  watch(
    refY,
    (value) => {
      updateScrollY(value);
    },
    {
      immediate: true,
    },
  );

  watch(
    refX,
    (value) => {
      updateScrollX(value);
    },
    {
      immediate: true,
    },
  );

  // 支持聚焦的时候键盘操作
  const rootEl = ref();
  const isFocus = ref(false);
  const enableShortcut = computed(() => {
    return isFocus.value && !hasCellValueEditing.value && !isPaperCanvas.value;
  });

  useClickOutside(rootEl, {
    onOutside: () => {
      isFocus.value = false;
    },
    onInside: () => {
      isFocus.value = true;
    },
    insideIgnore: ['.sheet-cell-value-textarea'],
  });

  /**
   * 按键监听
   * @param event
   */
  const handleKeyDown = (event: KeyboardEvent) => {
    console.log('按键事件', event.key, event.ctrlKey);

    if (!enableShortcut.value) {
      return;
    }
    let isListenKey = true;
    switch (event.code) {
      case 'ArrowUp':
        selectSurroundingCell('top');
        break;
      case 'ArrowDown':
        selectSurroundingCell('bottom');
        break;
      case 'ArrowLeft':
        selectSurroundingCell('left');
        break;
      case 'ArrowRight':
        selectSurroundingCell('right');
        break;
      case 'Delete':
      case 'Backspace':
        // 在这里处理Delete键的逻辑
        const { l, r, t, b } = selection;
        for (let x = l; x <= r; x++) {
          for (let y = t; y <= b; y++) {
            const cellData = paper.value.cells[y - 1][x - 1];
            if (cellData) {
              Object.keys(cellData).forEach((key) => {
                if (!['border', 'style'].includes(key)) {
                  cellData[key] = undefined;
                }
              });
            }
          }
        }
        break;
      case 'KeyZ':
        if (event.ctrlKey) {
          undo();
        }
        break;
      case 'KeyS':
        if (event.ctrlKey) {
          save();
        }
        break;
      case 'KeyT':
        if (event.altKey) {
          setThead();
        }
        break;
      case 'KeyG':
        if (event.altKey) {
          setSubTable(SubTableType.FIXED);
        }
        break;
      case 'KeyD':
        if (event.altKey) {
          setSubTable();
        }
        break;
      case 'KeyF':
        if (event.altKey) {
          setCurrentDataGroup();
        }
        break;
      default:
        isListenKey = false;
      // 其他键的处理或忽略
    }

    // 监听的按钮阻止后续冒泡
    if (isListenKey) {
      event.stopPropagation();
      event.preventDefault();
    }
  };

  const CopyTransferKey = '__copy_transfer__' as const;

  /**
   * 复制事件
   * @param event
   */
  const handleCopy = (event: ClipboardEvent) => {
    if (!enableShortcut.value) {
      return;
    }

    const copyData = copy();
    if (!copyData) {
      return;
    }

    // 设置传输数据
    event.clipboardData?.setData(CopyTransferKey, JSON.stringify(copyData));
    // 不然设置不上数据
    event.preventDefault();

    // todo 处理拷贝的数据
    console.log('[ 拷贝 ] >', copyData);
  };

  /**
   * 粘贴事件
   * @param event
   */
  const handlePaste = (event: ClipboardEvent) => {
    if (!enableShortcut.value) {
      return;
    }
    // 阻止默认粘贴行为，如果需要自定义处理
    event.preventDefault();

    // 获取粘贴的文本数据
    var clipboardData = event.clipboardData || (window as any).clipboardData;
    let lastError;

    // 电子表单的拷贝数据
    try {
      const copyDataStr = clipboardData.getData(CopyTransferKey);
      if (copyDataStr) {
        let copyData;
        try {
          copyData = JSON.parse(copyDataStr);
        } catch (error) {
          console.error('拷贝数据解析失败');
        }
        if (copyData) {
          paste('online-form', copyData);
          return;
        }
      }
    } catch (error) {
      lastError = error;
    }

    // html粘贴，excel复制给的也是html格式的字符串
    try {
      var htmlData = clipboardData.getData('text/html');
      if (htmlData) {
        paste('html', htmlData);
        return;
      }
    } catch (error) {
      lastError = error;
    }

    // 纯文本粘贴
    try {
      var textData = clipboardData.getData('text/plain');
      if (textData) {
        paste('text', textData);
        return;
      }
    } catch (error) {
      lastError = error;
    }

    if (lastError) {
      console.error('粘贴失败', lastError);
      return;
    }

    // 获取所有格式提供的数据
    const values = {};
    clipboardData.types.forEach((type) => {
      values[type] = clipboardData.getData(type);
    });

    console.log('不识别的数据格式 >', values);
  };

  const handleCut = (event: ClipboardEvent) => {
    if (!enableShortcut.value) {
      return;
    }

    const copyData = copy();
    if (!copyData) {
      return;
    }

    // 设置传输数据
    event.clipboardData?.setData(CopyTransferKey, JSON.stringify(copyData));
    // 不然设置不上数据
    event.preventDefault();
    resetRange();

    // todo 处理拷贝的数据
    console.log('[ 剪切 ] >', copyData);
  };

  // 监听按键和销毁监听
  document.addEventListener('keydown', handleKeyDown, true);
  document.addEventListener('paste', handlePaste);
  document.addEventListener('copy', handleCopy);
  document.addEventListener('cut', handleCut);
  onUnmounted(() => {
    document.removeEventListener('keydown', handleKeyDown);
    document.removeEventListener('paste', handlePaste);
    document.removeEventListener('copy', handleCopy);
    document.removeEventListener('cut', handleCut);
  });

  /**
   * 点击viewport事件
   * @param event 事件对象
   */
  const handleViewPortClick = (): void => {
    clearSelection();
  };
</script>

<style lang="less" scoped>
  .ant-spin-spinning {
    height: 100%;
    width: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 99;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: rgba(255, 255, 255, 1);
  }
</style>
