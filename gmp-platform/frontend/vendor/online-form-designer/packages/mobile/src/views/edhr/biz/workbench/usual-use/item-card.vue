<template>
  <div :class="['item-card']">
    <div class="item-card__icon">
      <gct-icon :value="_icon" color="#fff" :size="28" />
    </div>
    <span class="item-card__title">{{ title }}</span>
  </div>
</template>

<script lang="ts" setup name="item-card">
  import { i18n } from '@mobile/locales/setupI18n';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      icon: string;
      bgColor: string;
      title: string;
    }>(),
    {},
  );

  const _icon = computed(() => {
    return props.icon ? props.icon : 'iconfont:icon-shangchuanwenjian2';
  });
</script>

<style lang="less" scoped>
  .item-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    &__icon {
      flex-shrink: 0;
      width: 56px;
      height: 56px;
      border-radius: 15px 15px 15px 15px;
      margin-bottom: 10px;
      background-color: v-bind('props.bgColor');
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    &__title {
      font-weight: 400;
      font-size: 14px;
      line-height: 1;
      color: #1a1d23;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
</style>
