<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="`${isEdit ? t('sys.edit') : t('sys.new')}${t(`sys.appDesigner.variable`)}`"
    centered
    width="640px"
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
        :label="`${t('sys.appDesigner.variable')}KEY`"
        name="key"
        :rules="[
          { required: true },
          {
            validator: validateSpecialCharacters,
          },
        ]"
      >
        <a-input
          :disabled="isEdit"
          v-model:value="formState.key"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="32"
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.appDesigner.developEnv')"
        name="devValue"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.devValue" show-count :maxlength="256" />
      </a-form-item>

      <a-form-item
        :label="t('sys.appDesigner.testEnv')"
        name="testValue"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.testValue" show-count :maxlength="256" />
      </a-form-item>

      <a-form-item
        :label="t('sys.appDesigner.productionEnv')"
        name="prodValue"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.prodValue" show-count :maxlength="256" />
      </a-form-item>

      <a-form-item :label="t('sys.notes')" name="description">
        <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts" name="system-variables-modal">
  import { reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  import {
    postSystemVar,
    getSystemVarInfo,
    putSystemVarById,
  } from '/@/apis/gct-apaas/SystemVarController';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';

  import type { FormInstance } from 'ant-design-vue';

  const ADDON_KEY = '$SYSTEM_VAR_';
  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser(ADDON_KEY);

  interface FormState {
    /** 变量名称 */
    key?: string;
    /** 开发环境 */
    devValue?: string;
    testValue?: string;
    /** 生产环境 */
    prodValue?: string;
    /** 备注 */
    description?: string;
  }

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    key: '',
    devValue: '',
    testValue: '',
    prodValue: '',
    description: '',
  });

  const isEdit = ref<boolean>(false);

  const currentId = ref<string>('');

  const emit = defineEmits(['refresh', 'register']);

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[A-Za-z_]*$/;
    if (!reg.test(value) && !isEdit.value) {
      callback(
        t('sys.printDesigner.moduleValidateKeyErrorMsg', {
          sth: t('sys.appDesigner.systemVariable'),
        }),
      );
    }
    callback();
  };

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      isEdit.value = data.isEdit;
      if (data.isEdit && data.info) {
        onDataReceive(data.info);
      }
    }
  });

  const onDataReceive = async (node) => {
    const detail = (await getSystemVarInfo({ id: node.id })) || {};
    currentId.value = detail.id ?? '';

    // const key = detail.key?.replace(ADDON_KEY, '');
    formState.key = keyClip(detail.key!);
    formState.devValue = detail.devValue;
    formState.testValue = detail.testValue;
    formState.prodValue = detail.prodValue;
    formState.description = detail.description;
  };

  const handleShow = (visible: boolean) => {
    if (visible) {
      isEdit.value = false;
    }
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    currentId.value = '';
    formRef.value?.resetFields();
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const data = {
        ...formState,
        key: keyPad(formState.key!),
      };

      if (isEdit.value) {
        await putSystemVarById({ id: currentId.value }, data);
        message.success(t('sys.developer.appCenter.editSuccess'));
      } else {
        await postSystemVar(data);
        message.success(t('sys.createSuccess'));
      }
      emit('refresh');
      closeModal();
    });
  };
</script>

<style lang="less" scoped></style>
