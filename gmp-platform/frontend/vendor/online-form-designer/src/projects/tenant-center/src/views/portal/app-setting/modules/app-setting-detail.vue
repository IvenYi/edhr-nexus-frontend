<template>
  <a-drawer
    v-model:visible="open"
    width="75%"
    placement="right"
    :closable="false"
    :style="{ position: 'absolute' }"
    :bodyStyle="{ padding: 0 }"
    :get-container="getContainer"
  >
    <div
      class="flex justify-between items-center px-6 py-3 border-b border-b-solid border-[#eaeaea]"
    >
      <div class="flex items-center">
        <div class="title-logo">
          <template v-if="appInfo?.logoType === 'ICON'">
            <div
              class="logo-icon"
              :style="{
                '--logo-background': appInfo.logoBgColor,
                '--logo-color': appInfo.logoColor,
              }"
            >
              <IconNext :value="appInfo?.logo" :size="16" />
            </div>
          </template>
          <template v-else-if="appInfo?.logoType === 'IMAGE'">
            <img :src="transformUrl(appInfo?.logoThumbnail)" alt="" />
          </template>
        </div>
        <div class="ml-2">{{ appInfo.name }}</div>
      </div>
      <a-button type="text" @click="onClose">
        <template #icon>
          <CloseOutlined />
        </template>
      </a-button>
    </div>
    <div class="app-setting-detail">
      <div class="header">
        <div class="header-logo mr-20px">
          <template v-if="appInfo?.logoType === 'ICON'">
            <div
              class="logo-icon"
              :style="{
                '--logo-background': appInfo.logoBgColor,
                '--logo-color': appInfo.logoColor,
              }"
            >
              <IconNext :value="appInfo?.logo" :size="42" />
            </div>
          </template>
          <template v-else-if="appInfo?.logoType === 'IMAGE'">
            <img :src="transformUrl(appInfo?.logoThumbnail)" alt="" />
          </template>
        </div>
        <a-descriptions :column="4" class="mt-3">
          <!-- <a-descriptions-item :label="t('sys.nameOfSth', { sth: t('sys.app.index') })">{{
            appInfo.name
          }}</a-descriptions-item> -->
          <a-descriptions-item :label="t('sys.app.id')">
            {{ appInfo.id }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.description')" :span="3">
            {{ appInfo.description }}
          </a-descriptions-item>
          <a-descriptions-item :label="t('sys.enabled')">
            <a-switch
              @click="handleStatusChange"
              :checked="appInfo.releasedStatus"
              :checked-value="1"
              :un-checked-value="0"
              :disabled="!userActions.Setting"
            />
          </a-descriptions-item>
        </a-descriptions>
      </div>
      <div class="p-20px">
        <AppSetting :app-id="props.appId" app-env="prod" :disabled="!userActions.Setting" />
      </div>
    </div>
  </a-drawer>
</template>

<script setup lang="ts">
  import { ref, createVNode, computed, watch } from 'vue';
  import {
    putReleasedAppDisableByAppId,
    putReleasedAppEnableByAppId,
  } from '/@/apis/gct-platform/PublishedAppController';
  import { getAppInfoById } from '/@/apis/gct-platform/AppController';
  import type { AppResponse } from '/@/apis/gct-platform/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { Modal } from 'ant-design-vue';
  import { ExclamationCircleOutlined, CloseOutlined } from '@ant-design/icons-vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { IconNext } from '/@/components/Icon';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { AppSetting } from '/@/components/AppSetting';

  const { createMessage } = useMessage();

  const props = defineProps<{
    appId: string;
  }>();

  const { t } = useI18n();
  const { hasPermission } = usePermission();

  const open = ref(false);

  const appInfo = ref<AppResponse>({});

  const getContainer = () => document.body;

  const userActions = computed(() => {
    return {
      Setting: hasPermission(`PortalAppSetting.${BasicAction.Setting}`),
    };
  });

  const loadAppInfo = async () => {
    if (!props.appId) return;
    const res = await getAppInfoById({ id: props.appId });
    appInfo.value = res!;
  };

  watch(
    () => props.appId,
    () => {
      loadAppInfo();
    },
    {
      immediate: true,
    },
  );

  const onClose = () => {
    open.value = false;
  };

  /**
   * 启用
   */
  const handleEnable = async () => {
    await putReleasedAppEnableByAppId({
      appId: props.appId,
    });
    createMessage.success(t('sys.tipEnabledSuccess'));
  };

  /**
   * 禁用
   */
  const handleDisable = async () => {
    await putReleasedAppDisableByAppId({
      appId: props.appId,
    });
    createMessage.success(t('sys.tipDisabledSuccess'));
  };

  const handleStatusChange = () => {
    Modal.confirm({
      title: appInfo.value.releasedStatus === 1 ? t('sys.sureToDisable') : t('sys.sureToEnable'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        appInfo.value.releasedStatus === 1 ? await handleDisable() : await handleEnable();
        appInfo.value.releasedStatus = appInfo.value.releasedStatus === 1 ? 0 : 1;
      },
      onCancel() {},
    });
  };

  defineExpose({
    open,
  });
</script>

<style lang="less" scoped>
  .title-logo {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    overflow: hidden;
    border-radius: 4px;
    background-color: #f4f4f4;

    > img {
      width: 100%;
      height: auto;
      object-fit: contain;
    }

    .logo-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      // background-color: #3370ff;
      width: 24px;
      height: 24px;
      border-radius: 4px;
      background-color: var(--logo-background, #3370ff);
      // color: #fff;
      .icon-next {
        color: var(--logo-color, #fff);
      }
    }
  }
  .app-setting-detail {
    .header {
      display: flex;
      align-items: center;
      padding: 20px;
      border-bottom: 1px solid #eaeaea;

      .header-logo {
        display: flex;
        flex-shrink: 0;
        align-items: center;
        justify-content: center;
        width: 68px;
        height: 68px;
        overflow: hidden;
        border-radius: 4px;
        background-color: #f4f4f4;

        > img {
          width: 100%;
          height: auto;
          object-fit: contain;
        }

        .logo-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          // background-color: #3370ff;
          width: 58px;
          height: 58px;
          border-radius: 4px;
          background-color: var(--logo-background, #3370ff);
          // color: #fff;
          .icon-next {
            color: var(--logo-color, #fff);
          }
        }
      }

      .detail {
        width: 100%;
        margin-left: 14px;

        .description {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
</style>
