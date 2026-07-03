<template>
  <!-- <a-radio-group v-if="!editor._config?.hiddenMarginOrPadding" v-model:value="paddingORmargin">
    <a-radio-button value="margin">外边距</a-radio-button>
    <a-radio-button value="padding">内边距</a-radio-button>
  </a-radio-group> -->
  <a-tabs
    v-if="!editor._config?.hiddenMarginOrPadding"
    v-model:activeKey="paddingORmargin"
    class="margin-padding-tabs"
    @change="handleChange"
  >
    <a-tab-pane
      v-if="
        !editor._config?.hiddenMarginOrPadding ||
        editor._config?.hiddenMarginOrPadding === 'padding'
      "
      key="margin"
      tab="外边距"
    />
    <a-tab-pane
      v-if="
        !editor._config?.hiddenMarginOrPadding || editor._config?.hiddenMarginOrPadding === 'margin'
      "
      key="padding"
      tab="内边距"
    />
  </a-tabs>
  <div v-else>
    {{ editor._config?.hiddenMarginOrPadding === 'padding' ? '外边距' : '内边距' }}
  </div>
  <div class="container pb12px">
    <div class="box" v-if="paddingORmargin === 'margin'">
      <div class="box-inner">
        <div
          :class="{ highlight: curFocus === 'top' || curFocus === 'center' }"
          class="box-inner-line line-top"
        ></div>
        <div
          :class="{ highlight: curFocus === 'right' || curFocus === 'center' }"
          class="box-inner-line line-right"
        ></div>
        <div
          :class="{ highlight: curFocus === 'bottom' || curFocus === 'center' }"
          class="box-inner-line line-bottom"
        ></div>
        <div
          :class="{ highlight: curFocus === 'left' || curFocus === 'center' }"
          class="box-inner-line line-left"
        ></div>
      </div>
      <a-input
        :allowClear="false"
        suffix="px"
        class="top input"
        v-model:value="marginTop"
        @focus="handleFocus('top')"
        @blur="handleBlur($event, 'marginTop')"
      />
      <a-input
        :allowClear="false"
        suffix="px"
        class="right input"
        v-model:value="marginRight"
        @focus="handleFocus('right')"
        @blur="handleBlur($event, 'marginRight')"
      />
      <a-input
        :allowClear="false"
        suffix="px"
        class="bottom input"
        v-model:value="marginBottom"
        @focus="handleFocus('bottom')"
        @blur="handleBlur($event, 'marginBottom')"
      />
      <a-input
        :allowClear="false"
        suffix="px"
        class="left input"
        v-model:value="marginLeft"
        @focus="handleFocus('left')"
        @blur="handleBlur($event, 'marginLeft')"
      />
      <a-input
        :allowClear="false"
        suffix="px"
        class="center input"
        v-model:value="marginAll"
        @change="changeMarginOrPadding(true)"
        @focus="handleFocus('center')"
        @blur="handleBlur($event, 'marginAll')"
      />
    </div>
    <div class="box" v-if="paddingORmargin === 'padding'">
      <div class="box-inner">
        <div
          :class="{ highlight: curFocus === 'top' || curFocus === 'center' }"
          class="box-inner-line line-top line-padding"
        ></div>
        <div
          :class="{ highlight: curFocus === 'right' || curFocus === 'center' }"
          class="box-inner-line line-right line-padding"
        ></div>
        <div
          :class="{ highlight: curFocus === 'bottom' || curFocus === 'center' }"
          class="box-inner-line line-bottom line-padding"
        ></div>
        <div
          :class="{ highlight: curFocus === 'left' || curFocus === 'center' }"
          class="box-inner-line line-left line-padding"
        ></div>
      </div>
      <a-input
        suffix="px"
        class="top input"
        v-model:value="paddingTop"
        @focus="handleFocus('top')"
        @blur="handleBlur($event, 'paddingTop')"
        :allowClear="false"
      />
      <a-input
        suffix="px"
        class="right input"
        v-model:value="paddingRight"
        @focus="handleFocus('right')"
        @blur="handleBlur($event, 'paddingRight')"
        :allowClear="false"
      />
      <a-input
        suffix="px"
        class="bottom input"
        v-model:value="paddingBottom"
        @focus="handleFocus('bottom')"
        @blur="handleBlur($event, 'paddingBottom')"
        :allowClear="false"
      />
      <a-input
        suffix="px"
        class="left input"
        v-model:value="paddingLeft"
        @focus="handleFocus('left')"
        @blur="handleBlur($event, 'paddingLeft')"
        :allowClear="false"
      />
      <a-input
        suffix="px"
        class="center input"
        v-model:value="paddingAll"
        @change="changeMarginOrPadding(true)"
        @focus="handleFocus('center')"
        @blur="handleBlur($event, 'paddingAll')"
        :allowClear="false"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, toRefs, computed, onMounted } from 'vue';
  import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
  import { isNull, isUndefined } from 'lodash-es';
  import { onClickOutside } from '@vueuse/core';

  const props = defineProps<{
    editor: LowCodeWidget.StyleEditor;
    selectedStyle: LowCodeWidget.BasicStyle;
  }>();
  const { editor, selectedStyle } = toRefs(props);
  const curFocus = ref();

  const paddingORmargin = ref<'padding' | 'margin'>(
    editor.value._config?.hiddenMarginOrPadding === 'margin' ? 'padding' : 'margin',
  );
  const changeMarginOrPadding = (isAll) => {
    if (paddingORmargin.value === 'margin') {
      const marginAll = selectedStyle.value.marginAll || '0';
      selectedStyle.value.marginTop = isAll
        ? marginAll
        : selectedStyle.value.marginTop || marginAll;
      selectedStyle.value.marginBottom = isAll
        ? marginAll
        : selectedStyle.value.marginBottom || marginAll;
      selectedStyle.value.marginLeft = isAll
        ? marginAll
        : selectedStyle.value.marginLeft || marginAll;
      selectedStyle.value.marginRight = isAll
        ? marginAll
        : selectedStyle.value.marginRight || marginAll;
    } else {
      const paddingAll = selectedStyle.value.paddingAll || '0';
      selectedStyle.value.paddingTop = isAll
        ? paddingAll
        : selectedStyle.value.paddingTop ?? paddingAll;
      selectedStyle.value.paddingBottom = isAll
        ? paddingAll
        : selectedStyle.value.paddingBottom ?? paddingAll;
      selectedStyle.value.paddingLeft = isAll
        ? paddingAll
        : selectedStyle.value.paddingLeft ?? paddingAll;
      selectedStyle.value.paddingRight = isAll
        ? paddingAll
        : selectedStyle.value.paddingRight ?? paddingAll;
    }
  };
  watch(
    [
      () => selectedStyle.value.marginTop,
      () => selectedStyle.value.marginBottom,
      () => selectedStyle.value.marginLeft,
      () => selectedStyle.value.marginRight,
    ],
    () => {
      if (
        selectedStyle.value.marginTop === selectedStyle.value.marginBottom &&
        selectedStyle.value.marginBottom === selectedStyle.value.marginLeft &&
        selectedStyle.value.marginLeft === selectedStyle.value.marginRight
      ) {
        selectedStyle.value.marginAll = selectedStyle.value.marginLeft;
      } else {
        selectedStyle.value.marginAll = '';
      }
    },
  );
  watch(
    [
      () => selectedStyle.value.paddingTop,
      () => selectedStyle.value.paddingBottom,
      () => selectedStyle.value.paddingLeft,
      () => selectedStyle.value.paddingRight,
    ],
    () => {
      if (
        selectedStyle.value.paddingTop === selectedStyle.value.paddingBottom &&
        selectedStyle.value.paddingBottom === selectedStyle.value.paddingLeft &&
        selectedStyle.value.paddingLeft === selectedStyle.value.paddingRight
      ) {
        selectedStyle.value.paddingAll = selectedStyle.value.paddingLeft;
      } else {
        selectedStyle.value.paddingAll = '';
      }
    },
  );
  onMounted(() => {
    changeMarginOrPadding(false);
  });
  const marginTop = computed({
    get() {
      return selectedStyle.value.marginTop;
    },
    set(val) {
      selectedStyle.value.marginTop = val;
    },
  });
  const marginBottom = computed({
    get() {
      return selectedStyle.value.marginBottom;
    },
    set(val) {
      selectedStyle.value.marginBottom = val;
    },
  });
  const marginLeft = computed({
    get() {
      return selectedStyle.value.marginLeft;
    },
    set(val) {
      selectedStyle.value.marginLeft = val;
    },
  });
  const marginRight = computed({
    get() {
      return selectedStyle.value.marginRight;
    },
    set(val) {
      selectedStyle.value.marginRight = val;
    },
  });
  const marginAll = computed({
    get() {
      if (isUndefined(selectedStyle.value.marginAll) || isNull(selectedStyle.value.marginAll)) {
        return '0';
      }
      return selectedStyle.value.marginAll || '';
    },
    set(val) {
      selectedStyle.value.marginAll = val;
    },
  });
  const paddingTop = computed({
    get() {
      return selectedStyle.value.paddingTop;
    },
    set(val) {
      selectedStyle.value.paddingTop = val;
    },
  });
  const paddingBottom = computed({
    get() {
      return selectedStyle.value.paddingBottom;
    },
    set(val) {
      selectedStyle.value.paddingBottom = val;
    },
  });
  const paddingLeft = computed({
    get() {
      return selectedStyle.value.paddingLeft;
    },
    set(val) {
      selectedStyle.value.paddingLeft = val;
    },
  });
  const paddingRight = computed({
    get() {
      return selectedStyle.value.paddingRight;
    },
    set(val) {
      selectedStyle.value.paddingRight = val;
    },
  });
  const paddingAll = computed({
    get() {
      if (isUndefined(selectedStyle.value.paddingAll) || isNull(selectedStyle.value.paddingAll)) {
        return '0';
      }
      return selectedStyle.value.paddingAll || '';
    },
    set(val) {
      selectedStyle.value.paddingAll = val;
    },
  });
  const handleFocus = (c) => {
    curFocus.value = c;
  };
  const handleBlur = (e, position) => {
    curFocus.value = '';
    if (e.target.value === '') {
      switch (position) {
        case 'marginTop':
          marginTop.value = '0';
          break;
        case 'marginBottom':
          marginBottom.value = '0';
          break;
        case 'marginLeft':
          marginLeft.value = '0';
          break;
        case 'marginRight':
          marginRight.value = '0';
          break;
        case 'paddingTop':
          paddingTop.value = '0';
          break;
        case 'paddingBottom':
          paddingBottom.value = '0';
          break;
        case 'paddingLeft':
          paddingLeft.value = '0';
          break;
        case 'paddingRight':
          paddingRight.value = '0';
          break;
        default:
          break;
      }
    }
  };

  const handleChange = () => {
    changeMarginOrPadding(false);
  };

  const inptRef = ref();
  onClickOutside(inptRef, () => {
    curFocus.value = '';
  });
