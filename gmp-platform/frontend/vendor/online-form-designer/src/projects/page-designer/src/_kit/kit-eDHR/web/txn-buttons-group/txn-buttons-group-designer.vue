<template>
  <div class="txn-buttons-group">
    <Scrollbar>
      <a-button
        v-for="item in initialButtons"
        class="txn-buttons-group_item"
        size="large"
        block
        :key="item.name"
      >
        <span class="txn-buttons-group_item-name">{{ item.name }}</span>
        <span class="txn-buttons-group_item-count">{{ Math.floor(Math.random() * 10) }}</span>
      </a-button>
    </Scrollbar>
  </div>
</template>

<script lang="ts" setup>
  import { Scrollbar } from '/@/components/Scrollbar';
  import { ITxnButtonsGroup } from './schema';

  defineProps<{
    widget: ITxnButtonsGroup;
  }>();

  const initialButtons = [
    {
      name: '不良处置',
      icon: 'icon-baoliu',
    },
    {
      name: '报废',
      icon: 'icon-baofeiqingkuang',
    },
    {
      name: '维修',
      icon: 'icon-weixiu',
    },
    {
      name: '返工',
      icon: 'icon-gongxiang',
    },
  ];
</script>

<style lang="less" scoped>
  .txn-buttons-group {
    &_item {
      margin-bottom: 8px;
      background-color: #026ac80f;
      border: 1px solid #026ac833;
      font-size: 14px;
      display: flex;
      justify-items: space-between;
      align-items: center;
      gap: 12px;

      &-name {
        flex: 1;
        flex-shrink: 0;
        text-align: left;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      &-count {
        max-width: 48px;
        color: #8b8b8b;
        font-size: 12px;
      }

      &:hover {
        background-color: var(--ant-primary-color);
        border: 1px solid var(--ant-primary-color);
        color: #ffffff;
        .txn-buttons-group_item-count {
          color: #ffffff;
        }
      }
    }
  }
</style>
