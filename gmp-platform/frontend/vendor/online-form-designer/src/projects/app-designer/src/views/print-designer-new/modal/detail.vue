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
      <!-- <div v-show="isHasActions.length" class="button-container">
      <div
        v-for="item in isHasActions"
        :key="item.value"
        class="btn"
        @click="handleClick(item.value)"
      >
        <img :src="item.icon" />
        <div>{{ item.label }}</div>
      </div>
    </div> -->
      <!-- <a-row class="button-container">
      <a-col v-for="item in btnList" :key="item.value" :span="5">
      </a-col>
    </a-row> -->
      <!-- <a-button class="collapse-btn" @click="handleDesign">
        <template #icon>
          <i class="iconfont icon-sheji1 mr8px"></i>
        </template>
        {{ t('sys.design') }}
      </a-button> -->
      <!-- <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.basicInfo')">
          <div class="basic-info">
            <a-descriptions :column="3" class="basic-info-container">
              <a-descriptions-item
                :label="
                  isLabelDesign
                    ? t('sys.printDesigner.labelName')
                    : t('sys.appDesigner.printDesign.form.name')
                "
              >
                <span class="mr-4px" v-if="detailInfo.name || detailInfo.version">{{
                  isFrontPrint ? `${detailInfo.name}：${detailInfo.version}` : detailInfo.name
                }}</span>
                <a-tag color="processing" v-if="!!detailInfo.default && isFrontPrint">{{
                  t('sys.default')
                }}</a-tag>
              </a-descriptions-item>
              <a-descriptions-item
                v-if="!isFrontPrint"
                :label="
                  isLabelDesign
                    ? t('sys.printDesigner.labelKey')
                    : t('sys.appDesigner.printDesign.form.key')
                "
              >
                <copy-module-key :moduleKey="detailInfo.key" />
              </a-descriptions-item>

              <a-descriptions-item :label="t('sys.model.refModel')">
                <copy-module-key v-if="isFrontPrint" :moduleKey="detailInfo.modelKey" />
                <template v-else>
                  {{ detailInfo.modelName }}
                </template>
              </a-descriptions-item>

              <a-descriptions-item v-if="isLabelDesign" :label="t('sys.printDesigner.labelSize')">{{
                `${detailInfo.width || ''}mm*${detailInfo.height || ''}mm`
              }}</a-descriptions-item>
              <a-descriptions-item
                v-else
                :label="t('sys.appDesigner.printDesign.form.paperSize')"
                >{{
                  `${detailInfo.paperSize}(${detailInfo.width || ''}mm*${
                    detailInfo.height || ''
                  }mm)`
                }}</a-descriptions-item
              >
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
        <a-button class="collapse-btn" @click="handleDesign">
          <template #icon>
            <i class="iconfont icon-sheji1 mr8px"></i>
          </template>
          {{ t('sys.design') }}
        </a-button>
      </collapse-detail>
    </div>
    <div v-if="visible && tid" class="bg-[#E6E9EF] rounded-4px preview-wrap">
      <stage-canvas
        v-if="isLabelDesign && project"
        ref="canvas"
        style="pointer-events: none; user-select: none"
      />
      <document-view v-if="!isLabelDesign" :dataId="tid" />
      <!-- <ApaasCollectSheetView v-if="isLabelDesign" :dataId="tid" />
      <EdhrContent v-else :edhr-id="tid" :edhr-name="detailInfo.name" /> -->
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, reactive, computed, toRefs } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { Modal, message } from 'ant-design-vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import { deleteEdhrTmplRemoveVersionById } from '/@/apis/gct-apaas/EdhrTmplController';
  import versionCreateSVG from '@/assets/svg/version-create.svg';
  import versionCopySVG from '@/assets/svg/version-copy.svg';
  import DeleteSVG from '@/assets/svg/delete.svg';
  import DesignSVG from '@/assets/svg/design.svg';
  import { BasicAction } from '/@web-render/utils/UserappPermissions';
  import {
    getLabelGetVersionById,
    deleteLabelRemoveVersionById,
  } from '/@/apis/gct-apaas/LabelController';
  import {
    getDocumentGetVersionById,
    deleteDocumentRemoveVersionById,
  } from '/@/apis/gct-apaas/DocumentController';
  import StageCanvas from '../label-design/stage/stage-canvas.vue';
  import { usePage, loadLabelInfo } from '../label-design/hooks/usePage';
  import DocumentView from '/@online-form/views/integration/apaas_dp/designer/apaas-dp-print-sheet-view.vue';
  import CollapseDetail from '../../../components/collapse-detail/index.vue';
  import { type CollapseItem } from '../../../components/collapse-detail/typing';

  const props = defineProps<{
    isLabelDesign: boolean;
    isFrontPrint: boolean;
    userActions: { [key in BasicAction]?: boolean };
  }>();

  const { isLabelDesign, userActions } = toRefs(props);
  const { project } = usePage();

  const emit = defineEmits(['refresh', 'handlerDesign', 'handlerVersionCreate']);

  const { t } = useI18n();

  const visible = ref<boolean>(false);

  let detailInfo = ref<any>({});

  const computedTitle = computed(() => {
    return isLabelDesign.value ? t('sys.pageDesigner.label') : t('sys.pageDesigner.document');
  });

  const isHasActions = computed(() => {
    return btnList.filter((e) => userActions[e.showkey]).filter((i) => i.isShow);
  });

  const activeKey = ref(['1']);

  const tid = ref('');

  const collapseInfo = ref<CollapseItem[]>([]);

  const collapseDetailRef = ref();

  const getCollapseInfo = () => {
    const detail = detailInfo.value;
    return [
      {
        label: isLabelDesign.value
          ? t('sys.printDesigner.labelName')
          : t('sys.appDesigner.printDesign.form.name'),
        name: props.isFrontPrint ? `${detail.name}：${detail.version}` : detail.name,
        hasTag: !!detail.default && props.isFrontPrint,
        tagList: [
          {
            name: t('sys.default'),
            key: detail.default,
            color: 'processing',
          },
        ],
      },
      {
        label: isLabelDesign.value
          ? t('sys.printDesigner.labelKey')
          : t('sys.appDesigner.printDesign.form.key'),
        name: detail.key,
        key: detail.key,
        isCopy: true,
        hidden: props.isFrontPrint,
      },
      {
        label: t('sys.model.refModel'),
        name: detail.modelName,
        key: detail.modelName,
        isCopy: false,
      },
      {
        label: t('sys.printDesigner.labelSize'),
        name: `${detail.width || ''}mm*${detail.height || ''}mm`,
        hidden: !isLabelDesign.value,
      },
      {
        label: t('sys.appDesigner.printDesign.form.paperSize'),
        name: `${detail?.paperSize}(${detail.width || ''}mm*${detail.height || ''}mm)`,
        hidden: isLabelDesign.value,
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
        span: isLabelDesign.value ? 2 : 1,
      },
    ];
  };

  const btnList = [
    {
      label: t('sys.pageDesigner.version_createText'),
      value: 'versionCreate',
      icon: versionCreateSVG,
      showkey: BasicAction.Insert,
      isShow: props.isFrontPrint,
    },
    {
      label: t('sys.pageDesigner.version_copyText'),
      value: 'versionCopy',
      icon: versionCopySVG,
      showkey: BasicAction.Insert,
      isShow: props.isFrontPrint,
    },
    {
      label: t('sys.delete'),
      value: 'delete',
      icon: DeleteSVG,
      showkey: BasicAction.Delete,
      isShow: true,
    },
    {
      label: t('sys.design'),
      value: 'design',
      icon: DesignSVG,
      showkey: BasicAction.Design,
      isShow: true,
    },
  ];

  const onOpen = async (id) => {
    visible.value = true;
    detailInfo.value = {};
    if (id) {
      tid.value = id;
      let res = isLabelDesign.value
        ? await getLabelGetVersionById({ id })
        : await getDocumentGetVersionById({ id });
      detailInfo.value = { ...res, default: res?.default || res?.defaulted };
      console.log('detailInfo', detailInfo.value);
      collapseInfo.value = getCollapseInfo();
      if (isLabelDesign.value) {
        loadLabelInfo(id);
      }
    }
  };

  const onClose = () => {
    collapseDetailRef.value?.refreshExpand();
    visible.value = false;
    tid.value = '';
  };

  const handleClick = (type) => {
    const record = {
      ...detailInfo,
      default: 0,
      handlerType: type === 'versionCreate' ? 'create' : 'copy',
      id: type === 'versionCreate' ? '' : detailInfo.value.id,
      version: type === 'versionCreate' ? '' : 'Copy' + detailInfo.value.version,
      designerJson: type === 'versionCreate' ? '' : detailInfo.value.designerJson,
      runtimeJson: type === 'versionCreate' ? '' : detailInfo.value.runtimeJson,
      operation: type === 'versionCreate' ? '' : detailInfo.value.operation,
    };
    switch (type) {
      case 'delete':
        Modal.confirm({
          title: t('sys.confirmDel', { sth: `【${detailInfo.value.name}】${computedTitle.value}` }),
          content: t('sys.onlineForm.deleteVersionTips', {
            sth: isLabelDesign.value ? t('sys.pageDesigner.label') : t('sys.pageDesigner.document'),
          }),
          okText: t('sys.okText'),
          cancelText: t('sys.cancel'),
          async onOk() {
            if (isLabelDesign.value) {
              await deleteLabelRemoveVersionById({ id: detailInfo.value.id });
            } else {
              await deleteDocumentRemoveVersionById({ id: detailInfo.value.id });
              // await deleteEdhrTmplRemoveVersionById({ id: detailInfo.id });
            }
            message.success(t('sys.delSuccess'));
            onClose();
            emit('refresh');
          },
          onCancel() {},
        });
        break;
      case 'design':
        emit('handlerDesign', detailInfo);
        break;
      default:
        emit('handlerVersionCreate', record);
        return undefined;
    }
  };

  const handleDesign = () => {
    emit('handlerDesign', detailInfo.value);
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
    // padding: 20px;
    border-radius: 4px;
    background: #f7f8fa;
    text-align: center;
    display: flex;
    width: 100%;
    padding: 16px 24px;

    // .btn {
    //   display: flex;
    //   flex-direction: column;
    //   padding: 16px 24px;
    //   // justify-content: center;
    // }

    .btn {
      // width: 72px;
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
  // :deep(.ant-collapse-content-box) {
  //   padding: 0 !important;
  // }
  .preview-wrap {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    // :deep(.stage) {
    //   height: calc(100% - 20px);
    // }
  }
  // :deep(.ant-collapse-header) {
  //   padding: 12px 0 !important;
  //   font-size: 16px;
  // }
  // :deep(.ant-descriptions-item-label) {
  //   color: #797a7d;
  // }
  // :deep(.ant-descriptions-item-content) {
  //   color: #212528;
  // }

  .collapse-wrapper {
    // position: relative;
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
