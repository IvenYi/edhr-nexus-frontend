<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t(isEdit ? 'sys.renameSth' : 'sys.newSth', { sth: t('sys.category') })"
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
        :label="t('sys.nameOfSth', { sth: t('sys.category') })"
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
  import { FormInstance } from 'ant-design-vue';
  import { reactive, ref, inject } from 'vue';
  import { postCategory, putCategoryById } from '/@/apis/gct-platform/CategoryController';
  import { useI18n } from '/@/hooks/web/useI18n';

  const module = inject('module') as string;

  const emit = defineEmits(['ok', 'register']);

  const { t } = useI18n();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const isEdit = ref(false);
  const CategoryFormRef = ref<FormInstance>();
  const formState = reactive({
    name: '',
  });

  const onDataReceive = (data) => {
    console.log('Data Received', data);
    isEdit.value = true;
    Object.assign(formState, { ...data });
  };

  const handleClose = () => {
    isEdit.value = false;
    CategoryFormRef.value?.resetFields();
  };

  const handleOk = async () => {
    try {
      await CategoryFormRef.value?.validate();
      if (isEdit.value) {
        await putCategoryById(
          {
            id: formState.id,
          },
          {
            module,
            name: formState.name,
          },
        );
      } else {
        await postCategory({
          module,
          name: formState.name,
        });
      }
      emit('ok');
      closeModal();
    } catch (error) {
      console.warn(error);
    }
  };
</script>

<style lang="less"></style>
