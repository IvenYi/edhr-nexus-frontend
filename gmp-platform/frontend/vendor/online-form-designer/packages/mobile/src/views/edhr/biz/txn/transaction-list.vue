<template>
  <div :class="['transaction-list']">
    <div class="flex justify-between items-center px-16px h-50px">
      <span>
        <gct-icon class="mb-[-2px]" value="icon-preset:edhr-shengchanshiwu" :size="20" />
        <span class="ml-8px font-bold text-17px color-#1A1D23">生产事务</span>
      </span>
      <div class="w30px h30px rounded-6px bg-[#fff] ks-row-center-middle" @click="openList">
        <gct-icon class="mb-[-2px]" value="icon-a-Frame2" :size="16" />
      </div>
      <!-- <IconButton value="icon-preset:edhr-config" @click="handleConfig" /> -->
    </div>
    <div class="px-16px overflow-auto h-[calc(100%_-_50px)]">
      <div
        v-for="i in items"
        :key="i.name"
        class="mb8px flex items-center justify-between py-12px px-16px cursor-pointer bg-[rgba(255,255,255,0.7)] rounded-8px"
        @click="() => handleClick(i)"
      >
        <span class="transaction-list__item-name ks-col">{{ i.name }}</span>
        <span class="transaction-count">
          {{ i.count }}
        </span>
        <gct-icon class="ml-12px" value="icon-pad_arrow_right" color="#C6C6C6" :size="14" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup name="transaction-list">
  import { i18n } from '@mobile/locales/setupI18n';
  import IconButton from '@mobile/views/edhr/_comps_/layout/icon-button.vue';

  const { t } = i18n.global;

  const props = withDefaults(
    defineProps<{
      items?: any[];
    }>(),
    {
      items: () => [],
    },
  );

  const emit = defineEmits<{
    (e: 'click', txn: any): void;
    (e: 'config'): void;
    (e: 'open-list'): void;
  }>();

  const handleClick = (txn: any) => {
    emit('click', txn);
  };

  const handleConfig = () => {
    emit('config');
  };

  const openList = () => {
    emit('open-list');
  };
</script>

<style lang="less" scoped>
  .transaction-list {
    &__item-name {
      color: #1a1d23;
      font-size: 16px;
      font-weight: 400;

      // &::before {
      //   content: '';
      //   display: inline-block;
      //   width: 4px;
      //   height: 4px;
      //   margin-right: 8px;
      //   border-radius: 4px;
      //   background: #026ac8;
      //   vertical-align: middle;
      // }
    }
  }

  .transaction-count {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 4px 8px 0 rgb(0 0 0 / 6%);
    color: #5a5f6b;
    font-size: 12px;
    font-weight: 500;
    line-height: 22px;
    text-align: center;
  }
</style>
