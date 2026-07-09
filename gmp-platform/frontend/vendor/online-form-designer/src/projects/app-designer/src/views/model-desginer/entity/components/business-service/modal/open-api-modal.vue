<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? 'API' + t('sys.pageDesigner.config') : t('sys.openness') + 'API'"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
  >
    <a-form
      ref="apiFormRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-collapse v-model:activeKey="activeKey" ghost>
        <a-collapse-panel key="1" :header="t('sys.model.basicInfo')">
          <i18n-select-input-form
            :formRef="apiFormRef"
            formItemName="name"
            :fromItemExtraProps="{ label: t('sys.interfaceName'), rules: [{ required: true }] }"
            :inputExtraProps="{ showCount: true, maxlength: 32 }"
            v-model:text="formState.name"
            v-model:i18nConfig="formState.i18nConfig"
          />
          <a-form-item :label="t('sys.interfaceKey')" name="key" :rules="keyRules">
            <a-input
              v-if="!isEdit"
              v-model:value="formState.key"
              show-count
              :maxlength="32"
              :disabled="isEdit"
              :placeholder="`${t('sys.inputText')}${t('sys.interfaceKey')}`"
            />
            <template v-else>{{ formState.key }}</template>
          </a-form-item>
          <a-form-item :label="t('sys.description')" name="description">
            <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
          </a-form-item>
        </a-collapse-panel>
        <a-collapse-panel key="2" :header="t('sys.model.configOpt')">
          <a-form-item :label="t('sys.model.requestMethod')" name="method">
            {{ formState.method }}
          </a-form-item>
          <a-form-item :label="t('sys.interfacePath')">
            {{ path }}
          </a-form-item>
          <a-form-item :label="t('sys.model.refModel')">
            {{ props.modelName + '[' + formState.modelKey + ']' }}
          </a-form-item>
          <a-form-item :label="t('sys.authMethod')" name="authMethod">
            {{ authMethod }}
          </a-form-item>
        </a-collapse-panel>
      </a-collapse>
    </a-form>
  </basic-modal>
</template>

<script setup lang="ts" name="open-api-modal">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message } from 'ant-design-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { I18nSelectInputForm } from '/@/components/I18nSelect';
  import { postOpenapi, putOpenapiById, getOpenapiInfo } from '/@/apis/gct-apaas/OpenapiController';
  import { OpenapiRequest, OpenapiResponse } from '/@/apis/gct-apaas/model/index';

  const emit = defineEmits(['refresh']);

  const props = defineProps<{
    modelKey?: string;
    modelName?: string;
    modelCategory: string;
  }>();

  const { t } = useI18n();
  const activeKey = ref(['1', '2']);
  const keyRules = [
    { required: true },
    {
      pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
      message: t('sys.interKeyFormat'),
    },
  ];
  const openApiId = ref();
  const isEdit = ref(false);
  // const i18nConfig = ref();
  const authMethod = ref('API密钥');
  const apiFormRef = ref<FormInstance>();
  const formState = reactive<OpenapiRequest>({
    name: '',
    key: '', // 接口key
    method: 'GET',
    modelCategory: '', // 1：entity：实体模型，2：view:视图模型,3：data:数据模型
    bsKey: '', // 服务key
    description: '',
    modelKey: '',
    url: '', // 请求路径
    i18nConfig: '',
  });

  const path = computed(() => {
    return `/open-api/biz-service/${formState.key}`;
  });

  const [registerInner, { closeModal }] = useModalInner((options) => {
    if (!options) return;
    activeKey.value = ['1', '2'];
    const { edit, data } = options;
    isEdit.value = !!edit;
    if (isEdit.value) {
      openApiId.value = data.openapiId;
      getOpenApiInfo(data);
    } else {
      onDataReceive(data);
    }
  });

  const getOpenApiInfo = async (data) => {
    const result: OpenapiResponse = (await getOpenapiInfo({ id: data.openapiId })) || {};
    for (let key in result) {
      formState[key] = result[key];
    }
  };

  const onDataReceive = (data) => {
    const { name, key, description, method } = data;
    formState.name = name;
    formState.key = key;
    formState.method = method;
    formState.description = description;
    formState.bsKey = key;
    formState.modelKey = props.modelKey || '';
    formState.modelCategory = props.modelCategory;
    formState.i18nConfig = '';
  };

  const handleClose = () => {
    isEdit.value = false;
    apiFormRef.value?.resetFields();
  };

  const handleOk = async () => {
    if (isEdit.value) {
      await putOpenapiById({ id: openApiId.value }, formState);
      message.success(t('sys.operationSuccess'));
      isEdit.value = false;
    } else {
      await postOpenapi({ ...formState, url: path.value });
      message.success(t('sys.operationSuccess') + '，' + t('sys.openAPIOpenSuccess'));
    }
    closeModal();
    emit('refresh');
  };
</script>

<style lang="less"></style>
