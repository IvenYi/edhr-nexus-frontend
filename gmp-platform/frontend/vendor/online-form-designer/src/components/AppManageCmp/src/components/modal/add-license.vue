<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.license.addLicense')"
    centered
    width="700px"
    :minHeight="380"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <div class="pl-48px pr-48px">
      <div class="activate-type flex">
        <div
          class="item"
          :class="{ active: authorizationType == authorizationTypeEnum.Online }"
          @click="changeActivateType(authorizationTypeEnum.Online)"
        >
          {{ t('sys.license.online') }}
        </div>
        <div
          class="item"
          :class="{ active: authorizationType == authorizationTypeEnum.Offline }"
          @click="changeActivateType(authorizationTypeEnum.Offline)"
        >
          {{ t('sys.license.offline') }}
        </div>
      </div>
      <a-form ref="licenseFormRef" :model="formState" autocomplete="off">
        <!-- <a-form-item :label="t('sys.license.activateType')" name="prod">
          <a-radio-group v-model:value="authorizationType">
            <a-radio :value="authorizationTypeEnum.Online" name="type">
              {{ t('sys.license.online') }}
            </a-radio>
            <a-radio :value="authorizationTypeEnum.Offline" name="type">
              {{ t('sys.license.offline') }}
            </a-radio>
          </a-radio-group>
        </a-form-item> -->
        <a-form-item
          v-if="authorizationType === authorizationTypeEnum.Online && isOrigin"
          :label="t('sys.license.prodLicense')"
          name="prod"
          :validateStatus="ErrorEnv === 'prod' ? 'error' : ''"
        >
          <a-input v-model:value="formState.prod" @change="changeInput('prod')" />
          <template v-if="ErrorEnv === 'prod'" #extra>
            <span style="color: #ff4d4f"> {{ ErrorInfo }} </span>
          </template>
        </a-form-item>
        <a-form-item
          v-if="authorizationType === authorizationTypeEnum.Online && isOrigin"
          :label="t('sys.license.testLicense')"
          name="test"
          :validateStatus="ErrorEnv === 'test' ? 'error' : ''"
        >
          <a-input v-model:value="formState.test" @change="changeInput('test')" />
          <template v-if="ErrorEnv === 'test'" #extra>
            <span style="color: #ff4d4f"> {{ ErrorInfo }} </span>
          </template>
        </a-form-item>
        <a-form-item
          :label="t('sys.license.license')"
          name="authorizationCode"
          :rules="[{ required: true }]"
          v-if="!isOrigin && authorizationType === authorizationTypeEnum.Online"
        >
          <a-input v-model:value="formState.authorizationCode" />
        </a-form-item>
      </a-form>
      <offine-activate
        v-if="authorizationType === authorizationTypeEnum.Offline"
        ref="offlineRef"
        :curStep="curStep"
        :appId="formState.appId"
      />
    </div>

    <template #footer v-if="authorizationType === authorizationTypeEnum.Offline">
      <a-button v-if="!curStep" @click="closeModal">{{ t('sys.cancelText') }}</a-button>
      <a-button v-if="curStep" @click="prev">{{ t('sys.editor.prev') }}</a-button>
      <a-button v-if="!curStep" @click="next" type="primary"> {{ t('sys.app.nextStep') }}</a-button>
      <a-button v-if="curStep" type="primary" @click="handleOk">{{ t('sys.okText') }}</a-button>
    </template>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import { message } from 'ant-design-vue';
  import {
    postLicenseActivates,
    postLicenseActivatesOffline,
  } from '/@/apis/gct-platform/LicenseController';
  import { authorizationTypeEnum } from '/@/views/sys/login/constant/interface';
  import OffineActivate from './components/offine-activate.vue';

  const emit = defineEmits(['reload']);
  const { t } = useI18n();
  const successFn = ref<any>(null);
  /** 是否是初次激活 */
  const isOrigin = ref(false);
  //Form
  const licenseFormRef = ref<FormInstance>();
  const formState = reactive({
    appId: '',
    appKey: '',
    authorizationCode: '',
    test: '',
    prod: '',
    env: '',
  });

  const ErrorEnv = ref();

  const ErrorInfo = ref();

  const authorizationType = ref(authorizationTypeEnum.Online);

  const curStep = ref(0);

  const offlineRef = ref();

  //Modal
  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      formState.appId = data.appId;
      formState.appKey = data.suiteKey;
      formState.env = data.env;
      successFn.value = data.successFn;
      isOrigin.value = data.isOrigin;
    }
  });

  const next = () => {
    curStep.value = curStep.value + 1;
  };

  const prev = () => {
    curStep.value = curStep.value - 1;
  };

  const changeInput = (env) => {
    if (env === ErrorEnv.value) {
      ErrorInfo.value = '';
      ErrorEnv.value = '';
    }
  };

  const changeActivateType = (type) => {
    authorizationType.value = type;
  };

  const handleOk = () => {
    if (isOrigin.value && authorizationType.value === authorizationTypeEnum.Online) {
      if (!formState.test && !formState.prod) {
        message.warning(t('sys.license.authorizationCodeRequire'));
        return;
      }

      const params = [] as any;
      if (formState.prod) {
        params.push({
          appId: formState.appId,
          appKey: formState.appKey,
          authorizationCode: formState.prod,
          env: 'prod',
        });
      }
      if (formState.test) {
        params.push({
          appId: formState.appId,
          appKey: formState.appKey,
          authorizationCode: formState.test,
          env: 'test',
        });
      }

      postLicenseActivates(
        params,
        { increment: true },
        {
          displayError: true,
        },
      )
        .then(() => {
          message.success(t('sys.appDesigner.addSuccess'));
          emit('reload');
          successFn?.value && successFn.value();
          closeModal();
        })
        .catch((data) => {
          const errData = JSON.parse(JSON.parse(data.data));
          ErrorInfo.value = data.subMessage;
          ErrorEnv.value = errData.env;
        });
    } else if (authorizationType.value === authorizationTypeEnum.Offline) {
      const fileInfo = offlineRef.value.fileInfo;
      if (!fileInfo) {
        message.warn(t('sys.license.pleaseUploadFile'));
        return;
      }
      postLicenseActivatesOffline(
        fileInfo,
        { productType: formState.appKey, appId: formState.appId },
        {
          transferToConfig: {
            timeout: 300 * 1000,
            headers: {
              'Content-Type': 'multipart/form-data;charset=UTF-8',
            },
          },
        },
      ).then(() => {
        message.success(t('sys.activateSuccess'));
        emit('reload');
        successFn?.value && successFn.value();
        closeModal();
      });
    } else {
      licenseFormRef.value?.validate().then(async () => {
        const params = formState;
        postLicenseActivates([params], { increment: true }).then(() => {
          message.success(t('sys.appDesigner.addSuccess'));
          successFn?.value && successFn.value();
          emit('reload');

          closeModal();
        });
      });
    }
  };

  const handleClose = () => {
    licenseFormRef.value?.resetFields();
    authorizationType.value = authorizationTypeEnum.Online;
    curStep.value = 0;
  };
</script>

<style lang="less" scoped>
  .change-env-item {
    font-weight: 400;
    font-size: 14px;
    color: #797a7d;
    padding: 0 12px;
    cursor: pointer;

    &-active {
      color: var(--ant-primary-color);
    }
  }
  .activate-type {
    background: #f7f8fa;
    padding: 4px;
    margin-bottom: 24px;
    .item {
      width: 50%;
      text-align: center;
      padding: 4px;
      color: #8f8f8f;
      &.active {
        background: #fff;
        color: #212528;
        font-weight: 500;
      }
      &:hover {
        background: #fff;
      }
    }
  }
</style>
