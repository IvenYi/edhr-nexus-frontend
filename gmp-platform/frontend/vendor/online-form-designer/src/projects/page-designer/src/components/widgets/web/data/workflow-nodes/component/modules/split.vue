<template>
  <div ref="outerWrapper" :class="wrapperClasses">
    <div v-if="isHorizontal" :class="`${prefix}-horizontal`">
      <div :style="{ right: `${anotherOffset}%` }" class="left-pane" :class="paneClasses">
        <slot name="left"></slot>
      </div>
      <div
        :class="`${prefix}-trigger-con`"
        :style="{ left: `${offset}%` }"
        @mousedown="handleMousedown"
      >
        <slot name="trigger">
          <trigger mode="vertical" />
        </slot>
      </div>
      <div :style="{ left: `${offset}%` }" class="right-pane" :class="paneClasses">
        <slot name="right"></slot>
      </div>
    </div>
    <div v-else :class="`${prefix}-vertical`">
      <div :style="{ bottom: `${anotherOffset}%` }" class="top-pane" :class="paneClasses">
        <slot name="top"></slot>
      </div>
      <div
        :class="`${prefix}-trigger-con`"
        :style="{ top: `${offset}%` }"
        @mousedown="handleMousedown"
      >
        <slot name="trigger">
          <trigger mode="horizontal" />
        </slot>
      </div>
      <div :style="{ top: `${offset}%` }" class="bottom-pane" :class="paneClasses">
        <slot name="bottom"></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" name="gct-split">
  import { ref, nextTick, onBeforeUnmount, onMounted, computed, watch } from 'vue';
  import trigger from './trigger.vue';

  const props = defineProps({
    modelValue: {
      type: [Number, String],
      default: 0.5,
    },
    mode: {
      type: String,
      validator(value: string): boolean {
        return ['horizontal', 'vertical'].includes(value);
      },
      default: 'horizontal',
    },
    min: {
      type: [Number, String],
      default: '40px',
    },
    max: {
      type: [Number, String],
      default: '40px',
    },
  });

  const outerWrapper = ref(null);

  const prefix = ref('gct-split');
  const offset = ref(0);
  const oldOffset = ref(0);
  const initOffset = ref(0);
  const isMoving = ref(false);
  const computedMin = ref(0);
  const computedMax = ref(0);
  const currentValue = ref(0.5);

  const wrapperClasses = computed(() => [
    `${prefix.value}-wrapper`,
    isMoving.value ? 'no-select' : '',
  ]);

  const paneClasses = computed(() => [
    `${prefix.value}-pane`,
    {
      [`${prefix.value}-pane-moving`]: isMoving.value,
    },
  ]);

  const isHorizontal = computed(() => props.mode === 'horizontal');

  const anotherOffset = computed(() => 100 - offset.value);

  const valueIsPx = computed(() => typeof props.modelValue === 'string');

  const offsetSize = computed(() => (isHorizontal.value ? 'offsetWidth' : 'offsetHeight'));

  const px2percent = (numerator: string | number, denominator: string | number): number => {
    return parseFloat(numerator.toString()) / parseFloat(denominator.toString());
  };

  const getComputedThresholdValue = (type: 'min' | 'max'): number | string => {
    const size = outerWrapper.value ? outerWrapper.value[offsetSize.value] : 0;
    if (valueIsPx.value) {
      return typeof props[type] === 'string'
        ? props[type]
        : size * parseFloat(props[type].toString());
    } else {
      return typeof props[type] === 'string'
        ? px2percent(props[type], size)
        : parseFloat(props[type].toString());
    }
  };

  const getMax = (value1: string | number, value2: string | number): string | number => {
    if (valueIsPx.value) {
      return `${Math.max(parseFloat(value1.toString()), parseFloat(value2.toString()))}px`;
    } else {
      return Math.max(parseFloat(value1.toString()), parseFloat(value2.toString()));
    }
  };

  const getAnotherOffset = (value: string | number): string | number => {
    let res = 0;
    if (valueIsPx.value) {
      res = `${
        (outerWrapper.value ? outerWrapper.value[offsetSize.value] : 0) -
        parseFloat(value.toString())
      }px`;
    } else {
      res = 1 - parseFloat(value.toString());
    }
    return res;
  };

  const handleMove = (e: MouseEvent) => {
    const pageOffset = isHorizontal.value ? e.pageX : e.pageY;
    const offsetValue = pageOffset - initOffset.value;
    const outerWidth = outerWrapper.value ? outerWrapper.value[offsetSize.value] : 0;
    let value = valueIsPx.value
      ? `${parseFloat(oldOffset.value.toString()) + offsetValue}px`
      : px2percent(outerWidth * parseFloat(oldOffset.value.toString()) + offsetValue, outerWidth);
    let anotherValue = getAnotherOffset(value);
    if (parseFloat(value.toString()) <= parseFloat(computedMin.value.toString())) {
      value = getMax(value, computedMin.value);
    }
    if (parseFloat(anotherValue.toString()) <= parseFloat(computedMax.value.toString())) {
      value = getAnotherOffset(getMax(anotherValue, computedMax.value));
    }
    (e as any).atMin = props.modelValue === computedMin.value;
    (e as any).atMax = valueIsPx.value
      ? getAnotherOffset(props.modelValue) === computedMax.value
      : getAnotherOffset(props.modelValue).toFixed(5) === computedMax.value.toFixed(5);
    emit('update:modelValue', value);
    emit('on-moving', e);
  };

  const handleUp = () => {
    isMoving.value = false;
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mouseup', handleUp);
    emit('on-move-end');
  };

  const handleMousedown = (e: MouseEvent) => {
    initOffset.value = isHorizontal.value ? e.pageX : e.pageY;
    oldOffset.value = parseFloat(props.modelValue.toString());
    isMoving.value = true;
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    emit('on-move-start');
  };

  const computeOffset = () => {
    nextTick(() => {
      computedMin.value = getComputedThresholdValue('min');
      computedMax.value = getComputedThresholdValue('max');
      offset.value =
        ((valueIsPx.value
          ? px2percent(
              props.modelValue,
              outerWrapper.value ? outerWrapper.value[offsetSize.value] : 0,
            )
          : parseFloat(props.modelValue.toString())) *
          10000) /
        100;
    });
  };

  watch(
    () => props.modelValue,
    (val) => {
      if (val !== currentValue.value) {
        currentValue.value = val;
        computeOffset();
      }
    },
  );

  onMounted(() => {
    computeOffset();
    window.addEventListener('resize', computeOffset);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', computeOffset);
  });

  const emit = defineEmits<{
    (e: 'update:modelValue', value: string | number): void;
    (e: 'on-moving', e: MouseEvent): void;
    (e: 'on-move-end'): void;
    (e: 'on-move-start'): void;
    (e: 'on-init'): void;
  }>();
