<template>
  <div class="platform-logo">
    <img v-show="themeSetting.showLogo" :src="platformLogo" />
    <div class="title" :title="getPlatformName">
      {{ getPlatformName }}
    </div>
    <span class="platform-version">v{{ getPlatfromVersion }}</span>
    <div class="h-16px w-1px bg-[#fff] op-20 ml-16px mr-16px"></div>
    <div :title="getPlatformName">{{ systenTitle }}</div>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import DefaultLogo from '/@/assets/images/logo.png';
  import DefaultThumbnail from '/@/assets/images/logo-white-collapse.png';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ProjectName } from '/@/enums/appEnum';

  const {
    getLoginLogo,
    getPlatformLogo,
    getPlatformThumbnail,
    getPlatformName,
    getPlatfromVersion,
  } = useRootSetting();

  const { themeSetting } = useThemeSetting();
  const { getCurrentProject } = usePermissionStoreWithOut();
  const { t } = useI18n();

  const systenTitle = computed(() => {
    let title = '';
    switch (getCurrentProject) {
      case ProjectName.PORTAL:
        title = t('sys.workbench');
        break;
      case ProjectName.DEVELOPER_CENTER:
        title = t('sys.developCenter');
        break;
      case ProjectName.TENANT_CENTER:
        title = t('sys.tenantBackendManage');
        break;
      case ProjectName.BACKEND_MANAGEMENT:
        title = t('sys.enterpriseMgtBackend');
        break;
    }
    return title;
  });

  // 平台logo
  const platformLogo = computed(() => {
    return unref(getPlatformLogo) ? transformUrl(unref(getPlatformLogo)) : DefaultLogo;
  });

  // logo缩略图
  const platformThumbnail = computed(() => {
    return unref(getPlatformThumbnail)
      ? transformUrl(unref(getPlatformThumbnail))
      : DefaultThumbnail;
  });

  // 平台登录logo
  const platformLoginLogo = computed(() => {
    return unref(getLoginLogo) ? transformUrl(unref(getLoginLogo)) : DefaultLogo;
  });
</script>
<style lang="less" scoped>
  .platform-logo {
    display: flex;
    position: relative;
    align-items: center;
    font-size: 16px;

    img {
      width: 32px;
      height: 32px;
      object-fit: contain;
      margin-right: 8px;
    }

    .title {
      max-width: 116px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .platform-version {
    position: relative;
    top: -4px;
    margin-right: -24px;
    margin-left: 4px;
    padding: 4px 8px;
    transform: scale(0.6);
    transform-origin: left bottom;
    border-radius: 4px;
    background-color: rgb(255 255 255 / 20%);
    font-size: 16px;
  }
</style>
