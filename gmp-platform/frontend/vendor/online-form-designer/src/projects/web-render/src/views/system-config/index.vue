<template>
  <basic-page-render>
    <div class="flex h-full">
      <div class="tab-ul flex-none">
        <template v-for="item in platformOptions" :key="item.value">
          <div
            :class="['tab-li', { active: item.value === isActive }]"
            @click="handleChange(item.value)"
          >
            {{ item.name }}
          </div>
        </template>
      </div>
      <div class="h-full w-10px flex-1 flex flex-col">
        <div class="h-78px pl-24px pr-24px flex items-center justify-between flex-none">
          <span class="text-16px color-[#000]">{{ platformMap[isActive].name }}</span>
          <div>
            <div class="right">
              <a-button type="primary" @click="handleSave">
                <save-outlined />
                {{ $t('sys.saveText') }}
              </a-button>
            </div>
          </div>
        </div>
        <div class="h-1px bg-[#E0E3EA] flex-none"></div>
        <div class="h-1px flex-1">
          <ScrollContainer>
            <component :is="platformMap[isActive].component" ref="compRef" :is-platform="false" />
          </ScrollContainer>
        </div>
      </div>
    </div>
  </basic-page-render>
</template>
<script setup lang="ts">
  import { ref, computed } from 'vue';
  import App from './modules/app.vue';
  import Security from '/@backend-management/views/platform/platform-setting/modules/security-setting.vue';
  import Business from './modules/business.vue';
  import Org from '/@backend-management/views/platform/platform-setting/modules/org-setting.vue';
  import { useBasicSetting } from '/@/hooks/platform/useBasicSetting';
  import { message } from 'ant-design-vue';
  import { useSecuritySetting } from '/@/hooks/platform/useSecuritySetting';
  import { useBusinessSetting } from './hooks/useBusinessSetting';
  import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
  import { ScrollContainer } from '/@/components/Container';

  enum SettingType {
    APP = 'app',
    SECURITY = 'security',
    BUSINESS = 'business',
    ORG = 'org',
  }

  const { postBasicSetting } = useBasicSetting(false);
  const { postSecuritySetting } = useSecuritySetting(false);
  const { postBusinessSetting } = useBusinessSetting();
  const { postOrgSetting } = useOrgSetting(false);
  const compRef = ref();
  const isActive = ref(SettingType.APP);
  const platformOptions = computed(() => {
    return [
      {
        value: SettingType.APP,
        name: $t('sys.webRender.settingType.app'),
      },

      {
        value: SettingType.SECURITY,
        name: $t('sys.webRender.settingType.security'),
      },
      {
        value: SettingType.ORG,
        name: $t('sys.webRender.settingType.org'),
      },
      {
        value: SettingType.BUSINESS,
        name: $t('sys.webRender.settingType.business'),
      },
    ];
  });

  const platformMap = {
    [SettingType.APP]: {
      name: $t('sys.webRender.settingType.app'),
      component: App,
    },
    [SettingType.SECURITY]: {
      name: $t('sys.webRender.settingType.security'),
      component: Security,
    },
    [SettingType.BUSINESS]: {
      name: $t('sys.webRender.settingType.business'),
      component: Business,
    },
    [SettingType.ORG]: {
      name: $t('sys.webRender.settingType.org'),
      component: Org,
    },
  };

  const handleChange = (key: SettingType) => {
    isActive.value = key;
  };

  const handleSave = async () => {
    if (isActive.value === SettingType.ORG) {
      postOrgSetting();
      message.success($t('sys.saveSuccess'));
      return;
    }
    compRef.value?.validateValue().then(async () => {
      switch (isActive.value) {
        case SettingType.APP:
          await postBasicSetting();
          message.success($t('sys.saveSuccess'));
          break;
        case SettingType.SECURITY:
          await postSecuritySetting();
          message.success($t('sys.saveSuccess'));
          break;
        case SettingType.BUSINESS:
          const settingData = compRef.value?.getSettingData();
          await postBusinessSetting(settingData);
          message.success($t('sys.saveSuccess'));
          break;
        case SettingType.ORG:
          await postOrgSetting();
          message.success($t('sys.saveSuccess'));
          break;
        default:
      }
    });
  };
</script>
<style lang="less" scoped>
  .tab-ul {
    width: 155px;
    border-right: 1px solid #e0e3ea;
    padding-top: 24px;
    padding-left: 24px;
    color: #212528;
    height: 100%;

    .tab-li {
      height: 30px;
      line-height: 30px;
      text-align: center;
      margin-bottom: 12px;
      // border-radius: 4px;
      border-right: 2px solid transparent;
      transition: all 0.3s;
      cursor: pointer;

      &.active {
        color: var(--ant-primary-color);
        background-color: #f7f8fa;
        border-right-color: var(--ant-primary-color);
        font-weight: 500;
      }
    }
  }
</style>
