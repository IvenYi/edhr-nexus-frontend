<template>
  <DocumentLayout :loading="loading" :has-data="hasData">
    <template #default>
      <template v-for="basicInfo of basicInfoList" :key="basicInfo.uniqueId">
        <!-- <span style="font-size: 14px"> {{ formStateMap?.[basicInfo.uniqueId] }}</span> -->
        <WidgetFileForm
          v-if="basicInfo.formType === FormTypeEnum.FILE"
          :basicInfo="basicInfo"
          :formState="formStateMap?.[basicInfo.uniqueId]"
        />
        <template v-else>
          <DocumentPaper
            v-for="(page, page_idx) in pageDataMap[basicInfo.uniqueId]"
            :page="page"
            :basicInfo="basicInfo"
            :formState="formStateMap?.[basicInfo.uniqueId]"
            :widgetCenter="dataCenterMap[basicInfo.uniqueId]"
            is-mobile
          >
            <template #annotation v-if="basicInfo.annSwitchStatus"></template>
            <template #overlay="{ widgets }">
              <ContainerRender
                :widgets="widgets"
                :pageNumber="page_idx + 1"
                :pageTotal="pageDataMap[basicInfo.uniqueId].length"
                :pageFormState="formStateMap?.[basicInfo.uniqueId]"
              />
            </template>
            <template
              #widget="{
                tdInfo,
                formData,
                subtableFieldId,
                realRowIndex,
                pageRowIndex,
                childSubTableDataIndex,
                dynamicConfig,
              }"
            >
              <WidgetComponentVisible :widget="tdInfo.cellWidget">
                <WidgetComponent
                  :widget="tdInfo.cellWidget"
                  :formData="formData"
                  :subtableFieldId="subtableFieldId"
                  :realRowIndex="realRowIndex"
                  :pageRowIndex="pageRowIndex"
                  :childSubTableDataIndex="childSubTableDataIndex"
                  :dynamicConfig="dynamicConfig"
                />
              </WidgetComponentVisible>
            </template>
          </DocumentPaper>
        </template>
      </template>
    </template>
  </DocumentLayout>
</template>

<script setup lang="ts" name="MobilePreviewContainer">
  import { provide } from 'vue';
  import {
    DocumentLayout,
    DocumentPaper,
    NCB_PROVIDE,
    RenderModeEnum,
    useNocodeEmitter,
    FormTypeEnum,
  } from '@gct/nocode-base';
  import { GctPopup } from '@mobile/utils/popup';
  import WidgetComponentVisible from './_common_/widget-component-visible.vue';
  import WidgetComponent from './_common_/widget-component.vue';
  import ContainerRender from './_widget_/container/container-render.vue';
  import FillInModal from './common/fill-in-modal.vue';
  import { initMobilePaasUploadApis } from '../logic/index';
  import type { IBasicInfoItem, IPageData } from '@gct/nocode-base';
  import WidgetFileForm from './file-form/widget-file-form.vue';

  const props = defineProps<{
    /** 页面加载状态 */
    loading: boolean;
    /** 是否有数据 */
    hasData: boolean;
    /** 基础信息列表 */
    basicInfoList: IBasicInfoItem[];
    /** 单据模板数据map */
    dataCenterMap: Record<string, any>;
    /** 数据信息map */
    formStateMap: Record<string, Record<string, any>>;
    /** 分页信息map */
    pageDataMap: Record<string, IPageData[]>;
    /** 单据模板字段默认值map */
    defaultDataMap: Record<string, any>;
    /** 更新分页信息 */
    updatePageData: Function;
  }>();

  const updateCalcCallback = (uniqueId) => {
    props.updatePageData(uniqueId);
    const { emitter, EmitterEnum } = useNocodeEmitter();
    emitter.emit(EmitterEnum.__on_looper_auto_save, { changed: true });
  };

  const openFillFieldsModalCallback = (basicInfo: IBasicInfoItem, widgetInfo) => {
    if (basicInfo.renderModeType === RenderModeEnum.ViewMode) return;
    GctPopup.open(FillInModal, {
      ...widgetInfo,
      widgetCenter: props.dataCenterMap[basicInfo.uniqueId],
      formStateMap: props.formStateMap,
      defaultDataMap: props.defaultDataMap,
      basicInfo,
      updateCalcCallback,
      onOk: async (payload: { instId: string }, done: Function) => {},
    });
  };

  provide(NCB_PROVIDE.FROM_DATA, props.formStateMap);
  provide(NCB_PROVIDE.DEFAULT_FIELD_DATA, props.defaultDataMap);
  provide(NCB_PROVIDE.PAGE_DATA_CALL_BACK, updateCalcCallback);
  provide(NCB_PROVIDE.MOBILE_FILL_FIELDS_POPUP, openFillFieldsModalCallback);

  initMobilePaasUploadApis();
</script>

<style scoped></style>
