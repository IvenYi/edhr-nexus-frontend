<template>
  <div class="whitespace-nowrap gct-pad-button">
    <van-button
      :loading="loading"
      :block="block"
      :type="btnType"
      :size="btnSize"
      :plain="plain"
      :disabled="disabled"
      @click="handleClick"
      :style="{
        '--fontColor': fontColor,
        '--backgroundColor': backgroundColor,
      }"
      :class="{
        dashed,
        link,
        'gct-van-button-icon-only': onlyIcon && !isMoreMenu,
        'btn-font-color': hasFontColor,
        'btn-bg-style': hasBgColor,
        'btn-border-style': hasBorderColor,
      }"
    >
      <!-- :class="{ dashed: dashed, link: link, 'gct-van-button-icon-only': hasIcon && !hasText }" -->
      <template #icon v-if="hasIcon && !isMoreMenu">
        <IconNext
          :size="iconSize"
          :value="icon"
          :style="{
            marginRight: '0px',
            '--color': 'inherit',
            lineHeight: '1',
          }"
        />
      </template>
      <!-- {{ hasText ? (i18nConfig ? $t(JSON.parse(i18nConfig)) : title) : '' }} -->

      <div class="btn-text">
        {{ hasText || isMoreMenu ? buttonTitle : '' }}
      </div>
    </van-button>
  </div>
</template>
<script setup lang="ts" name="vantButton">
  import { computed } from 'vue';
  import IconNext from '/@/components/Icon/src/IconNext.vue';
  import { ButtonType, ButtonSize, ButtonType_vant, ButtonStyle } from '/@page-designer/enum';
  import { showConfirmDialog } from 'vant';
  import { BaseButton } from '/@page-designer/types/mobile';

  const emit = defineEmits(['click']);
  const defProps = withDefaults(
    defineProps<{
      isMoreMenu: boolean;
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
      isCollapse?: boolean;
    }>(),
    {
      isMoreMenu: false,
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
      isCollapse: false,
    },
  );
  const buttonTitle = computed(
    () => defProps.title || $t(defProps.widget?.displayName || defProps.widget?.name || ''),
  );
  const btnType = computed((): ButtonType_vant => {
    if (defProps.isMoreMenu) return ButtonType_vant.DEFAULT;
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

  const onlyIcon = computed(() => {
    return defProps.hasIcon && !defProps.hasText;
  });

  const iconSize = computed(() => {
    const sizeMap = {
      [ButtonSize.SMALL]: 13,
      [ButtonSize.DEFAULT]: 15,
      [ButtonSize.LARGE]: 17,
    };
    return sizeMap[defProps.size] || 15;
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

  async function handleClick() {
    const isAppDesign = /\/page-designer\//.test(location.pathname);
    if (!isAppDesign && defProps.confirm) {
      await showConfirmDialog({
        message: defProps.confirmText || $t('sys.pageDesigner.confirmTodo'),
      });
    }
    emit('click');
  }
</script>
<style lang="less" scoped>
  .gct-pad-button {
    &.bottom-btn {
      display: block;
    }
    display: inline-flex;
  }

  :deep(.van-button--small) {
    height: 28px;
    font-size: 13px;

    &:not(.gct-van-button-icon-only) {
      min-width: 60px;
      padding: 0 12px;
    }

    &.gct-van-button-icon-only {
      width: 28px;
    }
  }

  :deep(.van-button--middle) {
    height: 32px;
    font-size: 15px;

    &:not(.gct-van-button-icon-only) {
      min-width: 64px;
      padding: 0 16px;
    }

    &.link {
      min-width: auto;
      padding: 0;
    }

    &.gct-van-button-icon-only {
      width: 32px;
    }

    .van-button__icon + .van-button__text {
      margin-left: 8px;
    }
  }

  :deep(.van-button--large) {
    height: 36px;
    font-size: 17px;

    &:not(.gct-van-button-icon-only) {
      min-width: 80px;
      padding: 0 16px;
    }

    &.gct-van-button-icon-only {
      width: 36px;
    }

    .van-button__icon + .van-button__text {
      margin-left: 8px;
    }
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
  }

  .gct-van-button-icon-only {
    :deep(.van-button__icon + .van-button__text) {
      margin-left: 0;
    }
  }

  .btn-text {
    max-width: 120px;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    white-space: nowrap;
  }
</style>
