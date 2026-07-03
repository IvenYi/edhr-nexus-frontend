<template>
  <div>
    <div class="administrator">
      <setting-item
        :app-id="appId"
        :app-env="appEnv"
        :module="SettingModule.ADMIN"
        :type="SettingItemTypeEnum.ADMIN"
        :title="t('sys.developer.appAdmin')"
        :items="appSetting.admin_ids!"
        :disabled="disabled"
        @ok="loadAppSetting"
        @delete="handleTagDelete"
      />
    </div>
    <div class="visibilityRange">
      <setting-item
        :app-id="appId"
        :app-env="appEnv"
        :module="SettingModule.APP_ACCESS"
        :type="[SettingItemTypeEnum.VISIBILITY_USER, SettingItemTypeEnum.VISIBILITY_ORGANIZATION]"
        :title="t('sys.tenant.appVisibleRange')"
        :items="[...appSetting.visibilityUserIds, ...appSetting.visibilityOrganizationIds]"
        :disabled="disabled"
        @ok="loadAppSetting"
        @delete="handleTagDelete"
      />
    </div>
    <div class="organization">
      <setting-item
        :app-id="appId"
        :app-env="appEnv"
        :module="SettingModule.APP_INNER_ORG"
        :type="SettingItemTypeEnum.CAN_BE_USED_ORGANIZATION"
        :title="t('sys.tenant.appUseOrg')"
        :items="appSetting.canBeUsedOrganizationIds!"
        :disabled="disabled"
        @ok="loadAppSetting"
        @delete="handleTagDelete"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import { SettingModule, SettingItemTypeEnum } from './types';
  import SettingItem from './setting-item.vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { AppSettingDtoResponse } from '/@/apis/gct-platform/model';
  import {
    getAppSettingInfoByAppId,
    deleteAppSetting,
    deleteAppSettingDeveloperDelete,
  } from '/@/apis/gct-platform/AppSettingController';

  const props = defineProps<{
    appId: string;
    appEnv: 'test' | 'prod';
    disabled?: boolean;
  }>();

  const { t } = useI18n();
  const appSetting = ref<AppSettingDtoResponse>({
    admin_ids: [],
    visibilityUserIds: [],
    visibilityOrganizationIds: [],
    canBeUsedOrganizationIds: [],
  });

  const loadAppSetting = async () => {
    if (!props.appId) return;
    const res = await getAppSettingInfoByAppId({
      appId: props.appId,
      appEnv: props.appEnv,
    });
    appSetting.value = res!;
  };

  watch(
    () => props.appId,
    () => {
      loadAppSetting();
    },
    {
      immediate: true,
    },
  );

  const handleTagDelete = async (id) => {
    const api = props.appEnv === 'test' ? deleteAppSettingDeveloperDelete : deleteAppSetting;
    await api({
      ids: id,
    });
    loadAppSetting();
  };
</script>

<style></style>
