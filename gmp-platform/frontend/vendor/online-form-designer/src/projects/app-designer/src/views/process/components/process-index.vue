<template>
  <div class="wrap">
    <a-collapse
      v-model:activeKey="activeKey"
      :bordered="false"
      collapsible="icon"
      @change="handleCollapseChange($event)"
      style="margin-bottom: 16px"
    >
      <a-collapse-panel key="1">
        <template #header>
          <div class="header">
            <div class="header-title"> {{ t('sys.model.basicInformation') }}</div>
            <div class="action">
              <a-button class="ml-16px btn-text" @click.stop="handleEdit">
                <edit-outlined />
                {{ t('sys.edit') }}
              </a-button>
              <a-button class="ml-16px btn-text" @click.stop="handleDelete">
                <delete-outlined />
                {{ t('sys.delete') }}
              </a-button>
              <a-button type="primary" class="ml-16px btn-text" @click.stop="handleDesign">
                <i class="icon iconfont icon-sheji2" style="font-size: 14px"></i>
                <span class="ml-8px">{{ t('sys.design') }}</span>
              </a-button>
            </div>
          </div>
          <div :class="['description', { 'desc-expand': isExpand }]">
            <a-descriptions :column="3" class="item">
              <a-descriptions-item :label="t('sys.nameOfSth', { sth: t('sys.process.index') })">{{
                processInfo?.name
              }}</a-descriptions-item>
              <a-descriptions-item :label="t('sys.keyOfSth', { sth: t('sys.process.index') })">
                <copy-module-key :moduleKey="processInfo?.key" />
              </a-descriptions-item>
              <a-descriptions-item :label="t('sys.process.titleConfig')">
                {{ titleConfig }}
              </a-descriptions-item>
            </a-descriptions>
          </div>
        </template>
        <a-descriptions :column="3" class="desc-area">
          <a-descriptions-item :label="t('sys.typeOfSth', { sth: t('sys.process.index') })">{{
            processInfo?.type === 'BUSINESS' ? '业务流' : '审批流'
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.process.activeVersion')">{{
            processInfo?.activeVersion
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.updatePerson')">{{
            processInfo?.modifyUserName
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.updateTime')">{{
            processInfo?.modifyTime
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.createUser')">{{
            processInfo?.createUserName
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.createTime')">{{
            processInfo?.createTime
          }}</a-descriptions-item>
          <a-descriptions-item
            :span="2"
            :label="t('sys.description')"
            :contentStyle="{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              display: 'inlineBlock',
            }"
            >{{ processInfo?.description }}</a-descriptions-item
          >
        </a-descriptions>
      </a-collapse-panel>
    </a-collapse>
  </div>
  <process-modal @register="register" :categoryTree="treeData" @refresh="onRefresh" />
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import { message, Modal } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { useTreeSiderPage } from '/@/layouts/tree-sider-page/useTreeSiderPage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import openWindow from '/@app-designer/tools/openWindow';
  import {
    getPmProcessDefinitionInfo,
    deletePmProcessDefinition,
  } from '/@/apis/gct-apaas/PmProcessDefinitionController';
  import type { ProcessResponse } from '/@/apis/gct-apaas/model';
  import { EditOutlined, DeleteOutlined } from '@ant-design/icons-vue';
  import ProcessModal from '../modal/process-modal.vue';
  import CopyModuleKey from '/@/components/CopyModuleKey';

  const [register, { openModal }] = useModal();
  const { t } = useI18n();
  const { selectedTreeKey, treeData, initTreeData } = useTreeSiderPage();
  const isExpand = ref<boolean>(true);
  const activeKey = ref(['1']);

  const processInfo = ref<ProcessResponse>();

  const titleConfig = computed(() => {
    const json = processInfo.value?.titleConfig;
    if (json) {
      try {
        const data = JSON.parse(json);
        return data.exprEcho;
      } catch (err) {
        console.warn('title config error');
      }
    }
    return '';
  });

  const initData = async () => {
    if (!selectedTreeKey.value) return;
    processInfo.value = (await getPmProcessDefinitionInfo({ id: selectedTreeKey.value })) || {};
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

  const handleDesign = () => {
    openWindow('#/process-designer-new/' + processInfo.value?.id);
  };

  // 编辑
  const handleEdit = async () => {
    openModal(true, { edit: true, data: processInfo.value });
  };

  // 删除
  const handleDelete = () => {
    Modal.confirm({
      title: t('sys.sureToDelete'),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        if (!selectedTreeKey.value) return;
        await deletePmProcessDefinition({ ids: selectedTreeKey.value });
        message.success(t('sys.delSuccess'));
        initTreeData();
      },
      onCancel: () => {},
    });
  };

  const handleCollapseChange = (e) => {
    isExpand.value = !!e[0];
  };
</script>

<style lang="less" scoped>
  .wrap {
    flex: 1;
    height: 100%;
    overflow-y: hidden;
    background-color: #fff;
    :deep(.btn-text.ant-btn) {
      padding: 4px 12px;
      & > .anticon + span {
        margin-left: 8px;
      }
    }

    :deep(.ant-collapse-header) {
      flex-wrap: wrap;
      padding: 0;
      background-color: #fff;
      > div:first-child {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 48px;
        padding-top: 16px;
      }
    }

    :deep(.ant-collapse-item) {
      border-bottom: none;
    }

    .header {
      display: flex;
      flex: 1;
      align-items: center;
      justify-content: space-between;
      padding-top: 16px;
      padding-bottom: 12px;
      .header-title {
        font-size: 16px;
      }
      .action {
        .switch-wrap {
          display: inline-block;
        }
      }
    }

    .description {
      display: flex;
      align-items: center;
      // margin-left: 4px;
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
          // margin-left: 4px;
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
</style>
