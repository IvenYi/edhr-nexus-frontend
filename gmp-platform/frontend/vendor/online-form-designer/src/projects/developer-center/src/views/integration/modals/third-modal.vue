<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t(isEdit ? 'sys.editSth' : 'sys.newSth', { sth: optName })"
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
      <a-form-item label="KEY" name="key" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.key"
          :disabled="isEdit"
          :addon-before="PREFIX"
          show-count
          :maxlength="32 - PREFIX.length"
        />
      </a-form-item>
      <a-form-item
        v-if="[MessageTemplateEnum.FEISHU, MessageTemplateEnum.WX_WORK].includes(formState.type as MessageTemplateEnum)"
        label="CropId"
        name="corpid"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.corpid" show-count :maxlength="128" />
      </a-form-item>
      <a-form-item
        v-if="[MessageTemplateEnum.DING_TALK, MessageTemplateEnum.WX_WORK].includes(formState.type as MessageTemplateEnum)"
        label="AgentId"
        name="agentid"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.agentid" show-count :maxlength="128" />
      </a-form-item>
      <a-form-item
        v-if="formState.type === MessageTemplateEnum.DING_TALK"
        label="AppKey"
        name="appkey"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.appkey" show-count :maxlength="128" />
      </a-form-item>
      <a-form-item label="Secret" name="secret" :rules="[{ required: true }]">
        <a-input v-model:value="formState.secret" show-count :maxlength="128" />
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
  import { MessageTemplateEnum, MessageTemplateOptions } from '../enum';

  const emit = defineEmits(['refresh']);

  let PREFIX: any = '';

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    // debugger;
    const { edit, record } = data;
    isEdit.value = !!edit;

    const opt = MessageTemplateOptions.find((item) => item.value === record.type);
    PREFIX = opt?.prefix;

    if (isEdit.value) {
      isEdit.value &&
        Object.assign(formState, {
          ...record,
          key: record.key.replace(PREFIX, ''),
        });
      console.log(formState);
    } else {
      Object.assign(formState, {
        ...record,
        key: Math.random().toString(36).substring(2, 10),
      });
    }
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  interface IRequest extends MessageSettingRequest {
    id?: string;
  }
  const defaultData = {
    id: undefined,
    key: undefined,
    name: undefined,
    corpid: undefined,
    agentid: undefined,
    secret: undefined,
    remark: undefined,
    appkey: undefined,
    type: undefined,
  };
  const formState: IRequest = reactive({
    ...defaultData,
  });

  const optName = computed(() => {
    const opt = MessageTemplateOptions.find((item) => item.value === formState.type);
    if (opt) {
      return t(opt.i18n);
    } else {
      return '';
    }
  });

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
    Object.assign(formState, defaultData);
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
