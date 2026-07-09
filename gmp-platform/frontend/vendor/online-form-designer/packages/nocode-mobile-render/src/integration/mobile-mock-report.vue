<template>
  <div class="mock-report">
    <PreviewHeader
      v-bind="onlineFormRef?.currentInfo"
      :callback="onlineFormRef?.updateRenderModeType"
    />
    <BaseOnlineFormRender ref="onlineFormRef" :selfId="selfId" :option="option" />
  </div>
</template>

<script setup lang="ts" name="PaasMockReport">
  import { reactive, ref } from 'vue';
  import PreviewHeader from './_layout_/PreviewHeader.vue';
  import BaseOnlineFormRender from './_layout_/BaseOnlineFormRender.vue';
  import { RenderModeEnum, PlatformEnum } from '@gct/nocode-base';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { getConfigInfoByMobile } from '../logic/index';

  const props = defineProps<{
    /** 在线表单实例id */
    selfId: string;
  }>();

  const onlineFormRef = ref();

  const option = {
    requestCallback: getOnlineFormTmplGetVersionById,
    renderModeType: RenderModeEnum.FormMode,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    deviceConfig: getConfigInfoByMobile(),
    isMockReport: true,
  };
</script>

<style scoped lang="less">
  .mock-report {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
