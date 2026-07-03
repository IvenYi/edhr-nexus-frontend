<template>
  <div>
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh" :head-height="headHeight">
      <van-list
        v-model:loading="loading"
        :finished="finished"
        :finished-text="finishedText"
        :immediate-check="false"
        @load="onLoad"
      >
        <slot :list="list"></slot>
      </van-list>
    </van-pull-refresh>
    <slot name="empty" v-if="!list.length && finished">
      <Empty class="h-full" description="暂无搜索结果" />
    </slot>
  </div>
</template>

<script setup lang="ts">
  import { useList } from '@mobile/views/edhr/_hooks_/useList';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';

  const props = defineProps<{
    loader: Function;
    pageSize?: number;
    headHeight?: number;
  }>();

  const { loading, finished, refreshing, list, onLoad, onRefresh, loadList, finishedText } =
    useList<any>({
      loader: props.loader,
      pageSize: props.pageSize,
    });
  loadList();

  defineExpose({
    onSearch: onRefresh,
  });
</script>

<style scoped lang="less"></style>
