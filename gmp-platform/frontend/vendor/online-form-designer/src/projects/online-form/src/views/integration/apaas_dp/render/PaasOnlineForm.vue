<template>
  <div class="collect-online-form">
    <PreviewHeader
      v-bind="onlineFormRef?.currentInfo"
      :updateStatus="route.query.updateStatus === '1'"
      :updateId="route.query.id_"
      hiddenChangeModeTypeBtn
    />
    <BaseOnlineFormRender ref="onlineFormRef" v-bind="params" :option="option" />
  </div>
</template>

<script setup lang="ts" name="PaasOnlineForm">
  import { reactive, ref } from 'vue';
  import { useRoute } from 'vue-router';
  import { omit } from 'lodash-es';
  import PreviewHeader from '/@online-form/views/render/preview-header.vue';
  import BaseOnlineFormRender from '../../_common_/BaseOnlineFormRender.vue';
  import { updateTitle } from '/@/hooks/web/useTitle';

  import { RenderModeEnum, PlatformEnum } from '@gct/nocode-base';
  import { getDocumentInfo } from '/@/apis/gct-apaas/DocumentController';
  import { getConfigInfoByWeb } from '../../utils/interface';
  import { getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const route = useRoute();
  console.log('route.query', route.query);
  if (route.query.gct_title_) {
    updateTitle($t('sys.onlineForm.taskOrder') + ' - MedPro DHR');
  }

  const params = reactive<{
    /** 模板id */
    selfId: string;
    /** 查询条件 */
    query: any;
  }>({
    selfId: route.query.tid as string,
    query: omit(route.query, ['tid', 'mode', 'env', 'gct_title_', 'updateStatus', 'model']),
  });

  const onlineFormRef = ref();

  const option = {
    requestCallback: route.query.model ? getModelInfo : getDocumentInfo,
    renderModeType: RenderModeEnum.ViewMode,
    platformType: PlatformEnum.INTEGRATION_PAAS_DP,
    deviceConfig: getConfigInfoByWeb(),
    isMockReport: false,
  };

  async function getModelInfo(query = {}) {
    // 通过模型设计维护后，需要走业务服务接口
    const res = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'biz_info',
        modelKey: route.query.model,
        modelCategory: 'entity',
      },
      {
        ...query,
      },
    );
    return res?.data || {};
  }
</script>

<style scoped lang="less">
  .collect-online-form {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
