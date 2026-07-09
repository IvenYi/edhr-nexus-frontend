<template>
  <a-form-item
    v-if="hiddenAppName !== true"
    :label="t('sys.tenant.applicationName')"
    :name="platform === 'Mobile' ? ['mobileJson', 'name'] : 'name'"
    :rules="[
      { required: true },
      {
        validator: validateAppName,
        trigger: 'change',
      },
    ]"
    :model="formState"
  >
    <a-input
      v-model:value="formState.name"
      show-count
      :maxlength="32"
      :disabled="platform === 'Web'"
    />
  </a-form-item>
  <a-form-item
    :label="t('sys.developer.appCenter.appLogoType')"
    name="logoType"
    :rules="[{ required: true, message: t('sys.developer.appCenter.logoTypeMessage') }]"
  >
    <a-radio-group v-model:value="formState.logoType" :options="logoTypeOptions" />
  </a-form-item>

  <!-- 图标类型 -->
  <a-form-item
    v-if="formState.logoType === LogoTypeEnum.Icon"
    label=" "
    :colon="false"
    :name="platform === 'Web' ? 'icon' : ['mobileJson', 'icon']"
    :rules="[{ required: true, message: t('sys.developer.appCenter.logoType'), trigger: 'change' }]"
  >
    <IconNextPicker
      v-model:value="formState.icon"
      show-color
      show-background
      v-model:color="formState.logoColor"
      v-model:background="formState.logoBgColor"
    />
  </a-form-item>

  <!-- 图片类型 -->
  <template v-else-if="formState.logoType === LogoTypeEnum.Image">
    <a-form-item
      :label="t('sys.tenant.appLogo')"
      :name="platform === 'Web' || platform === 'bi' ? 'image' : ['mobileJson', 'image']"
      :rules="[{ required: true, message: t('sys.developer.appCenter.logoType') }]"
    >
      <simple-upload
        v-model:file="formState.image"
        :tip="t('sys.developer.appCenter.uploadTip')"
        :width="208"
        :height="40"
      />
    </a-form-item>

    <a-form-item
      v-if="platform === 'Web'"
      :label="t('sys.tenant.appLogo_abbreviate')"
      name="thumbnail"
      :rules="[{ required: true, message: t('sys.developer.appCenter.logoType_abbreviate') }]"
    >
      <simple-upload
        v-model:file="formState.thumbnail"
        :tip="t('sys.developer.appCenter.uploadThumbnailTip')"
      />
    </a-form-item>
  </template>

  <a-form-item
    :label="t('sys.tenant.applicationDesc')"
    name="description"
    :rules="[
      {
        validator: validateAppDescription,
        trigger: 'change',
      },
    ]"
  >
    <a-textarea v-model:value="formState.description" :placeholder="t('sys.inputText')" :rows="3" />
  </a-form-item>
</template>

<script setup lang="ts">
  import { computed } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import SimpleUpload from '/@/components/SimpleUpload/index.vue';
  import { LogoTypeEnum, logoTypeOptions } from '../../constant/interface';
  import { IconNextPicker } from '/@/components/Icon';

  interface AppFormData {
    /** logo类型 */
    logoType?: LogoTypeEnum;
    /** 应用logo */
    icon: string;
    logoColor?: string;
    logoBgColor?: string;
    /** logo图片 */
    image: string;
    /** logo缩略图片 */
    thumbnail?: string;
    /** 应用名称 */
    name: string;
    /** 应用描述 */
    description: string;
  }

  const props = withDefaults(
    defineProps<{
      /** 特殊逻辑处理字段，等于 false 时隐藏应用名称 */
      hiddenAppName?: boolean;
      formData: AppFormData;
      platform?: 'Web' | 'Mobile' | string;
    }>(),
    {
      platform: 'Web',
    },
  );

  const formState = computed({
    get() {
      return props.formData;
    },
    set(value) {
      Object.assign(props.formData, value);
    },
  });

  const { t } = useI18n();

  const validateAppDescription = async (_rule, value) => {
    if (!value) {
      return Promise.resolve();
    }
    if (value.length > 120) {
      return Promise.reject('最大120字');
    } else {
      return Promise.resolve();
    }
  };

  const validateAppName = async (_rule, value) => {
    if (!value) {
      return Promise.resolve();
    }
    if (value.length > 32) {
      return Promise.reject('最大32字');
    } else {
      return Promise.resolve();
    }
  };
</script>

<style></style>
