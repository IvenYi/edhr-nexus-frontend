<template>
  <div v-if="containerInfo" class="produce-run-layout hidden-scrollbar h-full relative">
    <div class="task-header ks-row bg-white">
      <div class="overflow-x-auto ks-row ks-col [&>div]:flex-shrink-0">
        <LayoutSection2 :title="containerLabel" @click="selectLotSnPopup">
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
        <!-- <LayoutSection2
          v-if="containerInfo.type === 'LOT'"
          title="当前返工批次"
          :content="containerInfo?.name"
        >
          <template #extra>
            <IconButton value="icon-preset:edhr-switch" class="mr-16px" @click="toggleRework" />
          </template>
        </LayoutSection2> -->
        <div class="ks-row-middle">
          <van-divider vertical :hairline="false" class="h24px! text-[#F2F5F8] mx28px!" />
        </div>
        <LayoutSection2
          class=""
          title="返工标题"
          v-if="material_status_ === MATERIAL_STATUS_ENUM.LOT"
          @click="() => selectReworkPopup()"
        >
          <div class="ks-row-middle">
            <span class="ell max-w80px">{{ rework_data.rework_name_ }}</span>
            <gct-icon value="icon-icon_qiehuan_pad" color="#026AC8" :size="16" />
          </div>
        </LayoutSection2>
        <LayoutSection2 class="" title="返工标题" v-else>
          <div class="ell max-w80px">
            {{ containerInfo.reworkName }}
          </div>
        </LayoutSection2>
        <div class="ks-row-middle">
          <van-divider vertical :hairline="false" class="h24px! text-[#F2F5F8] mx28px!" />
        </div>
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
        <!-- <LayoutSection2 title="当前工单" :content="containerInfo.order" /> -->
        <!-- <LayoutSection2 title="当前物料" :content="containerInfo.productName" /> -->
        <div class="ks-row-middle">
          <van-divider vertical :hairline="false" class="h24px! text-[#F2F5F8] mx28px!" />
        </div>
        <template v-if="material_status_ === MATERIAL_STATUS_ENUM.LOT">
          <LayoutSection2 title="返工数量" :content="`${rework_data.original_qty_}`" />
          <div class="ks-row-middle">
            <van-divider vertical :hairline="false" class="h24px! text-[#F2F5F8] mx28px!" />
          </div>
        </template>
        <LayoutSection2
          title="当前工序"
          :content="containerOperationInfoById?.name_"
          linkable
          @click="toggleContainerOperation"
        >
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
          v-if="containerInfo.status === 'running'"
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
        <div
          class="h-68px px-16px py-12px"
          style="border-top: 1px solid #e0e3eb"
          v-if="containerInfo.status === 'running'"
        >
          <div
            class="text-[#fff] bg-[color:var(--van-primary-color)] rounded-6px h-full w-full flex items-center justify-center"
            @click.stop="fillingForm"
          >
            <gct-icon value="icon-preset:edhr-doc" color="#fff" :size="16" />
            <span class="text-16px font-500"> 表单填报 </span>
          </div>
        </div>
      </div>
    </div>

    <!-- <DragFloat :z-index="10" :initial-position="{ top: '90px', right: 0 }">
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
    </DragFloat> -->
  </div>
</template>

<script setup lang="ts">
  import LayoutSection2 from '@mobile/views/edhr/_comps_/layout/section2.vue';
  import ScanIcon from '@mobile/assets/svg/edhr/icon_scan_pad.svg';
  import { useReworkRun2 } from './useReworkRun2';
  import EsopCard from './components/esop-card.vue';
  import DataCard from './components/data-card.vue';
  import TransactionList from '../txn/transaction-list.vue';
  import ActionBtn from '@mobile/views/edhr/_comps_/task-actions/action-btn.vue';
  import { MATERIAL_STATUS_ENUM, rework_data, selectRework } from './useBasicsRun';
  import ProductInforPopver from './components/product-info-popver.vue';

  const {
    containerInfo,
    containerOperationInfo,
    containerOperationInfoById,
    containerOperationEsopDetail,
    txnList,
    handleStartWork,
    handleEndWork,
    toggleContainerOperation,
    changeEsop,
    fillingForm,
    selectLotSnPopup,
    selectScanCode,
    clickTxnBtn,
    sortTxn,
    material_status_,
    containerLabel,
    openInfoPopup,
    selectReworkPopup,
    openArisenTxnList,
  } = useReworkRun2();
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
