<template>
  <BasicModal
    v-bind="$attrs"
    class="application-management"
    @register="registerInner"
    :title="title"
    centered
    width="640px"
    :minHeight="100"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      :model="formState"
      autocomplete="off"
      ref="formRef"
      :label-col="{ span: 8 }"
      :wrapper-col="{ span: 12 }"
    >
      <template v-if="formState.type === AppClassifyEnum.Pro">
        <a-form-item
          :label="t('sys.tenant.applicationName')"
          name="name"
          :rules="[
            { required: true },
            {
              validator: validateAppName,
              trigger: 'change',
            },
          ]"
        >
          <a-input v-model:value="formState.name" :placeholder="t('sys.inputText')" />
        </a-form-item>

        <a-form-item :label="t('sys.developer.appCenter.client')" name="platforms">
          <div class="flex gap-6 items-center" style="font-size: 14px">
            <a-checkbox v-model:checked="formState.webEnabled" :disabled="true">
              Web端
              <a-tooltip>
                <template #title>
                  <span class="whitespace-nowrap">适用于网页、工控机等Web端相关场景</span>
                </template>
                <i
                  class="gct-iconfont icon-icon_wenhao ml-1 text-gray-400"
                  style="font-size: 14px"
                ></i>
              </a-tooltip>
            </a-checkbox>
            <a-checkbox v-model:checked="formState.mobileEnabled">
              Mobile端
              <a-tooltip>
                <template #title>
                  <span class="whitespace-nowrap">适用于PDA、Pad等Mobile端相关场景</span>
                </template>
                <i
                  class="gct-iconfont icon-icon_wenhao ml-1 text-gray-400"
                  style="font-size: 14px"
                ></i>
              </a-tooltip>
            </a-checkbox>
          </div>
        </a-form-item>

        <a-form-item
          :label="t('sys.app.version.index')"
          name="appVersion"
          :rules="[
            {
              required: true,
              validator: validateAppVersion,
              trigger: 'change',
            },
          ]"
        >
          <div class="flex">
            <a-input-number
              :disabled="isEdit"
              :max="999"
              :min="0"
              :step="1"
              :precision="0"
              v-model:value="verState.v1"
            />
            <span class="ml-10px mr-10px font-bold">.</span>
            <a-input-number
              :disabled="isEdit"
              :max="999"
              :min="0"
              :step="1"
              :precision="0"
              v-model:value="verState.v2"
            />
            <span class="ml-10px mr-10px font-bold">.</span>
            <a-input-number
              :disabled="isEdit"
              :max="999"
              :min="0"
              :step="1"
              :precision="0"
              v-model:value="verState.v3"
            />
          </div>
        </a-form-item>

        <app-form hiddenAppName :form-data="formState" platform="Web" />
      </template>
      <template v-else>
        <app-form :form-data="formState" platform="bi" />
      </template>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts" name="app-modal">
  import { reactive, ref, computed, toRaw } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { QuestionCircleOutlined } from '@ant-design/icons-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    Ch_AppClassify,
    LogoTypeEnum,
    AppClassifyEnum,
    SourceTypeEnum,
  } from '../../constant/interface';
  import { omit } from 'lodash-es';
  import AppForm from '../common/app-form.vue';

  import type { AppResponse } from '/@/apis/gct-platform/model/index';

  const { t } = useI18n();

  interface FormState {
    /** 应用id */
    id?: string;
    /** logo类型 */
    logoType?: LogoTypeEnum;
    /** 应用logo */
    icon: string;
    /** logo图片 */
    image: string;
    /** logo缩略图片 */
    thumbnail: string;
    /** 应用名称 */
    name: string;
    /** 应用描述 */
    description: string;
    /** 应用类型 */
    type?: AppClassifyEnum;
    /** 所属租户id */
    tenantId: string;
    /** 支持Web端 */
    webEnabled: boolean;
    /** 支持Mobile端 */
    mobileEnabled: boolean;
    logoColor?: string;
    logoBgColor?: string;
    appVersion: string;
    sourceType: SourceTypeEnum;
    mobileJson: {
      /** logo类型 */
      logoType?: LogoTypeEnum;
      /** 应用logo */
      icon: string;
      logoColor?: string;
      logoBgColor?: string;
      /** logo图片 */
      image: string;
      /** 应用名称 */
      name: string;
      /** 应用描述 */
      description: string;
    };
  }

  interface ModalInfo {
    modalType: 'create' | 'edit';
    type: AppClassifyEnum;
    tenantId: string;
    info?: AppResponse;
  }

  const emit = defineEmits(['ok']);

  const formRef = ref<FormInstance>();
  const modalType = ref<'create' | 'edit'>();

  const formState = reactive<FormState>({
    id: undefined,
    logoType: LogoTypeEnum.Icon,
    icon: 'icon-park:aiming',
    image: '',
    thumbnail: '',
    name: '',
    description: '',
    type: undefined,
    tenantId: '',
    webEnabled: true,
    mobileEnabled: false,
    logoColor: '#FFFFFF',
    logoBgColor: '#3370ff',
    appVersion: '',
    sourceType: SourceTypeEnum.SELF_BUILT,
    mobileJson: {
      logoType: LogoTypeEnum.Icon,
      icon: 'icon-park:aiming',
      logoColor: '#FFFFFF',
      logoBgColor: '#3370ff',
      image: '',
      name: '',
      description: '',
    },
  });

  const verState = reactive({
    v1: 1,
    v2: 0,
    v3: 0,
  });

  const isCreate = computed<boolean>(() => modalType.value === 'create');

  const isEdit = computed<boolean>(() => modalType.value === 'edit');

  const title = computed(() => {
    if (isCreate.value) {
      return `${t('sys.create')}${Ch_AppClassify[formState.type as string]}`;
    }
    if (isEdit.value) {
      return `${t('sys.edit')}${Ch_AppClassify[formState.type as string]}`;
    }
    return '';
  });

  const [registerInner, { closeModal }] = useModalInner((data: ModalInfo) => {
    if (data) {
      modalType.value = data.modalType;
      formState.tenantId = data.tenantId;
      formState.type = data.type;
      if (data.info) {
        onDeactivated(data.info);
      }
    }
  });

  const onDeactivated = (data) => {
    formState.id = data.id;
    formState.logoType = data.logoType ?? '';
    formState.sourceType = data.sourceType ?? SourceTypeEnum.SELF_BUILT;
    if (data.logoType === LogoTypeEnum.Icon) {
      formState.icon = data.logo ?? '';
      formState.logoColor = data.logoColor ?? '';
      formState.logoBgColor = data.logoBgColor ?? '';
    } else if (data.logoType === LogoTypeEnum.Image) {
      formState.image = data.logo ?? '';
      formState.thumbnail = data.logoThumbnail;
    }
    formState.name = data.name ?? '';
    formState.description = data.description ?? '';

    // 兼容老数据：mobileEnabled可能是number或boolean
    const mobileEnabled = data.mobileEnabled;
    formState.webEnabled = true; // Web端始终启用
    formState.mobileEnabled = typeof mobileEnabled === 'number' ? !!mobileEnabled : !!mobileEnabled;

    formState.mobileJson = data.mobileJson
      ? JSON.parse(data.mobileJson)
      : { logoType: LogoTypeEnum.Icon };
    if (formState.appVersion) {
      const [v1, v2, v3] = formState.appVersion.split('.');
      Object.assign(verState, {
        v1,
        v2,
        v3,
      });
    }
    if (formState.mobileEnabled) {
      // 兼容老数据开启了移动端，但没有移动端相关配置的问题
      formState.mobileJson.logoColor = formState.mobileJson.logoColor
        ? formState.mobileJson.logoColor
        : data.logoColor;
      formState.mobileJson.logoBgColor = formState.mobileJson.logoBgColor
        ? formState.mobileJson.logoBgColor
        : data.logoBgColor;
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

  const validateAppVersion = async () => {
    if (
      [undefined, null].includes(verState.v1 as any) ||
      [undefined, null].includes(verState.v2 as any) ||
      [undefined, null].includes(verState.v3 as any)
    ) {
      return Promise.reject('请输入版本号');
    } else {
      return Promise.resolve();
    }
  };

  const handleShow = () => {};

  const handleClose = () => {
    formRef.value?.resetFields();
    Object.assign(formState, {
      id: undefined,
      logoType: LogoTypeEnum.Icon,
      icon: 'icon-park:aiming',
      image: '',
      thumbnail: '',
      name: '',
      description: '',
      webEnabled: true,
      mobileEnabled: false,
      logoColor: '#FFFFFF',
      logoBgColor: '#3370ff',
      appVersion: '',
      mobileJson: {
        logoType: LogoTypeEnum.Icon,
        icon: 'icon-park:aiming',
        logoColor: '#FFFFFF',
        logoBgColor: '#3370ff',
        image: '',
        name: '',
        description: '',
      },
    });
    modalType.value = undefined;
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    saveFunc();
  };

  function saveFunc() {
    // 自动从Web端配置生成mobileJson配置
    const generatedMobileJson = {
      logoType: formState.logoType,
      icon: formState.icon,
      logoColor: formState.logoColor,
      logoBgColor: formState.logoBgColor,
      image: formState.image,
      name: formState.name,
      description: formState.description,
    };

    const params = {
      ...omit(toRaw(formState), ['icon', 'image', 'thumbnail', 'webEnabled']),
      appVersion: `${verState.v1}.${verState.v2}.${verState.v3}`,
      mobileEnabled: formState.mobileEnabled ? 1 : 0, // 转换为数字以兼容后端
      mobileJson: JSON.stringify(generatedMobileJson),
    };
    if (formState.logoType === LogoTypeEnum.Icon) {
      Object.assign(params, {
        logo: formState.icon,
      });
    } else if (formState.logoType === LogoTypeEnum.Image) {
      Object.assign(params, {
        logo: formState.image,
        logoThumbnail: formState.thumbnail,
      });
    }
    emit('ok', { info: { ...params }, type: modalType.value });
    closeModal();
  }
</script>

<style lang="less" scoped>
  .ant-tabs {
    :deep(.ant-tabs-nav) {
      padding-left: 20px;
    }
  }

  .gct-iconfont.icon-icon_wenhao:hover {
    color: #5a5f6b !important;
  }

  :deep(.ant-checkbox-wrapper-disabled), :deep(.ant-checkbox-disabled) {
    cursor: default;

    span {
      cursor: default;
    }
  }
</style>