</script>

<style lang="less" scoped>
  .container {
    display: flex;
    justify-content: center;

    .box {
      position: relative;
      width: 176px;
      height: 98px;
      margin-top: 30px;
      border: 1px solid @gct-input-border-color;
      border-radius: 4px;
      // background: #fafafa;

      .box-inner {
        position: absolute;
        top: 50%;
        left: 50%;
        width: 104px;
        height: 52px;
        transform: translate(-50%, -50%);
        border: 1px dashed @gct-modal-border-color;
        border-radius: 4px;

        &-line {
          position: absolute;
          background-color: #c3c3c3;

          &.highlight {
            background-color: var(--ant-primary-color);
          }

          &.line-top,
          &.line-bottom {
            top: -13px;
            right: 50%;
            width: 2px;
            height: 13px;
            transform: translateX(-50%);

            &.line-padding {
              top: 0;
              height: 12px;
            }
          }

          &.line-bottom {
            top: unset;
            bottom: -13px;

            &.line-padding {
              top: unset;
              bottom: 0;
            }
          }

          &.line-left,
          &.line-right {
            top: 50%;
            left: -18px;
            width: 18px;
            height: 2px;
            transform: translateY(-50%);

            &.line-padding {
              left: 0;
            }
          }

          &.line-right {
            right: -18px;
            left: unset;

            &.line-padding {
              right: 0;
              left: unset;
            }
          }
        }
      }

      .input {
        position: absolute;
        width: 48px;
        height: 24px;
        padding: 0 4px;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
        border-radius: 4px;

        &:focus {
          border-color: var(--ant-primary-color);
        }
      }

      .top {
        top: -14px;
        left: 50%;
        transform: translateX(-50%);
      }

      .right {
        top: 50%;
        right: -25px;
        transform: translateY(-50%);
      }

      .bottom {
        bottom: -14px;
        left: 50%;
        transform: translateX(-50%);
      }

      .left {
        top: 50%;
        left: -25px;
        transform: translateY(-50%);
      }

      .center {
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }

  :deep(.ant-tabs-nav) {
    margin-bottom: 0;
  }

  :deep(.ant-tabs-nav-wrap) {
    padding: 0 12px;
  }

  :deep(.ant-tabs-tab) {
    padding: 4px 0;
    font-size: 12px;
  }

  :deep(.ant-input-affix-wrapper-focused) {
    box-shadow: 0 0 0 1px var(--ant-primary-color) !important;
  }
</style>
