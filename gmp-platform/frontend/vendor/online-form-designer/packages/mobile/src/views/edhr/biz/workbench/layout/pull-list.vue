<template>
  <van-pull-refresh class="pull-list pt-8px" v-model="refreshing" @refresh="onRefresh">
    <Empty
      v-if="finished && list.length == 0"
      class="h-full rounded-12px"
      description="暂无数据"
      :size="[90, 66]"
    />
    <van-list
      v-else
      class="h-full"
      v-model:loading="loading"
      :finished="finished"
      finished-text=""
      @load="onLoad"
    >
      <template v-for="item in list">
        <slot name="item" :item="item"></slot>
      </template>
    </van-list>
  </van-pull-refresh>
</template>

<script lang="ts" setup name="pull-list">
  import { i18n } from '@mobile/locales/setupI18n';
  import Empty from '@mobile/views/edhr/_comps_/empty/empty.vue';

  const { t } = i18n.global;

  const loading = ref(false);
  const finished = ref(false);
  const list = ref([]);
  const pageNo = ref(0);
  const refreshing = ref(false);

  const props = withDefaults(
    defineProps<{
      loadApi: (params: { currentPage: number }) => Promise<{
        data: any[];
        totalPage: number;
      }>;
    }>(),
    {},
  );

  const onLoad = async () => {
    loading.value = true;
    try {
      pageNo.value++;
      const res = await props.loadApi({
        currentPage: pageNo.value,
      });
      console.log('res', res);
      list.value.push(...res.data);
      finished.value = pageNo.value >= res.totalPage;
    } catch (error) {
      console.error(error);
      finished.value = true;
    } finally {
      loading.value = false;
    }
  };

  const onRefresh = () => {
    finished.value = false;
    pageNo.value = 0;
    list.value = [];
    refreshing.value = false;
    onLoad();
  };

  defineExpose({
    refresh: onRefresh,
  });

</script>

<style lang="less" scoped>
  .pull-list {
    height: 100%;
    overflow: auto;

    :deep(.van-empty) {
      background-color: #fff;
    }
  }
</style>
