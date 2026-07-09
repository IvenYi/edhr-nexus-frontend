<template>
  <basic-page-render>
    <div class="flex flex-col h100%">
      <div class="role-setting__description">
        <a-descriptions>
          <a-descriptions-item :label="t('sys.nameOfSth', { sth: t('sys.role') })">{{
            roleInfo.name
          }}</a-descriptions-item>
          <a-descriptions-item :label="t('sys.status')">
            <a-switch
              @click="handleStatusChange"
              :checked="roleInfo.enabled"
              :checked-value="1"
              :un-checked-value="0"
            />
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.notes')">{{
            roleInfo.description
          }}</a-descriptions-item>
        </a-descriptions>
      </div>
      <a-tabs class="--tl-space" v-model:activeKey="activeKey">
        <a-tab-pane key="WEB" :tab="t('sys.appDesigner.menuTab', { tab: 'Web' })">
          <permission-menu-table :roleId="roleId" :platform="'WEB'" />
        </a-tab-pane>
        <a-tab-pane
          key="MOBILE"
          :tab="t('sys.appDesigner.menuTab', { tab: 'PDA' })"
          v-if="appInfoStore.appInfo.mobileEnabled && appInfoStore.appInfo.suiteKey !== 'eDHR'"
        >
          <permission-menu-table :roleId="roleId" :platform="'MOBILE'" />
        </a-tab-pane>
        <a-tab-pane
          key="PAD"
          :tab="t('sys.appDesigner.menuTab', { tab: 'Pad' })"
          v-if="appInfoStore.appInfo.mobileEnabled"
        >
          <permission-menu-table :roleId="roleId" :platform="'PAD'" />
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, createVNode, PropType } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { RoleResponse } from '/@/apis/gct-platform/model';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getRoleInfo, putRoleByIdByEnabled } from '/@/apis/gct-apaas/RoleController';
  import PermissionMenuTable from './permission-menu-table.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { IModal } from '@gct/runtime';

  const props = defineProps({
    modal: { type: Object as PropType<IModal>, required: true },
    roleId: { type: String, required: true },
  });

  const appInfoStore = useAppInfoStore();

  const activeKey = ref('WEB');
  const { t } = useI18n();
  const { createMessage } = useMessage();

  const roleId = props.roleId;
  const roleInfo = ref<RoleResponse>({});

  const loadRoleInfo = async () => {
    if (!roleId) return;
    const res = await getRoleInfo({ id: roleId });
    roleInfo.value = res!;
  };
  loadRoleInfo();

  const handleStatusChange = () => {
    Modal.confirm({
      title: roleInfo.value.enabled === 1 ? t('sys.sureToDisable') : t('sys.sureToEnable'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        const enabled = roleInfo.value.enabled === 1 ? 0 : 1;
        await putRoleByIdByEnabled({
          id: roleInfo.value.id as string,
          enabled,
        });
        roleInfo.value.enabled = enabled;
        createMessage.success(t('sys.operationSuccess'));
      },
      onCancel() {},
    });
  };
</script>

<style lang="less" scoped>
  .basic-page {
    padding-top: 0;
  }

  .role-setting {
    &__description {
      padding: 22px 20px 2px;
      border-bottom: 1px solid #eaeaea;
    }
  }

  .section-title {
    display: flex;
    align-items: center;
    padding: 12px 20px;
    color: #333;
    font-size: 16px;
    line-height: 20px;

    &::before {
      content: '';
      display: block;
      width: 4px;
      height: 14px;
      margin-right: 8px;
      border-radius: 2px;
      background: var(--ant-primary-color);
    }
  }

  .role-permission__action-item {
    margin: 0 10px 0 0;
  }

  :deep(.ant-tabs) {
    display: flex;
    flex: 1;
    flex-direction: column;

    .ant-tabs-content-holder {
      flex: 1;

      .ant-tabs-content,
      .ant-tabs-tabpane {
        height: 100%;
      }

      .ant-tabs-tabpane {
        display: flex;
        flex-direction: column;
      }
    }
  }
</style>
