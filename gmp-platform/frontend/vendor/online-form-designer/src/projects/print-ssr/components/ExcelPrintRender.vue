<template>
  <PreviewContainer
    :loading="loading"
    :hasData="hasData"
    :basicInfoList="basicInfoList"
    :dataCenterMap="dataCenterMap"
    :formStateMap="formStateMap"
    :pageDataMap="pageDataMap"
    :defaultDataMap="defaultDataMap"
    :updatePageData="updatePageData"
    class="nocode-backend-print"
  />
</template>

<script lang="ts" setup name="ExcelPrintRender">
  import { computed } from 'vue';
  import PreviewContainer from '/@online-form/views/render/preview-container.vue';
  import { getConfigInfoByWeb } from '/@online-form/views/integration/utils/interface';
  import {
    PlatformEnum,
    FormTypeEnum,
    useRenderPageFactory,
    RenderModeEnum,
  } from '@gct/nocode-base';
  import { useWebUpload } from '@gct/nocode-web-render';
  import { setupPrintSSRBridge } from '../hooks/usePrintSSRBridge';
  import { getOnlineFormInstanceDetail } from '/@/apis/gct-apaas/OnlineFormInstanceController';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import type { OnlineFormInstanceResponse } from '/@/apis/gct-apaas/model';
  import type { IBasicInfoItem } from '@gct/nocode-base';

  const props = withDefaults(
    defineProps<{
      inst: string;
      type: string;
      paramExtraProps?: Record<string, any>;
    }>(),
    {
      type: 'INST',
    },
  );

  //QE5YfBF2dCeDtkCd
  const {
    loading,
    hasData,
    basicInfoList,
    pageDataMap,
    formStateMap,
    dataCenterMap,
    defaultDataMap,
    updatePageData,
    findFormInsInfo,
    findBasicInsInfo,
    getAppendixInfos,
    getPdfInfos,
  } = useRenderPageFactory(
    {
      selfId: props.inst,
    },
    props.type === 'INST'
      ? {
          factoryType: 'instance',
          requestCallback: getOnlineFormInstanceDetail,
          platformType: PlatformEnum.INTEGRATION_PAAS_SI,
          paramExtraProps: props.paramExtraProps,
          deviceConfig: getConfigInfoByWeb(),
          isMockReport: false,
          isDetailPage: true,
        }
      : {
          factoryType: 'template',
          requestCallback: getOnlineFormTmplGetVersionById,
          renderModeType: RenderModeEnum.ViewMode,
          platformType: PlatformEnum.INTEGRATION_PAAS_SI,
          isMockReport: true,
        },
  );

  /** 在线表单实例详情 */
  const formIns = computed<OnlineFormInstanceResponse>(() => findFormInsInfo(props.inst) ?? {});
  /** 当前页面基础信息 */
  const basicIns = computed<IBasicInfoItem | undefined>(() => findBasicInsInfo(props.inst));

  setupPrintSSRBridge('excel', {
    getAttachments() {
      const { transfer } = useWebUpload();
      const uniqueId = basicIns.value?.uniqueId ?? '';
      const list = getAppendixInfos(uniqueId, formIns.value);
      return list.map((item) => transfer(item));
    },

    getFileFormInfo() {
      if (formIns.value.formType !== FormTypeEnum.FILE) {
        return { isFile: false };
      }
      const { transfer } = useWebUpload();
      const uniqueId = basicIns.value?.uniqueId || '';
      const pdfList = getPdfInfos(uniqueId);

      return {
        isFile: true,
        file: pdfList.map((item) => transfer(item)),
      };
    },
  });
</script>
