<template>
  <a-drawer
    v-model:visible="visible"
    :title="t('sys.detail')"
    :maskStyle="{ backgroundColor: 'transparent' }"
    placement="right"
    width="70%"
    @close="onClose"
    class="preview-drawer"
  >
    <div class="collapse-wrapper">
      <!-- <a-button class="collapse-btn" @click="handleConfig">
        <template #icon>
          <i class="iconfont icon-sheji1 mr8px"></i>
        </template>
        {{ t('sys.design') }}
      </a-button> -->
      <!-- <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.basicInfo')">
          <div class="basic-info">
            <a-descriptions :column="3" class="basic-info-container">
              <a-descriptions-item :label="t('sys.process.approvalName')">
                {{ detailInfo.name }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.process.approvalKey')">
                <copy-module-key :moduleKey="detailInfo?.key" />
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.model.refModel')">
                {{ detailInfo.modelName }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.process.activeVersion')">
                {{ detailInfo?.activeVersion }}
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.createUser')">{{
                detailInfo.createUserName
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.createTime')">{{
                detailInfo.createTime
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.modifier')">{{
                detailInfo.modifyUserName
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.modifyTime')">{{
                detailInfo.modifyTime
              }}</a-descriptions-item>
              <a-descriptions-item
                :label="t('sys.description')"
                :contentStyle="{
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }"
              >
                <span :title="detailInfo.description">
                  {{ detailInfo.description }}
                </span>
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </a-collapse-panel>
      </a-collapse> -->

      <collapse-detail :collapseInfo="collapseInfo" ref="collapseDetailRef">
        <a-button class="collapse-btn" @click="handleConfig">
          <template #icon>
            <i class="iconfont icon-sheji1 mr8px"></i>
          </template>
          {{ t('sys.design') }}
        </a-button>
      </collapse-detail>
    </div>
    <div v-if="visible && tid" class="bg-[#E6E9EF] rounded-4px preview-wrap">
      <!-- <stage-canvas v-if="project" ref="canvas" style="pointer-events: none; user-select: none" /> -->
      <!-- <ApaasCollectSheetView v-if="isLabelDesign" :dataId="tid" />
      <EdhrContent v-else :edhr-id="tid" :edhr-name="detailInfo.name" /> -->
      <PaasBpmnDiagram v-if="detailInfo.id" :onlyFlow="true" :id="detailInfo.id" />
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicAction } from '/@web-render/utils/UserappPermissions';
  import { getPmProcessDefinitionInfo } from '/@/apis/gct-apaas/PmProcessDefinitionController';
  // import StageCanvas from '../label-design/stage/stage-canvas.vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import PaasBpmnDiagram from '../../../../../app-designer/src/views/process-designer-new/index.vue';
  import openWindow from '/@app-designer/tools/openWindow';
  import CollapseDetail from '../../../components/collapse-detail/index.vue';
  import { type CollapseItem } from '../../../components/collapse-detail/typing';

  const props = defineProps<{
    userActions: { [key in BasicAction]?: boolean };
  }>();

  const { t } = useI18n();
  const visible = ref<boolean>(false);
  const detailInfo = ref<any>({});
  const activeKey = ref(['1']);
  const tid = ref('');

  const collapseInfo = ref<CollapseItem[]>([]);
  const collapseDetailRef = ref();
  const getCollapseInfo = () => {
    const detail = detailInfo.value;
    return [
      {
        label: t('sys.process.approvalName'),
        name: detail.name,
      },
      {
        label: t('sys.process.approvalKey'),
        name: detail.key,
        key: detail.key,
        isCopy: true,
      },
      {
        label: t('sys.model.refModel'),
        name: detail.modelName,
      },
      {
        label: t('sys.process.activeVersion'),
        name: detail.activeVersion,
      },
      {
        label: t('sys.createUser'),
        name: detail.createUserName,
      },
      {
        label: t('sys.createTime'),
        name: detail.createTime,
      },
      {
        label: t('sys.modifier'),
        name: detail.modifyUserName,
      },
      {
        label: t('sys.modifyTime'),
        name: detail.modifyTime,
      },
      {
        label: t('sys.description'),
        name: detail.description,
        ellipsis: true,
      },
    ];
  };

  const onOpen = async (id) => {
    visible.value = true;
    detailInfo.value = {};
    if (id) {
      tid.value = id;
      let res = await getPmProcessDefinitionInfo({ id });
      detailInfo.value = res;
      collapseInfo.value = getCollapseInfo();
    }
  };

  const onClose = () => {
    collapseDetailRef.value?.refreshExpand();
    visible.value = false;
    tid.value = '';
  };

  const handleConfig = () => {
    openWindow('#/process-designer-new/' + tid.value);
  };

  defineExpose({ onOpen, onClose });
</script>
<style lang="scss" scoped>
  .basic-info {
    padding: 16px 20px 0;
    border-radius: 4px;
    background: #f7f8fa;
    margin-bottom: 12px;
  }

  .button-container {
    border-radius: 4px;
    background: #f7f8fa;
    text-align: center;
    display: flex;
    width: 100%;
    padding: 16px 24px;
    .btn {
      cursor: pointer;

      & + .btn {
        margin-left: 156px;
      }

      img {
        widows: 40px;
        margin-bottom: 8px;
      }

      div {
        color: #272727;
        font-size: 14px;
        font-weight: 400;
      }
    }
  }

  .edhr-preview {
    height: calc(100vh - 445px);
  }
</style>
<style lang="less" scoped>
  :global(.preview-drawer .ant-drawer-body) {
    flex: 1;
    display: flex !important;
    flex-direction: column !important;
    padding: 16px;
  }
  :deep(.ant-collapse-content-box) {
    padding: 0 !important;
  }
  .preview-wrap {
    flex: 1;
    padding: 10px 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    // :deep(.stage) {
    //   height: calc(100% - 20px);
    // }
  }
  :deep(.ant-collapse-header) {
    padding: 12px 0 !important;
    font-size: 16px;
  }
  :deep(.ant-descriptions-item-label) {
    color: #797a7d;
  }
  :deep(.ant-descriptions-item-content) {
    color: #212528;
  }
  .collapse-wrapper {
    position: relative;
    .collapse-btn {
      position: absolute;
      right: 0;
      top: 12px;
      z-index: 9;
      height: 28px;
      line-height: 18px;
      padding: 4px 12px;
      .iconfont {
        font-size: 14px;
      }
    }
  }
</style>
