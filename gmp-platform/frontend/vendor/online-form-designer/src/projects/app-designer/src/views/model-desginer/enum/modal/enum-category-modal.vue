<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? t('sys.model.editEnumeration') : t('sys.model.newEnumeration')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      ref="enumFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.model.enumClassification')"
        name="categoryId"
        :rules="[{ required: true }]"
      >
        <a-select ref="select" v-model:value="formState.categoryId">
          <template v-for="item in enumModel" :key="item.id">
            <a-select-option :value="item.id">{{ item.name }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.model.modelName')"
        name="name"
        :rules="[{ required: true }, { validator: validateModelName }]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item
        :label="t('sys.model.modelKey')"
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
      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.description"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';

  import { NewEnumInfo } from '../types/enum-modal';
  import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import {
    getEnumModelInfoById,
    postEnumModel,
    putEnumModelById,
  } from '/@/apis/gct-apaas/EnumModelController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ModelTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { validateModelName } from '/@/utils/validate';

  const enumFormRef = ref<FormInstance>();
  const isEdit = ref<boolean>(false);
  const enumModel = ref<CategoryCompleteResponse[]>([]);
  const currentId = ref<string>('');

  const formState = reactive<NewEnumInfo>({
    categoryId: '',
    key: '',
    name: '',
    description: '',
  });

  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('enu');

  const emit = defineEmits(['refresh', 'register']);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      isEdit.value = data.isEdit;
      formState.categoryId = data.categoryId;
      if (!data.isEdit) {
        formState.key = data?.uuid;
      }
      data.isEdit && onDataReceive(data);
    }
  });

  const onDataReceive = async (node) => {
    const info = (await getEnumModelInfoById({ id: node.id })) || {};
    currentId.value = node.id;
    formState.categoryId = info.categoryResponse!.id!;
    formState.name = info?.name || '';
    formState.description = info!.description!;
    formState.key = keyClip(info.key!);
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    enumFormRef.value?.resetFields();
    closeModal();
  };

  const handleShow = async () => {
    // 获取模型列表
    enumModel.value = (await getCategoryListComplete({ module: ModelTypeEnum.ENUM })) ?? [];
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z_]*$/;
    if (!reg.test(value)) {
      callback(
        t('sys.printDesigner.moduleValidateKeyErrorMsg', {
          sth: t('sys.model.enumModel'),
        }),
      );
    }
    callback();
  };

  const handleOk = () => {
    enumFormRef.value?.validate().then(async () => {
      const data = { ...formState, key: keyPad(formState.key) };
      if (isEdit.value) {
        await putEnumModelById({ id: currentId.value }, data);
      } else {
        await postEnumModel(data);
      }
      emit('refresh');
      isEdit.value = false;
      closeModal();
    });
  };
</script>

<style lang="less" scoped>
  .series {
    :deep(.ant-form-item-label) {
      label {
        display: none;
      }
    }
  }
</style>
