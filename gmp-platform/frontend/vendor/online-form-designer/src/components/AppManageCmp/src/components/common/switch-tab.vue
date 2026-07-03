<template>
  <div class="app-manage-cmp-switch-tab">
    <div
      v-for="tab of switchIcons"
      :key="tab.key"
      class="switch-item"
      :class="[showType === tab.name && 'selected']"
      @click.stop="() => onChangeTypeTab(tab)"
    >
      <i class="iconfont" :class="tab.icon"></i>
    </div>
  </div>
</template>
<script lang="ts" name="switch-tab" setup>
  import { useStorage } from '@vueuse/core';
  import { useUserStore } from '/@/store/modules/user';

  interface IProps {
    showType: 'Card' | 'List';
  }

  defineProps<IProps>();

  const userStore = useUserStore();

  const state = useStorage<{ [key: string]: any }>(
    `${userStore?.getUserInfo?.userId}_switch-tab`,
    () => {
      return {
        type: '',
      };
    },
  );

  const emit = defineEmits(['update:showType']);

  const switchIcons = [
    {
      icon: 'icon-kapian',
      name: 'Card',
      key: 'switch_icon_card',
    },
    {
      icon: 'icon-liebiao',
      name: 'List',
      key: 'switch_icon_list',
    },
  ];

  const onChangeTypeTab = (data) => {
    state.value.type = data.name;
    emit('update:showType', data.name);
  };
</script>
<style scoped lang="less">
  .app-manage-cmp-switch-tab {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    padding: 4px;
    border-radius: 4px;

    .switch-item {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      color: #999;

      border-radius: 2px;
      cursor: pointer;

      .iconfont {
        width: 24px;
        height: 24px;
        font-size: 16px;
        display: flex;
        justify-content: center;
      }

      &.selected {
        background-color: #fff;
        color: var(--ant-primary-color);
      }
    }
  }
</style>
