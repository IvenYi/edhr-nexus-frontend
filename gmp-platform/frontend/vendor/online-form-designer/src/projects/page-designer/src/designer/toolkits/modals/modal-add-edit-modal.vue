<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      isEdit
        ? `${t('sys.edit')}${t('sys.pageDesigner.modal')}${t('sys.name')}`
        : isCopyState
        ? `${t('sys.copyBtn')}${t('sys.pageDesigner.modal')}${t('sys.name')}`
        : `${t('sys.new')}${t('sys.pageDesigner.modal')}${t('sys.name')}`
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="modalFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="`${t('sys.pageDesigner.modal')}${t('sys.name')}`"
        name="modalName"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.modalName" :maxlength="32" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { type FormInstance } from 'ant-design-vue';
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  // import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { LowCodeModal } from '/@page-designer/types/modal-types';

  const { t } = useI18n();
  // const { pageJson } = useDesigner();

  const emit = defineEmits(['ok', 'register']);

  const isEdit = ref(false);
  const modalFormRef = ref<FormInstance>();
  const formState = ref<Partial<LowCodeModal.Modal>>({});
  const isCopyState = ref(false);
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = (data) => {
    console.log('Data Received', data);
    if (data.modal.id) {
      isEdit.value = true;
    }
    isCopyState.value = data.isCopyState;
    formState.value = data.modal;
  };
  const handleClose = () => {
    isEdit.value = false;
    modalFormRef.value?.resetFields();
    formState.value = {};
    isCopyState.value = false;
    closeModal();
  };
  const handleOk = () => {
    modalFormRef.value!.validate().then(() => {
      emit('ok', formState.value);
    });
  };
  // const validateName: any = async () => {
  //   const modal = pageJson.modals.find(
  //     (d) => (d as LowCodeModal.Modal).modalName === formState.value.modalName,
  //   );
  //   if (modal && modal.id !== formState.value.id) {
  //     return Promise.reject(false);
  //   } else {
  //     return Promise.resolve(true);
  //   }
  // };
</script>

<style scoped></style>
