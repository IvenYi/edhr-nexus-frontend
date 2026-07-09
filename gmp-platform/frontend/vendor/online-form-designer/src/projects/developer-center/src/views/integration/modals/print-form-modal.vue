<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t(isEdit ? 'sys.editSth' : 'sys.addSth', { sth: t('sys.printer') })"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 5 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.name')"
        name="name"
        :rules="[{ required: true, whitespace: true }]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>

      <a-form-item
        :label="t('sys.keyOfSth', { sth: t('sys.printer') })"
        name="key"
        :rules="[
          { required: true },
          {
            pattern: /^[a-zA-Z0-9_]+$/,
            message: t('sys.integration.printerKeyFormat'),
          },
        ]"
      >
        <a-input
          v-model:value="formState.key"
          :disabled="isEdit"
          :addon-before="PREFIX"
          show-count
          :maxlength="6"
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.integration.ipAddress')"
        name="printIp"
        :rules="[
          { required: true, whitespace: true },
          {
            pattern:
              /^((25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))\.){3}(25[0-5]|2[0-4]\d|((1\d{2})|([1-9]?\d)))$/,
            message: t('sys.pleaseInputValidSth', {
              sth: t('sys.integration.ipAddress'),
            }),
          },
        ]"
      >
        <a-input v-model:value="formState.printIp" show-count :maxlength="32" />
      </a-form-item>

      <a-form-item :label="t('sys.brand')" name="brand">
        <a-input v-model:value="formState.brand" show-count :maxlength="32" />
      </a-form-item>

      <a-form-item :label="t('sys.notes')" name="remark">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.remark"
          show-count
          :rows="5"
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { PrintResourceRequest } from '/@/apis/gct-platform/model';
  import {
    postPrintResource,
    putPrintResourceById,
  } from '/@/apis/gct-platform/PrintResourceController';
  import { PrintResourceEnum } from '../enum';

  const emit = defineEmits(['ok']);

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
      formState.key = Math.random().toString(36).substring(2, 8);
    }
  });

  const formRef = ref<FormInstance>();

  const PREFIX = 'printer_';

  interface IFormState extends PrintResourceRequest {
    id?: string;
  }
  const isEdit = ref(false);
  const formState: IFormState = reactive({
    id: undefined,
    key: undefined,
    name: undefined,
    printIp: undefined,
    brand: undefined,
    remark: undefined,
    type: PrintResourceEnum.INTERNET_PRINT,
  });
  // const printers = ref<any[]>([]);

  const handleClose = () => {
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
        delete params.id;
        await putPrintResourceById({ id: formState.id! }, params);
      } else {
        await postPrintResource(params);
      }

      message.success(t('sys.operationSuccess'));
      closeModal();
      emit('ok');
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less"></style>
