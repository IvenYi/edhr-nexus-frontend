<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? '编辑模板' : '新建模板'"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item label="模板名称" name="name" :rules="[{ required: true }]">
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item label="模板KEY" name="key" :rules="[{ required: true }]">
        <a-input
          :disabled="isEdit"
          v-model:value="formState.key"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="32"
        />
      </a-form-item>
      <a-form-item label="类型">
        <a-select ref="select" name="type" v-model:value="formState.type" style="width: 60%">
          <a-select-option value="IMPORT">{{ t('sys.import') }}</a-select-option>
          <a-select-option value="EXPORT">{{ t('sys.export') }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="描述" name="description">
        <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { omit } from 'lodash-es';
  import { DataTemplateEnum, DataTemplateType } from '../type';
  import { postExcelTmpl, putExcelTmplById } from '/@/apis/gct-apaas/ExcelTmplController';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { uuid2 } from '/@/utils/uuid';
  const props = defineProps<{
    modelKey: string;
  }>();

  const emit = defineEmits(['refresh']);

  const { t } = useI18n();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDeactivated(data);
  });

  const formState = reactive<DataTemplateType>({
    type: DataTemplateEnum.IMPORT,
    name: '',
    key: uuid2(6),
    description: '',
  });
  const isEdit = ref(false);
  const dataTplId = ref('');
  const formRef = ref<FormInstance>();

  const addonBefore = computed(() => {
    return formState.type.toLowerCase();
  });
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser(addonBefore);

  const onDeactivated = (data) => {
    const { edit, id, name, key, type, description } = data;
    isEdit.value = edit;
    dataTplId.value = id;
    formState.name = name;
    formState.type = type;
    formState.description = description;
    formState.key = keyClip(key);
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formRef.value?.resetFields();
    closeModal();
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const data = {
        ...omit(formState, ['key']),
        key: keyPad(formState.key),
        modelKey: props.modelKey,
      };

      if (isEdit.value) {
        // 编辑
        await putExcelTmplById({ id: dataTplId.value }, data);
        message.success(`${formState.name}模板编辑成功`);
      } else {
        // 新建
        await postExcelTmpl(data);
        message.success(`${formState.name}模板新建成功`);
      }
      emit('refresh');
      closeModal();
    });
  };
</script>

<style lang="less"></style>
