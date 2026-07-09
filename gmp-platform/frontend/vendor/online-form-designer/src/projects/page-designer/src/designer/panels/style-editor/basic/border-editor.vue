<template>
  <div :class="['border-box', isLabelPrint ? 'label-print' : '']">
    <div class="border-div">
      <div class="border-div-inner">
        <div class="top" :class="pos === 'borderTop' ? 'focus' : null"></div>
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.topBorder') }}</template>
          <div
            class="top-rect rect"
            @click="pos = 'borderTop'"
            :class="pos === 'borderTop' ? 'focus-line' : null"
          ></div>
        </a-tooltip>
        <div class="left" :class="pos === 'borderLeft' ? 'focus' : null"></div>
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.leftBorder') }}</template>
          <div
            class="left-rect rect"
            @click="pos = 'borderLeft'"
            :class="pos === 'borderLeft' ? 'focus-line' : null"
          ></div>
        </a-tooltip>

        <div class="bottom" :class="pos === 'borderBottom' ? 'focus' : null"></div>
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.bottomBorder') }}</template>
          <div
            class="bottom-rect rect"
            @click="pos = 'borderBottom'"
            :class="pos === 'borderBottom' ? 'focus-line' : null"
          ></div>
        </a-tooltip>

        <div class="right" :class="pos === 'borderRight' ? 'focus' : null"></div>
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.rightBorder') }}</template>
          <div
            class="right-rect rect"
            @click="pos = 'borderRight'"
            :class="pos === 'borderRight' ? 'focus-line' : null"
          ></div>
        </a-tooltip>
        <a-tooltip>
          <template #title>{{ t('sys.pageDesigner.whole') }}</template>
          <div
            class="center"
            @click="pos = 'borderAll'"
            :class="pos === 'borderAll' ? 'focus-line' : null"
          ></div>
        </a-tooltip>
      </div>
    </div>
    <div class="border-editor">
      <a-row class="row">
        <a-col :span="6">线型</a-col>
        <a-col :span="18">
          <a-select
            v-model:value="borderVal.borderStyle"
            :options="boderStyleOpt"
            style="width: 100%"
            size="small"
            @change="changeBorder('borderStyle', borderVal.borderStyle)"
          />
        </a-col>
      </a-row>
      <a-row class="row">
        <a-col :span="6">线宽</a-col>
        <a-col :span="18" class="relative">
          <a-auto-complete
            :options="options"
            v-model:value="borderVal.borderWidth"
            @change="changeBorder('borderWidth', borderVal.borderWidth)"
          >
            <!-- <a-input
              type="number"
              v-model:value="borderVal.borderWidth"
              suffix="px"
              size="small"
              @change="changeBorder('borderWidth', borderVal.borderWidth)"
            /> -->
            <a-input-number
              v-model:value="borderVal.borderWidth"
              :min="0"
              :controls="true"
              :precision="0"
              style="width: 100%"
              size="small"
              addonAfter="px"
              @change="(val) => changeBorder('borderWidth', val)"
              @blur="!borderVal.borderWidth && changeBorder('borderWidth', 1)"
            />
          </a-auto-complete>
          <down-outlined class="ant-select-arrow gct-select-arrow" />
        </a-col>
      </a-row>
      <a-row class="row">
        <a-col :span="6">颜色</a-col>
        <a-col :span="18">
          <g-color-picker
            :preset="presetColor"
            :color="borderVal.borderColor"
            @update:color="handleUpdateColor"
          >
            <template #icon>
              <div
                :style="{
                  width: '22px',
                  height: '22px',
                  backgroundColor: borderVal.borderColor,
                  borderRadius: '4px',
                }"
              ></div>
            </template>
          </g-color-picker>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts" name="border-editor">
  import { computed, ref, watch, Ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
  import { BorderStyleOpt } from '/@page-designer/types/panel';
  import { BorderStyle } from '/@page-designer/enum';
  import GColorPicker from '/@/components/ColorPicker/src/ColorPicker.vue';
  import { presetColor } from '/@page-designer/hooks/useStyleEditor';
  import { isEqual } from 'lodash-es';

  const props = defineProps({
    isLabelPrint: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: () => {
        return {};
      },
    },
  });

  const emit = defineEmits(['changeEvent']);

  let style: Ref<any> = computed({
    get() {
      return props.value;
    },
    set(val) {
      emit('changeEvent', val);
    },
  });

  const { selectedStyle } = useSelectedWidget();

  if (props.isLabelPrint !== true) {
    // eslint-disable-next-line vue/no-ref-as-operand
    style = selectedStyle;
  }

  const { t } = useI18n();
  const pos = ref('borderAll');
  const options = ref([
    {
      label: '1',
      value: '1',
    },
    {
      label: '2',
      value: '2',
    },
    {
      label: '3',
      value: '3',
    },
    {
      label: '4',
      value: '4',
    },
    {
      label: '5',
      value: '5',
    },
  ]);
  function getDefaultBorder() {
    return {
      borderStyle: BorderStyle.NONE,
      borderColor: '#F0F0F0',
      borderWidth: '1',
    };
  }
  const borderVal = computed(() => {
    switch (pos.value) {
      case 'borderAll':
        if (style.value.borderAll) {
          return style.value.borderAll;
        }
        const defaultColor = getDefaultBorder();
        const { borderWidth: wb, borderStyle: sb } = style.value.borderBottom || defaultColor;
        const { borderWidth: wt, borderStyle: st } = style.value.borderTop || defaultColor;
        const { borderWidth: wr, borderStyle: sr } = style.value.borderRight || defaultColor;
        const { borderWidth: wl, borderStyle: sl } = style.value.borderLeft || defaultColor;
        if (new Set([wb, wt, wr, wl]).size === 1) {
          defaultColor.borderWidth = wb;
        } else {
          defaultColor.borderWidth = undefined;
        }
        if (new Set([sb, st, sr, sl]).size === 1) {
          defaultColor.borderStyle = sb;
        } else {
          defaultColor.borderStyle = undefined;
        }
        return defaultColor;
      case 'borderTop':
        return style.value.borderTop || getDefaultBorder();
      case 'borderRight':
        return style.value.borderRight || getDefaultBorder();
      case 'borderLeft':
        return style.value.borderLeft || getDefaultBorder();
      case 'borderBottom':
        return style.value.borderBottom || getDefaultBorder();
      default:
        return style.value.borderAll || getDefaultBorder();
    }
  });

  const boderStyleOpt: BorderStyleOpt[] = [
    {
      label: t(`sys.pageDesigner.borderStyle.${BorderStyle.NONE}`),
      value: BorderStyle.NONE,
    },
    {
      label: t(`sys.pageDesigner.borderStyle.${BorderStyle.SOLID}`),
      value: BorderStyle.SOLID,
    },
    {
      label: t(`sys.pageDesigner.borderStyle.${BorderStyle.DOTTED}`),
      value: BorderStyle.DOTTED,
    },
    {
      label: t(`sys.pageDesigner.borderStyle.${BorderStyle.DASHED}`),
      value: BorderStyle.DASHED,
    },
  ];

  const handleUpdateColor = (_e, color) => {
    if (borderVal.value.borderColor === color) {
      return;
    }
    borderVal.value.borderColor = color;
    if (pos.value === 'borderAll') {
      if (!style.value.borderRight) {
        style.value.borderRight = getDefaultBorder();
      }
      style.value.borderRight.borderColor = color;
      if (!style.value.borderTop) {
        style.value.borderTop = getDefaultBorder();
      }
      style.value.borderTop.borderColor = color;
      if (!style.value.borderLeft) {
        style.value.borderLeft = getDefaultBorder();
      }
      style.value.borderLeft.borderColor = color;
      if (!style.value.borderBottom) {
        style.value.borderBottom = getDefaultBorder();
      }
      style.value.borderBottom.borderColor = color;
    } else {
      if (!style.value[pos.value]) {
        style.value[pos.value] = getDefaultBorder();
      }
      style.value[pos.value].borderColor = color;
    }
    // eslint-disable-next-line no-self-assign
    style.value = style.value;
  };

  watch(
    [
      () => style.value.borderRight,
      () => style.value.borderTop,
      () => style.value.borderLeft,
      () => style.value.borderBottom,
    ],
    () => {
      if (
        style.value.borderRight &&
        style.value.borderTop &&
        style.value.borderLeft &&
        style.value.borderBottom &&
        isEqual(style.value.borderRight, style.value.borderTop) &&
        isEqual(style.value.borderTop, style.value.borderLeft) &&
        isEqual(style.value.borderLeft, style.value.borderBottom)
      ) {
        style.value.borderAll = { ...style.value.borderLeft };
      } else {
        delete style.value.borderAll;
      }
    },
    {
      deep: true,
    },
  );

  const changeBorder = (styleAttr, val) => {
    if (!style.value[pos.value]) {
      style.value[pos.value] = getDefaultBorder();
    }
    if (pos.value === 'borderAll') {
      if (!style.value.borderRight) {
        style.value.borderRight = getDefaultBorder();
      }
      style.value.borderRight[styleAttr] = val;
      if (!style.value.borderTop) {
        style.value.borderTop = getDefaultBorder();
      }
      style.value.borderTop[styleAttr] = val;
      if (!style.value.borderLeft) {
        style.value.borderLeft = getDefaultBorder();
      }
      style.value.borderLeft[styleAttr] = val;
      if (!style.value.borderBottom) {
        style.value.borderBottom = getDefaultBorder();
      }
      style.value.borderBottom[styleAttr] = val;
    } else {
      style.value[pos.value][styleAttr] = val;
    }
    // eslint-disable-next-line no-self-assign
    style.value = style.value;
  };
