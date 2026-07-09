<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? t('sys.i18n.modifyTranslation') : t('sys.i18n.addTranslation')"
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
      :model="i18nState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.i18n.resourceIdentification')"
        name="id"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="i18nState.id" show-count :maxlength="32" :disabled="isEdit" />
      </a-form-item>
      <template v-for="item in props.lang" :key="item.dataIndex">
        <a-form-item :label="item.title" :name="item.dataIndex" :rules="[{ required: true }]">
          <a-input v-model:value="i18nState[item.dataIndex]" show-count :maxlength="32" />
        </a-form-item>
      </template>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref, toRaw } from 'vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';

  export interface I18nState {
    id: string;
    [key: string]: string;
  }

  const formRef = ref<FormInstance>();
  const { t } = useI18n();

  const i18nState = reactive<I18nState>({
    id: '',
  });
  const emit = defineEmits(['ok', 'register']);
  const props = defineProps<{ lang: { title: string; dataIndex: string }[] }>();
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
    isEdit.value = true;
    i18nState.id = data.key;
    const { lang } = props;
    for (let i = 0; i < lang.length; i++) {
      const key = lang[i].dataIndex;
      i18nState[key] = data[key];
    }
  };
  const handleOk = () => {
    formRef.value?.validate().then(() => {
      emit('ok', { ...toRaw(i18nState) }, isEdit.value);
      closeModal();
    });
  };
  const handleClose = () => {
    formRef.value?.resetFields();
    return undefined;
  };
</script>

<style lang="less" scoped></style>
