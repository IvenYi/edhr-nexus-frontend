<template>
  <div class="inline-block align-middle whitespace-nowrap base-button">
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
        'gct-van-button-icon-only': onlyIcon,
        'btn-font-color': hasFontColor,
        'btn-bg-style': hasBgColor,
        'btn-border-style': hasBorderColor,
      }"
    >
      <template #icon v-if="hasIcon">
        <IconNext
          :size="14"
          :value="icon"
          :style="{
            marginRight: '0px',
            '--color': 'inherit',
            lineHeight: '1',
          }"
        />
      </template>
      {{ hasText ? buttonTitle : '' }}
    </van-button>
  </div>
</template>
<script setup lang="ts" name="vantButton">
  import { computed } from 'vue';
  import IconNext from '/@/components/Icon/src/IconNext.vue';

  import { ButtonType, ButtonSize, ButtonType_vant, ButtonStyle } from '@gct/runtime';
  import { showConfirmDialog } from 'vant';
  import { BaseButton } from '/@page-designer/types/mobile';

  const emit = defineEmits(['click']);
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
      buttonStyle: string;
      enableCustomColor: boolean;
      backgroundColor: string;
      fontColor: string;
      block: boolean;
      loading: boolean;
    }>(),
    {
      hasIcon: false,
      hasText: true,
      type: ButtonType.DEFAULT,
      size: ButtonSize.DEFAULT,
      danger: false,
      icon: '',
      title: '',
      disabled: false,
      hidden: false,
      buttonStyle: ButtonStyle.ORDINARY,
      enableCustomColor: false,
      backgroundColor: '',
      fontColor: '',
      block: false,
      loading: false,
    },
  );
  const buttonTitle = computed(() => defProps.title);
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
    if (defProps.size === ButtonSize.DEFAULT) return 'small';
    return 'small';
  });

  const onlyIcon = computed(() => {
    return defProps.hasIcon && !defProps.hasText;
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
    emit('click');
  }
</script>
<style lang="scss" scoped>
  .base-button {
    --van-button-small-height: 40px;
    --van-button-small-padding: 0 30px;
    --van-button-small-font-size: 15px;
    --van-button-radius: 6px;
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
</style>
