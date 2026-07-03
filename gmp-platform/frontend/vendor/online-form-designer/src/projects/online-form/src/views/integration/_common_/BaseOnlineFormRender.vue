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
  />
</template>

<script setup lang="ts" name="BaseOnlineFormRender">
  import { computed } from 'vue';
  import { cloneDeep } from 'lodash-es';
  import PreviewContainer from '/@online-form/views/render/preview-container.vue';
  import {
    RenderModeEnum,
    PlatformEnum,
    ComponentTypeEnum,
    useRenderPageFactory,
  } from '@gct/nocode-base';

  interface IOptions {
    platformType: PlatformEnum;
    renderModeType: RenderModeEnum;
    requestCallback: Function;
    isMockReport: boolean;
  }

  const props = defineProps<{
    /** 模板id */
    selfId: string;
    /** 批次号 */
    materialNo?: string;
    /** 查询条件 */
    query?: any;
    option: IOptions;
  }>();

  const {
    loading,
    hasData,
    basicInfoList,
    pageDataMap,
    formStateMap,
    dataCenterMap,
    defaultDataMap,
    findFormInsInfo,
    findBasicInsInfo,
    updatePageData,
    updateRenderModeType,
  } = useRenderPageFactory(props, {
    factoryType: 'template',
    ...props.option,
  });

  const currentInfo = computed(() => {
    const tid = props.selfId.replace(/^.*?:/, '') || props.selfId;
    const formIns = findFormInsInfo(tid);
    const basicIns = findBasicInsInfo(tid);

    let printSize;
    if (formIns) {
      const cloneRuntimeJson = cloneDeep(JSON.parse(formIns?.runtimeJson || '{}'));
      const paper = cloneRuntimeJson[ComponentTypeEnum.PAPER];
      if (paper) {
        printSize = `${paper.props.pageWidth}mm ${paper.props.pageHeight}mm`;
      }
    }

    return {
      uniqueId: basicIns?.uniqueId ?? '',
      categoryName: formIns?.categoryName ?? '',
      previewTitle: formIns?.name ?? '',
      printSize: printSize,
      formType: basicIns?.formType,
    };
  });

  defineExpose({
    currentInfo,
    updateRenderModeType,
  });
</script>

<style scoped></style>
