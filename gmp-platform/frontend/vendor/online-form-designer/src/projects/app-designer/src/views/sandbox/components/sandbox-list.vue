<template>
  <div class="bg-[#F2F5F8] h100% flex flex-col">
    <div class="mb12px">
      <a-alert message="一次只允许存在 1 个沙箱，可删除后重新创建新的沙箱" type="info" show-icon />
    </div>
    <div class="flex-1 bg-[#ffffff] list-box px24px py26px list-container">
      <div v-for="item in props.dataList" :key="item.id">
        <div class="mb20px flex justify-between">
          <div class="title">{{ item.name }}</div>
          <div class="flex">
            <a-button class="mr12px" @click="updateSandbox(item)">
              {{ t('sys.ipaas.responseMethod.SYNC') }}
            </a-button>
            <div class="display-btn" @click="editSandbox(item)">
              {{ t('sys.edit') }}
            </div>
            <a-dropdown class="ml-1px hide-btn">
              <template #overlay>
                <a-menu>
                  <a-menu-item @click="deleteSandbox(item)">
                    {{ '删除' }}
                  </a-menu-item>
                </a-menu>
              </template>
              <EllipsisOutlined />
            </a-dropdown>
          </div>
        </div>
        <div class="btn-container flex">
          <a-button
            v-if="item?.webRoutePath"
            class="btn"
            @click="toSandboxEnvirement(item.webRoutePath)"
          >
            <template #icon>
              <img :src="WEB" class="mr6px" />
            </template>
            {{ t('sys.appDesigner.appFront') }} (Web)
          </a-button>
          <a-button
            v-if="item?.pdaRoutePath"
            class="btn"
            @click="toSandboxEnvirement(item.pdaRoutePath)"
          >
            <template #icon>
              <img :src="PDA" class="mr6px" />
            </template>
            {{ t('sys.appDesigner.appFront') }} (PDA)
          </a-button>
          <a-button
            v-if="item?.padRoutePath"
            class="btn"
            @click="toSandboxEnvirement(item.padRoutePath)"
          >
            <template #icon>
              <img :src="PAD" class="mr6px" />
            </template>
            {{ t('sys.appDesigner.appFront') }} (Pad)
          </a-button>
        </div>
        <div class="line my24px"></div>
        <div class="info w720px mb24px text-[#5A5F6B]">{{ item.description }}</div>
        <div class="basic-info flex items-center text-[#8B8B8B]">
          <div
            >{{ t('sys.createUser') }}：{{
              item?.createUserName.length > 12
                ? item?.createUserName.slice(0, 12) + '...'
                : item?.createUserName
            }}</div
          >
          <a-divider type="vertical" />
          <div>{{ t('sys.createTime') }}：{{ item?.createTime }}</div>
          <a-divider type="vertical" />
          <div
            >{{ t('sys.modifier') }}：{{
              item?.modifyUserName.length > 12
                ? item?.modifyUserName.slice(0, 12) + '...'
                : item?.modifyUserName
            }}</div
          >
          <a-divider type="vertical" />
          <div>{{ t('sys.modifyTime') }}：{{ item?.modifyTime }}</div>
        </div>
      </div></div
    >
  </div>
  <add-sandbox @register="register" @ok="emit('refresh')" />
  <loading-sandbox @register="registerLoading" @ok="emit('refresh')" />
