<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="isEdit ? t('sys.appDesigner.editScript') : t('sys.appDesigner.newScript')"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form ref="formRef" :model="formState" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
      <a-form-item
        :label="t('sys.appDesigner.scriptClassification')"
        name="categoryId"
        :rules="[{ required: true }]"
      >
        <a-select ref="select" v-model:value="formState.categoryId">
          <template v-for="item in scriptCategory" :key="item">
            <a-select-option :value="item.id">{{ item.name }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>
      <a-form-item
        :label="t('sys.appDesigner.scriptName')"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>
      <a-form-item
        :label="t('sys.appDesigner.scriptKey')"
        name="key"
        :rules="[
          { required: true },
          isEdit
            ? {}
            : {
                pattern: /^[A-Za-z_]+$/,
                message: t('sys.printDesigner.moduleValidateKeyErrorMsg', {
                  sth: t('sys.script'),
                }),
              },
        ]"
      >
        <a-input
          v-model:value="formState.key"
          :disabled="isEdit"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="64"
        />
      </a-form-item>
      <template v-if="isEdit">
        <a-form-item
          :label="`${t('sys.appDesigner.activate')}${t('sys.appDesigner.version')}`"
          name="version"
          :rules="[{ required: true }]"
        >
          <a-select ref="select" v-model:value="formState.version">
            <template v-for="item in versions" :key="item">
              <a-select-option :value="item.label">{{ item.label }}</a-select-option>
            </template>
          </a-select>
        </a-form-item>
      </template>
      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
      </a-form-item>
      <a-form-item :label="t('sys.editor.sampleScript')" name="content">
        <a-select
          v-model:value="formState.content"
          allow-clear
          :options="sampleScriptOptions"
          style="width: 100%"
        />
      </a-form-item>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts">
  import { computed, reactive, ref } from 'vue';
  import { FormInstance, message, Modal } from 'ant-design-vue';
  import { ScriptType } from '../types/script';
  import { postScript, putScriptById } from '/@/apis/gct-apaas/ScriptController';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import { sampleScriptMap } from '../constant/scriptInfo';
  import { scriptTypeEnum } from '@gct/runtime';
  defineProps<{
    scriptCategory;
    versions?;
  }>();
  const emit = defineEmits(['refresh', 'create-success']);

  const { t } = useI18n();
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('script');

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data && data.categoryId) {
      formState.categoryId = data.categoryId;
    }
    if (data && data.uuid) {
      formState.key = data.uuid;
    }
    if (data && data.contentKey) {
      formState.content = sampleScriptMap[data.contentKey];
    }
    data && data.id && onDataReceive(data);
  });

  const isEdit = ref(false);
  const formRef = ref<FormInstance>();
  const id = ref('');
  const formState = reactive<ScriptType>({
    categoryId: '',
    name: '',
    key: '',
    version: '1.0',
    description: '',
    content: '',
  });

  const sampleScriptOptions = computed(() => {
    return Object.entries(sampleScriptMap).reduce((list: object[], item) => {
      list.push({
        value: item[1],
        label: t(`sys.editor.sampleScriptMap.${item[0]}`),
      });
      return list;
    }, []);
  });

  const onDataReceive = (data) => {
    const { name, key, description, categoryResponse, scriptVersion } = data;
    formState.name = name;
    formState.description = description;
    formState.key = keyClip(key);
    formState.version = scriptVersion.version;
    formState.categoryId = categoryResponse.id;
    id.value = data.id;
    isEdit.value = true;
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formRef.value?.resetFields();
    closeModal();
  };
  const DEFAULT_CONTENT = `function main() {\n    \n}`;
  const handleOk = async () => {
    await formRef.value?.validate();
    const data = {
      ...formState,
      key: keyPad(formState.key),
      content: formState.content ? formState.content + DEFAULT_CONTENT : '',
    };
    if (isEdit.value) {
      Modal.confirm({
        title: `确认要激活${formState.version}版本吗？`,
        okText: '确认',
        cancelText: '取消',
        closable: false,
        onOk: async () => {
          await putScriptById({ id: id.value }, data);
          message.success(t('sys.appDesigner.scriptChangeSuccessfully'));
          closeModal();
          emit('refresh');
        },
        onCancel: () => {},
      });
    } else {
      const res = await postScript(data);
      emit('create-success', res);
      message.success(t('sys.appDesigner.scriptCreatedSuccessfully'));
      closeModal();
      emit('refresh', res);
    }
  };
</script>

<style lang="less"></style>
