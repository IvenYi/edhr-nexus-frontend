<template>
  <div class="flex h-full overflow-hidden">
    <div class="w-240px">
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
          <van-button class="batch-print w-full" type="primary" @click="onBatchPrint">
            {{ $t('sys.edhr.DHRSinglePrint') }}
          </van-button>
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
    </div>

    <BaseOnlineFormRender
      v-if="!docInstanceList.length"
      :selfId="selectTid"
      :option="option"
      :materialNo="materialNo"
      class="bg-[#e6e9ef]"
    />

    <MobileOnlineFormOperator
      v-else
      ref="operatorRef"
      style="flex: 1; overflow: hidden; height: 100%"
      :selfId="selectSelfInfo?.id"
      :in-drawer="false"
      :keep="false"
      :isViewPage="true"
      :isMedPro="isMedPro"
      :paramExtraProps="{}"
      :dataCollectionInfo="{}"
      :showRightBtns="[]"
      @btn-click-callback="btnClickCallback"
      class="bg-[#e6e9ef]"
    />
  </div>

  <EdhrWikiFilePreviewModal ref="filePreviewModalRef" />
</template>

<script setup lang="ts" name="mobile-single-form-fill-modal">
  import { ref, computed, onMounted } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import BaseOnlineFormRender from './_layout_/BaseOnlineFormRender.vue';
  import MobileOnlineFormOperator from './_layout_/mobile-online-form-operator.vue';
  import { showNotify, showToast } from 'vant';
  import { cloneDeep } from 'lodash-es';

  import EdhrWikiFilePreviewModal from './edhr-wiki-file-preview-modal.vue';
  import EdhrNewWikiTree from './edhr-new-wiki-tree.vue';
  import InstanceStatusLabel from './instance-status/instance-status-label.vue';
  import { useNewSiWikiFactory } from '../hooks/useNewSiWikiFactory';
  import { postFileTaskSubmit } from '/@/apis/gct-apaas/FileTaskController';
  import { PlatformEnum, RenderModeEnum } from '@gct/nocode-base';
  import { getOnlineFormTmplGetVersionById } from '/@/apis/gct-apaas/OnlineFormTmplController';

  const { t } = i18n.global;

  const isMedPro = (window as any)?._gct?.store?.appInfo?.suiteKey === 'MEDPRO';

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

  const option = {
    requestCallback: getOnlineFormTmplGetVersionById,
    renderModeType: RenderModeEnum.ViewMode,
    platformType: PlatformEnum.INTEGRATION_PAAS_SI,
    isMockReport: false,
  };

  const btnClickCallback = (data) => {
    console.log('按钮点击回调', data);
    reload();
  };
  const onBatchPrint = async () => {
    if (!edhrInstance.value?.id) {
      showToast($t('sys.edhr.instNotExist'));
      return;
    }
    postFileTaskSubmit({
      tmplInstantId: edhrInstance.value?.id,
      type: 'EDHR',
    });
    showToast($t('sys.edhr.printTaskCreationWasSuccessful'));
  };

  const filePreviewModalRef = ref<InstanceType<typeof EdhrWikiFilePreviewModal> | null>(null);

  function onSelectDoc(data) {
    const filePath = data?.file_path_;
    const name = data?.name_;
    if (!filePath) return;
    filePreviewModalRef.value?.openPreview(filePath, name);
  }

  onMounted(async () => {});
</script>

<style scoped lang="less">
  .action-nav-bar {
    position: relative;
    background: #fff;

    &-buttons {
      display: flex;
      flex-direction: column;
      width: 52px;
    }
  }

  .custom-btn {
    :deep(.van-button) {
      padding: 0 13px;
    }
  }
</style>
