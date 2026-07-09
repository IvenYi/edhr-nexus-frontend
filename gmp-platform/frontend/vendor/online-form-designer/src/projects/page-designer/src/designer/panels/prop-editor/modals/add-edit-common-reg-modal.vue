<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.pageDesigner.commonReg')"
    centered
    width="540px"
    :min-height="100"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="commonRegForm"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        name="name"
        :label="t('sys.name')"
        :rules="[{ required: true }, { validator: validateName }]"
      >
        <a-input v-model:value="formState.name"></a-input>
      </a-form-item>
      <a-form-item name="value" :label="t('sys.pageDesigner.regex')" :rules="[{ required: true }]">
        <a-input v-model:value="formState.value"></a-input>
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { RegexpResponse } from '/@/apis/gct-apaas/model';

  const { t } = useI18n();
  const commonRegForm = ref();
  const isEdit = ref(false);
  const emit = defineEmits(['ok', 'register']);
  const formState = ref<RegexpResponse>({
    name: '',
    value: '',
  });
  const commonRegList = ref<RegexpResponse[]>([]);
  const [registerInner] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = (data) => {
    formState.value = {
      id: data.id,
      name: data.name,
      value: data.value,
    };
    commonRegList.value = data.commonRegList;
    isEdit.value = data.isEdit;
    console.log(formState);
  };
  const handleClose = () => {
    commonRegForm.value?.resetFields();
    formState.value = {
      name: '',
      value: '',
    };
  };
  const handleOk = async () => {
    try {
      await commonRegForm.value!.validate();
      emit('ok', { ...formState.value });
    } catch (err) {
      console.log(err);
    }
  };
  const validateName = async () => {
    const find = commonRegList.value.find((d) => d.name === formState.value.name);
    if (!!find && find.id !== formState.value.id) {
      return Promise.reject(t('sys.pageDesigner.repeatRegName'));
    }
    return Promise.resolve();
  };
</script>
<script lang="ts"></script>
<style scoped></style>