</template>
<script setup lang="ts">
  import { computed, createVNode } from 'vue';
  import { useI18n } from 'vue-i18n';
  import PAD from '/@/assets/svg/pad.svg';
  import WEB from '/@/assets/svg/web.svg';
  import PDA from '/@/assets/svg/PDA.svg';
  import AddSandbox from './add-sandbox.vue';
  import LoadingSandbox from './loading-sandbox.vue';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import {
    getSandboxConfigValidStatus,
    putSandboxConfigById,
    postSandboxConfigSync,
    deleteSandboxConfig,
  } from '/@/apis/gct-apaas/SandboxConfigController';
  import { useModal } from '/@/components/Modal';
  import { Modal, message } from 'ant-design-vue';
  import { ExclamationCircleFilled } from '@ant-design/icons-vue';
  import { SandboxConfigResponse } from '@mobile/apis/gct-apaas/model';

  const appInfoStore = useAppInfoStore();

  const { t } = useI18n();

  const [register, { openModal }] = useModal();
  const [registerLoading, { openModal: openLoadingModal }] = useModal();

  const props = defineProps<{ dataList: SandboxConfigResponse[] }>();

  const emit = defineEmits(['refresh']);

  const path = computed(() => {
    return {
      webRoutePath: `/web-sandbox/${appInfoStore?.appInfo?.id}#/login`,
      pdaRoutePath: appInfoStore.appInfo.mobileEnabled
        ? `/mobile-sandbox/${appInfoStore?.appInfo?.id}/#/login`
        : '',
      padRoutePath: appInfoStore.appInfo.mobileEnabled
        ? `/pad-sandbox/${appInfoStore?.appInfo?.id}/#/login`
        : '',
    };
  });

  const updateSandbox = (item) => {
    Modal.confirm({
      title: '确认要同步最新正式环境数据至沙箱吗？',
      icon: createVNode(ExclamationCircleFilled),
      content: '同步最新正式环境数据，原沙箱配置及数据将被替换，同步后不可恢复，请谨慎操作哦！',
      okText: '确认',
      cancelText: '取消',
      width: 316,
      centered: true,
      onOk() {
        openLoadingModal(true, { ...item, ...path.value, type: 'UPDATE' });

        // await getSandboxConfigValidStatus({ appId: appInfoStore?.appInfo?.id });
        // await postSandboxConfigSync();
        // await putSandboxConfigById({ id: item.id }, { ...item, ...path.value });
        // emit('refresh');
      },
    });
  };

  const editSandbox = (item) => {
    openModal(true, { ...item });
  };

  const toSandboxEnvirement = (path) => {
    const link = document.createElement('a');
    link.href = `${location.origin}${path}`;
    link.target = '_blank';
    link.click();
    // window.open(path, '_blank');
  };
  const deleteSandbox = (item) => {
    Modal.confirm({
      title: `确认要删除 ${item.name} 沙箱吗？`,
      icon: createVNode(ExclamationCircleFilled),
      content: '删除沙箱，将同时删除沙箱配置及数据，删除后不可恢复，请谨慎操作哦！',
      okText: '确认',
      cancelText: '取消',
      width: 316,
      centered: true,
      onOk() {
        openLoadingModal(true, { ...item, ...path.value, type: 'DELETE' });
        // deleteSandboxConfig()
        //   .then(() => {
        //     message.success('删除成功');
        //     emit('refresh');
        //   })
        //   .finally(() => {});
      },
    });
  };
</script>
<style lang="less" scoped>
  :deep(.ant-alert-info) {
    height: 36px;
    border: 1px solid rgb(0 153 255 / 30%);
    border-radius: 4px;
    background-color: rgb(0 153 255 / 8%);
  }

  :deep(.ant-divider-vertical) {
    margin: 4px 16px 0;
  }

  .list-box {
    border-radius: 8px 8px 0 0;
  }

  .title {
    color: #1a1d23;
    font-size: 20px;
    font-weight: 600;
  }

  .btn {
    display: flex;
    align-items: center;
    width: 157px;
    height: 40px;
    margin-right: 12px;
    border: 1px solid #5a5f6b;
    color: #1a1d23;

    &:hover {
      background: #f2f5f8;
      color: #1a1d23;
    }
  }

  .display-btn {
    width: 72px;
    height: 32px;
    padding: 5px 20px;
    border-radius: 4px 0 0 4px;
    background-color: var(--ant-primary-color);
    color: #fff;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      border-color: var(--ant-primary-color-hover);
      background: var(--ant-primary-color-hover);
      color: #fff;
    }
  }

  .hide-btn {
    height: 32px;
    padding: 9px 8px;
    border-radius: 0 4px 4px 0;
    background-color: var(--ant-primary-color);
    color: #fff;
    cursor: pointer;

    &:hover {
      border-color: var(--ant-primary-color-hover);
      background: var(--ant-primary-color-hover);
      color: #fff;
    }
  }

  :deep(.ant-dropdown-menu-item) {
    width: 80px;
  }

  .line {
    width: 100%;
    height: 1px;
    background-color: #e0e3eb;
  }

  .list-container {
    overflow: auto;
  }
</style>
