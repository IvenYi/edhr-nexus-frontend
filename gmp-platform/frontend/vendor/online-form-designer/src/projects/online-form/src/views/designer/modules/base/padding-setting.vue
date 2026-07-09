<template>
  <div class="padding-setting">
    <div class="padding-setting__inner">
      <a-input-number
        class=""
        size="small"
        :allowClear="false"
        :controls="false"
        :min="0"
        :max="999"
        :step="1"
        :precision="0"
        v-model:value="centerValue"
        @change="handleCenterValueChange"
        :disabled="disabled"
      />
    </div>
    <a-input-number
      class="padding-value padding-value__left"
      size="small"
      v-model:value="left"
      :allowClear="false"
      :controls="false"
      :min="0"
      :max="999"
      :step="1"
      :precision="0"
      @change="handleValuesChange"
      :disabled="disabled"
    />
    <a-input-number
      class="padding-value padding-value__right"
      size="small"
      v-model:value="right"
      :allowClear="false"
      :controls="false"
      :min="0"
      :max="999"
      :step="1"
      :precision="0"
      @change="handleValuesChange"
      :disabled="disabled"
    />
    <a-input-number
      class="padding-value padding-value__top"
      size="small"
      v-model:value="top"
      :allowClear="false"
      :controls="false"
      :min="0"
      :max="999"
      :step="1"
      :precision="0"
      @change="handleValuesChange"
      :disabled="disabled"
    />
    <a-input-number
      class="padding-value padding-value__bottom"
      size="small"
      v-model:value="bottom"
      :allowClear="false"
      :controls="false"
      :min="0"
      :max="999"
      :step="1"
      :precision="0"
      @change="handleValuesChange"
      :disabled="disabled"
    />
  </div>
</template>

<script setup lang="ts">
  import { isNil } from 'lodash-es';
  import { computed, ref, watch } from 'vue';

  const props = defineProps<{
    padding: { t?: number; r?: number; b?: number; l?: number };
    disabled?: boolean;
  }>();

  const top = computed({
    get() {
      return props.padding.t;
    },
    set(value) {
      Object.assign(props.padding, { t: value });
    },
  });

  const right = computed({
    get() {
      return props.padding.r;
    },
    set(value) {
      Object.assign(props.padding, { r: value });
    },
  });

  const bottom = computed({
    get() {
      return props.padding.b;
    },
    set(value) {
      Object.assign(props.padding, { b: value });
    },
  });

  const left = computed({
    get() {
      return props.padding.l;
    },
    set(value) {
      Object.assign(props.padding, { l: value });
    },
  });

  const centerValue = ref();

  const handleCenterValueChange = (value) => {
    if (!isNil(value)) {
      Object.assign(props.padding, { l: value, r: value, t: value, b: value });
    }
  };

  const resetCenterValue = () => {
    // 是否四个方向的边距都相等（不为空）
    if (
      props.padding &&
      props.padding.l === props.padding.r &&
      props.padding.l === props.padding.t &&
      props.padding.l === props.padding.b &&
      !isNil(props.padding.l)
    ) {
      centerValue.value = props.padding.l;
    } else {
      centerValue.value = undefined;
    }
  };

  const handleValuesChange = () => {
    resetCenterValue();
  };

  // 每次padding引用变更时触发重算中间值
  watch(
    () => props.padding,
    () => {
      resetCenterValue();
    },
    { immediate: true },
  );
</script>

<style lang="less" scoped>
  .padding-setting {
    --padding-input-width: 48px;
    --padding-frame-inset-x: clamp(38px, 18%, 48px);
    --padding-frame-inset-y: 18px;
    --padding-inner-width: clamp(58px, 30%, 78px);
    --padding-inner-height: 50px;
    height: 126px;
    position: relative;
    padding: 13px 0;

    &::after {
      content: '';
      display: block;
      position: absolute;
      inset: var(--padding-frame-inset-y) var(--padding-frame-inset-x);
      border-radius: 8px;
      border: 1px solid #e2e8f0;
      background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
    }

    &__inner {
      width: var(--padding-inner-width);
      height: var(--padding-inner-height);
      border: 1px dashed #d9e2ec;
      position: absolute;
      top: 50%;
      left: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      transform: translate(-50%, -50%);
      z-index: 100;
      background-color: #fff;
      border-radius: 8px;
      box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04);

      & > span {
        width: var(--padding-input-width) !important;
      }
    }

    &:has(.padding-setting__inner input:focus) .padding-value {
      --line-color: var(--ant-primary-color);
    }

    .padding-value {
      position: absolute;
      z-index: 50;

      &__left {
        top: 50%;
        left: max(14px, calc(var(--padding-frame-inset-x) - (var(--padding-input-width) / 2)));
        transform: translateY(-50%);
      }
      &__right {
        top: 50%;
        right: max(14px, calc(var(--padding-frame-inset-x) - (var(--padding-input-width) / 2)));
        transform: translateY(-50%);
      }
      &__top {
        left: 50%;
        top: 0;
        transform: translateX(-50%);
      }
      &__bottom {
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
      }
    }
  }

  .ant-input-number {
    width: var(--padding-input-width) !important;
    border-color: #d9e2ec;
    border-radius: 5px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.03);
    &::before {
      content: 'mm';
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
</style>
