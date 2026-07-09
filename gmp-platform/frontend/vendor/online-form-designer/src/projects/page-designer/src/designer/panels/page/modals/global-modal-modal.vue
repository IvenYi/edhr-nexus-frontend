<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      isEdit
        ? `${t('sys.edit')}${t('sys.pageDesigner.globalModal')}${t('sys.name')}`
        : `${t('sys.new')}${t('sys.pageDesigner.globalModal')}${t('sys.name')}`
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="gModalFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="`${t('sys.pageDesigner.globalModal')}${t('sys.name')}`"
        :name="['modalInfo', 'modalName']"
        :rules="[
          { required: true },
          // { validator: validateName, message: t('sys.pageDesigner.modalNameRepeat') },
        ]"
      >
        <a-input v-model:value="formState.modalInfo.modalName" :maxlength="32" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { type FormInstance } from 'ant-design-vue';
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { LowCodeModal } from '/@page-designer/types/modal-types';
  // import { useGlobal } from '/@page-designer/hooks/useGlobal';

  const { t } = useI18n();
  // const { gModal } = useGlobal();

  const emit = defineEmits(['ok', 'register']);

  const isEdit = ref(false);
  const gModalFormRef = ref<FormInstance>();
  const formState = ref<{ id?: string; modalInfo: Partial<LowCodeModal.Modal> }>({
    modalInfo: {},
  });
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = (data) => {
    console.log('Data Received', data);
    if (data.id) {
      isEdit.value = true;
    }
    formState.value = data;
  };
  const handleClose = () => {
    isEdit.value = false;
    gModalFormRef.value?.resetFields();
    formState.value = {
      modalInfo: {},
    };
    closeModal();
  };
  const handleOk = () => {
    gModalFormRef.value!.validate().then(() => {
      emit('ok', { ...formState.value });
    });
  };
  // const validateName: any = async () => {
  //   const modal = gModal.value.find((d) => d.name === formState.value.modalInfo.modalName);
  //   if (modal && modal.id !== formState.value.id) {
  //     return Promise.reject(false);
  //   } else {
  //     return Promise.resolve(true);
  //   }
  // };
</script>

<style scoped></style>
