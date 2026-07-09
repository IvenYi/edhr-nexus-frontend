<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="
      isEdit
        ? t('sys.component.fieldTypeProps.editOption')
        : t('sys.component.fieldTypeProps.newOption')
    "
    centered
    :min-height="200"
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="save"
  >
    <a-form
      ref="enumFormRef"
      :model="formState"
      :label-col="{ span: 7 }"
      :wrapper-col="{ span: 13 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.component.fieldTypeProps.showValue')"
        name="text"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.text" :placeholder="t('sys.inputText')" />
      </a-form-item>
      <a-form-item
        :label="t('sys.component.fieldTypeProps.optionValue')"
        name="value"
        :rules="[
          { required: true },
          {
            validator: validateSpecialCharacters,
          },
        ]"
      >
        <a-input v-model:value="formState.value" :placeholder="t('sys.inputText')" />
      </a-form-item>
      <a-form-item
        :label="t('sys.component.fieldTypeProps.defaultSelected')"
        name="defaultSelected"
      >
        <a-switch v-model:checked="formState.defaultSelected" />
      </a-form-item>
      <a-form-item :label="$t('sys.onlineForm.whetherToDisplay')" name="display">
        <a-switch v-model:checked="formState.display" />
      </a-form-item>
    </a-form>
    <template v-if="!isEdit" #centerFooter>
      <a-button type="primary" @click="saveAndNew">{{ t('sys.confirmAndContinue') }}</a-button>
    </template>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CellWidget } from '../../designer/types/cell-widget';
  import { buildUUID } from '/@/utils/uuid';
  import { clone } from 'lodash-es';

  defineProps<{
    data?: CellWidget.EnumOption;
  }>();

  const emit = defineEmits<{
    (e: 'update', data: CellWidget.EnumOption): void;
    (e: 'create', data: CellWidget.EnumOption): void;
  }>();

  const { t } = useI18n();

  const formState = reactive<Partial<CellWidget.EnumOption>>({
    id: buildUUID(),
    display: true,
  });

  const enumFormRef = ref<FormInstance>();
  /** 表单校验 */
  const clear = () => {
    enumFormRef.value?.resetFields();
    formState.id = buildUUID();
    formState.display = true;
  };

  const validateAndEmit = async () => {
    await enumFormRef.value?.validate();
    if (isEdit.value) {
      emit('update', clone(formState) as CellWidget.EnumOption);
    } else {
      emit('create', clone(formState) as CellWidget.EnumOption);
    }
    clear();
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z0-9_]*$/;
    if (!reg.test(value)) {
      callback(t('sys.model.validateEnumFieldErrorMsg'));
    }
    callback();
  };

  const isEdit = ref<boolean>(false);

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDataReceive(data);
  });

  const onDataReceive = (data) => {
    isEdit.value = !!data.isEdit;
    if (data.option) {
      Object.assign(formState, data.option);
    }
  };

  const handleClose = () => {
    clear();
    closeModal();
  };

  const save = async () => {
    await validateAndEmit();
    closeModal();
  };

  // 保存并继续新建
  const saveAndNew = async () => {
    await validateAndEmit();
  };
</script>

<style lang="less" scoped></style>
