<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="400"
    :title="isEdit ? t('sys.developer.devive.editParams') : t('sys.developer.devive.createParams')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    :scroll="{ y: 300 }"
    @ok="handleOk"
    :confirmLoading="loading"
  >
    <div class="py8px px64px">
      <a-form :model="formState" ref="formRef" :labelCol="labelCol">
        <a-form-item
          :label="t('sys.platform.code')"
          name="key"
          :rules="[{ required: true }, { max: 64, message: t('sys.max64') }]"
        >
          <a-input
            v-model:value.trim="formState.key"
            :disabled="isEdit"
            :placeholder="t('sys.inputText')"
          />
        </a-form-item>
        <a-form-item
          :label="t('sys.name')"
          name="name"
          :rules="[{ required: true }, { max: 32, message: t('sys.max32') }]"
        >
          <a-input v-model:value.trim="formState.name" :placeholder="t('sys.inputText')" />
        </a-form-item>
        <a-form-item :label="t('sys.type')" name="type" :rules="[{ required: true }]">
          <a-select
            v-model:value="formState.type"
            :placeholder="t('sys.chooseText')"
            :options="typeOptions"
          />
        </a-form-item>
        <a-form-item :label="t('sys.notes')" name="remark">
          <a-textarea v-model:value.trim="formState.remark" :placeholder="t('sys.inputText')" />
        </a-form-item>
      </a-form>
    </div>
  </basic-modal>
</template>
<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import {
    postDeviceInterconnectionParam,
    putDeviceInterconnectionParamById,
  } from '/@/apis/gct-platform/DeviceInterconnectionParamController';
  import { message } from 'ant-design-vue';
  import { DeviceParamsTypeEnum } from '@gct/runtime';

  const emit = defineEmits(['ok']);
  const { t } = useI18n();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    formRef.value && formRef.value.resetFields();
    if (!data) {
      formState.id = '';
      return;
    }
    Object.assign(formState, data);
  });

  const labelCol = { span: 3 };

  const formRef = ref();

  const formState = reactive({
    id: '',
    key: '',
    name: '',
    type: undefined,
    remark: '',
  });
  const loading = ref(false);
  const isEdit = computed(() => {
    return !!formState.id;
  });

  const typeOptions = [
    {
      label: t('sys.text'),
      value: DeviceParamsTypeEnum.STRING,
    },
    {
      label: t('sys.component.dataConnection.modelField.integer'),
      value: DeviceParamsTypeEnum.INTEGER,
    },
    {
      label: t('sys.component.dataConnection.modelField.long'),
      value: DeviceParamsTypeEnum.LONG,
    },
    {
      label: t('sys.component.dataConnection.modelField.double'),
      value: DeviceParamsTypeEnum.FLOAT,
    },
    {
      label: t('sys.component.dataConnection.modelField.boolean'),
      value: DeviceParamsTypeEnum.BOOLEAN,
    },
    {
      label: t('sys.component.dataConnection.modelField.date'),
      value: DeviceParamsTypeEnum.DATE,
    },
  ];

  const handleClose = () => {
    formState.id = '';
    formRef.value.resetFields();
    closeModal();
  };

  const handleOk = () => {
    formRef.value?.validate().then(() => {
      loading.value = true;
      if (formState.id) {
        putDeviceInterconnectionParamById({ id: formState.id }, formState)
          .then(() => {
            message.success(t('sys.editSuccess'));
            emit('ok');
            handleClose();
          })
          .finally(() => {
            loading.value = false;
          });
      } else {
        postDeviceInterconnectionParam(formState)
          .then(() => {
            message.success(t('sys.createSuccess'));
            emit('ok');
            handleClose();
          })
          .finally(() => {
            loading.value = false;
          });
      }
    });
  };
</script>
