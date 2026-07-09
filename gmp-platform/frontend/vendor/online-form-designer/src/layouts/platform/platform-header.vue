<template>
  <a-layout-header :class="prefixCls">
    <template v-if="renderAppLogo">
      <template v-if="isHorizontal">
        <div class="horizontal-box">
          <platform-logo-app-horizontal />
        </div>
      </template>

      <platform-logo-app />
    </template>
    <platform-logo v-else class="ml-14px" />
    <div class="online-number" v-if="isProdSuiteApp">
      <icon-next value="icon-park:every-user" :size="16" />
      <div class="ml-6px">{{ t('sys.onlineNum') + ' ' + onlineNum }}</div>
    </div>
    <div v-if="isSandbox" class="sandbox text-[12px] ml32px">
      <img :src="sandboxIcon" alt="" class="mr4px" />
      {{ t('sys.menu.sandbox') }}
    </div>
    <template v-if="getCurrentProject === 'app-designer'">
      <app-branch class="ml-20px" />
      <app-draft-state class="ml-10px" />
    </template>

    <div class="ml-[auto]"></div>

    <test-env-tag v-if="isTestEnv" class="mr-32px" />
    <component-search v-if="getCurrentProject === 'app-designer'" />
    <preview-app v-if="getCurrentProject === 'app-designer'" class="ml-16px" />

    <message-entry v-if="renderProcessEntry || getCurrentProject === ProjectName.WEB_RENDER" />
    <process-entry v-if="renderProcessEntry" />
    <locale-timezone-picker />
    <fullscreen-toggle />
    <!-- <message-entry class="ml-16px" /> -->
    <system-toggle v-if="renderSystemToggle" :el="PlatformSystemToggleRef" />

    <div
      class="w-1px h-16px op-20 ml-24px mr-24px"
      :class="{ 'bg-[#fff]': !isHorizontal, 'bg-[#000]': isHorizontal }"
    ></div>
    <platform-user-dropdown />

    <quit-preview v-if="renderQuitPreview" class="absolute top-50% left-50% -translate-50%" />
  </a-layout-header>
</template>

<script setup lang="ts">
  import { ref, computed, inject, onMounted, onBeforeUnmount } from 'vue';
  import { usePermissionStoreWithOut } from '/@/store/modules/permission';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  import IconNext from '@/components/Icon/src/IconNext.vue';
  import PlatformLogo from './platform-logo.vue';
  import PlatformLogoApp from './platform-logo-app.vue';
  import PlatformLogoAppHorizontal from './platform-logo-app-horizontal.vue';
  import SystemToggle from './system-toggle.vue';
  import PlatformUserDropdown from './platform-user-dropdown.vue';
  import { LocaleTimezonePicker } from '/@/layouts/default/header/components/localeTimezone-picker';
  import MessageEntry from '/@/layouts/default/header/components/MessageEntry.vue';
  import ProcessEntry from '/@/layouts/default/header/components/ProcessEntry.vue';
  import FullscreenToggle from '/@/layouts/default/header/components/FullscreenToggle.vue';
  import TestEnvTag from '/@/layouts/default/header/components/TestEnvTag.vue';
  import PreviewApp from '/@/layouts/default/header/components/PreviewApp.vue';
  import QuitPreview from '/@/layouts/default/header/components/QuitPreview.vue';
  import AppBranch from '/@/layouts/default/header/components/AppBranch.vue';
  import { AppDraftState } from '/@/components/AppDraftState';
  import { ProjectName } from '/@/enums/appEnum';
  import { usePreview } from '/@/hooks/develop/usePreview';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { createSessionStorage } from '/@/utils/cache';
  import { ComponentSearch } from '/@/layouts/default/header/components/search';
  import sandboxIcon from '/@/assets/svg/icon_sandbox_icon.svg';

  const { t } = useI18n();
  const { appInfo } = useAppInfoStore();
  const { mitt } = useMitt();
  const ss = createSessionStorage({
    hasEncrypt: false,
  });

  const isHorizontal = inject('isHorizontal') as Boolean;

  const prefixCls = computed(() => {
    const classList = ['platform-header'];
    if (isHorizontal?.value) {
      classList.push('horizontal-layout-header');
    }
    if (renderRunning.value) {
      classList.push('running-header');
    }
    return classList;
  });

  const { getCurrentProject } = usePermissionStoreWithOut();
  const { isTestEnv, getEnv, isAppProd, isAppRun, isSandbox } = useEnv();
  const PlatformSystemToggleRef = ref();
  const { previewFromUrl } = usePreview();
  const onlineNum = ref(1);

  const renderAppLogo = computed(() => {
    return [ProjectName.APP_DESIGNER, ProjectName.WEB_RENDER].includes(
      getCurrentProject as ProjectName,
    );
  });

  const renderProcessEntry = computed(() => {
    return ProjectName.PORTAL === getCurrentProject;
  });

  const renderQuitPreview = computed(() => {
    return (
      ProjectName.WEB_RENDER === getCurrentProject &&
      !!previewFromUrl.value &&
      location.pathname.includes('/web-render/')
    );
  });

  const renderRunning = computed(() => {
    return isAppProd || renderQuitPreview.value;
  });

  const renderSystemToggle = computed(() => {
    return !isTestEnv.value && getCurrentProject !== ProjectName.WEB_RENDER;
  });

  const isProdSuiteApp = computed(() => {
    return isAppRun;
  });

  onMounted(() => {
    if (isProdSuiteApp.value) {
      onlineNum.value = ss.get('suite-app-online-count') ?? 0;
      mitt.on('update-online-count', (num) => {
        onlineNum.value = num;
      });
    }
  });

  onBeforeUnmount(() => {
    mitt.off('update-online-count');
  });
</script>

<style lang="less" scoped>
  @prefix-cls: ~'platform-header';

  .@{prefix-cls} {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: space-between;
    height: 54px;
    padding: 0 24px 0 0;
    background: #1a1d23;
    color: #fff;
    line-height: 1.2em;

    &.running-header {
      background-color: var(--ant-primary-color);
    }

    &.horizontal-layout-header {
      background: #fff;
      color: rgb(0 0 0 / 85%);

      :deep(.icon-next) {
        color: rgb(0 0 0 / 85%);
      }

      .horizontal-box {
        width: 55px;
        height: 100%;
        background-color: var(--ant-primary-color);
      }
    }
  }

  .platfrom-logo-wrapper {
    width: var(--width);
    padding-left: 14px;
  }

  .online-number {
    display: flex;
  }

  .sandbox {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 90px;
    height: 28px;
    border: 1px solid rgb(255 255 255 / 40%);
    border-radius: 20px;
    background: linear-gradient(90deg, #fa773f 0%, #ffac38 100%);
    color: #fff;
  }
</style>
