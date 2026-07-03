<template>
  <div class="produce-run-layout h-full relative">
    <layout-section title="任务详情">
      <div class="h-full overflow-auto">
        <TaskRunDetail />
      </div>
    </layout-section>
    <div class="task-count flex flex-col">
      <div class="flex-none h-90px flex items-stretch">
        <layout-section
          class="w-252px flex-none mr-8px pt-8px pb-8px pl-16px pr-16px"
          :header="false"
        >
          <LayoutSubtitle title="任务进度" />
          <div class="lh-none mt-4px">
            <span class="font-bold text-32px">{{ containerOperationInfo?.report_qty_sum_ }}</span>
            <span class="text-20px color-[#5A5F6B] ml-3px"
              >/ {{ containerOperationInfo?.original_qty_ }}</span
            >
          </div>
          <div class="flex items-center -mt-3px">
            <van-progress
              class="flex-1"
              :percentage="containerOperationProcess > 100 ? 100 : containerOperationProcess"
              stroke-width="6"
              :show-pivot="false"
            />
            <span class="ml-10px flex-none text-14px">{{ containerOperationProcess }}%</span>
          </div>
        </layout-section>
        <layout-section class="flex-1 pt-8px pb-8px pl-16px pr-16px" :header="false">
          <LayoutSubtitle title="当前工序" arrow @click="toggleContainerOperation" />
          <div class="h-52px flex items-center">
            <div class="color--active ellipsis--2 lh-20px">{{
              containerOperationInfoById?.name_
            }}</div>
          </div>
        </layout-section>
      </div>
      <div class="mt-8px flex-1 flex items-stretch">
        <layout-section class="mr-8px flex-1 pt-8px pb-8px pl-16px pr-16px" :header="false">
          <LayoutSubtitle title="良品" arrow @arrow-click="viewReport" />
          <div class="text-32px lh-none mt-8px color-[#026AC8]">{{
            containerOperationInfo?.good_qty_sum_
          }}</div>
        </layout-section>
        <layout-section class="flex-1 pt-8px pb-8px pl-16px pr-16px" :header="false">
          <LayoutSubtitle title="报废" arrow @arrow-click="viewScrap" />
          <div class="text-32px lh-none mt-8px color-[#F5222D]">{{
            containerOperationInfo?.scrap_qty_sum_
          }}</div>
        </layout-section>
      </div>
    </div>
    <layout-section class="task-esop" title="SOP作业指导书">
      <EsopRender :file-meta="containerOperationEsopDetail" />
    </layout-section>

    <FloatingBtns :btns="floatingBtns" />
    <TaskStartBtn v-if="containerOperationInfo?.status_ === 'waiting'" @trigger="handleStartWork" />
    <TaskFinishBtn
      v-if="containerOperationInfo?.status_ === 'running'"
      @trigger="handleCompleteWork"
    />
  </div>
</template>

<script setup lang="ts">
  import { watch } from 'vue';
  import FloatingBtns from '@mobile/views/edhr/_comps_/floating-btns/index.vue';
  import EsopRender from '@mobile/views/edhr/_comps_/esop/esop-render.vue';
  import LayoutSection from '@mobile/views/edhr/_comps_/layout/section.vue';
  import LayoutSubtitle from '@mobile/views/edhr/_comps_/layout/subtitle.vue';
  import { useReworkRun } from './useReworkRun';
  import TaskRunDetail from './task-run-detail.vue';
  import ReworkPopup from '@mobile/views/edhr/_comps_/records/rework-popup.vue';
  import ScrapPopup from '@mobile/views/edhr/_comps_/records/scrap-popup.vue';
  import { GctPopup } from '@mobile/utils/popup';
  import TaskStartBtn from '@mobile/views/edhr/_comps_/task-actions/start.vue';
  import TaskFinishBtn from '@mobile/views/edhr/_comps_/task-actions/finish.vue';

  const {
    init,
    containerOperationId,
    containerOperationInfo,
    loadOperations,
    loadOperationInfo,
    loadOperationEsops,
    floatingBtns,
    containerOperationEsopDetail,
    handleStartWork,
    handleCompleteWork,
    containerOperationInfoById,
    toggleContainerOperation,
    containerOperationProcess,
  } = useReworkRun();

  init();
  loadOperations();
  watch(containerOperationId, () => {
    loadOperationInfo();
    loadOperationEsops();
  });

  const viewReport = () => {
    GctPopup.open(ReworkPopup, {
      context: {
        list: (containerOperationInfo.value?.reports ?? []).filter((item) => item.good_qty_ > 0),
      },
    });
  };

  const viewScrap = () => {
    GctPopup.open(ScrapPopup, {
      context: {
        list: (containerOperationInfo.value?.reports ?? []).filter((item) => item.scrap_qty_ > 0),
      },
    });
  };
</script>
<style scoped lang="less">
  .produce-run-layout {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 444px 1fr;
    grid-template-rows: 180px 1fr;
    grid-template-areas:
      'count esop'
      'info esop';

    > .task-info {
      grid-area: info;
    }
    > .task-count {
      grid-area: count;
    }
    > .task-esop {
      grid-area: esop;
    }
  }
</style>
