<template>
  <div class="mock-report">
    <PreviewHeader
      v-bind="onlineFormRef?.currentInfo"
      :callback="onlineFormRef?.updateRenderModeType"
    />
    <BaseOnlineFormRender ref="onlineFormRef" :selfId="params.selfId" :option="option" />
  </div>
</template>

<script setup lang="ts" name="PaasMockReport">
  import { reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import PreviewHeader from '../../../render/preview-header.vue';
  import BaseOnlineFormRender from '../../_common_/BaseOnlineFormRender.vue';
  import { FormEditionEnum } from '/@app-designer/views/online-form/constants';
  import { RenderModeEnum, PlatformEnum } from '@gct/nocode-base';
  import {
    getOnlineFormTmplGetVersionById,
    getOnlineFormTmplStash,
  } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { getConfigInfoByWeb } from '../../utils/interface';
  import {
    getLocalDesignerDocument,
    isLocalDesignerId,
  } from '/@online-form/views/designer/hooks/local-designer-cache';
  import { AsyncGctOnlineComponents } from '/@online-form/views/render/__components__/index';

  await AsyncGctOnlineComponents.init();

  const route = useRoute();

  const params = reactive<{
    /** 模板id */
    selfId: string;
  }>({
    selfId: route.query.tid as string,
  });

  const onlineFormRef = ref();

  const initDocumentInfo = async (...args) => {
    if (route.query.local === '1' || isLocalDesignerId(params.selfId)) {
      return getLocalDesignerDocument(params.selfId);
    }

    const res = await getOnlineFormTmplGetVersionById(...args);
    /** 是否是普通表单的设计态 */
    const isEasyStash = res?.edition === FormEditionEnum.EASY;
    if (isEasyStash) {
      // 普通表单的设计模式下，额外请求暂存数据并合并
      const stashData = await getOnlineFormTmplStash({ id: res.id! });
      Object.assign(res!, stashData);
      console.log('stashData', stashData);
    }
    return res;
  };

  const option = {
    requestCallback: initDocumentInfo,
    renderModeType: RenderModeEnum.FormMode,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    deviceConfig: getConfigInfoByWeb(),
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
