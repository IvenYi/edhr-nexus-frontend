<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="modalTitle"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    :zIndex="1002"
    @visible-change="visibleChange"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.process.type')"
        name="categoryId"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseSelectSth', {
              sth: t('sys.process.type'),
            }),
          },
        ]"
      >
        <a-select ref="select" v-model:value="formState.categoryId">
          <template v-for="item in categoryOptions" :key="item">
            <a-select-option :value="item.value">{{ item.label }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item :label="t('sys.process.name')" name="name" :rules="[{ required: true }]">
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item
        :label="t('sys.process.key')"
        name="key"
        :rules="[{ required: true }, { validator: validateSpecialCharacters }]"
      >
        <a-input
          v-model:value="formState.key"
          :addon-before="keyPrefix"
          :disabled="isEdit"
          show-count
          :maxlength="32"
        />
      </a-form-item>
      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed, unref } from 'vue';
  import { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import {
    getBizProcessDefinitionInfo,
    postBizProcessDefinition,
    putBizProcessDefinitionById,
  } from '/@/apis/gct-apaas/BizProcessDefinitionController';
  import { useUUid } from '@/hooks/web/useUUid';
  import { getCategoryList } from '/@/apis/gct-apaas/CategoryController';

  const { keyPrefix, keyPad, keyClip, keyReset, keyPrePad, keyPreClip, keySuffix } = useKeyParser(
    'process',
    '',
  );
  const { getUuid } = useUUid([], '');
  const { t } = useI18n();

  const props = defineProps<{
    currentCategoryId: string;
  }>();

  const categoryOptions = ref<any>([]);

  const emit = defineEmits(['refresh', 'register']);
  const currentId = ref('');
  const formRef = ref<FormInstance>();

  const modalTitle = computed(() => {
    return `${formState.id ? t('sys.edit') : t('sys.new')}` + t('sys.process.biz');
  });

  const [registerInner, { closeModal }] = useModalInner(async (data) => {
    !formState.key && (formState.key = getUuid());
    formState.id = '';
    getCategoryList({ module: 'biz_process_module' }).then((res) => {
      categoryOptions.value =
        res?.map((item) => {
          return {
            value: item.id,
            label: item.name,
          };
        }) || [];
      if (categoryOptions.value.map((item) => item.value).includes(props.currentCategoryId)) {
        formState.categoryId = props.currentCategoryId;
      }
    });
    if (!data) return;
    if (data) {
      const info = data.id ? (await getBizProcessDefinitionInfo({ id: data.id })) || {} : data;
      isEdit.value = !!data.id;
      currentId.value = info.id!;
      Object.assign(formState, {
        ...info,
        key: keyClip(info?.key),
      });
    }
  });

  const formState = reactive({
    categoryId: '',
    description: '',
    key: '',
    name: '',
    modelKey: 'em_check_task',
  });

  const isEdit = ref(false);

  const visibleChange = async (visible) => {};

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formRef.value?.resetFields();
    formState.key = '';
    currentId.value = '';
    closeModal();
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z_]{1,}$/;
    if (!reg.test(value) && !isEdit.value) {
      callback(t('sys.printDesigner.validateKeyErrorMsg'));
    }
    callback();
  };

  const handleOk = async () => {
    console.log('formState.key', keyPad(formState.key!));
    console.log('formState', formState);
    await formRef.value?.validate();

    const data: any = {
      ...formState,
      key: keyPad(formState.key!),
    };

    const res = data.id
      ? await putBizProcessDefinitionById({ id: currentId.value }, data)
      : await postBizProcessDefinition(data);
    if (res) data.id = res;
    closeModal();
    isEdit.value = false;
    emit('refresh', data);
  };
</script>

<style lang="less" scoped></style>
