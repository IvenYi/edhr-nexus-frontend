<template>
  <div class="spacing-editor">
    <a-tabs v-if="showArea.length > 1" v-model:activeKey="activeTab" class="margin-padding-tabs">
      <a-tab-pane key="margin" tab="外边距" />
      <a-tab-pane key="padding" tab="内边距" />
    </a-tabs>
    <div v-else class="label">
      {{ showArea.includes('margin') ? '外边距' : '内边距' }}
    </div>
    <div class="spacing-editor__container pb20px">
      <div class="box" v-if="activeTab === 'margin'">
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
        <a-input-number
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
          class="top input"
          v-model:value="marginTop"
          @focus="handleFocus('top')"
          @blur="handleBlur($event, 'marginTop')"
        />
        <a-input-number
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
          class="right input"
          v-model:value="marginRight"
          @focus="handleFocus('right')"
          @blur="handleBlur($event, 'marginRight')"
        />
        <a-input-number
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
          class="bottom input"
          v-model:value="marginBottom"
          @focus="handleFocus('bottom')"
          @blur="handleBlur($event, 'marginBottom')"
        />
        <a-input-number
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
          class="left input"
          v-model:value="marginLeft"
          @focus="handleFocus('left')"
          @blur="handleBlur($event, 'marginLeft')"
        />
        <a-input-number
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
          class="center input"
          v-model:value="marginAll"
          @focus="handleFocus('center')"
          @blur="handleBlur($event, 'marginAll')"
        />
      </div>
      <div class="box" v-if="activeTab === 'padding'">
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
        <a-input-number
          class="top input"
          v-model:value="paddingTop"
          @focus="handleFocus('top')"
          @blur="handleBlur($event, 'paddingTop')"
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
        />
        <a-input-number
          class="right input"
          v-model:value="paddingRight"
          @focus="handleFocus('right')"
          @blur="handleBlur($event, 'paddingRight')"
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
        />
        <a-input-number
          class="bottom input"
          v-model:value="paddingBottom"
          @focus="handleFocus('bottom')"
          @blur="handleBlur($event, 'paddingBottom')"
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
        />
        <a-input-number
          class="left input"
          v-model:value="paddingLeft"
          @focus="handleFocus('left')"
          @blur="handleBlur($event, 'paddingLeft')"
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
        />
        <a-input-number
          class="center input"
          v-model:value="paddingAll"
          @focus="handleFocus('center')"
          @blur="handleBlur($event, 'paddingAll')"
          :allowClear="false"
          :controls="false"
          size="small"
          :min="0"
          :max="999"
          :step="1"
          :precision="0"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, toRefs, computed, onMounted } from 'vue';
  import { IPadding, IMargin, ISpacing } from '../../../../interface';
  import { emitFieldSet, parseValueUnit } from '@gct/runtime';

  const props = withDefaults(
    defineProps<{
      padding: IPadding;
      margin: IMargin;
      showArea?: Array<'padding' | 'margin'>;
    }>(),
    {
      showArea: () => ['padding', 'margin'],
    },
  );

  const emit = defineEmits<{
    (e: 'update:padding', value: IPadding | undefined): void;
    (e: 'update:margin', value: IMargin | undefined): void;
  }>();

  // 激活分页
  const _activeTab = ref('margin');
  const activeTab = computed({
    get: () => {
      return props.showArea.length > 1 ? _activeTab.value : props.showArea[0];
    },
    set: (val) => {
      if (props.showArea.length > 1) {
        _activeTab.value = val;
      }
    },
  });

  // 聚焦样式
  const curFocus = ref();

  const handleFocus = (c) => {
    curFocus.value = c;
  };
  const handleBlur = (e, position) => {
    curFocus.value = '';
  };

  type ILocalSpacing = {
    top: number;
    right: number;
    bottom: number;
    left: number;
    center: number | undefined;
  };

  function calcLocalSpacing(spacing?: ISpacing): ILocalSpacing {
    function toNum(val) {
      return val ? parseValueUnit(val).value : 0;
    }
    const nums = {
      top: toNum(spacing?.top),
      right: toNum(spacing?.right),
      bottom: toNum(spacing?.bottom),
      left: toNum(spacing?.left),
    };
    const isSame = nums.top === nums.right && nums.top === nums.bottom && nums.top === nums.left;
    return {
      top: nums.top,
      right: nums.right,
      bottom: nums.bottom,
      left: nums.left,
      center: isSame ? nums.top : undefined,
    };
  }

  function calcEmitSpacing(local: ILocalSpacing, isCenterChange: boolean = false): ISpacing {
    const centerVal = local.center ? local.center : 0;
    return {
      top: (isCenterChange ? centerVal : local.top || 0) + 'px',
      right: (isCenterChange ? centerVal : local.right || 0) + 'px',
      bottom: (isCenterChange ? centerVal : local.bottom || 0) + 'px',
      left: (isCenterChange ? centerVal : local.left || 0) + 'px',
    };
  }

  const _localPadding = computed(() => {
    return calcLocalSpacing(props.padding);
  });
  const {
    top: paddingTop,
    bottom: paddingBottom,
    left: paddingLeft,
    right: paddingRight,
    center: paddingAll,
  } = emitFieldSet(_localPadding, (f, v, obj) => {
    emit('update:padding', calcEmitSpacing(obj, f === 'center'));
  });

  const _localMargin = computed(() => {
    return calcLocalSpacing(props.margin);
  });
  const {
    top: marginTop,
    bottom: marginBottom,
    left: marginLeft,
    right: marginRight,
    center: marginAll,
  } = emitFieldSet(_localMargin, (f, v, obj) => {
    emit('update:margin', calcEmitSpacing(obj, f === 'center'));
  });
</script>

<style lang="less" scoped>
  .ant-input-number {
    &::before {
      content: 'px';
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      right: 3px;
      font-size: 12px;
      color: #797a7d;
    }

    :deep(input) {
      padding-left: 4px;
      font-size: 12px;
    }
  }

  .spacing-editor__container {
    display: flex;
    justify-content: center;

    // // input
    // .ant-input {
    //   // &-number,
    //   &-number-group-wrapper {
    //     min-width: 0;
    //     width: 48px !important;
    //     max-width: auto;
    //   }
    // }

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
        min-width: 0;
        width: 48px !important;
        height: 24px;
        padding: 0 3px;
        border: 1px solid #d9d9d9;
        border-radius: 2px;
        border-radius: 4px;
        color: #212528;

        &:has(:focus) {
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
        right: -24px;
        transform: translateY(-50%);
      }

      .bottom {
        bottom: -14px;
        left: 50%;
        transform: translateX(-50%);
      }

      .left {
        top: 50%;
        left: -24px;
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
