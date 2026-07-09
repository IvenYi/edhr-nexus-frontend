<template>
  <div class="online-form-wiki-render-wrapper">
    <EbrWikiLayout :loading="loading" :has-data="hasData">
      <template #ebr-left>
        <EdhrNewWikiTree
          ref="treeRef"
          :wiki-tree-data="treeData"
          :appendixList="appendixList"
          :doc-instance-list="docInstanceList"
          :doc-list="docList"
          @selectDoc="onSelectDoc"
          v-model:tree-select-doc-data="treeSelectDocData"
          v-model:select-self-info="selectSelfInfo"
        >
          <template #print>
            <a-button class="batch-print w-full" type="primary" @click="onBatchPrint">
              {{ $t('sys.edhr.DHRSinglePrint') }}
            </a-button>
          </template>
          <template #status="{ item }">
            <instance-status-label
              :form-type="item.formType!"
              :data-status="item.dataStatus"
              :instance-status="item.instanceStatus!"
              use-dynamic-color
            />
          </template>
        </EdhrNewWikiTree>
      </template>
      <template #ebr-right>
        <BaseOnlineFormRender
          v-if="!docInstanceList.length"
          :selfId="selectTid"
          :option="option"
          :materialNo="materialNo"
        />
        <OnlineFormOperator
          v-else
          ref="operatorRef"
          class="paas-si-form-builder-container"
          style="flex: 1; overflow: hidden; height: 100%"
          :selfId="selectSelfInfo?.id"
          :materialNo="materialNo"
          :paramExtraProps="{ _gct_useDynRowHeight_: true }"
          keep
          :hideLeftButtons="['edhrView', 'checkList']"
          :in-drawer="false"
          :isViewPage="true"
          @btn-click-callback="btnClickCallback"
        />
      </template>
    </EbrWikiLayout>
    <EdhrWikiFilePreviewModal ref="filePreviewModalRef" />
  </div>
</template>

<script setup lang="ts" name="MedProEdhrView">
  import { provide, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { useNewSiWikiFactory } from '../hooks/useNewSiWikiFactory';
  import { PlatformEnum, RenderModeEnum, EbrWikiLayout, EdhrNewWikiTree } from '@gct/nocode-base';
  import OnlineFormOperator from './operator/online-form-operator.vue';
  import BaseOnlineFormRender from '../../_common_/BaseOnlineFormRender.vue';
  import { EBR_PROVIDE_ENUM } from '/@online-form/views/integration/utils/enum';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';
  import { postFileTaskSubmit } from '/@/apis/gct-apaas/FileTaskController';
  import InstanceStatusLabel from './components/instance-status/instance-status-label.vue';
  import { PrintModeEnum, FileModeEnum } from '@gct/nocode-web-render';
  import EdhrWikiFilePreviewModal from './components/edhr-wiki-file-preview-modal.vue';

  const props = defineProps<{
    /** edhr 实例id  */
    selfId?: string;
    /** 物料编号/或批次id */
    materialNo?: string;
    // 文件类表
    docList?: any[];
  }>();

  const {
    loading,
    hasData,
    treeData,
    appendixList,
    edhrInstance,
    treeSelectDocData,
    docInstanceList,
    selectSelfInfo,
    selectTid,
    usePermissionActions,
    reload,
  } = useNewSiWikiFactory(props, {});

  provide(EBR_PROVIDE_ENUM.EDHR_BUTTON_PERMISSION, usePermissionActions);

  const option = {
    requestCallback: getOnlineFormTmplGetVersionById,
    renderModeType: RenderModeEnum.ViewMode,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    isMockReport: false,
  };

  /** 批量打印 */
  const onBatchPrint = () => {
    if (!edhrInstance.value?.id) {
      message.warn($t('sys.edhr.instNotExist'));
      return;
    }
    postFileTaskSubmit({
      tmplInstantId: edhrInstance.value?.id,
      type: 'EDHR',
    });
    message.success($t('sys.edhr.printTaskCreationWasSuccessful'));
  };

  const btnClickCallback = (data) => {
    console.log('按钮点击回调', data);
    reload();
  };

  const filePreviewModalRef = ref<InstanceType<typeof EdhrWikiFilePreviewModal> | null>(null);

  function onSelectDoc(data) {
    const filePath = data?.file_path_;
    const name = data?.name_;
    if (!filePath) return;
    filePreviewModalRef.value?.openPreview(filePath, name);
  }
</script>

<style scoped lang="less">
  .online-form-wiki-render-wrapper {
    width: 100%;
    height: calc(100vh - 266px);
    overflow: hidden;
    border: 1px solid #e0e3ea;

    .batch-print {
      height: 32px;
      line-height: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  }
</style>
