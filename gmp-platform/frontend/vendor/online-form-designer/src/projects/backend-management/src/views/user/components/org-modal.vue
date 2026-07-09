<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="
      isEdit
        ? `${t('sys.edit')}${t('sys.organization')}`
        : `${t('sys.new')}${t('sys.organization')}`
    "
    centered
    width="700px"
    :minHeight="100"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        v-if="getOrgIdentifier"
        :label="`${t('sys.organization')}${t('sys.no')}`"
        name="identifier"
      >
        <a-input v-model:value="formState.identifier" :maxlength="32" show-count />
      </a-form-item>
      <a-form-item
        :label="`${t('sys.organization')}${t('sys.name')}`"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.name" :maxlength="64" show-count />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance } from 'ant-design-vue';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';

  const { t } = useI18n();
  const { getOrgIdentifier } = useRootSetting();
  const formRef = ref<FormInstance>();
  interface FormState {
    id: number | undefined;
    parentId: number | undefined;
    identifier: string;
    name: string;
  }
  const formState = reactive<FormState>({
    id: undefined,
    parentId: undefined,
    identifier: '',
    name: '',
  });
  const emit = defineEmits(['ok', 'register']);
  const isEdit = ref(false);
  //弹框显示隐藏改变
  const handleShow = (visible: boolean) => {
    if (visible) {
      isEdit.value = false;
    }
  };
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = (data) => {
    console.log('Data Received', data);
    isEdit.value = true;
    formState.id = data.id;
    formState.parentId = data.parentId;
    formState.identifier = data.identifier;
    formState.name = data.name;
  };
  const handleOk = () => {
    formRef.value?.validate().then((res) => {
      console.log(toRaw(formState));
      emit('ok', { ...toRaw(formState) });
      closeModal();
    });
  };
  const handleClose = () => {
    formRef.value?.resetFields();
    formState.id = undefined;
    formState.parentId = undefined;
  };
</script>

<style lang="ts" scoped></style>
