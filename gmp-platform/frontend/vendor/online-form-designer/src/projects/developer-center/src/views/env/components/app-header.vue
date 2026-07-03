<template>
  <div class="flex">
    <app-logo
      class="mr-14px flex-none"
      :type="appInfo.app?.logoType"
      :logo="appInfo.app?.logo"
      :logoThumbnail="appInfo.app?.logoThumbnail"
      :background="appInfo.app?.logoBgColor"
    />
    <a-descriptions
      :column="4"
      :labelStyle="{
        color: '#7F8695',
      }"
      :contentStyle="{
        color: '#333333',
      }"
    >
      <a-descriptions-item :label="t('sys.nameOfSth', { sth: t('sys.app.index') })">
        {{ appInfo.appName }}
      </a-descriptions-item>
      <a-descriptions-item :label="t('sys.app.id')">
        {{ appInfo.appId }}
      </a-descriptions-item>
      <a-descriptions-item :label="t('sys.app.version.index')">
        {{ appInfo.appVersion }}
      </a-descriptions-item>
      <a-descriptions-item :label="t('提交标识')">
        {{ appInfo.commitTag }}
      </a-descriptions-item>
      <a-descriptions-item :label="t('sys.description')" :span="4">
        {{ appInfo.app?.description }}
      </a-descriptions-item>
    </a-descriptions>
  </div>
</template>

<script setup lang="ts">
  import type { PublishedAppDtoResponse } from '/@/apis/gct-platform/model';
  import { useI18n } from '/@/hooks/web/useI18n';
  import AppLogo from '/@/components/AppLogo/index.vue';

  defineProps<{
    appInfo: PublishedAppDtoResponse;
  }>();
  const { t } = useI18n();
</script>

<style></style>
