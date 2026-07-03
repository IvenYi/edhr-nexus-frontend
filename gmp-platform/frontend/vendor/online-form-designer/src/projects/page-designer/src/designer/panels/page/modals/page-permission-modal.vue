<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? t('sys.edit') : t('sys.new') + t('sys.permission')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="perFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="`${t('sys.permission')}${t('sys.name')}`"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.name" :maxlength="16" show-count />
      </a-form-item>
      <a-form-item
        :label="`${t('sys.permission')}KEY`"
        name="key"
        :rules="[
          { required: true },
          { pattern: /^[a-zA-Z0-9_]+$/, message: t('sys.permissionKeyFormat') },
        ]"
      >
        <a-input
          v-model:value="formState.key"
          :disabled="isEdit"
          :maxlength="32"
          show-count
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { type FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { PermissionResponse } from '/@/apis/gct-apaas/model';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';

  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('perm');
  const emit = defineEmits(['ok', 'register']);
  const perFormRef = ref<FormInstance>();
  const { t } = useI18n();
  const formState = ref<PermissionResponse>({
    name: '',
    key: '',
  });
  const isEdit = ref(false);
  //打开弹框传参
  const [registerInner] = useModalInner((data) => {
    data && onDataReceive(data);
  });
  const onDataReceive = (data) => {
    isEdit.value = true;
    formState.value = {
      ...data,
      key: keyClip(data.key),
    };
  };
  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formState.value = {
      name: '',
      key: '',
    };
  };
  const handleOk = () => {
    perFormRef.value?.validate().then(() => {
      emit('ok', { ...formState.value, key: keyPad(formState.value.key!) });
    });
  };
</script>

<style lang="less" scoped></style>
