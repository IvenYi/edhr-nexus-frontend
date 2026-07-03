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
    height: 120px;
    position: relative;
    padding: 11px 24px;
    &::after {
      content: '';
      display: block;
      height: 100%;
      border-radius: 4px;
      border: 1px solid #e8ebf0;
    }

    &__inner {
      border: 1px dashed #e8ebf0;
      padding: 15px 22px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 100;
      background-color: #fff;
      border-radius: 4px;

      & > span {
        width: 48px !important;
      }
    }

    &:has(.padding-setting__inner input:focus) .padding-value {
      --line-color: var(--ant-primary-color);
    }

    .padding-value {
      position: absolute;
      z-index: 50;
      --line-color: #c3c3c3;
      &::after {
        content: '';
        position: absolute;
        height: 2px;
        width: 20px;
        background: var(--line-color);
      }

      &:has(:focus) {
        --line-color: var(--ant-primary-color);
      }

      &__left {
        top: 50%;
        left: 0;
        transform: translateY(-50%);
        &::after {
          top: 50%;
          left: 100%;
          transform: translateY(-50%);
        }
      }
      &__right {
        top: 50%;
        right: 0;
        transform: translateY(-50%);
        &::after {
          top: 50%;
          right: 100%;
          transform: translateY(-50%);
        }
      }
      &__top {
        left: 50%;
        top: 0;
        transform: translateX(-50%);
        &::after {
          left: 50%;
          top: 100%;
          transform: translateX(-50%);
          width: 2px;
          height: 20px;
        }
      }
      &__bottom {
        left: 50%;
        bottom: 0;
        transform: translateX(-50%);
        &::after {
          left: 50%;
          bottom: 100%;
          transform: translateX(-50%);
          width: 2px;
          height: 20px;
        }
      }
    }
  }

  .ant-input-number {
    width: 48px !important;
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
