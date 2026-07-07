<template>
  <div class="designer__toolbar">
    <!-- <a-upload :before-upload="beforeXlsxUpload" :show-upload-list="false">
      <i>import</i>
    </a-upload> -->
    <!-- <i>
      <icon-park type="format" />
    </i>

    <i>
      <icon-park type="return" />
    </i>

    <i>
      <icon-park type="go-on" />
    </i>

    <div class="vertical-divider"></div> -->
    <HistoryToolbar />

    <font-family-selector
      v-if="!hostedDesigner"
      v-model:value="cellFontFamily"
      class="w-100px mr-4px"
    />
    <font-size-selector
      v-if="!hostedDesigner"
      v-model:value="cellFontSize"
      class="w-72px mr-18px"
    />

    <a-tooltip placement="bottom">
      <template #title>
        <span>{{ $t('sys.pageDesigner.bold') }}</span>
      </template>
      <i
        :class="{
          active: cellStyleState?.bold,
        }"
        @click="setStyle({ 'font-weight': cellStyleState?.bold ? undefined : 'bold' })"
      >
        <i class="iconfont icon-Bold"></i>
      </i>
    </a-tooltip>

    <a-tooltip placement="bottom">
      <template #title>
        <span>{{ $t('sys.pageDesigner.italic') }}</span>
      </template>
      <i
        :class="{
          active: cellStyleState?.italic,
        }"
        @click="setStyle({ 'font-style': cellStyleState?.italic ? undefined : 'italic' })"
      >
        <i class="iconfont icon-Italic"></i>
      </i>
    </a-tooltip>

    <a-tooltip placement="bottom">
      <template #title>
        <span>{{ $t('sys.pageDesigner.underline') }}</span>
      </template>
      <i
        :class="{
          active: cellStyleState?.underline,
        }"
        @click="setTextDecoration('underline', !cellStyleState?.underline)"
      >
        <i class="iconfont icon-Underline"></i>
      </i>
    </a-tooltip>

    <a-tooltip placement="bottom">
      <template #title>
        <span>{{ $t('sys.pageDesigner.linethrough') }}</span>
      </template>
      <i
        :class="{
          active: cellStyleState?.through,
        }"
        @click="setTextDecoration('line-through', !cellStyleState?.through)"
      >
        <i class="iconfont icon-Strikethrough"></i>
      </i>
    </a-tooltip>

    <div class="tool--dropdown">
      <i @click="setBorder(borderIconType)">
        <BorderIcon :type="borderIconType" />
      </i>
      <a-dropdown
        trigger="click"
        placement="bottom"
        :overlayStyle="{
          paddingTop: '10px',
        }"
      >
        <i class="arrow"></i>
        <template #overlay>
          <a-menu @click="handleSetBorder">
            <a-menu-item :key="item.type" v-for="item in BorderPositionOptions">
              <div class="flex items-center text-12px">
                <BorderIcon :type="item.type" class="mr-6px relative -top-1px" />
                <span> {{ item.name }}</span>
              </div>
            </a-menu-item>
          </a-menu>
        </template>
      </a-dropdown>
    </div>

    <div class="tool--dropdown">
      <i>
        <i class="iconfont icon-wenziyanse"></i>
        <div
          class="color"
          :style="{
            background: cellColor,
          }"
        ></div>
      </i>
      <color-picker
        :preset="presetColor"
        :color="cellColor"
        @update:color="
          (_, color) => {
            setStyle({
              color,
            });
          }
        "
        use-trigger
        placement="bottom"
      >
        <template #trigger>
          <i class="arrow"></i>
        </template>
      </color-picker>
    </div>

    <div class="tool--dropdown">
      <i>
        <i class="iconfont icon-tianchongyanse relative left-1px"></i>
        <div
          class="color"
          :style="{
            background: cellBackgroundColor,
          }"
        ></div>
      </i>

      <color-picker
        :preset="presetColor"
        :color="cellBackgroundColor"
        @update:color="
          (_, color) => {
            setStyle({
              'background-color': color,
            });
          }
        "
        use-trigger
        placement="bottom"
      >
        <template #trigger>
          <i class="arrow"></i>
        </template>
      </color-picker>
    </div>

    <div class="vertical-divider"></div>

    <a-tooltip placement="bottom" v-for="item in alignList" :key="item.icon">
      <template #title>
        <span>{{ item.title }}</span>
      </template>
      <i
        :class="{
          active: item.active,
        }"
        @click="setStyle(item.value as any)"
      >
        <i class="iconfont" :class="item.icon"></i>
      </i>
    </a-tooltip>

    <a-tooltip placement="bottom">
      <template #title>
        <span>{{ $t('sys.pageDesigner.wrap') }}</span>
      </template>
      <i
        :class="{
          active: cellStyleState?.wrap,
        }"
        @click="setTextWrap(!cellStyleState?.wrap)"
      >
        <i class="iconfont icon-huanhang"></i>
      </i>
    </a-tooltip>

    <a-tooltip placement="bottom">
      <template #title>
        <span>{{ $t('sys.merge') }}</span>
      </template>
      <i @click="setMerge">
        <i class="iconfont icon-hebingdanyuange_merge-cells"></i>
      </i>
    </a-tooltip>

    <a-tooltip placement="bottom">
      <template #title>
        <span>{{ $t('sys.onlineForm.split') }}</span>
      </template>
      <i @click="cancelMerge">
        <i class="iconfont icon-chaifendanyuange_split-cells"></i>
      </i>
    </a-tooltip>

    <div class="vertical-divider"></div>

    <!-- <i>
      <i class="iconfont icon-lianjie2"></i>
    </i>

    <i>
      <i class="iconfont icon-tupian_wudaima"></i>
    </i> -->

    <a-tooltip v-if="!isTextOnlineForm" placement="bottom">
      <template #title>
        <span>{{ $t('sys.onlineForm.formHeader') }}</span>
      </template>
      <i @click="setThead">
        <i class="iconfont icon-biaotou"></i>
      </i>
    </a-tooltip>

    <a-tooltip v-if="!isTextOnlineForm" placement="bottom">
      <template #title>
        <span>{{ $t('sys.onlineForm.subTableType.DEFAULT') }}</span>
      </template>
      <i @click="() => setSubTable()">
        <i class="iconfont icon-dongtaibiao"></i>
      </i>
    </a-tooltip>

    <a-tooltip v-if="!isTextOnlineForm" placement="bottom">
      <template #title>
        <span>{{ $t('sys.onlineForm.subTableType.FIXED') }}</span>
      </template>
      <i @click="setSubTable(SubTableType.FIXED)">
        <i class="iconfont icon-a-gudingbiaosvg"></i>
      </i>
    </a-tooltip>

    <a-tooltip v-if="!isTextOnlineForm && !hostedDesigner" placement="bottom">
      <template #title>
        <span>{{ $t('sys.onlineForm.subTableType.2D') }}</span>
      </template>
      <i @click="setSubTable(SubTableType._2D)">
        <img :src="TableIcon2d" alt="" srcset="" />
      </i>
    </a-tooltip>

    <a-tooltip v-if="!isTextOnlineForm && !hostedDesigner" placement="bottom">
      <template #title>
        <span>{{ $t('sys.onlineForm.subTableType.CHECK') }}</span>
      </template>
      <i @click="setSubTable(SubTableType.CHECK)">
        <img :src="TableIconCheck" alt="" srcset="" />
      </i>
    </a-tooltip>

    <div v-if="!isTextOnlineForm" class="vertical-divider"></div>

    <div class="grid">
      <a-checkbox v-model:checked="gridLineVisible">{{
        $t('sys.onlineForm.gridlines')
      }}</a-checkbox>
      <a-checkbox :disabled="sheetReadonly" v-model:checked="paper.paperHeader">
        {{ $t('sys.onlineForm.header') }}
      </a-checkbox>
      <a-checkbox :disabled="sheetReadonly" v-model:checked="paper.paperFooter">
        {{ $t('sys.footer') }}
      </a-checkbox>
    </div>

    <div v-if="!isTextOnlineForm" class="vertical-divider canvas-mode-divider"></div>

    <div v-if="!isTextOnlineForm" class="canvas-mode-toggle" role="group" aria-label="设计模式">
      <button
        v-for="item in canvasModeOptions"
        :key="item.value"
        type="button"
        class="canvas-mode-toggle__button"
        :class="{ 'canvas-mode-toggle__button--active': activeCanvasMode === item.value }"
        :disabled="sheetReadonly"
        @click="handleCanvasModeChange(item.value)"
      >
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { useSpreadSheet } from '../hooks/useSpreadSheet';
  import { useState } from '../hooks/useState';
  import ColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import FontFamilySelector from '/@online-form/views/designer/modules/base/font-family-selector.vue';
  import FontSizeSelector from '/@online-form/views/designer/modules/base/font-size-selector.vue';
  import {
    FontFamilyEnum,
    BorderPositionOptions,
    BorderPositionEnum,
    SubTableType,
  } from '/@online-form/views/designer/enums';
  import { DEFAULT_FONT_SIZE } from '/@online-form/views/designer/constants';
  import BorderIcon from '/@online-form/views/designer/icons/border.vue';
  import HistoryToolbar from './history-toolbar.vue';
  import TableIcon2d from '/@online-form/assets/table-2d.svg';
  import TableIconCheck from '/@online-form/assets/table-check.svg';
  import { CanvasMode } from '../types';

  const route = useRoute();
  const hostedDesigner = computed(() => route.query.hosted === '1');
  const HOSTED_TEMPLATE_FONT_FAMILY = '"Microsoft YaHei", "微软雅黑", sans-serif';

  const {
    setMerge,
    cancelMerge,
    setThead,
    setSubTable,
    setStyle,
    setBorder,
    switchCanvasMode,
    gridLineVisible,
    paper,
    sheetReadonly,
    setTextWrap,
    setTextDecoration,
    isTextOnlineForm,
  } = useSpreadSheet();

  const { cellStyleState, cellStyleValue } = useState();
  const canvasModeOptions = [
    { label: '表格模式', value: CanvasMode.Sheet },
    { label: '画布模式', value: CanvasMode.Paper },
  ];
  const activeCanvasMode = computed(() => paper.value.canvasMode ?? CanvasMode.Sheet);

  const handleCanvasModeChange = (mode: CanvasMode) => {
    if (sheetReadonly.value || activeCanvasMode.value === mode) {
      return;
    }
    switchCanvasMode(mode);
  };

  const presetColor = [
    '#DBDBDB',
    '#FFE4E4',
    '#D1D1D1',
    '#838383',
    '#838383',
    '#FFEECB',
    '#D8E3FF',
    '#FF8888',
    '#FF8888',
    '#0DAA9C',
    '#3370FF',
  ];

  const borderIconType = ref<BorderPositionEnum>(BorderPositionEnum.none);

  /**
   * 字体颜色
   */
  const cellColor = computed<string>(() => {
    return (cellStyleValue.value['color'] ?? '#000000') as string;
  });

  /**
   * 背景色
   */
  const cellBackgroundColor = computed<string>(() => {
    return (cellStyleValue.value['background-color'] ?? '#ffffff') as string;
  });

  /**
   * 字体
   */
  const cellFontFamily = computed<string>({
    get() {
      return (cellStyleValue.value['font-family'] ??
        (hostedDesigner.value ? HOSTED_TEMPLATE_FONT_FAMILY : FontFamilyEnum.Serif)) as string;
    },
    set(value) {
      setStyle({
        'font-family': value,
      });
    },
  });

  /**
   * 字号
   */
  const cellFontSize = computed<number>({
    get() {
      const size = cellStyleValue.value['font-size'] as string;
      return size ? parseInt(size) : DEFAULT_FONT_SIZE;
    },
    set(value) {
      setStyle({
        'font-size': value + 'px',
      });
    },
  });

  const alignList = computed(() => {
    return [
      {
        title: $t('sys.pageDesigner.leftAlign'),
        icon: 'icon-zuoduiqi2',
        value: { 'text-align': 'left' },
        active: cellStyleState.value?.left,
      },
      {
        title: $t('sys.platform.center'),
        icon: 'icon-juzhong',
        value: { 'text-align': 'center' },
        active: cellStyleState.value?.center,
      },
      {
        title: $t('sys.pageDesigner.rightAlign'),
        icon: 'icon-youduiqi2',
        value: { 'text-align': 'right' },
        active: cellStyleState.value?.right,
      },
      // {
      //   title: '两端对齐',
      //   icon: 'icon-youduiqi2',
      //   value: { 'text-align': 'justify' },
      //   active: cellStyleState.value?.justify,
      // },
      {
        title: $t('sys.onlineForm.topAlign'),
        icon: 'icon-dingduanduiqi',
        value: { 'vertical-align': 'top' },
        active: cellStyleState.value?.top,
      },
      {
        title: $t('sys.platform.center'),
        icon: 'icon-juzhong1',
        value: { 'vertical-align': 'middle' },
        active: cellStyleState.value?.middle,
      },
      {
        title: $t('sys.onlineForm.bottomAlign'),
        icon: 'icon-diduanduiqi',
        value: { 'vertical-align': 'bottom' },
        active: cellStyleState.value?.bottom,
      },
    ];
  });

  const handleSetBorder = ({ key }) => {
    borderIconType.value = key;
    setBorder(key as BorderPositionEnum);
  };
