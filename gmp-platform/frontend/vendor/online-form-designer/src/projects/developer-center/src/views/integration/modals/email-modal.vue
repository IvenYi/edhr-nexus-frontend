<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t(isEdit ? 'sys.editSth' : 'sys.newSth', { sth: t('sys.email') })"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item :label="t('sys.name')" name="name" :rules="[{ required: true }]">
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item
        :label="t('sys.keyOfSth', { sth: t('sys.mailBox') })"
        name="key"
        :rules="[{ required: true }]"
      >
        <a-input
          v-model:value="formState.key"
          :disabled="isEdit"
          :addon-before="PREFIX"
          show-count
          :maxlength="32 - PREFIX.length"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.integration.serviceType')"
        name="serviceType"
        :rules="[{ required: true }]"
      >
        <a-radio-group v-model:value="formState.serviceType" name="radioGroup">
          <a-radio v-for="value in ServiceTypeEnum" :key="value" :value="value">{{
            value
          }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :label="t('sys.integration.host')"
        name="serviceIp"
        :rules="[
          { required: true },
          {
            pattern: /^((ht|f)tps?:\/\/)?[\w-]+(\.[\w-]+)+(:\d{1,5})?$/,
            message: t('sys.pleaseInputValidSth', { sth: t('sys.integration.host') }),
          },
        ]"
      >
        <a-input v-model:value="formState.serviceIp" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item :label="t('sys.userName')" name="userName" :rules="[{ required: true }]">
        <a-input v-model:value="formState.userName" show-count :maxlength="256" />
      </a-form-item>
      <a-form-item :label="t('sys.password')" name="password" :rules="[{ required: true }]">
        <a-input-password
          v-model:value="formState.password"
          show-count
          :maxlength="256"
          autocomplete="new-password"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.integration.sendMailBox')"
        name="sendEmail"
        :rules="[
          { required: true },
          {
            type: 'email',
            message: t('sys.pleaseInputValidSth', {
              sth: t('sys.integration.sendMailBox'),
            }),
          },
        ]"
      >
        <a-input v-model:value="formState.sendEmail" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item label="SSL" name="ssl">
        <a-checkbox v-model:checked="sslBoolean" />
      </a-form-item>
      <a-form-item
        :label="t('sys.integration.sendTimeout')"
        name="timeout"
        :rules="[{ required: true }]"
      >
        <a-input-number
          v-model:value="formState.timeout"
          :step="1"
          :precision="0"
          :min="1"
          :addon-after="t('sys.timeSecond')"
        />
      </a-form-item>
      <a-form-item :label="t('sys.notes')" name="remark">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.remark"
          show-count
          :rows="3"
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { MessageSettingRequest } from '/@/apis/gct-platform/model';
  import {
    postMessageSetting,
    putMessageSettingById,
  } from '/@/apis/gct-platform/MessageSettingController';
  import { ServiceTypeEnum, MessageTemplateEnum } from '../enum';

  const emit = defineEmits(['refresh']);

  const PREFIX = 'mail_';

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    const { edit, record } = data;
    isEdit.value = !!edit;
    if (isEdit.value) {
      isEdit.value &&
        Object.assign(formState, {
          ...record,
          key: record.key.replace(PREFIX, ''),
        });
    } else {
      formState.key = Math.random().toString(36).substring(2, 10);
    }
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  interface IRequest extends MessageSettingRequest {
    id?: string;
  }
  const formState: IRequest = reactive({
    key: '',
    name: '',
    sendEmail: '',
    serviceIp: '',
    serviceType: ServiceTypeEnum.IMAP,
    userName: '',
    password: '',
    remark: '',
    ssl: 0,
    timeout: 60,
    type: MessageTemplateEnum.EMAIL,
  });

  const sslBoolean = computed({
    get() {
      return formState.ssl === 1 ? true : false;
    },
    set(value) {
      formState.ssl = value ? 1 : 0;
    },
  });

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      const params = {
        ...formState,
        key: PREFIX + formState.key,
      };
      if (isEdit.value) {
        await putMessageSettingById({ id: formState.id! }, params);
      } else {
        await postMessageSetting(params);
      }
      message.success(t('sys.operationSuccess'));
      closeModal();
      emit('refresh');
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less"></style>
