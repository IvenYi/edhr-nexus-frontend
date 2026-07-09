<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="isEdit ? `${t('sys.edit')}${t('sys.category')}` : `${t('sys.new')}${t('sys.category')}`"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="CategoryFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="`${t('sys.category')}${t('sys.name')}`"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="100" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { CategoryRequest } from '/@/apis/gct-apaas/model';
  import { reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const emit = defineEmits(['ok', 'register']);
  const isEdit = ref(false);
  const CategoryFormRef = ref<FormInstance>();
  const formState = reactive<CategoryRequest>({});
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = (data) => {
    console.log('Data Received', data);
    isEdit.value = true;
    Object.assign(formState, { ...data });
  };
  const handleClose = () => {
    isEdit.value = false;
    CategoryFormRef.value?.resetFields();
    formState.id = '';
    closeModal();
  };
  const handleOk = async () => {
    try {
      await CategoryFormRef.value!.validate();
      emit('ok', { name: formState.name, id: formState.id });
      closeModal();
    } catch (error) {
      console.warn(error);
    }
  };
</script>

<style scoped></style>
