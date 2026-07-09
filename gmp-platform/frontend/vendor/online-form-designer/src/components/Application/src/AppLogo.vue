<!--
 * @Author: Vben
 * @Description: logo component
-->
<template>
  <div class="anticon" :class="getAppLogoClass" @click="goHome">
    <!-- 应用 -->
    <template v-if="appInfoStore.appInfo.logoType === 'ICON'">
      <!-- 自定义图标模式 -->
      <IconNext :value="appInfoStore.appInfo.logo" :size="32" />
      <span class="app-name">{{ appInfoStore.appInfo.name }}</span>
    </template>
    <template v-else-if="appInfoStore.appInfo.logoType === 'IMAGE'">
      <!-- 自定义图片模式 -->
      <img v-if="showTitle" :src="transformUrl(appInfoStore.appInfo.logo)" />
      <img v-else :src="transformUrl(appInfoStore.appInfo.logoThumbnail)" />
    </template>

    <!-- 平台 todo 基于project判断 -->
    <template v-else>
      <!-- default -->
      <img v-if="showTitle" :src="platformLogo" />
      <img v-else-if="getCollapsed" :src="platformThumbnail" />
      <img v-else :src="platformLoginLogo" />
    </template>
  </div>
</template>
<script lang="ts" setup>
  import { computed, unref } from 'vue';
  import { useGlobSetting } from '/@/hooks/setting';
  import { useGo } from '/@/hooks/web/usePage';
  import { useMenuSetting } from '/@/hooks/setting/useMenuSetting';
  import { useDesign } from '/@/hooks/web/useDesign';
  import { PageEnum } from '/@/enums/pageEnum';
  import { useUserStore } from '/@/store/modules/user';
  import { usePermissionStore } from '/@/store/modules/permission';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { IconNext } from '/@/components/Icon';

  import DefaultLogo from '/@/assets/images/logo.png';
  import DefaultThumbnail from '/@/assets/images/logo-white-collapse.png';

  const props = defineProps({
    /**
     * The theme of the current parent component
     */
    theme: { type: String, validator: (v: string) => ['light', 'dark'].includes(v) },
    /**
     * Whether to show title
     */
    showTitle: { type: Boolean, default: true },
    /**
     * The title is also displayed when the menu is collapsed
     */
    alwaysShowTitle: { type: Boolean },

    logoClass: { type: String },
  });

  const { prefixCls } = useDesign('app-logo');
  const { getCollapsedShowTitle, getCollapsed } = useMenuSetting();
  const userStore = useUserStore();
  const permissionStore = usePermissionStore();
  const { title } = useGlobSetting();
  const { getLoginLogo, getPlatformLogo, getPlatformThumbnail } = useRootSetting();

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

  const appInfoStore = useAppInfoStore();

  const go = useGo();

  const getAppLogoClass = computed(() => [
    prefixCls,
    props.theme,
    { 'collapsed-show-title': unref(getCollapsedShowTitle) },
  ]);

  const getTitleClass = computed(() => [
    `${prefixCls}__title`,
    {
      'xs:opacity-0': !props.alwaysShowTitle,
    },
  ]);

  function goHome() {
    go(permissionStore.getCurrentHomePath || PageEnum.BASE_HOME);
  }
</script>
<style lang="less" scoped>
  @prefix-cls: ~'@{namespace}-app-logo';

  .@{prefix-cls} {
    display: flex;
    align-items: center;
    padding-left: 7px;
    transition: all 0.2s ease;
    cursor: pointer;

    img {
      height: 36px;
    }

    svg {
      flex: none;
      color: #fff;
    }

    .app-name {
      max-width: calc(100% - 40px);
      margin-left: 6px;
      overflow: hidden;
      color: #fff;
      font-size: 18px;
      font-weight: bold;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &.light {
      border-bottom: 1px solid @border-color-base;
    }

    &.collapsed-show-title {
      padding-left: 20px;
    }

    &.light &__title {
      color: var(--ant-primary-color);
    }

    &.dark &__title {
      color: @white;
    }

    &__title {
      transition: all 0.5s;
      font-size: 16px;
      font-weight: 700;
      line-height: normal;
    }
  }

  .app-logo__contain {
    height: var(--height) !important;
    width: var(--width) !important;
    padding: 0;
    img {
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  }
</style>
