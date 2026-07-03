<template>
  <div :class="`${prefixCls}-action-wrap`">
    <div
      :class="`${prefixCls}-action ${option.id}`"
      v-for="option in createAppMenuOptions"
      :key="option.id"
      @click="$emit('create-app', option.id)"
    >
      <div :class="`${prefixCls}-action-icon`">
        <component :is="icons[option.icon]" />
      </div>
      <div :class="`${prefixCls}-action-title`">{{ option.title }}</div>
    </div>
  </div>
</template>

<script setup lang="ts" name="app-center-header">
  import { createAppMenuOptions } from '/@/components/AppManageCmp/src/constant/interface';
  import BulletinIcon from './Icon/bulletin-icon.vue';
  import MajorIcon from './Icon/major-icon.vue';
  import MicroIcon from './Icon/micro-icon.vue';

  interface Props {
    prefixCls: string;
  }

  defineProps<Props>();

  defineEmits(['create-app']);

  const icons = {
    BulletinIcon,
    MajorIcon,
    MicroIcon,
  };
</script>

<style lang="less">
  @prefix-cls: ~'@{namespace}-application-manage-cmp';

  .@{prefix-cls}-action-wrap {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 16px;
    padding-bottom: 16px;
  }

  .@{prefix-cls}-action {
    position: relative;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 16px 20px;
    transition: all 0.3s;
    cursor: pointer;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      width: 64px;
      height: 64px;
      background-color: rgba(255, 255, 255, 0.1);
      right: 0;
      top: 0;
      border-bottom-left-radius: 80%;
    }

    &.PRO {
      background: #0daa9c;
    }

    &.MICRO {
      background: #ff882c;
    }

    &.BI {
      background: #407bf1;
    }
    &:hover {
      box-shadow: 0px 5px 12px 0px rgba(0, 0, 0, 0.12);

      // .@{prefix-cls}-action-title {
      //   color: var(--ant-primary-color);
      // }
    }

    &-icon {
      width: 68px;
      height: 68px;
      background: rgba(255, 255, 255, 0.17);
      border-radius: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-shrink: 0;
    }

    &-title {
      font-size: 18px;
      color: #fff;
      line-height: 24px;
      margin-left: 12px;
      transition: all 0.3s;
    }
  }
</style>
