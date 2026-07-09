<template>
  <div class="h-full flex">
    <div class="w-222px flex flex-col flex-none">
      <!-- <div class="border-bottom pl-16px pr-16px pt-24px pb-24px flex-none">
        <a-button type="primary" ghost block @click="onCreate">
          <template #icon>
            <plus-outlined />
          </template>
          {{ t('sys.newSth', { sth: t('sys.ipaas.connectionFlow') }) }}
        </a-button>
      </div> -->
      <div class="flex-1 h-1px">
        <CategorySider
          class="h-full"
          :module="CategoryModuleEnum.FLOW"
          v-model:value="categoryId"
          :siderTitle="$t('sys.category')"
          :canCreate="userActions.AddCate"
          :canRename="userActions.RenameCate"
          :canDelete="userActions.DeleteCate"
        />
      </div>
    </div>
    <div class="w-1px flex-1 h-ful p-24px"> <FlowInfo :categoryId="categoryId" :userActions="userActions" /></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, createVNode, computed } from 'vue';
  import { Empty, Modal, message } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CategorySider, CategoryModuleEnum } from '/@ipaas/comps/category';
  import CopyModuleKey from '/@/components/CopyModuleKey';
  import FlowInfo from './flow-info.vue';
  // import flowRunningRecord from './flow-running-record.vue';
  // import flowAssociatedAccount from './flow-associated-account.vue';
  // import flowReleaseRecord from './flow-release-record.vue';
  import IPaasAppTree from './tree.vue';
  import FlowModal from './flow-modal.vue';
  // import { FlowApiConfig } from '../api';
  import { pick } from 'lodash-es';
  import { openWindow, genUrl } from '/@/utils';
  import {
    deleteFlowByFuuid,
    putFlowOffline,
    putFlowOnline,
  } from '/@/apis/gct-ipaas/IpaasDataFlowController';
  import { getBffFlowByFuuid } from '/@/apis/gct-ipaas/IpaasBackForFrontController';
  import type {
    FlowMainResp,
    FlowVersionResp,
    BizFlowMainResp,
    CategoryResp,
  } from '/@/apis/gct-ipaas/model';
  // import VersionForm from '../modal/version-form.vue';
  import { ConnectionFlowStatus } from '/@ipaas/enums';
  import { useFlowEntry } from './useFlowEntry';

  defineProps<{
    userActions: { [key: string]: boolean };
  }>();

  const categoryId = ref<string | undefined>(undefined);

  const { t } = useI18n();

  const { initTreeData } = useFlowEntry();

  // const isExpand = ref<boolean>(false);
  const activeKey = ref<'1' | '2' | '3' | '4'>('1');
  const fuuid = ref<string>('');
  const fversion = ref<string>('');
  const flowCategoryInfo = ref<Partial<CategoryResp>>({});
  const flowBasicInfo = ref<Partial<FlowMainResp>>({});
  const flowVersions = ref<FlowVersionResp[]>([]);

  /**
   * 重置选中信息
   */
  const resetFlow = () => {
    fuuid.value = '';
    fversion.value = '';
    flowCategoryInfo.value = {};
    flowBasicInfo.value = {};
    flowVersions.value = [];
  };

  /**
   * 当前版本信息
   */
  const flowVersionInfo = computed<FlowVersionResp | undefined>(() => {
    return flowVersions.value.find((item) => item.version === fversion.value);
  });

  /**
   * 获取连接流详情
   */
  const getFlowDetail = async (id: string) => {
    const res: BizFlowMainResp = await getBffFlowByFuuid({ fuuid: id });
    flowBasicInfo.value = res.flow ?? {};
    flowCategoryInfo.value = res.category ?? {};
    fuuid.value = id;
    fversion.value = res.currentVersion.version ?? '';
    flowVersions.value = res.versions ?? [];
  };

  // 新建数据流
  const onCreate = async () => {
    const title = t('sys.newSth', {
      sth: t('sys.ipaas.connectionFlow'),
    });
    const result = await gct.openUtil.modal(
      FlowModal,
      {
        isEdit: false,
        context: {},
      },
      {
        title: title,
        width: 640,
        showFooter: true,
        okText: t('sys.okText'),
      },
    );
    if (result.ok) {
      await initTreeData();
    }
  };

  // 编辑数据流
  const onEdit = async () => {
    console.log(flowBasicInfo);
    const title = t('sys.editSth', {
      sth: t('sys.ipaas.connectionFlow'),
    });
    // const context = {};
    const result = await gct.openUtil.modal(
      FlowModal,
      {
        isEdit: true,
        context: {
          ...pick(flowBasicInfo.value, ['fuuid', 'name', 'modelKey', 'mark']),
          fAppId: flowCategoryInfo.value.id,
        },
      },
      {
        title: title,
        width: 800,
        showFooter: true,
        okText: t('sys.okText'),
      },
    );
    if (result.ok) {
      getFlowDetail(fuuid.value);
      await initTreeData();
    }
  };

  // 点击分类节点
  const handleFlowChange = (node: FlowMainResp) => {
    Object.assign(flowBasicInfo.value, node);
    node.fuuid && getFlowDetail(node.fuuid);
  };

  // 删除连接流
  const onDelete = async () => {
    const onlineVersion = flowVersions.value.find(
      (item) => item.statusStr === ConnectionFlowStatus.Online,
    );
    if (onlineVersion) {
      message.warn(t('存在已上线的版本，不能删除'));
      return;
    }

    Modal.confirm({
      title: t('sys.sureToDelete'),
      icon: () =>
        createVNode(
          'span',
          {
            class: 'anticon anticon-exclamation-circle',
          },
          [
            createVNode('i', {
              class: 'iconfont icon-jinggao1',
              style: { position: 'relative', top: '3px', color: '#FF8C4B' },
            }),
          ],
        ),
      okText: t('sys.okText'),
      cancelText: t('sys.cancel'),
      async onOk() {
        await deleteFlowByFuuid({ fuuid: fuuid.value });
        message.success(t('sys.delSuccess'));
        initTreeData();
        resetFlow();
      },
    });
  };

  // 设计
  const onDesign = () => {
    openWindow(
      genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB_CONNECTION_FLOW}`, {
        fuuid: flowBasicInfo.value.fuuid,
      }),
      {
        target: '_blank',
      },
    );
  };
</script>

<style lang="less" scoped>
  .border-right {
    border-right: 1px solid #e5e7eb;
  }

  .border-bottom {
    border-bottom: 1px solid #e5e7eb;
  }

  :deep(.tree-container-wrapper) {
    padding: 0;

    .common-layout__tree {
      border: 0;
      border-right: 1px solid @gct-modal-border-color;
    }

    .content {
      border: 0;

      .content-wrapper {
        padding: 0;
      }
    }
  }

  .wrap {
    :deep(.ant-collapse-header) {
      flex-wrap: wrap;
      padding: 0;
      background-color: #fff;

      > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 34px;
      }
    }

    .header-title {
      display: flex;
      align-items: center;
      height: 34px;
    }

    :deep(.ant-collapse-item) {
      border-bottom: none;
    }

    .header {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 12px;

      .header-title {
        font-size: 16px;
      }

      .action {
        overflow-x: auto;
        white-space: nowrap;

        .switch-wrap {
          display: inline-block;
        }
      }
    }

    .description {
      display: flex;
      align-items: center;
      padding: 20px 0;
      border-radius: 4px;
      background-color: #f7f8fa;

      &.desc-expand {
        border-bottom-right-radius: 0;
        border-bottom-left-radius: 0;
      }

      .item {
        padding: 0 20px;
      }

      :deep(.ant-descriptions-row) {
        td {
          padding-bottom: 0;
        }
      }
    }

    :deep(.ant-collapse.ant-collapse-borderless) {
      background: transparent;

      .ant-collapse-item {
        .ant-collapse-content {
          border-radius: 0 0 4px 4px;
          background-color: #f7f8fa;

          .ant-collapse-content-box {
            padding: 0 20px;
          }
        }
      }
    }

    :deep(.ant-descriptions-item-container .ant-descriptions-item-label) {
      color: #797a7d;
    }

    .desc-area {
      color: #333;
      font-family: PingFangSC-Regular, 'PingFang SC';
      font-size: 14px;
      font-weight: 400;

      :deep(.ant-descriptions-row) {
        td {
          padding-bottom: 20px;
        }
      }
    }

    :deep(.ant-tabs-top > .ant-tabs-nav) {
      margin-bottom: 0;
    }

    :deep(.ant-tabs-content) {
      border-right: 1px solid @gct-input-border-color;
      border-bottom: 1px solid @gct-input-border-color;
      border-left: 1px solid @gct-input-border-color;
    }
  }

  .empty-warp {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100%;
  }

  .ant-tabs {
    height: 100%;

    :deep(> .ant-tabs-content-holder > .ant-tabs-content) {
      height: 100%;
    }
  }
</style>
