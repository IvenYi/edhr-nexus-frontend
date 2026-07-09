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
    <!-- <i class="icon-dot" v-if="!useDynamicColor"></i> -->
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
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

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
    if (props.useDynamicColor) {
      const config = useInstanceThemeConfig({
        formType: props.formType,
        dataStatus: props.dataStatus,
        instanceStatus: props.instanceStatus,
        statusType: props.statusType,
        isFormSummary: props.isFormSummary,
      });
      return {
        baseClass: [base, `${base}--dynamic`],
        ...config,
      };
    }

    return {
      placeholder: props.instanceStatus
        ? t(`sys.edhr.instanceStatus2FormEnum.${props.instanceStatus}`)
        : '',
      baseClass: [base, `${base}--static`, `${base}--${props.instanceStatus}`],
    };
  });
</script>

<style scoped lang="less">
  .instance-status-wrapper {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    overflow: hidden;

    &.instance-status-label {
      &--UNFILLED,
      &--UNRELEASED {
        --color: #de5e5f;
      }

      &--RUNNING,
      &--running,
      &--RELEASE {
        --color: #026ac8;
      }

      &--COMPLETED,
      &--finished {
        --color: #309c41;
      }

      &--ARCHIVED,
      &--IN_AUDIT {
        --color: #dda200;
      }

      &--EXCEPTION {
        --color: var(--ant-warning-color);
      }

      &--IN_SUMMARY {
        --color: #ff9442;
      }

      &--SUMMARIZED {
        --color: #aa78ff;
      }

      &--static {
        .instance-title {
          color: var(--color, rgba(96, 98, 102, 1));
          padding: 0;
        }
      }
    }

    .icon-dot {
      width: 4px;
      height: 4px;
      margin-right: 4px;
      border-radius: 50%;
      background-color: var(--color, transparent);
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
      background: var(--nocode-bgColor);
      border-radius: 4px;
      padding: 0 6px;
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
  }
</style>
