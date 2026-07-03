<template>
  <a-layout-header :class="[prefixCls, prefixClsBi]">
    <bi-platform-logo class="ml-14px" />

    <div class="online-number" v-if="isProdSuiteApp">
      <icon-next value="icon-park:every-user" :size="16" />
      <div class="ml-6px">{{ t('sys.onlineNum') + ' ' + onlineNum }}</div>
    </div>

    <div class="ml-[auto]"></div>

    <locale-timezone-picker />
    <fullscreen-toggle />

    <div class="w-1px h-16px op-20 ml-24px mr-24px bg-[#000]"></div>
    <bi-platform-user-dropdown />
  </a-layout-header>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
  import IconNext from '@/components/Icon/src/IconNext.vue';
  import BiPlatformLogo from './bi-platform-logo.vue';
  import BiPlatformUserDropdown from './bi-platform-user-dropdown.vue';
  import { LocaleTimezonePicker } from '/@/layouts/default/header/components/localeTimezone-picker';
  import FullscreenToggle from '/@/layouts/default/header/components/FullscreenToggle.vue';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { createSessionStorage } from '/@/utils/cache';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const { mitt } = useMitt();
  const ss = createSessionStorage({
    hasEncrypt: false,
  });

  const prefixCls = 'platform-header';
  const prefixClsBi = 'bi-platform-header';
  const { isAppRun } = useEnv();
  const onlineNum = ref(1);

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
    background: #fff;
    line-height: 1.2em;
    :deep(.icon-next) {
      color: rgb(0 0 0 / 85%);
    }
  }

  .platfrom-logo-wrapper {
    width: var(--width);
    padding-left: 14px;
  }
</style>
<style lang="less">
  .bi-platform-header .icon-wrapper {
    cursor: pointer;
    color: rgba(from #1a1d23 r g b / 72%) !important;
    &:hover {
      background-color: #e6e9ef;
      color: #1a1d23;
    }
  }
  .bi-platform-header .platform-user-info__info {
    color: #1a1d23;
  }
  .bi-platform-header .platform-user-info__tenant {
    color: rgba(from #1a1d23 r g b / 64%);
    &:hover {
      color: #1a1d23;
    }
  }
</style>