</script>

<style lang="less" scoped>
  .designer__toolbar {
    display: flex;
    align-items: center;
    height: 100%;
    padding-right: 16px;
    padding-left: 16px;
    overflow: hidden;
    border-bottom: 1px solid #e0e3ea;
    background-color: #fff;

    & > i {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;

      &:hover {
        background-color: #e8ebf0;
      }

      &.active {
        background-color: #e8ebf0;
        color: #212528;
      }

      & > span.i-icon {
        display: flex;
      }

      & > .iconfont {
        display: flex;
        line-height: 1em;
      }
    }

    .tool {
      &--dropdown {
        --border-color: transparent;

        display: flex;
        height: 24px;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        //#E0E3EA
        cursor: pointer;

        &:hover {
          --border-color: #e0e3ea;
        }

        & > i:first-child {
          display: flex;
          position: relative;
          align-items: center;
          justify-content: center;
          width: 22px;
          border-right: 1px solid var(--border-color);

          .i-icon {
            display: inline-flex;
          }

          .iconfont {
            display: flex;
            line-height: 1em;
          }

          & > .color {
            position: absolute;
            bottom: 3px;
            left: 4px;
            width: 14px;
            height: 2px;
          }

          &:hover {
            background-color: #e8ebf0;
          }
        }

        & > .arrow {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 18px;
          padding-top: 1px;

          &::after {
            content: '';
            border-top: 3px solid #a6a6a6;
            border-right: 3px solid transparent;
            border-left: 3px solid transparent;
          }

          &:hover {
            background-color: #e8ebf0;
          }
        }
      }
    }

    .grid {
      display: inline-flex;
      align-items: center;
      flex-wrap: nowrap;
      gap: 10px;
      flex-shrink: 0;
      height: 24px;
      padding-left: 2px;
      white-space: nowrap;

      & > label {
        display: inline-flex;
        align-items: center;
        flex: 0 0 auto;
        margin-left: 0;

        :deep(.ant-checkbox) {
          top: 0;
        }
      }
    }

    .canvas-mode-divider {
      margin-left: 14px;
    }

    .canvas-mode-toggle {
      display: inline-flex;
      align-items: center;
      flex-shrink: 0;
      gap: 4px;
      height: 24px;

      &__button {
        height: 24px;
        padding: 0 10px;
        border: 1px solid #d8dde6;
        border-radius: 4px;
        background: #fff;
        color: #4e5969;
        font-size: 12px;
        line-height: 22px;
        cursor: pointer;

        &:hover:not(:disabled) {
          border-color: #1687e8;
          color: #1687e8;
        }

        &--active {
          border-color: #1687e8;
          background: #1687e8;
          color: #fff;

          &:hover:not(:disabled) {
            color: #fff;
          }
        }

        &:disabled {
          cursor: not-allowed;
          opacity: 0.55;
        }
      }
    }

    .vertical-divider {
      width: 1px;
      height: 16px;
      margin-right: 16px;
      border-right: 1px solid #e0e3ea;
    }

    & > i,
    & > .tool--dropdown {
      margin-right: 12px;
      color: #797a7d;

      &:has(+ .vertical-divider) {
        margin-right: 16px;
      }
    }
  }
</style>