</script>

<style lang="less" scoped>
  :deep(.ant-input-number-handler-wrap) {
    z-index: 2;
  }

  .border-box {
    display: flex;
    // border-top: 1px solid #f0f0f0;
    align-items: center;
    padding-top: 16px;

    .border-div {
      width: 60px;
      height: 60px;
      margin-right: 15px;
      padding: 6px;
      border: 1px solid @gct-input-border-color;
      border-radius: 4px;
      // margin-top: 15px;
      &-inner {
        position: relative;
        width: 48px;
        height: 48px;
        border: 1px dashed @gct-modal-border-color;
        border-radius: 4px;
      }

      .rect {
        width: 10px;
        height: 10px;
        border: 1px solid #e3e3e3;
        border-radius: 1px;
        cursor: pointer;
      }

      .center {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 12px;
        height: 12px;
        transform: translate(-50%, -50%);
        border: 1px solid #c3c3c3;
        border-radius: 2px;
        cursor: pointer;
      }

      .top {
        position: absolute;
        z-index: 3;
        top: -1px;
        left: 50%;
        width: 22px;
        height: 2px;
        transform: translate(-50%, 0);
        background-color: #c3c3c3;
      }

      .top-rect {
        position: absolute;
        top: -1px;
        left: 50%;
        transform: translate(-50%, 0);
      }

      .bottom {
        position: absolute;
        z-index: 3;
        bottom: -1px;
        left: 50%;
        width: 22px;
        height: 2px;
        transform: translate(-50%, 0);
        background-color: #c3c3c3;
      }

      .bottom-rect {
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translate(-50%, 0);
      }

      .left {
        position: absolute;
        z-index: 3;
        top: 50%;
        left: -1px;
        width: 2px;
        height: 22px;
        transform: translate(0, -50%);
        background-color: #c3c3c3;
      }

      .left-rect {
        position: absolute;
        top: 50%;
        left: -1px;
        transform: translate(0, -50%);
      }

      .right {
        position: absolute;
        z-index: 3;
        top: 50%;
        right: -1px;
        width: 2px;
        height: 22px;
        transform: translate(0, -50%);
        background-color: #c3c3c3;
      }

      .right-rect {
        position: absolute;
        top: 50%;
        right: -1px;
        transform: translate(0, -50%);
      }
    }

    .border-editor {
      flex: 1;

      .row {
        align-items: center;
        margin-bottom: 4px;
      }

      .border-col {
        display: flex;
        align-items: center;
        width: 50%;
        padding-bottom: 5px;
        border-bottom: 1px solid #c3c3c3;

        .border-text {
          margin-right: 12px;
        }

        .input-wrap {
          flex: 1;

          .border-input {
            width: 100%;
            border: none;
            outline: none;
            background-color: transparent;
            text-align: center;
            vertical-align: middle;
          }
        }
      }
    }
  }

  .border-box.label-print {
    padding-top: 0;
  }

  .focus {
    background-color: var(--ant-primary-color) !important;
  }

  .focus-line {
    border: 1px solid var(--ant-primary-color) !important;
  }

  :deep(.gct-select-arrow) {
    position: absolute;
    top: 50%;
    right: 45px;
    color: #212528;
  }
</style>
