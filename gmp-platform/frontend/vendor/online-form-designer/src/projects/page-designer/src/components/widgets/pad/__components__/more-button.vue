<template>
  <div class="more-button-wrapper align-middle whitespace-nowrap" :class="`btn-size-${btnSize}`">
    <van-button
      :loading="loading"
      :block="block"
      :type="btnType"
      :size="btnSize"
      :plain="plain"
      :disabled="disabled"
      class="more-button"
      :class="{
        dashed,
        link,
        'btn-font-color': hasFontColor,
        'btn-bg-style': hasBgColor,
        'btn-border-style': hasBorderColor,
      }"
      :style="{
        '--fontColor': fontColor,
        '--backgroundColor': backgroundColor,
        '--borderLeftColor': borderLeftColor,
      }"
    >
      <i class="icon gct-iconfont icon-ziduan-biaodananniu-quanbuzhedie"></i>
    </van-button>
  </div>
</template>
<script setup lang="ts" name="vantButton">
  import { computed } from 'vue';
  import { ButtonType, ButtonSize, ButtonType_vant, ButtonStyle } from '/@page-designer/enum';
  import { BaseButton } from '/@page-designer/types/mobile';

  const defProps = withDefaults(
    defineProps<{
      hasIcon: boolean;
      hasText: boolean;
      type: ButtonType;
      size: ButtonSize;
      danger: boolean;
      icon: string;
      title: string;
      disabled: boolean;
      hidden: boolean;
      i18nConfig: string;
      buttonStyle: string;
      confirmText: string;
      confirm: boolean;
      enableCustomColor: boolean;
      backgroundColor: string;
      fontColor: string;
      block: boolean;
      loading: boolean;
      widget?: BaseButton;
    }>(),
    {
      hasIcon: false,
      hasText: true,
      type: ButtonType.PRIMARY,
      size: ButtonSize.DEFAULT,
      danger: false,
      icon: '',
      title: '',
      disabled: false,
      hidden: false,
      i18nConfig: '',
      buttonStyle: ButtonStyle.ORDINARY,
      confirmText: '',
      confirm: false,
      enableCustomColor: false,
      backgroundColor: '',
      fontColor: '',
      block: false,
      loading: false,
    },
  );

  const btnType = computed((): ButtonType_vant => {
    if (defProps.danger) return ButtonType_vant.DANGER;
    else if (defProps.type === ButtonType.DASHED || defProps.type === ButtonType.DEFAULT)
      return ButtonType_vant.DEFAULT;
    else return ButtonType_vant.PRIMARY;
  });
  const plain = computed(() => {
    return defProps.type === ButtonType.DEFAULT && defProps.danger ? true : false;
  });

  const dashed = computed(() => {
    return defProps.type === ButtonType.DASHED ? true : false;
  });
  const link = computed(() => {
    return defProps.type === ButtonType.LINK ? true : false;
  });
  const btnSize = computed(() => {
    return defProps.size;
  });

  const hasFontColor = computed(() => {
    return defProps?.enableCustomColor && defProps?.fontColor;
  });

  const hasBgColor = computed(() => {
    return (
      defProps?.enableCustomColor &&
      defProps?.backgroundColor &&
      defProps.type === ButtonType_vant.PRIMARY
    );
  });

  const hasBorderColor = computed(() => {
    return (
      defProps?.enableCustomColor &&
      defProps?.backgroundColor &&
      btnType.value !== ButtonType_vant.PRIMARY
    );
  });

  const borderLeftColor = computed(() => {
    if (defProps.type === ButtonType.PRIMARY) {
      return '#fff';
    }
    if (defProps.type === ButtonType.DEFAULT && defProps.danger) {
      return 'inherit';
    }
    if (defProps.type === ButtonType.LINK) {
      return 'transparent';
    }
    if (defProps.enableCustomColor && defProps.type !== ButtonType.PRIMARY) {
      return defProps.backgroundColor;
    }
    return '#E0E3EB';
  });
</script>
<style lang="scss" scoped>
  .more-button-wrapper {
    display: inline-flex;
    padding: 0;
    margin: 0;

    &.btn-size-small {
      height: 28px;
    }

    &.btn-size-middle {
      height: 32px;
    }

    &.btn-size-large {
      height: 36px;
    }
  }

  :deep(.van-button) {
    padding: 0 8px;
  }

  :deep(.van-button--small) {
    height: 28px;
  }

  :deep(.van-button--middle) {
    height: 32px;
  }

  :deep(.van-button--large) {
    height: 36px;
  }

  :deep(.van-button) {
    &.btn-font-color {
      color: var(--fontColor) !important;
    }

    &.btn-bg-style {
      border-color: var(--backgroundColor) !important;
      background: var(--backgroundColor) !important;
    }

    &.btn-border-style {
      border-color: var(--backgroundColor) !important;
      background: transparent;
    }
    &.more-button {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left-style: solid;
      border-left-color: var(--borderLeftColor) !important;
    }
  }

  :deep(.van-button__icon) {
    font-size: 0;
  }

  .dashed {
    border-style: dashed;
  }

  .link {
    border: none;
    background-color: transparent;
    color: var(--van-primary-color);

    &:active {
      :deep(&::before) {
        opacity: 0;
      }
    }

    &:active::before {
      opacity: 0;
    }

    &::after {
      content: '';
      display: block;
      position: absolute;
      top: 50%;
      left: -1px;
      width: 1px;
      height: 16px;
      background-color: #e0e3eb;
      transform: translateY(-50%);
    }
  }
</style>
