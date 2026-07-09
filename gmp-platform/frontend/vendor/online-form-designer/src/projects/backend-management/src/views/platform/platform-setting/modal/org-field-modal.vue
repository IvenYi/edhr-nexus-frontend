<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
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
      class="p-8px"
      :model="formState"
      :label-col="{ span: 24 }"
      :wrapper-col="{ span: 24 }"
      autocomplete="off"
    >
      <a-row :gutter="24">
        <a-col :span="12">
          <a-form-item
            :label="t('sys.model.fieldName')"
            name="fieldName"
            :rules="[
              {
                required: true,
                message: t('sys.inputText') + t('sys.model.fieldName'),
                trigger: ['blur', 'change'],
              },
              {
                validator: () => fieldNameVali(formState.fieldName),
                trigger: ['blur', 'change'],
              },
            ]"
          >
            <a-input
              v-model:value="formState.fieldName"
              :placeholder="t('sys.inputText')"
              style="width: 100%"
            />
          </a-form-item>
        </a-col>
        <a-col :span="12">
          <a-form-item :label="t('sys.model.refField')" name="relationField">
            <a-select
              v-model:value="formState.relationField"
              style="width: 100%"
              :options="relationFields"
              @change="changeField"
            />
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="" name="encrypted">
            <div
              class="flex items-center justify-between pb-20px"
              style="border-bottom: 1px solid #e0e3eb"
            >
              <div>
                <div>{{ t('sys.appDesigner.displayInPwd') }}</div>
                <span class="color-[#8B8B8B]" style="font-size: 12px">
                  {{ t('sys.appDesigner.displayInPwdTip') }}
                </span>
              </div>
              <a-switch
                v-model:checked="formState.encrypted"
                :checked-value="1"
                :un-checked-value="0"
              />
            </div>
          </a-form-item>
        </a-col>
        <a-col :span="24">
          <a-form-item label="" name="required">
            <div class="flex items-center justify-between">
              <span>{{ t('sys.requiredOrNot') }}</span>
              <a-switch
                v-model:checked="formState.required"
                :checked-value="1"
                :un-checked-value="0"
              />
            </div>
          </a-form-item>
        </a-col>
      </a-row>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import crypto from 'crypto';
  import { useOrgSetting } from '/@/hooks/platform/useOrgSetting';
  import { useI18n } from '/@/hooks/web/useI18n';

  const { t } = useI18n();
  const emit = defineEmits(['change']);
  const { relationFields, relationFiledsCopy } = useOrgSetting();

  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDeactivated(data);
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const formState = reactive({
    id: '',
    fieldName: '',
    relationField: relationFields.value[0].value,
    required: 0,
    type: relationFields.value[0].type,
    encrypted: 0,
  });

  const onDeactivated = (data) => {
    isEdit.value = data.isEdit;
    if (isEdit.value) {
      formState.id = data.id;
      formState.fieldName = data.fieldName;
      formState.relationField = data.relationField;
      formState.required = data.required;
      formState.type = data.type;
      formState.encrypted = data.encrypted;
    } else {
      formState.id = generateRandomString(16);
      formState.relationField = relationFields.value[0].value;
    }
  };

  const changeField = (value, option) => {
    formState.type = option.type;
  };

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
    closeModal();
  };

  const handleOk = async () => {
    await formRef.value?.validate();
    const item = relationFields.value.find((item) => item.value === formState.relationField);
    if (item) {
      relationFiledsCopy.value.push(item);
      relationFields.value = relationFields.value.filter((itey) => itey.value !== item.value);
    }
    emit('change', { ...formState, isEdit });
    closeModal();
  };

  function generateRandomString(length) {
    return crypto.randomBytes(length).toString('hex');
  }

  function fieldNameVali(value) {
    if (value && value.length > 32) {
      return Promise.reject(t('sys.max32words'));
    }
    return Promise.resolve();
  }
</script>

<style lang="less" scoped></style>
