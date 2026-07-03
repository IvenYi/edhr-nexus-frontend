<template>
  <a-modal
    v-model:visible="visible"
    :title="t('sys.edhr.txnWithWork.bindFormInstance')"
    :width="800"
    @ok="handleOk"
    @cancel="handleCancel"
    :okButtonProps="{
      disabled: !(formData.instId && formData.tmplId),
    }"
  >
    <a-form :model="formData" ref="formRef" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }">
      <!-- <a-form-item label="绑定类型" name="bindType">
        <a-radio-group v-model:value="formData.bindType" :options="formTypeOptions" />
      </a-form-item> -->
      <a-form-item
        :label="t('sys.webRender.onlineFormSerialNo')"
        name="serialNumber"
        :rules="[{ required: true, message: t('sys.inputText') }]"
      >
        <a-input
          v-model:value="formData.serialNumber"
          :placeholder="t('sys.inputText')"
          @blur="onPressEnter"
          @pressEnter="onPressEnter"
          @clear="onPressEnter"
        />
      </a-form-item>
      <a-form-item :label="t('sys.webRender.onlineFormTmplName')" name="name">
        <a-input v-model:value="formData.name" disabled />
      </a-form-item>
      <a-form-item :label="t('sys.webRender.onlineFormTmplCode')" name="code">
        <a-input v-model:value="formData.code" disabled />
      </a-form-item>
      <a-form-item :label="t('sys.onlineForm.formType')" name="formType">
        <a-input v-model:value="formData.formType" disabled />
      </a-form-item>
      <a-form-item :label="t('sys.onlineForm.formStatus')" name="status">
        <a-input v-model:value="formData.status" disabled />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script setup lang="ts" name="bind-form-dialog">
  import { ref, reactive, toRaw } from 'vue';
  import { message } from 'ant-design-vue';
  import { getOnlineFormInstanceGetOne } from '/@/apis/gct-apaas/FormInstanceController';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();

  const emits = defineEmits<{
    (e: 'ok', data: any): void;
  }>();

  const initData = {
    bindType: 'aaa',
    serialNumber: '',
    name: '',
    code: '',
    formType: '',
    status: '',
    instId: '',
    tmplId: '',
  };

  const formRef = ref();
  const visible = ref(false);

  const formTypeOptions = [
    {
      label: t('sys.edhr.formInstance'),
      value: 'aaa',
      disabled: false,
    },
    {
      label: 'eDHR',
      value: 'bbb',
      disabled: true,
    },
  ];

  const formData = reactive({ ...initData });

  async function onPressEnter() {
    if (!formData.serialNumber) {
      clearData();
      return;
    }
    const result = await getOnlineFormInstanceGetOne({
      materialStatus: 'FORM,LOT,SN',
      serialNo: formData.serialNumber,
    });
    console.log('res', result);
    if (result) {
      Object.assign(formData, {
        name: result.tmplName,
        code: result.ofCode,
        formType: t(`sys.onlineForm.formTypeEnum.${result.formType}`),
        status: result.instanceStatus
          ? t(`sys.edhr.instanceStatus2FormEnum.${result.instanceStatus}`)
          : '',
        instId: result.id,
        tmplId: result.tmplId,
      });
    } else {
      message.warn(t('sys.edhr.txnWithWork.bindFormInstTip'));
      clearData();
    }
  }

  function clearData() {
    Object.assign(formData, { ...initData });
  }

  async function onOpen(optionList: Array<any>) {
    visible.value = true;
    clearData();
  }

  function handleCancel() {
    visible.value = false;
  }

  async function handleOk() {
    await formRef.value.validate();
    visible.value = false;
    emits('ok', toRaw(formData));
  }

  defineExpose({
    open: onOpen,
    confirm: handleOk,
  });
</script>

<style scoped></style>
