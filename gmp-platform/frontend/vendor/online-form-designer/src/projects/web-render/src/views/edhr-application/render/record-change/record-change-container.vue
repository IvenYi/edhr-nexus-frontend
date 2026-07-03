<template>
  <div class="record-change-container">
    <div class="record-change-area" v-if="materialNo">
      <EbrWikiLayout :loading="loading" :has-data="hasData" showFullScreen>
        <template #ebr-left v-if="recordType !== 'doc'">
          <ebr-tree
            ref="treeRef"
            :edhr-instance="edhrInstance"
            :wiki-tree-data="treeData"
            :doc-instance-list="docInstanceList"
            v-model:tree-select-doc-data="treeSelectDocData"
            v-model:select-self-info="selectSelfInfo"
          />
        </template>
        <template #ebr-right>
          <BaseOnlineFormRender
            v-if="selectInstanceInfo?.showType === 'TMPL'"
            class="nocode-form-tmpl-badge"
            :selfId="selectInstanceInfo?.id"
            :option="option"
          />
          <OnlineFormOperator
            v-else-if="selectInstanceInfo?.showType === 'INST'"
            class="paas-si-form-builder-container"
            style="flex: 1; overflow: hidden; height: 100%"
            :selfId="selectInstanceInfo?.id"
            :in-drawer="false"
            keep
            :isViewPage="false"
            @btn-click-callback="
              () => {
                updateEdhrIconStatusCounter();
                updateInstanceCounter();
              }
            "
          />
        </template>
      </EbrWikiLayout>
    </div>

    <div class="record-change-empty-area" v-else>
      <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>
  </div>
</template>

<script setup lang="ts" name="record-change-container">
  import { provide, computed, ref } from 'vue';
  import { Empty } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EBR_PROVIDE_ENUM } from '/@online-form/views/integration/utils/enum';

  import { EbrWikiLayout, RenderModeEnum, PlatformEnum } from '@gct/nocode-base';
  import EbrTree from '/@online-form/views/integration/apaas_ebr/render/ebr-tree.vue';
  import { OnlineFormOperator } from '/@online-form/views/integration/apaas_si/index';
  import BaseOnlineFormRender from '/@online-form/views/integration/_common_/BaseOnlineFormRender.vue';
  import { useEbrWikiFactory } from '/@online-form/views/integration/apaas_ebr/hooks/useEbrWikiFactory';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';

  const { t } = useI18n();

  const option = {
    requestCallback: getOnlineFormTmplGetVersionById,
    renderModeType: RenderModeEnum.ViewMode,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    isMockReport: false,
  };

  const props = defineProps<{
    materialNo?: string;
    recordType?: string;
    instanceStatus?: string;
  }>();

  const {
    loading,
    hasData,
    treeData,
    edhrInstance,
    docInstanceList,
    treeSelectDocData,
    selectSelfInfo,
    selectInstanceInfo,
    usePermissionActions,
    updateEdhrCounter,
    updateInstanceCounter,
    updateEdhrIconStatusCounter,
  } = useEbrWikiFactory(props, {
    pageType: 'record-change',
  });

  provide(EBR_PROVIDE_ENUM.EDHR_BUTTON_PERMISSION, usePermissionActions);

  defineExpose({
    updateEdhrCounter,
  });
</script>

<style scoped lang="less">
  .record-change-container {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;

    .record-change-area {
      display: flex;
      flex-direction: column;
      position: relative;
      // padding: 16px 16px 16px 20px;
      background-color: #fff;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }

    .record-change-empty-area {
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: #fff;
      height: 100%;
    }
  }
</style>
