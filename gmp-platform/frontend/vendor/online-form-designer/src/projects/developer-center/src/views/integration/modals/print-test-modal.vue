<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.integration.testPrint')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState">
      <a-form-item
        label=""
        name="printContent"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseInputSth', {
              sth: t('sys.integration.printContent'),
            }),
          },
        ]"
      >
        <a-textarea
          v-model:value="formState.printContent"
          :placeholder="
            t('sys.pleaseInputSth', {
              sth: t('sys.integration.printContent'),
            })
          "
          :rows="5"
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
  import { postPrintResourceSendPrintData } from '/@/apis/gct-platform/PrintResourceController';
  import { PrintLogDto } from '/@/apis/gct-platform/model';

  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    Object.assign(formState, {
      ...data,
    });
  });

  const formRef = ref<FormInstance>();
  const formState: PrintLogDto = reactive({
    macAddress: '',
    printContent: '',
    printNumber: 1,
    printName: '',
    printType: 'zpl',
    resourceType: '',
    printAppId: 'Platform',
    printAppName: 'Platform',
  });

  const handleClose = () => {
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      await postPrintResourceSendPrintData(formState);
      message.success(t('sys.operationSuccess'));
      closeModal();
    } catch (err) {
      console.warn(err);
    } finally {
      changeOkLoading(false);
    }
  };
</script>

<style lang="less"></style>
