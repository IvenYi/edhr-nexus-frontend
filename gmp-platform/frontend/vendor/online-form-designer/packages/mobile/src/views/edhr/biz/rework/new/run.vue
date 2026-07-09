<template>
  <div v-if="containerInfo" class="produce-run-layout hidden-scrollbar h-full relative">
    <div class="task-header flex gap-16px overflow-x-auto">
      <LayoutSection2
        class="min-w-280px flex-shrink-0 flex-grow-1"
        :title="containerLabel"
        :content="containerName"
        linkable
        @click="selectLotSn"
      >
        <template #extra>
          <img class="cursor-pointer mx-2px" :src="ScanIcon" @click.stop="scan" />
        </template>
      </LayoutSection2>
      <LayoutSection2
        v-if="containerInfo.type === 'LOT'"
        class="min-w-210px flex-shrink-0 flex-grow-1"
        title="当前返工批次"
        :content="containerInfo?.name"
      >
        <template #extra>
          <IconButton value="icon-preset:edhr-switch" class="mr-16px" @click="toggleRework" />
        </template>
      </LayoutSection2>
      <LayoutSection2
        class="min-w-210px flex-shrink-0 flex-grow-1"
        title="当前工单"
        :content="containerInfo.order"
      />
      <LayoutSection2
        class="min-w-210px flex-shrink-0 flex-grow-1"
        title="当前物料"
        :content="containerInfo.productName"
      />
      <LayoutSection2
        class="min-w-210px flex-shrink-0 flex-grow-1"
        title="生产数量"
        :content="`${containerInfo.produceNum} 件`"
      />
      <LayoutSection2
        class="min-w-210px flex-shrink-0 flex-grow-1"
        title="当前工序"
        :content="containerOperationInfoById?.name_"
        linkable
      >
        <template #extra>
          <IconButton
            value="icon-preset:edhr-switch"
            class="mr-16px"
            @click="toggleContainerOperation"
          />
        </template>
      </LayoutSection2>
    </div>
    <EsopCard class="task-esop" :file-meta="containerOperationEsopDetail" @toggle="changeEsop" />
    <div class="task-info run-card flex flex-col">
      <DataCard :data="containerOperationInfo" />
      <TransactionList
        class="flex-1 h-1px"
        :items="txnList"
        @click="clickTxnBtn"
        @config="sortTxn"
      />
      <div class="h-68px px-16px py-12px" style="border-top: 1px solid #e0e3eb">
        <div
          class="border-#026ac880 border-width-1px border-solid rounded-4px h-full w-full bg-#026ac80f color-#026AC8 flex items-center justify-center"
          @click.stop="fillingForm"
        >
          <gct-icon value="icon-preset:edhr-doc" color="#026AC8" :size="16" />
          <span class="text-16px font-500"> 表单填报 </span>
        </div>
      </div>
    </div>
    <DragFloat :z-index="10" :initial-position="{ top: '90px', right: 0 }">
      <div class="flex flex-col flex-gap-16px">
        <ActionBtn
          v-if="containerInfo.status === 'waiting'"
          icon="icon-preset:edhr-gongxukaigong"
          text="工序开工"
          background="linear-gradient( 180deg, #247BFF 0%, #026AC8 95%)"
          @trigger="handleStartWork"
        />
        <ActionBtn
          v-if="containerInfo.status === 'running' && containerInfo.isContinuousProduction"
          text="部分完工"
          icon="icon-preset:edhr-bufenwangong"
          background="linear-gradient( 180deg, #FF9442 0%, #F5782A 95%)"
          @trigger="handlePartEndWork"
        />
        <ActionBtn
          v-if="containerInfo.status === 'running'"
          text="工序完工"
          icon="icon-preset:edhr-gongxuwangong"
          background="linear-gradient( 180deg, #F84D4D 0%, #DA2B34 95%)"
          @trigger="handleEndWork"
        />
      </div>
    </DragFloat>
  </div>
</template>

<script setup lang="ts">
  import { watch } from 'vue';
  import LayoutSection2 from '@mobile/views/edhr/_comps_/layout/section2.vue';
  import IconButton from '@mobile/views/edhr/_comps_/layout/icon-button.vue';
  import ScanIcon from '@mobile/assets/svg/combined_scan.svg';
  import { useReworkRun2 } from './useReworkRun2';
  import EsopCard from '@mobile/views/edhr/biz/produce/new/esop-card.vue';
  import DataCard from '@mobile/views/edhr/biz/produce/new/data-card.vue';
  import TransactionList from '../../txn/transaction-list.vue';
  import DragFloat from '@mobile/views/edhr/_comps_/drag-float/drag-float.vue';
  import ActionBtn from '@mobile/views/edhr/_comps_/task-actions/action-btn.vue';

  const {
    init,
    containerInfo,
    containerOperationInfo,
    containerOperationInfoById,
    containerOperationEsopDetail,
    txnList,
    parentLot,
    toggleRework,
    handleStartWork,
    handleEndWork,
    handlePartEndWork,
    toggleContainerOperation,
    changeEsop,
    fillingForm,
    scan,
    selectLotSn,
    clickTxnBtn,
    sortTxn,
  } = useReworkRun2();

  const containerLabel = computed(() => {
    return containerInfo.value.type === 'LOT' ? '当前批次号' : '当前SN号';
  });

  const containerName = computed(() => {
    return containerInfo.value.type === 'LOT' ? parentLot.value.name : containerInfo.value.name;
  });

  init();
</script>
<style scoped lang="less">
  .produce-run-layout {
    display: grid;
    grid-gap: 10px;
    grid-template-columns: 1fr 333px;
    grid-template-rows: 92px 1fr;
    grid-template-areas:
      'header header'
      'esop info ';
    .run-card {
      background: #ffffff;
      border-radius: 8px 8px 8px 8px;
    }

    > .task-info {
      grid-area: info;
      overflow: hidden;
    }
    > .task-header {
      grid-area: header;
    }
    > .task-esop {
      grid-area: esop;
      overflow: hidden;
    }
  }
</style>
<style>
  .custom-float.van-floating-bubble {
    --van-floating-bubble-border-radius: 0;
    --van-floating-bubble-size: fit-content;
  }
</style>
