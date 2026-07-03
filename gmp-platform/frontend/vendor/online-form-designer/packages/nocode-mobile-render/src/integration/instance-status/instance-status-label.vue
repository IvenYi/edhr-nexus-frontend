<template>
  <div
    class="instance-status-wrapper"
    :class="themeConfig.baseClass"
    :style="{
      '--nocode-iconBgColor': themeConfig?.iconBackground,
      '--nocode-textColor': themeConfig?.textColor,
      '--nocode-bgColor': themeConfig?.background,
    }"
  >
    <i class="icon-dot" v-if="!useDynamicColor"></i>
    <span v-if="showIcon" class="instance-status-icon">
      <i class="iconfont icon-a-biaodan2"></i>
    </span>
    <slot name="instanceTitle"></slot>
    <span :class="['instance-title', needCustomClass ? 'is-custom-class' : '']">{{
      themeConfig?.placeholder
    }}</span>
  </div>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { FormTypeEnum } from '@gct/nocode-base';
  import { InstanceStatusValue } from './status';
  import { useInstanceThemeConfig } from './instance-theme-config';
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      formType?: FormTypeEnum;
      dataStatus?: string;
      instanceStatus: InstanceStatusValue;
      statusType?: string;
      useDynamicColor?: boolean;
      showIcon?: boolean;
      needCustomClass?: boolean;
      isFormSummary?: boolean;
    }>(),
    {
      useDynamicColor: false,
      showIcon: false,
      needCustomClass: false,
      isFormSummary: false,
    },
  );

  const themeConfig = computed(() => {
    const base = 'instance-status-label';

    const config = useInstanceThemeConfig({
      formType: props.formType,
      dataStatus: props.dataStatus,
      instanceStatus: props.instanceStatus,
      statusType: props.statusType,
      isFormSummary: props.isFormSummary,
    });

    return {
      baseClass: [base, props.useDynamicColor ? `${base}--dynamic` : `${base}--static`],
      ...config,
    };
  });

  defineExpose({
    themeConfig,
  });
</script>

<style scoped lang="less">
  .instance-status-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;

    .icon-dot {
      width: 6px;
      height: 6px;
      margin-right: 6px;
      border-radius: 50%;
      background-color: var(--nocode-iconBgColor, rgba(96, 98, 102, 1));
    }

    .instance-status-icon {
      display: flex;
      align-items: center;
      height: 32px;
      width: 32px;
      justify-content: center;
      color: #fff;
      background: var(--nocode-iconBgColor);
      border-radius: 2px;
      .iconfont {
        font-size: 18px;
      }
    }

    .instance-title {
      display: inline-block;
      line-height: 22px;
      font-size: 14px;
      color: var(--nocode-textColor);
      border-radius: 4px;
      &.is-custom-class {
        position: absolute;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        height: 18px;
        font-size: 12px;
        line-height: 18px;
        border-radius: 0 0 4px 4px;
      }
    }

    &.instance-status-label-dynamic {
      .instance-title {
        background: var(--nocode-bgColor);
        padding: 0 6px;
      }
    }
  }
</style>
