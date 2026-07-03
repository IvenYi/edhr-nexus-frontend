<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? t('sys.edit') : t('sys.new')"
    centered
    width="640px"
    :minHeight="100"
    :maskClosable="false"
    :afterClose="handleClose"
    :get-container="getContainer"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      ref="formRef"
      :model="i18nState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
      layout="horizontal"
    >
      <a-form-item
        :label="t('sys.i18n.resourceIdentification')"
        name="id"
        :rules="[
          {
            required: true,
            message: t('sys.pleaseInputSth', { sth: t('sys.i18n.resourceIdentification') }),
          },
          { validator: validateSpecialCharacters },
        ]"
      >
        <a-input v-model:value="i18nState.id" show-count :maxlength="128" :disabled="isEdit" />
      </a-form-item>
      <template v-for="item in props.lang" :key="item.dataIndex">
        <a-form-item
          :label="item.title"
          :name="item.dataIndex"
          :rules="[
            {
              required: true,
              message: t('sys.pleaseInputSth', { sth: item.title }),
            },
            {
              validator: validateLang,
            },
          ]"
        >
          <a-input v-model:value="i18nState[item.dataIndex]" show-count :maxlength="300" />
        </a-form-item>
      </template>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts">
  import { reactive, ref, toRaw } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  export interface I18nState {
    id: string;
    [key: string]: string;
  }

  const { t } = useI18n();
  const props = defineProps<{
    lang: { title: string; dataIndex: string }[];
    getContainer: () => HTMLElement;
  }>();
  const emit = defineEmits(['ok', 'register']);
  const formRef = ref<FormInstance>();
  const i18nState = reactive<I18nState>({
    id: '',
  });
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
    console.log(lang, 'lang========');
    for (let i = 0; i < lang.length; i++) {
      const key = lang[i].dataIndex;
      i18nState[key] = data[key];
    }
  };

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z_.]*$/;
    if (!reg.test(value)) {
      callback(t('sys.i18n.validated18nKeyErrorMsg'));
    }
    callback();
  };

  const validateLang = async (_rule, value: string) => {
    const reg = /^\s*$/g;
    if (reg.test(value)) {
      return Promise.reject(t('sys.notEmptySth', { sth: t('sys.i18n') }));
    } else {
      return Promise.resolve();
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
