<template>
  <div class="produce-layout h-full">
    <QueryCards />
    <layout-section title="当前任务列表">
      <div class="h-full overflow-auto">
        <TaskCards />
      </div>
    </layout-section>
    <layout-section title="任务详情">
      <template v-if="taskCardDetail && taskCardDetail?.f_status__jhwd !== 'finished'" #extra>
        <van-button
          round
          color="linear-gradient(180deg, #0280F2 0%, #0056AA 95%)"
          :style="{
            '--van-button-default-height': '40px',
          }"
          @click="runTask"
        >
          <div class="flex items-center">
            <img class="h-16px w-16px mr-8px" :src="TaskExcuteSvg" />
            执行当前任务
          </div>
        </van-button>
      </template>
      <div class="h-full overflow-auto">
        <TaskDetail />
      </div>
    </layout-section>

    <FloatingScan @trigger="runScan" />
  </div>
</template>
<script setup lang="ts">
  import LayoutSection from '@mobile/views/edhr/_comps_/layout/section.vue';
  import QueryCards from './query-cards.vue';
  import TaskCards from './task-cards.vue';
  import TaskDetail from './task-detail.vue';
  import { useProduce } from './useProduce';
  import FloatingScan from '@mobile/views/edhr/_comps_/floating-btns/scan.vue';
  import TaskExcuteSvg from '@mobile/assets/svg/task-excute.svg';

  defineOptions({
    // eslint-disable-next-line vue/component-definition-name-casing
    name: 'edhr-produce',
  });

  const { runTask, runScan, taskCardDetail } = useProduce();
</script>
<style scoped lang="less">
  .produce-layout {
    display: grid;
    grid-gap: 16px;
    grid-template-columns: 440px 1fr;
    grid-template-rows: 56px 1fr;
    grid-template-areas:
      'tab tab'
      'list info';

    > div:nth-child(1) {
      grid-area: tab;
    }
    > div:nth-child(2) {
      grid-area: list;
    }
    > div:nth-child(3) {
      grid-area: info;
    }
  }
</style>
