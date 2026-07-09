<template>
  <div class="batch-view">
    <PreviewContainer
      :loading="loading"
      :hasData="hasData"
      :basicInfoList="basicInfoList"
      :dataCenterMap="dataCenterMap"
      :formStateMap="formStateMap"
      :pageDataMap="pageDataMap"
      :defaultDataMap="defaultDataMap"
      :updatePageData="updatePageData"
    />
  </div>
</template>

<script setup lang="ts" name="MedProStandardEdhrBatchView">
  import PreviewContainer from '/@online-form/views/render/preview-container.vue';
  import { PlatformEnum, useRenderPageFactory } from '@gct/nocode-base';
  import { getConfigInfoByWeb } from '../../utils/interface';
  import { postOnlineFormInstanceInfos } from '/@/apis/gct-apaas/OnlineFormInstanceController';

  const props = defineProps<{
    /** 单据实例数组 */
    selfId: string[];
    paramExtraProps?: Record<string, any>;
  }>();

  const {
    loading,
    hasData,
    basicInfoList,
    pageDataMap,
    formStateMap,
    dataCenterMap,
    defaultDataMap,
    updatePageData,
  } = useRenderPageFactory(props, {
    factoryType: 'batchInstance',
    requestCallback: postOnlineFormInstanceInfos,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    paramExtraProps: props.paramExtraProps,
    deviceConfig: getConfigInfoByWeb(),
    isMockReport: false,
    isDetailPage: true,
  });
</script>

<style scoped lang="less">
  .batch-view {
    position: relative;
    :deep(.cmp-paper-wrapper) {
      box-shadow: none !important;
      margin: 0 !important;
    }
  }
</style>
