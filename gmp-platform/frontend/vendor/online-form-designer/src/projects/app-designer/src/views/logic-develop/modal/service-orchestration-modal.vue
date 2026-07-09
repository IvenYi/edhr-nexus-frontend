<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="
      isEdit
        ? t('sys.editSth', { sth: t('sys.model.serviceOrchestration') })
        : t('sys.newSth', { sth: t('sys.model.serviceOrchestration') })
    "
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.categoryOfSth', { sth: t('sys.model.serviceOrchestration') })"
        name="categoryId"
        :rules="[{ required: true }]"
      >
        <a-select ref="select" v-model:value="formState.categoryId">
          <template v-for="item in category" :key="item">
            <a-select-option :value="item.id">{{ item.name }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.nameOfSth', { sth: t('sys.model.serviceOrchestration') })"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item
        :label="t('sys.keyOfSth', { sth: t('sys.model.serviceOrchestration') })"
        name="key"
        :rules="[
          { required: true },
          isEdit
            ? {}
            : {
                pattern: /^[A-Za-z_]+$/,
                message: t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                  sth: t('sys.orchestration'),
                }),
              },
        ]"
      >
        <a-input
          v-model:value="formState.key"
          :disabled="isEdit"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="32"
        />
      </a-form-item>
      <template v-if="isEdit">
        <a-form-item
          :label="`${t('sys.appDesigner.activate')}${t('sys.appDesigner.version')}`"
          name="version"
          :rules="[{ required: true }]"
        >
          <a-select ref="select" v-model:value="formState.version">
            <a-select-option v-for="item in versions" :value="item.version" :key="item.version">
              {{ item.version }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </template>
      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import {
    postServiceOrchestration,
    putServiceOrchestrationById,
  } from '/@/apis/gct-apaas/ServiceOrchestrationController';
  import { ServiceOrchestrationRequest } from '/@/apis/gct-apaas/model';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';

  defineProps<{
    category;
    versions?;
  }>();
  const emit = defineEmits(['refresh', 'create-success']);

  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('so');

  const [registerInner, { closeModal, changeOkLoading }] = useModalInner((data) => {
    if (!data) return;

    const { edit, data: info } = data;
    isEdit.value = !!edit;
    if (!isEdit.value) {
      formState.categoryId = info.categoryId;
      formState.key = info.uuid;
    } else {
      onDataReceive(info);
    }
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const id = ref('');
  const formState = reactive<ServiceOrchestrationRequest>({
    categoryId: '',
    name: '',
    key: '',
    version: '',
    description: '',
  });

  const onDataReceive = (data) => {
    const { name, key, description, categoryResponse, orchestrationVersion } = data;
    formState.name = name;
    formState.description = description;
    formState.key = keyClip(key);
    formState.version = orchestrationVersion.version;
    formState.categoryId = categoryResponse.id;
    id.value = data.id;
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formRef.value?.resetFields();
    closeModal();
  };

  const handleOk = async () => {
    changeOkLoading(true);
    try {
      await formRef.value?.validate();
      const data = { ...formState, key: keyPad(formState.key!) };
      if (isEdit.value) {
        await putServiceOrchestrationById({ id: id.value }, data);
      } else {
        const res = await postServiceOrchestration(data);
        emit('create-success', res);
      }
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
