<template>
  <basic-page>
    <div class="h-full overflow-auto px-24px py-16px">
      <slot name="header"></slot>
      <img class="w100%" src="@/assets/images/theme.png" alt="" />
      <a-tabs v-model:activeKey="activeKey" type="card" class="mt-12px">
        <a-tab-pane :key="1" tab="全局配置">
          <globalSetting />
        </a-tab-pane>
        <a-tab-pane :key="2" tab="主题风格">
          <theme-setting>
            <!-- <template #footer>
        <a-button class="mt-24px" type="primary" @click="handleSave">
          {{ t('sys.saveText') }}
        </a-button>
      </template> -->
          </theme-setting>
        </a-tab-pane>
      </a-tabs>
    </div>
  </basic-page>
</template>

<script lang="ts" setup>
  import { ref, watch } from 'vue';
  import ThemeSetting from '/@backend-management/views/platform/platform-setting/modules/theme-setting.vue';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { debounce } from 'lodash-es';
  import globalSetting from './components/global-setting.vue';

  const { postThemeSetting, themeSetting: themeSettingData } = useThemeSetting();
  const { postGlobalSetting, globalSetting: globalSettingData } = useGlobalSetting();
  const { t } = useI18n();
  const { createMessage } = useMessage();

  const debounceSave = debounce(() => {
    postThemeSetting();
    createMessage.success(t('sys.platform.setSuccess'));
  }, 500);
  const debounceGlobalSave = debounce(() => {
    postGlobalSetting();
    createMessage.success(t('sys.platform.setSuccess'));
  }, 500);
  const activeKey = ref(1);
  // 个性化配置改为修改即生效
  watch(
    () => themeSettingData,
    () => {
      debounceSave();
    },
    {
      deep: true,
    },
  );

  watch(
    () => globalSettingData,
    () => {
      debounceGlobalSave();
    },
    {
      deep: true,
    },
  );

  // const handleSave = async () => {
  //   await postThemeSetting();
  //   createMessage.success(t('sys.saveSuccess'));
  // };
</script>

<style lang="less" scoped>
  :deep(.ant-tabs) {
    height: calc(100% - 165px);
  }
  :deep(.ant-tabs-content) {
    height: 100%;
  }
  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0;
  }
  :deep(.ant-tabs-content) {
    border-bottom: 1px solid #f0f0f0;
    border-left: 1px solid #f0f0f0;
    border-right: 1px solid #f0f0f0;
  }
</style>
