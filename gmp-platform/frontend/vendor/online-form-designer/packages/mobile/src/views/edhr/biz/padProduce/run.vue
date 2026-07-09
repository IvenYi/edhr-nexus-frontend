<template>
  <div v-if="containerInfo" class="produce-run-layout hidden-scrollbar h-full relative">
    <div class="task-header ks-row bg-white">
      <div class="overflow-x-auto ks-row ks-col [&>div]:flex-shrink-0">
        <LayoutSection2 :title="containerLabel" @click="() => selectLotSnPopup()">
          <template #extra>
            <div class="scan-btn cursor-pointer mx-20px" @click.stop="selectScanCode">
              <img :src="ScanIcon" />
            </div>
          </template>
          <div>
            {{ containerInfo.name }}
            <gct-icon value="icon-icon_qiehuan_pad" color="#026AC8" :size="16" />
          </div>
        </LayoutSection2>
        <div class="ks-row-middle">
          <van-divider vertical :hairline="false" class="h24px! text-[#F2F5F8] mx28px!" />
        </div>
        <!-- <LayoutSecti on2 title="当前工单" :content="containerInfo.order" />
        <div class="ks-row-middle">
          <van-divider vertical :hairline="false" class="h24px! text-[#F2F5F8] mx28px!" />
        </div> -->
        <LayoutSection2 class="" title="产品" :content="containerInfo.productName">
          <ProductInforPopver
            :productId="containerInfo.productId"
            :productCode="containerInfo.productName"
          >
            <div class="ks-row-middle">
              <span class="inline-block ell max-w80px"> {{ containerInfo.productName }}</span>
              <span class="primary-gct ml6px"> 详情 </span>
            </div>
          </ProductInforPopver>
        </LayoutSection2>
        <div class="ks-row-middle">
          <van-divider vertical :hairline="false" class="h24px! text-[#F2F5F8] mx28px!" />
        </div>
        <template v-if="material_status_ === MATERIAL_STATUS_ENUM.LOT">
          <LayoutSection2 class="" title="生产数量" :content="`${containerInfo.produceNum}`" />
          <div class="ks-row-middle">
            <van-divider vertical :hairline="false" class="h24px! text-[#F2F5F8] mx28px!" />
          </div>
        </template>
        <LayoutSection2 class="" title="当前工序" @click="toggleContainerOperation">
          <div>
            {{ containerOperationInfoById?.name_ }}
            <gct-icon value="icon-icon_qiehuan_pad" color="#026AC8" :size="16" />
          </div>
        </LayoutSection2>
        <div class="ks-row-middle ml28px">
          <van-button type="default" class="h36px" @click="openInfoPopup">查看更多</van-button>
        </div>
      </div>
      <div v-show="containerOperationInfoById?.has_permission_" class="pl16px ks-row-middle">
        <ActionBtn
          v-if="containerInfo.status === 'waiting'"
          icon="icon-preset:edhr-gongxukaigong"
          text="开始"
          background="#026AC8"
          class="w140px"
          @trigger="handleStartWork"
        />
        <ActionBtn
          v-if="containerInfo.status === 'running' && containerInfo.isContinuousProduction"
          text="部分结束"
          icon="icon-preset:edhr-bufenwangong"
          background="#FB893A"
          @trigger="handlePartEndWork"
          class="w140px"
        />
        <ActionBtn
          v-if="containerInfo.status === 'running' && !containerInfo.continuous_"
          text="结束"
          icon="icon-preset:edhr-gongxuwangong"
          background="#F54547"
          @trigger="handleEndWork"
          class="w140px ml8px!"
        />
      </div>
    </div>
    <div
      v-show="containerOperationInfoById?.has_permission_"
      class="ks-col overflow-hidden ks-row bg-white mt12px rounded-[12px_12px_0_0] pt4px px4px"
    >
      <EsopCard
        class="task-esop ks-col"
        :file-meta="containerOperationEsopDetail"
        @toggle="changeEsop"
      />
      <div class="task-info run-card flex flex-col w333px">
        <DataCard :data="containerOperationInfo" />
        <TransactionList
          class="flex-1 h-1px"
          :items="txnList"
          @click="clickTxnBtn"
          @config="sortTxn"
          @open-list="openArisenTxnList"
        />
        <div class="h-68px px-16px py-12px" v-if="containerInfo.status === 'running'">
          <div
            class="text-[#fff] bg-[color:var(--van-primary-color)] rounded-6px h-full w-full flex items-center justify-center"
            @click.stop="fillingForm"
          >
            <gct-icon value="icon-preset:edhr-doc" color="#fff" :size="16" />
            <span class="text-16px font-500 ml6px"> 表单填报 </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { watch } from 'vue';
  import LayoutSection2 from '@mobile/views/edhr/_comps_/layout/section2.vue';
  import { useProduceRun2 } from './useProducRun2';
  import EsopCard from './components/esop-card.vue';
  import DataCard from './components/data-card.vue';
  import TransactionList from '../txn/transaction-list.vue';
  import ActionBtn from '@mobile/views/edhr/_comps_/task-actions/action-btn.vue';
  import ScanIcon from '@mobile/assets/svg/edhr/icon_scan_pad.svg';
  import { MATERIAL_STATUS_ENUM } from './useBasicsRun';
  import ProductInforPopver from './components/product-info-popver.vue';

  const {
    containerInfo,
    containerOperationInfo,
    containerOperationInfoById,
    containerOperationEsopDetail,
    txnList,
    handleStartWork,
    handleEndWork,
    handlePartEndWork,
    toggleContainerOperation,
    changeEsop,
    fillingForm,
    clickTxnBtn,
    sortTxn,
    openArisenTxnList,
    selectLotSnPopup,
    selectScanCode,
    material_status_,
    openInfoPopup,
    containerLabel,
  } = useProduceRun2();
</script>
<style scoped lang="less">
  .produce-run-layout {
    display: flex;
    flex-direction: column;

    .scan-btn {
      width: 44px;
      height: 44px;
      border: 1px solid #e0e3eb;
      border-radius: 6px;

      img {
        width: 100%;
        height: 100%;
      }
    }

    .run-card {
      border-radius: 10px 10px 0 0;
      background: #e6e9ee;
    }

    > .task-info {
      overflow: hidden;
    }

    > .task-header {
      padding: 4px;
      border-radius: 12px;
    }

    > .task-esop {
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
