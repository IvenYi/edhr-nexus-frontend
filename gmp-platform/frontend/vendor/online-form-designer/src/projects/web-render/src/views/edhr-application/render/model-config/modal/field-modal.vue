<template>
  <basic-modal
    v-bind="$attrs"
    @register="register"
    :title="
      isEdit
        ? `${t('sys.edit')}${t('sys.appDesigner.field')}`
        : `${t('sys.add')}${t('sys.appDesigner.field')}`
    "
    centered
    width="640px"
    :minHeight="150"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 18 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.model.fieldName')" name="name" :rules="nameValidator">
        <a-input
          v-model:value="formState.name"
          style="width: 70%"
          maxlength="32"
          :placeholder="t('sys.inputText')"
        />
      </a-form-item>
      <a-form-item
        :label="t('sys.model.refField')"
        name="key"
        :rules="[{ required: true, message: t('sys.model.refField') + t('sys.model.required') }]"
      >
        <a-select
          v-model:value="formState.key"
          style="width: 70%"
          :options="relationFields"
          :disable="isEdit"
          :placeholder="t('sys.chooseText')"
          @change="changeField"
        />
      </a-form-item>
      <a-form-item :label="t('sys.requiredOrNot')" name="required">
        <a-switch v-model:checked="formState.required" :checked-value="1" :un-checked-value="0" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FieldMetaDTO } from '@gct/runtime';
  import { sortedArrayByFieldKey } from '../useModelConfig';

  const { t } = useI18n();
  const emit = defineEmits(['change']);
  const [register, { openModal, closeModal }] = useModal();

  const props = defineProps<{
    allRelationFields: FieldMetaDTO[];
  }>();

  const relationFields = computed(() => {
    const relationFieldsWithoutUsed = props.allRelationFields.filter(
      (item) => item.specificConfig?.extField && !item.specificConfig?.extUsed,
    );
    return sortedArrayByFieldKey(relationFieldsWithoutUsed).map((item) => {
      return {
        label: item.key,
        type: item.type,
        value: item.key,
      };
    });
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const formState = reactive({
    name: undefined,
    key: undefined,
    required: 0,
    type: undefined,
  });

  const nameValidator = computed(() => [
    { required: true, message: t('sys.model.fieldName') + t('sys.model.required') },
    {
      validator: async (rule, value) => {
        return await new Promise((resolve, reject) => {
          if (value) {
            const exist = props.allRelationFields.find(
              (item) => !isEdit.value && item.name === value,
            );
            if (exist) {
              reject(t('sys.model.fieldName') + '' + t('sys.edhr.alreadyExist'));
            } else {
              resolve(true);
            }
          } else {
            resolve(true);
          }
        });
      },
    },
  ]);

  const onDeactivated = (data) => {
    isEdit.value = data.isEdit;
    formState.name = data?.name;
    formState.key = data?.key;
    formState.required = data?.required;
    formState.type = data?.type;
  };

  const changeField = (value, option) => {
    formState.type = option.type;
  };

  const handleOpen = (data) => {
    openModal(true);
    onDeactivated(data);
  };

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
    closeModal();
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    emit('change', { ...formState, isEdit: isEdit.value });
    closeModal();
  };

  defineExpose({
    open: handleOpen,
  });
</script>

<style lang="less" scoped></style>
