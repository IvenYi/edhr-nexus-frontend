<template>
  <div class="box-full script">
    <div class="container-wrapper">
      <div class="header">
        <div class="breadcrumb ml-17px">
          <a-breadcrumb separator="">
            <a-breadcrumb-item href="">{{ soInfo?.categoryResponse?.name }}</a-breadcrumb-item>
            <a-breadcrumb-separator />
            <a-breadcrumb-item href="">{{ soInfo?.name }}</a-breadcrumb-item>
          </a-breadcrumb>
        </div>
        <div class="action">
          <a-button class="mr-10px" danger @click="handleDelete">
            <div class="ant-btn--with-iconfont">
              <i class="iconfont icon-shanchu mr-6px"></i>
              {{ t('sys.delete') }}
            </div>
          </a-button>

          <a-button type="primary" ghost class="mr-10px" @click="handleEdit">
            <div class="ant-btn--with-iconfont">
              <i class="iconfont icon-bianji mr-6px"></i>
              {{ t('sys.edit') }}
            </div>
          </a-button>
          <a-button type="primary" @click="handleDevelop">
            <div class="ant-btn--with-iconfont">
              <i class="iconfont icon-sheji mr-6px"></i>
              {{ t('sys.appDesigner.develop') }}
            </div>
          </a-button>
        </div>
      </div>
      <div class="code-panel"> </div>
    </div>
    <div class="w-280px flex-none" style="border-left: 1px solid #d9d9d9">
      <so-basic-info :data="soInfo!" :versions="versionList" @ok="handleOk" />
    </div>
  </div>
  <service-orchestration-modal
    @register="register"
    :versions="versionList"
    :category="treeData"
    @refresh="onRefresh"
  />
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import ServiceOrchestrationModal from '../modal/service-orchestration-modal.vue';
  import {
    deleteServiceOrchestration,
    getServiceOrchestrationInfo,
  } from '/@/apis/gct-apaas/ServiceOrchestrationController';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { getServiceOrchestrationVersionPageList } from '/@/apis/gct-apaas/ServiceOrchestrationVersionController';
  import { ServiceOrchestrationResponse } from '/@/apis/gct-apaas/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import openWindow from '/@app-designer/tools/openWindow';
  import SoBasicInfo from './so-basic-info.vue';

  const [register, { openModal }] = useModal();
  const { t } = useI18n();
  const { selectedTreeKey, treeData, initTreeData } = useTreeSiderPage('LogicDevelop');

  const soInfo = ref<ServiceOrchestrationResponse>();
  const versionId = ref<string>();
  const versionList = ref<any[]>([]);

  const initData = async () => {
    if (!selectedTreeKey.value) return;
    soInfo.value = (await getServiceOrchestrationInfo({ id: selectedTreeKey.value })) || {};
    versionId.value = soInfo.value.orchestrationVersion?.id;
    const res = await getServiceOrchestrationVersionPageList({ soKey: soInfo.value.key });
    versionList.value = res!.data;
  };

  watch(
    selectedTreeKey,
    () => {
      initData();
    },
    {
      immediate: true,
    },
  );

  const onRefresh = () => {
    initData();
    initTreeData();
  };

  const handleOk = () => {
    initData();
  };

  // 编辑
  const handleEdit = async () => {
    soInfo.value = (await getServiceOrchestrationInfo({ id: selectedTreeKey.value! })) || {};
    openModal(true, { edit: true, data: soInfo.value });
  };

  // 删除
  const handleDelete = () => {
    Modal.confirm({
      title: t('sys.model.confirmDelScriptPage', { scriptPageName: soInfo.value!.name }),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        if (!selectedTreeKey.value) return;
        await deleteServiceOrchestration({ ids: selectedTreeKey.value });
        message.success(t('sys.delSuccess'));
        initTreeData();
      },
      onCancel: () => {},
    });
  };

  const handleDevelop = () => {
    openWindow('#/service-orchestration/' + selectedTreeKey.value);
  };
</script>

<style lang="less" scoped>
  .ant-btn--with-iconfont {
    display: flex;
    align-items: center;
    line-height: 1;
  }

  .script {
    display: flex;

    .info {
      width: 280px;
      border-left: 1px solid #eaeaea;

      .title {
        padding-top: 17px;
        padding-bottom: 11px;
        border-bottom: 1px solid #eaeaea;
        color: #333;
        font-family: PingFangSC-Medium, 'PingFang SC';
        font-size: 14px;
        font-weight: 500;
        text-align: center;
      }

      .list {
        padding: 0 12px;

        .row {
          margin: 14px 0;

          .version {
            display: flex;
            align-items: center;

            .btn {
              display: flex;
              align-items: center;
              width: 70px;
              margin-left: 6px;
              cursor: pointer;

              .icon {
                // text-align: center;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 18px;
                height: 18px;
                margin-right: 4px;
                border-radius: 4px;
                background-color: var(--ant-primary-1);
                color: var(--ant-primary-color);
                font-size: 14px;

                i {
                  z-index: 9;
                  font-size: 14px;
                }
              }

              .text {
                color: var(--ant-primary-color);
              }
            }
          }

          .col-val {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    .container-wrapper {
      flex: 1;
      width: calc(100% - 280px);
      height: 100%;

      .header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 60px;
        border-bottom: 1px solid #eaeaea;

        .action {
          margin-right: 17px;
        }
      }

      .code-panel {
        height: calc(100% - 60px);
        overflow: auto;

        :deep(.hljs) {
          background-color: #fff;
        }
      }
    }
  }
</style>
