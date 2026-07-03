<template>
  <basic-page>
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
          <span class="text-16px color-[#000]">{{ platformMap.get(isActive)?.name }}</span>
          <div>
            <div v-if="isActive !== PlatformSettingEnum.APK" class="right">
              <a-button type="primary" @click="handleSave" :loading="loading">
                <save-outlined />
                {{ t('sys.saveText') }}
              </a-button>
            </div>
          </div>
        </div>
        <div class="h-1px bg-[#E0E3EA] flex-none"></div>
        <div class="h-1px flex-1">
          <ScrollContainer>
            <keep-alive>
              <component
                :is="platformMap.get(isActive)?.component as ComponentType"
                ref="compRef"
              />
            </keep-alive>
          </ScrollContainer>
        </div>
      </div>
    </div>
  </basic-page>
</template>

<script setup lang="ts">
  import { ref, computed } from 'vue';
  import { SaveOutlined } from '@ant-design/icons-vue';
  import { PlatformSettingEnum, PlatformMapType } from '/@/hooks/platform/types';
  import BasicSetting from './modules/basic-setting.vue';
  import WatermarkSetting from './modules/watermark-setting.vue';
  import SecuritySetting from './modules/security-setting.vue';
  import LoginSetting from './modules/login-setting.vue';
  import ThemeSetting from './modules/theme-setting.vue';
  import OrgSetting from './modules/org-setting.vue';
  import ApkSetting from './modules/apk-setting.vue';
  import { useBasicSetting } from '/@/hooks/platform/useBasicSetting';
  import { useLoginSetting } from '/@/hooks/platform/useLoginSetting';
  import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
  import { useSecuritySetting } from '/@/hooks/platform/useSecuritySetting';
  import { useThemeSetting } from '/@/hooks/platform/useThemeSetting';
  import { useWatermarkSetting } from '/@/hooks/platform/useWatermarkSetting';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CustomAction } from '/@/enums/authActionEnum';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { ScrollContainer } from '/@/components/Container';

  const { postBasicSetting } = useBasicSetting();
  const { postLoginSetting } = useLoginSetting();
  const { postOrgSetting } = useOrgSetting();
  const { postSecuritySetting } = useSecuritySetting();
  const { postThemeSetting } = useThemeSetting();
  const { postWatermarkSetting } = useWatermarkSetting();
  const { t } = useI18n();
  const { hasPermission } = usePermission();
  const { createMessage } = useMessage();
  const loading = ref(false);
  type ComponentType =
    | typeof BasicSetting
    | typeof WatermarkSetting
    | typeof SecuritySetting
    | typeof LoginSetting
    | typeof ThemeSetting
    | typeof OrgSetting
    | typeof ApkSetting;
  const isActive = ref(PlatformSettingEnum.BASIC);

  const compRef = ref();

  const platformMap: Map<PlatformSettingEnum, PlatformMapType<ComponentType>> = new Map([
    [
      PlatformSettingEnum.BASIC,
      {
        name: t('sys.platform.basicSetting'),
        component: BasicSetting,
      },
    ],
    [
      PlatformSettingEnum.WATERMARK,
      {
        name: t('sys.platform.watermarkSetting'),
        component: WatermarkSetting,
      },
    ],
    [
      PlatformSettingEnum.SECURITY,
      {
        name: t('sys.platform.securitySetting'),
        component: SecuritySetting,
      },
    ],
    [
      PlatformSettingEnum.LOGIN,
      {
        name: t('sys.platform.loginSetting'),
        component: LoginSetting,
      },
    ],
    [
      PlatformSettingEnum.THEME,
      {
        name: t('sys.platform.themeSetting'),
        component: ThemeSetting,
      },
    ],
    [
      PlatformSettingEnum.ORGANIZATION,
      {
        name: t('sys.platform.orgSetting'),
        component: OrgSetting,
      },
    ],
    [
      PlatformSettingEnum.APK,
      {
        name: t('sys.platform.apkSetting'),
        component: ApkSetting,
      },
    ],
  ]);

  const platformOptions = computed(() => {
    return [
      {
        value: PlatformSettingEnum.BASIC,
        name: t('sys.platform.basicSetting'),
        visible: hasPermission(CustomAction.BaiscSetting),
      },

      {
        value: PlatformSettingEnum.WATERMARK,
        name: t('sys.platform.watermarkSetting'),
        visible: hasPermission(CustomAction.WatermarkSetting),
      },

      {
        value: PlatformSettingEnum.SECURITY,
        name: t('sys.platform.securitySetting'),
        visible: hasPermission(CustomAction.SecuritySetting),
      },

      {
        value: PlatformSettingEnum.LOGIN,
        name: t('sys.platform.loginSetting'),
        visible: hasPermission(CustomAction.LoginSetting),
      },

      {
        value: PlatformSettingEnum.THEME,
        name: t('sys.platform.themeSetting'),
        visible: hasPermission(CustomAction.ThemeSetting),
      },
      {
        value: PlatformSettingEnum.ORGANIZATION,
        name: t('sys.platform.orgSetting'),
        visible: hasPermission(CustomAction.OrganizationSetting),
      },
      {
        value: PlatformSettingEnum.APK,
        name: t('sys.platform.apkSetting'),
        visible: hasPermission(CustomAction.ApkSetting),
      },
    ].filter((item) => item.visible);
  });

  const handleChange = (key: PlatformSettingEnum) => {
    isActive.value = key;
  };

  const handleSave = async () => {
    loading.value = true;
    switch (isActive.value) {
      case PlatformSettingEnum.BASIC:
        if (typeof compRef.value?.validateValue === 'function') {
          compRef.value?.validateValue().then(async () => {
            await postBasicSetting();
            createMessage.success(t('sys.saveSuccess'));
          });
        }
        break;
      case PlatformSettingEnum.LOGIN:
        await postLoginSetting();
        createMessage.success(t('sys.saveSuccess'));
        break;
      case PlatformSettingEnum.ORGANIZATION:
        if (typeof compRef.value?.validateValue === 'function') {
          compRef.value?.validateValue().then(async () => {
            await postOrgSetting();
            createMessage.success(t('sys.saveSuccess'));
          });
        }
        break;
      case PlatformSettingEnum.SECURITY:
        if (typeof compRef.value?.validateValue === 'function') {
          compRef.value?.validateValue().then(async () => {
            await postSecuritySetting();
            createMessage.success(t('sys.saveSuccess'));
          });
        }
        break;
      case PlatformSettingEnum.WATERMARK:
        if (typeof compRef.value?.validateValue === 'function') {
          compRef.value?.validateValue().then(async () => {
            await postWatermarkSetting();
            createMessage.success(t('sys.saveSuccess'));
          });
        }
        break;
      case PlatformSettingEnum.THEME:
        await postThemeSetting();
        createMessage.success(t('sys.saveSuccess'));
        break;
      default:
    }
    await new Promise((reslove) => {
      setTimeout(() => {
        reslove();
      }, 300);
    });
    loading.value = false;
  };
</script>

<style lang="less" scoped>
  .tab-ul {
    width: 155px;
    height: 100%;
    padding-top: 24px;
    padding-left: 24px;
    border-right: 1px solid #e0e3ea;
    color: #212528;

    .tab-li {
      height: 30px;
      margin-bottom: 12px;
      transition: all 0.3s;
      // border-radius: 4px;
      border-right: 2px solid transparent;
      line-height: 30px;
      text-align: center;
      cursor: pointer;

      &.active {
        border-right-color: var(--ant-primary-color);
        background-color: #f7f8fa;
        color: var(--ant-primary-color);
        font-weight: 500;
      }
    }
  }
</style>
