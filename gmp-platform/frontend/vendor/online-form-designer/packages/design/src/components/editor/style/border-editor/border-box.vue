<template>
  <div class="border-box">
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
            v-model:value="style"
            :options="borderStyleOpt"
            style="width: 100%"
            size="small"
          />
        </a-col>
      </a-row>
      <a-row class="row">
        <a-col :span="6">线宽</a-col>
        <a-col :span="18" class="relative">
          <a-auto-complete :options="options" v-model:value="width">
            <a-input-number
              v-model:value="width"
              :min="0"
              :controls="true"
              :precision="0"
              style="width: 100%"
              size="small"
              addonAfter="px"
              @blur="onWidthBlur"
            />
          </a-auto-complete>
          <down-outlined class="ant-select-arrow gct-select-arrow" />
        </a-col>
      </a-row>
      <a-row class="row">
        <a-col :span="6">颜色</a-col>
        <a-col :span="18">
          <color-picker :preset="presetColor" :color="color" @update:color="handleUpdateColor">
            <template #icon>
              <div
                :style="{
                  width: '22px',
                  height: '22px',
                  backgroundColor: color,
                  borderRadius: '4px',
                }"
              ></div>
            </template>
          </color-picker>
        </a-col>
      </a-row>
    </div>
  </div>
</template>

<script setup lang="ts" name="border-box">
  import { computed, ref } from 'vue';
  import { BorderStyle, emitFieldSet, presetColor } from '@gct/runtime';
  import { BoxValue, parseBorderItem, parsePos, parseValueUnit } from './util';
  import { useI18n } from 'vue-i18n';

  const { t } = useI18n();

  const options = ref([
    {
      label: '1',
      value: 1,
    },
    {
      label: '2',
      value: 2,
    },
    {
      label: '3',
      value: 3,
    },
    {
      label: '4',
      value: 4,
    },
    {
      label: '5',
      value: 5,
    },
  ]);

  const borderStyleOpt = [
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

  const defaultBorder = {
    style: BorderStyle.NONE,
    color: '#F0F0F0',
    width: 1,
  };

  const props = withDefaults(
    defineProps<{
      value?: BoxValue;
    }>(),
    {},
  );

  const emit = defineEmits<{
    (e: 'update:value', value: BoxValue): void;
  }>();

  const local = computed(() => {
    const v = props.value;
    const pos = parsePos(v);
    const item = parseBorderItem(pos, v);
    let borderItem = {
      style: item?.style || defaultBorder.style,
      color: item?.color || defaultBorder.color,
      width: defaultBorder.width,
    };
    if (item?.width) {
      const { value } = parseValueUnit(item.width);
      borderItem.width = value;
    }

    return {
      pos,
      ...borderItem,
    };
  });

  const { pos, style, color, width } = emitFieldSet(local, (f, v, obj) => {
    const eachBorder = {
      style: obj.style,
      color: obj.color,
      width: obj.width + 'px',
    };
    let tags = ['top', 'right', 'bottom', 'left'];
    switch (obj.pos) {
      case 'borderTop':
        tags = ['top'];
        break;
      case 'borderRight':
        tags = ['right'];
        break;
      case 'borderBottom':
        tags = ['bottom'];
        break;
      case 'borderLeft':
        tags = ['left'];
        break;
      default:
        break;
    }
    const result = {};
    tags.forEach((tag) => {
      result[tag] = { ...eachBorder };
    });
    emit('update:value', result);
  });

  const onWidthBlur = () => {
    if (!width.value) {
      width.value = 1;
    }
  };

  const handleUpdateColor = (_e, v) => {
    color.value = v;
  };
</script>

<style lang="less" scoped>
  .border-box {
    display: flex;
    // border-top: 1px solid #f0f0f0;
    align-items: center;
    .border-div {
      width: 60px;
      height: 60px;
      padding: 6px;
      border-radius: 4px;
      border: 1px solid @gct-input-border-color;
      margin-right: 15px;
      // margin-top: 15px;
      &-inner {
        border: 1px dashed @gct-modal-border-color;
        border-radius: 4px;
        position: relative;
        width: 48px;
        height: 48px;
      }
      .rect {
        cursor: pointer;
        border: 1px solid #e3e3e3;
        width: 10px;
        height: 10px;
        border-radius: 1px;
      }
      .center {
        cursor: pointer;
        width: 12px;
        height: 12px;
        border-radius: 2px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        border: 1px solid #c3c3c3;
      }
      .top {
        position: absolute;
        top: -1px;
        left: 50%;
        width: 22px;
        height: 2px;
        background-color: #c3c3c3;
        z-index: 3;
        transform: translate(-50%, 0);
      }
      .top-rect {
        position: absolute;
        top: -1px;
        left: 50%;
        transform: translate(-50%, 0);
      }
      .bottom {
        position: absolute;
        bottom: -1px;
        left: 50%;
        width: 22px;
        height: 2px;
        z-index: 3;
        background-color: #c3c3c3;
        transform: translate(-50%, 0);
      }
      .bottom-rect {
        position: absolute;
        bottom: -1px;
        left: 50%;
        transform: translate(-50%, 0);
      }
      .left {
        position: absolute;
        top: 50%;
        left: -1px;
        width: 2px;
        z-index: 3;
        height: 22px;
        background-color: #c3c3c3;
        transform: translate(0, -50%);
      }
      .left-rect {
        position: absolute;
        top: 50%;
        left: -1px;
        transform: translate(0, -50%);
      }
      .right {
        position: absolute;
        top: 50%;
        right: -1px;
        width: 2px;
        height: 22px;
        z-index: 3;
        background-color: #c3c3c3;
        transform: translate(0, -50%);
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
        margin-bottom: 4px;
        align-items: center;
      }
      .border-col {
        border-bottom: 1px solid #c3c3c3;
        padding-bottom: 5px;
        display: flex;
        align-items: center;
        width: 50%;
        .border-text {
          margin-right: 12px;
        }
        .input-wrap {
          flex: 1;
          .border-input {
            border: none;
            outline: none;
            text-align: center;
            vertical-align: middle;
            background-color: transparent;
            width: 100%;
          }
        }
      }
    }
  }
  .focus {
    background-color: var(--ant-primary-color) !important;
  }
  .focus-line {
    border: 1px solid var(--ant-primary-color) !important;
  }
  :deep(.gct-select-arrow) {
    color: #212528;
    position: absolute;
    top: 50%;
    right: 45px;
  }

  :deep(.ant-input-number-handler-wrap) {
    z-index: 2;
  }
</style>
