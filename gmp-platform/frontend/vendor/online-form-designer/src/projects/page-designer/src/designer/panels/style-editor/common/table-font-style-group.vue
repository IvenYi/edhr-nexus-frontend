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
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const props = defineProps<{ fontStyle: LowCodeWidget.FontStyle }>();
  const FontStyleRef = ref(props.fontStyle);
  const changeFontStyle = (fontProp: string) => {
    FontStyleRef.value[fontProp] = !FontStyleRef.value[fontProp];
  };
  const changeTextDecoration = (prop) => {
    if (FontStyleRef.value.textDecoration === prop) {
      FontStyleRef.value.textDecoration = TextDecoration.NONE;
    } else {
      FontStyleRef.value.textDecoration = prop;
    }
  };
</script>

<style lang="less" scoped>
  .icon-box {
    width: 20px;
    height: 20px;
    margin-right: 10px;
    text-align: center;
    cursor: pointer;

    &:hover {
      background-color: #e3e3e3;
    }
  }

  .selected {
    background-color: #e3e3e3;
  }

  .font-style-box {
    display: flex;
    align-items: center;
    justify-content: space-around;
    height: 32px;
    background-color: #f1f1f1;
  }
</style>
