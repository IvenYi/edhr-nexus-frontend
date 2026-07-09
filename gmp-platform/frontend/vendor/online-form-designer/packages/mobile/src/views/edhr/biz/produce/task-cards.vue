<template>
  <van-pull-refresh
    :class="{
      'h-full': taskCards.length === 0,
    }"
    v-model="taskCardsMeta.refreshing"
    @refresh="onRefresh"
  >
    <div v-if="taskCards.length === 0" class="h-full flex items-center flex-col pt-24%">
      <div class="h-148px w-148px">
        <img :src="NoData" alt="" class="w100% h100%" />
      </div>
      <span class="color-[#999999] mt-12px">暂无任务</span>
    </div>
    <van-list
      v-else
      v-model:loading="taskCardsMeta.loading"
      :finished="taskCardsMeta.finished"
      finished-text="没有更多了"
      :immediate-check="false"
      @load="onLoad"
    >
      <div
        class="task-card"
        :class="[index === taskCardIndex ? 'task-card--active' : '']"
        v-for="(task, index) in taskCards"
        :key="task.id"
        @click="toggleTaskCard(index)"
      >
        <div class="flex items-center">
          <TaskStatusTag
            class="mr-8px flex-none"
            :code="task.f_status__jhwd"
            :label="taskStatusEnumMap[task.f_status__jhwd].text"
          />
          <span
            class="text-14px font-bold ellipsis"
            :class="{
              'color--active': index === taskCardIndex,
            }"
          >
            {{ task.f_name__jhwd }}
          </span>
        </div>
        <div class="flex mt-8px">
          <DescriptionItem class="max-w-49% mr-2%" name="所属工单" :value="task.f_code__jhwd" />
          <DescriptionItem class="max-w-49%" name="所属订单" :value="task.f_order_code__jhwd" />
        </div>
        <div class="mt-4px">
          <DescriptionItem
            name="物料名称"
            :value="task._DICT['f_product_id__jhwd'][task.f_product_id__jhwd][0]"
          />
        </div>
      </div>
    </van-list>
  </van-pull-refresh>
</template>

<script setup lang="ts">
  import { useProduce } from './useProduce';
  import DescriptionItem from '@mobile/views/edhr/_comps_/description/item.vue';
  import TaskStatusTag from '@mobile/views/edhr/_comps_/status-tag/task-status-tag.vue';
  import NoData from '@mobile/assets/image/no-app.png';

  const props = defineProps<{
    hook?: Function;
  }>();

  const {
    taskCards,
    taskCardIndex,
    toggleTaskCard,
    taskCardsMeta,
    onLoad,
    onRefresh,
    taskStatusEnumMap,
  } = (props.hook ?? useProduce)();
</script>

<style scoped lang="less">
  .task-card {
    padding: 16px;

    &:not(:last-child) {
      border-bottom: 1px solid var(--border-color);
    }

    &--active {
      background: #f8f9fd;
      border-right: 2px solid #026ac8;
    }
  }
</style>
