<template>
  <div class="font-style-box">
    <div
      class="icon-box"
      :class="FontStyleRef.bold ? 'selected' : null"
      @click="changeFontStyle('bold')"
    >
      <a-tooltip>
        <template #title>{{ t('sys.pageDesigner.bold') }}</template>
        <bold-outlined />
      </a-tooltip>
    </div>
    <div
      class="icon-box"
      :class="FontStyleRef.italic ? 'selected' : null"
      @click="changeFontStyle('italic')"
    >
      <a-tooltip>
        <template #title>{{ t('sys.pageDesigner.italic') }}</template>
        <italic-outlined />
      </a-tooltip>
    </div>
    <div
      class="icon-box"
      :class="FontStyleRef.textDecoration === TextDecoration.UNDERLINE ? 'selected' : null"
      @click="changeTextDecoration(TextDecoration.UNDERLINE)"
    >
      <a-tooltip>
        <template #title>{{ t('sys.pageDesigner.underline') }}</template>
        <underline-outlined />
      </a-tooltip>
    </div>
    <div
      class="icon-box"
      :class="FontStyleRef.textDecoration === TextDecoration.LINETHROUGH ? 'selected' : null"
      @click="changeTextDecoration(TextDecoration.LINETHROUGH)"
    >
      <a-tooltip>
        <template #title>{{ t('sys.pageDesigner.linethrough') }}</template>
        <strikethrough-outlined />
      </a-tooltip>
    </div>
  </div>
</template>

<script setup lang="ts">
  import {
    BoldOutlined,
    ItalicOutlined,
    UnderlineOutlined,
    StrikethroughOutlined,
  } from '@ant-design/icons-vue';
  import { TextDecoration } from '/@page-designer/enum';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { computed, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';

  const { selectedStyle } = useSelectedWidget();
  const { t } = useI18n();
  const props = defineProps({
    name: {
      type: String,
      default: 'labelFont',
    },
    widget: {
      type: Object as PropType<LowCodeWidget.BasicSchema>,
    },
  });
  const FontStyleRef = computed(() => {
    const defaultFont = {
      bold: false,
      italic: false,
      textDecoration: TextDecoration.NONE,
    };
    return selectedStyle.value[props.name] || defaultFont;
  });
  const changeFontStyle = (fontProp: string) => {
    FontStyleRef.value[fontProp] = !FontStyleRef.value[fontProp];
    if (!props.widget?.style[props.name]) {
      props.widget!.style[props.name] = { [fontProp]: FontStyleRef.value[fontProp] };
    } else {
      props.widget!.style[props.name][fontProp] = FontStyleRef.value[fontProp];
    }
  };
  const changeTextDecoration = (prop) => {
    const isSelected = FontStyleRef.value.textDecoration === prop;
    if (isSelected) {
      FontStyleRef.value.textDecoration = TextDecoration.NONE;
    } else {
      FontStyleRef.value.textDecoration = prop;
    }
    if (!props.widget?.style[props.name]) {
      props.widget!.style[props.name] = { textDecoration: FontStyleRef.value.textDecoration };
    } else {
      props.widget!.style[props.name].textDecoration = FontStyleRef.value.textDecoration;
    }
  };
</script>
<style lang="less" scoped>
  .icon-box {
    height: 22px;
    flex: 1;
    text-align: center;
    cursor: pointer;
    border-radius: 2px;

    .anticon {
      padding: 3px 4px;
      border-radius: 2px;
      font-size: 14px;
      position: relative;
      top: 1px;
      &:hover {
        background-color: #e6e9ef;
      }
    }
  }

  .selected {
    background-color: #ffffff;
  }

  .font-style-box {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 26px;
    background-color: #f2f4f7;
    border-radius: 4px;
    padding: 2px;
  }
</style>
