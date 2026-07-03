<template>
  <van-tabs v-model:active="activeTabKey" :line-width="100">
    <template #nav-right>
      <div class="ml-auto mr-1em flex items-center">
        <van-icon name="filter-o" size="1.8em" color="#027ae7" @click="onClick" />
      </div>
    </template>
    <van-tab title="待我审核">
      <AuditTodo :key="refreshKey" :query="todoQuery" />
    </van-tab>
    <van-tab title="我已审核">
      <AuditDone :key="refreshKey" :query="doneQuery" />
    </van-tab>
  </van-tabs>
</template>

<script setup lang="ts">
  import { useAudit } from './useAudit';
  import AuditTodo from './todo.vue';
  import AuditDone from './done.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import SearchFormPopup from './search-form-popup.vue';

  defineOptions({
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'edhr-audit',
  });

  const { activeTabKey, refreshKey, search } = useAudit();
  const todoQuery = ref({});
  const doneQuery = ref({});

  const onClick = () => {
    const type = activeTabKey.value === 0 ? 'todo' : 'done';
    const queryRef = activeTabKey.value === 0 ? todoQuery : doneQuery;
    GctPopup.open(SearchFormPopup, {
      context: {
        type: type,
        query: queryRef.value,
      },
      onOk: (data) => {
        queryRef.value = data;
        setTimeout(() => {
          search();
        }, 300);
      },
    });
  };
</script>

<style scoped lang="less">
  .van-tabs {
    height: 100%;

    :deep(.van-tabs__wrap) {
      border-bottom: 1px solid #eceff3;
    }

    :deep(.van-tab) {
      flex: none;
      width: 120px;
    }

    :deep(.van-tabs__content) {
      height: calc(100% - var(--van-tabs-line-height));
      overflow: auto;
    }
    :deep(.van-tab__panel) {
      height: 100%;
    }
  }
</style>
