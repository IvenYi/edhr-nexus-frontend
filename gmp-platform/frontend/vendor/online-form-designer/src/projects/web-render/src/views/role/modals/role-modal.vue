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
      <a-form-item
        :label="t('sys.type')"
        name="type"
        :rules="[{ required: true }]"
        v-show="getEnv() === 'dev'"
      >
        <a-radio-group v-model:value="formState.type" name="radioGroup" :disabled="isEdit">
          <a-radio value="BUILTIN">{{ t('sys.builtin') }}</a-radio>
          <a-radio value="USER_DEFINED">{{ t('sys.customize') }}</a-radio>
        </a-radio-group>
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
  import { pick } from 'lodash-es';
  import { postRole } from '/@/apis/gct-apaas/RoleController';
  import { RoleRequest } from '/@/apis/gct-apaas/model';
  import { getEnv } from '/@/utils';

  const emit = defineEmits(['refresh']);

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
    id: undefined,
    description: '',
    enabled: 1,
    name: '',
    type: 'USER_DEFINED',
  });

  const handleClose = () => {
    isEdit.value = false;
    formState.id = undefined;
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      const data = pick(formState, ['id', 'name', 'enabled', 'description', 'type']);
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
