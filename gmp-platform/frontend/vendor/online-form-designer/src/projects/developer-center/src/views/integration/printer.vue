<template>
  <basic-page>
    <div class="p-24px flex-none section-header">
      <h2 class="text-16px lh-[24px] color-[#000] font-500 mb-4px">
        {{ t('sys.menu.printerManagement') }}
      </h2>
      <p class="text-14px lh-[18px] color-[#797A7D] mb-0">
        {{ t('sys.integration.printerManagementTip') }}
      </p>
    </div>

    <div class="h-1px bg-[#E0E3EA]"></div>

    <a-tabs
      v-model:activeKey="activePrintResource"
      :style="{
        '--height': tabContentHeight + 'px',
      }"
      animated
    >
      <a-tab-pane
        :key="PrintResourceEnum.CLIENT_PRINT"
        :tab="`${t('sys.integration.printService')}(${
          printResourceTypedCount[PrintResourceEnum.CLIENT_PRINT]
        })`"
      >
        <div>
          <client-print ref="ClientPrintRef" />
        </div>
      </a-tab-pane>
      <a-tab-pane
        :key="PrintResourceEnum.INTERNET_PRINT"
        :tab="`${t('sys.integration.networkPrinter')}(${
          printResourceTypedCount[PrintResourceEnum.INTERNET_PRINT]
        })`"
      >
        <div>
          <internet-print ref="InternetPrintRef" />
        </div>
      </a-tab-pane>
    </a-tabs>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, onMounted, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useWindowSizeFn } from '@vben/hooks';
  import { PrintResourceEnum } from './enum';
  import ClientPrint from './components/client-print.vue';
  import InternetPrint from './components/internet-print.vue';
  import { usePrintResource } from './hooks/usePrintResource';

  const { t } = useI18n();
  const { activePrintResource, printResourceTypedCount, loadPrintResourceTypedCount } =
    usePrintResource();

  loadPrintResourceTypedCount();

  const ClientPrintRef = ref();
  const InternetPrintRef = ref();
  const tabContentHeight = ref(100);
  onMounted(() => {
    calcHeight();
  });
  /**
   * 计算tab内容区域高度
   */
  const calcHeight = () => {
    setTimeout(async () => {
      const outerHeight = document
        .querySelector('.basic-page__body')
        ?.getBoundingClientRect().height;
      const innerHeight = document.querySelector('.section-header')?.getBoundingClientRect().height;
      if (!outerHeight || !innerHeight) return;
      tabContentHeight.value = outerHeight - innerHeight - 46 - 16;
      await nextTick();
      ClientPrintRef.value && ClientPrintRef.value.calcScrollHeight();
      InternetPrintRef.value && InternetPrintRef.value.calcScrollHeight();
    }, 100);
  };
  useWindowSizeFn(calcHeight);
</script>

<style lang="less" scoped>
  // .section-header {
  //   background-color: #fff;
  //   padding: 20px 16px 10px;
  //   flex: none;

  //   div:nth-child(1) {
  //     font-weight: bold;
  //     font-size: 18px;
  //     color: #333;
  //   }
  //   div:nth-child(2) {
  //     font-size: 14px;
  //     color: #666;
  //     margin-top: 4px;
  //   }
  // }

  .ant-tabs {
    flex: 1;
    :deep(.ant-tabs-nav) {
      background-color: #fff;
      margin: 24px 24px 0;
      &::before {
        bottom: -1px;
        border-color: #e8ebf0;
      }
    }
    .ant-tabs-tabpane > div {
      height: var(--height);
      padding: 0 24px 24px;
      display: flex;
      flex-direction: column;
    }
    :deep(.ant-tabs-tab) {
      padding: 12px;
      & + .ant-tabs-tab {
        margin: 0 0 0 24px;
      }
    }
  }
</style>
