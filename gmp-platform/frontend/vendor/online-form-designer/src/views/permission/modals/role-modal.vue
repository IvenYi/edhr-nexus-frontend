<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      isEdit ? t('sys.editSth', { sth: t('sys.role') }) : t('sys.newSth', { sth: t('sys.role') })
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.nameOfSth', { sth: t('sys.role') })"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item :label="t('sys.status')" name="enabled" :rules="[{ required: true }]">
        <a-radio-group v-model:value="formState.enabled" name="radioGroup">
          <a-radio :value="1">{{ t('sys.enabled') }}</a-radio>
          <a-radio :value="0">{{ t('sys.disabled') }}</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item :label="t('sys.notes')" name="description">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.description"
          show-count
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
  import type { RoleRequest } from '/@/apis/gct-platform/model';
  import { pick } from 'lodash-es';
  import { useRoleApis } from '/@/views/permission/hooks/useModule';

  const emit = defineEmits(['refresh']);

  const { postRole } = useRoleApis();
  const { t } = useI18n();
  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;
    const { edit, record } = data;
    isEdit.value = !!edit;
    isEdit.value && Object.assign(formState, record);
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const formState = reactive<RoleRequest>({
    description: '',
    enabled: 1,
    name: '',
  });

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      const data = pick(formState, ['id', 'name', 'enabled', 'description']);
      await postRole(data);
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
