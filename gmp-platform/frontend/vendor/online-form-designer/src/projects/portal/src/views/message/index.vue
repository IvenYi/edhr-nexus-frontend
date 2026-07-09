<template>
  <PlatformHeaderDetailLayout :menus="MessageCenterSubMenus" :hideContentTitle="true">
    <template #headerBtn>
      <div class="mr24px">
        <span class="top-right-text">{{ t('sys.menu.messageTips') }}</span>
        <a-button type="link" @click="readAll">{{ t('sys.menu.setMessageState') }}</a-button>
      </div>
    </template>
  </PlatformHeaderDetailLayout>
</template>

<script setup lang="ts">
  import PlatformHeaderDetailLayout from '/@/layouts/platform/platform-detail-layout.vue';
  import { putInternalMessageReadAll } from '/@/apis/gct-platform/InternalMessageController';
  import { MessageCenterSubMenus } from '/@portal/router/routes/constants';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMitt } from '/@page-designer/hooks/useMitt';

  const { t } = useI18n();
  const { mitt } = useMitt();

  const readAll = () => {
    putInternalMessageReadAll().then(() => {
      mitt.emit('read-message-all');
    });
  };
</script>

<style lang="less" scoped>
  .top-right-text {
    color: #c3c3c3;
    font-size: 14px;
    font-weight: 400;
  }
</style>
