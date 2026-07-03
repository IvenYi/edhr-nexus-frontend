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
            :key="page_idx"
            :basicInfo="basicInfo"
            :formState="formStateMap?.[basicInfo.uniqueId]"
            :widgetCenter="dataCenterMap[basicInfo.uniqueId]"
          >
            <template #annotation v-if="basicInfo.annSwitchStatus">
              <i
                class="paper-annotation-mark"
                @click.stop="setSelectAnnotationId('gct-nocode-ann-main', basicInfo)"
              ></i>
            </template>
            <template #overlay="{ widgets }">
              <ContainerRender
                :widgets="widgets"
                :pageNumber="page_idx + 1"
                :pageTotal="pageDataMap[basicInfo.uniqueId].length"
                :pageFormState="formStateMap?.[basicInfo.uniqueId]"
              />
            </template>
            <template
              #subAction="{
                showDelBtn,
                showQuickFillBtn,
                subTableFieldId,
                mobileTdIdGroups,
                handleMenuClick,
                showEditBtn,
                showInsertMultiple,
                noPopover,
              }"
            >
              <DocumentSubTableAction
                :showDelBtn="showDelBtn"
                :showQuickFillBtn="showQuickFillBtn"
                :showEditBtn="showEditBtn"
                :showInsertMultiple="showInsertMultiple"
                :subTableFieldId="subTableFieldId"
                :mobileTdIdGroups="mobileTdIdGroups"
                :widgetCenter="dataCenterMap[basicInfo.uniqueId]"
                :handleMenuClick="handleMenuClick"
                :noPopover="noPopover"
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

<script setup lang="ts" name="PreviewContainer">
  import { provide } from 'vue';
  import ContainerRender from '/@online-form/views/__widgets__/container/container-render.vue';
  import WidgetComponentVisible from '/@online-form/views/render/__components__/_common_/widget-component-visible.vue';
  import WidgetComponent from '/@online-form/views/render/__components__/_common_/widget-component.vue';
  import WidgetFileForm from '/@online-form/views/render/__components__/_common_/widget-file-form.vue';
  import {
    FormTypeEnum,
    DocumentLayout,
    DocumentPaper,
    DocumentSubTableAction,
    DocumentQuickFillin,
    NCB_PROVIDE,
    useNocodeEmitter,
    setSelectAnnotationId,
  } from '@gct/nocode-base';
  import { initWebPaasUploadApis } from '@gct/nocode-web-render';
  import type { IBasicInfoItem, IPageData } from '@gct/nocode-base';

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
    /** bom信息控制器 */
    tmplBomCMap: Record<string, any>;
    /** 单据模板字段默认值map */
    defaultDataMap: Record<string, any>;
    /** 更新分页信息 */
    updatePageData: Function;
  }>();

  provide(NCB_PROVIDE.FROM_DATA, props.formStateMap);
  provide(NCB_PROVIDE.DEFAULT_FIELD_DATA, props.defaultDataMap);
  provide(NCB_PROVIDE.PAGE_DATA_CALL_BACK, (uniqueId) => {
    props.updatePageData(uniqueId);
    const { emitter, EmitterEnum } = useNocodeEmitter();
    emitter.emit(EmitterEnum.__on_looper_auto_save, { changed: true });
  });

  initWebPaasUploadApis();
</script>

<style scoped></style>
