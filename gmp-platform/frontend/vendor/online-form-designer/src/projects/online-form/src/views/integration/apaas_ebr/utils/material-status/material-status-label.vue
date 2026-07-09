<template>
  <span v-if="value" :class="baseClass" :style="customStyle">
    {{ label }}
  </span>
  <span v-else>--</span>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { MaterialStatusEnum } from './enum';

  const props = withDefaults(
    defineProps<{
      /** 要显示的状态 */
      value?: MaterialStatusEnum;
      /** 如果为 true，则使用「无状态」模式（动态背景色）；否则走预定义 class */
      useDynamicColor?: boolean;
    }>(),
    {
      useDynamicColor: true,
    },
  );

  const { t } = useI18n();

  // 文本
  const label = computed(() => (props.value ? t(`sys.edhr.materialStatus.${props.value}`) : '--'));

  const baseClass = computed(() => {
    const base = 'material-status-label';
    return props.useDynamicColor || !props.value
      ? [base, `${base}--dynamic`]
      : [base, `${base}--static`, `${base}--${props.value}`];
  });

  const themeConfigMap: Record<MaterialStatusEnum, string> = {
    FORM: '#3168ec',
    LOT: '#02c889',
    SN: '#a002c8',
    PRODUCT_RELEASE: '#dda200',
    LOT_SN_APPEND: '#3168ec',
    TXN: '#a002c8',
    NOTEBOOK: '#838383',
    DHR: '#02c889',
    REWORK: '#ff4d4f',
  };

  const customStyle = computed(() =>
    props.useDynamicColor && props.value
      ? {
          // backgroundColor: themeConfigMap[props.value] + '1A', // 半透明
          backgroundColor: '#f0f0f0', // 半透明
          color: themeConfigMap[props.value],
        }
      : {},
  );
</script>

<style lang="less" scoped>
  .material-status-label {
    display: inline-block;
    width: 48px;
    height: 22px;
    line-height: 22px;
    font-size: 14px;
    text-align: center;
    border-radius: 2px;
    &--static {
      color: #fff;
    }
    &--LOT {
      background-color: #3168ec;
    }
    &--SN {
      background-color: #a002c8;
    }
  }
</style>
