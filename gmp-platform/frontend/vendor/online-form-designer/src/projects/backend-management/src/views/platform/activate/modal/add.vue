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
          v-if="authorizationType === authorizationTypeEnum.Online"
          :label="t('sys.license.license')"
          name="authorizationCode"
          :rules="[{ required: true }]"
        >
          <a-input v-model:value="formState.authorizationCode" />
        </a-form-item>
      </a-form>
      <offine-activate
        v-if="authorizationType === authorizationTypeEnum.Offline"
        :curStep="curStep"
        :appId="formState.appId"
        ref="offlineRef"
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
    getLicenseActivate,
    postLicenseActivatesOffline,
  } from '/@/apis/gct-platform/LicenseController';
  import { useBasicSetting } from '/@/hooks/platform/useBasicSetting';
  import { authorizationTypeEnum } from '/@/views/sys/login/constant/interface';
  import OffineActivate from '/@/components/AppManageCmp/src/components/modal/components/offine-activate.vue';

  const emit = defineEmits(['reload']);

  const { t } = useI18n();

  const curStep = ref(0);

  const offlineRef = ref();

  const { basicSetting } = useBasicSetting();

  const authorizationType = ref(authorizationTypeEnum.Online);
  //Form
  const licenseFormRef = ref<FormInstance>();

  const next = () => {
    curStep.value = curStep.value + 1;
  };

  const prev = () => {
    curStep.value = curStep.value - 1;
  };

  const changeActivateType = (type) => {
    authorizationType.value = type;
  };

  const formState = reactive({
    appId: '',
    appKey: '',
    authorizationCode: '',
    increment: true,
  });
  //Modal
  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      formState.appId = data.appId;
      formState.appKey = data.appKey;
    }
  });
  const handleOk = () => {
    if (authorizationType.value === authorizationTypeEnum.Offline) {
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
        closeModal();
      });
    } else {
      licenseFormRef.value?.validate().then(async () => {
        const params = { ...formState, version: basicSetting.version };
        getLicenseActivate(params).then(() => {
          message.success(t('sys.appDesigner.addSuccess'));
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
  .activate-type {
    margin-bottom: 24px;
    padding: 4px;
    background: #f7f8fa;

    .item {
      width: 50%;
      padding: 4px;
      color: #8f8f8f;
      text-align: center;

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
