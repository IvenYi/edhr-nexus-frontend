<template>
  <div class="font-style-box">
    <div class="icon-box" :class="bold ? 'selected' : null" @click="changeFontStyle('bold')">
      <a-tooltip>
        <template #title>{{ t('sys.pageDesigner.bold') }}</template>
        <bold-outlined />
      </a-tooltip>
    </div>
    <div class="icon-box" :class="italic ? 'selected' : null" @click="changeFontStyle('italic')">
      <a-tooltip>
        <template #title>{{ t('sys.pageDesigner.italic') }}</template>
        <italic-outlined />
      </a-tooltip>
    </div>
    <div
      class="icon-box"
      :class="textDecoration === TextDecoration.UNDERLINE ? 'selected' : null"
      @click="changeTextDecoration(TextDecoration.UNDERLINE)"
    >
      <a-tooltip>
        <template #title>{{ t('sys.pageDesigner.underline') }}</template>
        <underline-outlined />
      </a-tooltip>
    </div>
    <div
      class="icon-box"
      :class="textDecoration === TextDecoration.LINETHROUGH ? 'selected' : null"
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
  import { computed } from 'vue';
  import { emitFieldSet, TextDecoration } from '@gct/runtime';
  import { useI18n } from 'vue-i18n';
  import { IFont } from '@gct/base';
  import { DefaultFont } from './util';

  const { t } = useI18n() as any;

  type ValueType = Pick<IFont, 'bold' | 'italic' | 'textDecoration'>;

  const props = defineProps<{
    value?: ValueType;
  }>();

  const emit = defineEmits<{
    (e: 'update:value', value: ValueType): void;
  }>();

  const local = computed(() => {
    const defaultFont = {
      bold: DefaultFont.bold,
      italic: DefaultFont.italic,
      textDecoration: DefaultFont.textDecoration,
    };
    return props.value || defaultFont;
  });

  const { bold, italic, textDecoration } = emitFieldSet(local, (k, v, obj) => {
    emit('update:value', obj);
  });

  const changeFontStyle = (key: 'bold' | 'italic') => {
    if (key === 'bold') {
      bold.value = !bold.value;
    } else if (key === 'italic') {
      italic.value = !italic.value;
    }
  };

  const changeTextDecoration = (v: TextDecoration) => {
    if (textDecoration.value === v) {
      textDecoration.value = TextDecoration.NONE;
    } else {
      textDecoration.value = v;
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