</script>

<style lang="less">
  @split-prefix-cls: ~'gct-split';
  @box-shadow: 0 0 4px 0 rgba(28, 36, 56, 0.4);
  @trigger-bar-background: rgba(23, 35, 61, 0.25);
  @trigger-background: #f8f8f9;
  @trigger-width: 6px;
  @trigger-bar-width: 4px;
  @trigger-bar-offset: (@trigger-width - @trigger-bar-width) / 2;
  @trigger-bar-interval: 3px;
  @trigger-bar-weight: 1px;
  @trigger-bar-con-height: (@trigger-bar-weight + @trigger-bar-interval) * 8;

  .@{split-prefix-cls} {
    &-wrapper {
      position: relative;
      width: 100%;
      height: 100%;
    }
    &-pane {
      position: absolute;
      &.left-pane,
      &.right-pane {
        top: 0;
        bottom: 0;
      }
      &.left-pane {
        left: 0;
      }
      &.right-pane {
        right: 0;
      }
      &.top-pane,
      &.bottom-pane {
        left: 0;
        right: 0;
      }
      &.top-pane {
        top: 0;
      }
      &.bottom-pane {
        bottom: 0;
      }

      &-moving {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
      }
    }
    &-trigger {
      border: 1px solid @border-color-base;
      &-con {
        position: absolute;
        transform: translate(-50%, -50%);
        z-index: 10;
      }
      &-bar-con {
        position: absolute;
        overflow: hidden;
        &.vertical {
          left: @trigger-bar-offset;
          top: 50%;
          height: @trigger-bar-con-height;
          transform: translate(0, -50%);
        }
        &.horizontal {
          left: 50%;
          top: @trigger-bar-offset;
          width: @trigger-bar-con-height;
          transform: translate(-50%, 0);
        }
      }
      &-vertical {
        width: @trigger-width;
        height: 100%;
        background: @trigger-background;
        border-top: none;
        border-bottom: none;
        cursor: col-resize;
        .@{split-prefix-cls}-trigger-bar {
          width: @trigger-bar-width;
          height: 1px;
          background: @trigger-bar-background;
          float: left;
          margin-top: @trigger-bar-interval;
        }
      }
      &-horizontal {
        height: @trigger-width;
        width: 100%;
        background: @trigger-background;
        border-left: none;
        border-right: none;
        cursor: row-resize;
        .@{split-prefix-cls}-trigger-bar {
          height: @trigger-bar-width;
          width: 1px;
          background: @trigger-bar-background;
          float: left;
          margin-right: @trigger-bar-interval;
        }
      }
    }
    &-horizontal {
      width: 100%;
      height: 100%;
      > .@{split-prefix-cls}-trigger-con {
        top: 50%;
        height: 100%;
        width: 0;
      }
    }
    &-vertical {
      width: 100%;
      height: 100%;
      > .@{split-prefix-cls}-trigger-con {
        left: 50%;
        height: 0;
        width: 100%;
      }
    }
    .no-select {
      -webkit-touch-callout: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
  }
</style>
