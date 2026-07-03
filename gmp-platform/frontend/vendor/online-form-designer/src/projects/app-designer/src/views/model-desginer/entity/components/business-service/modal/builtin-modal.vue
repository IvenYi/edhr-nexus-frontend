<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? t('sys.appDesigner.editService') : t('sys.appDesigner.newService')"
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
      <!-- <a-form-item :label="t('sys.model.serviceName')" name="name" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.name"
          show-count
          :maxlength="32"
          :placeholder="`${t('sys.inputText')}${t('sys.model.serviceName')}`"
        />
      </a-form-item>
      <a-form-item :label="t('sys.model.serviceKey')" name="key" :rules="[{ required: true }]">
        <a-input
          v-model:value="formState.key"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="32"
          :disabled="isEdit"
          :placeholder="`${t('sys.inputText')}${t('sys.model.serviceKey')}`"
        />
      </a-form-item> -->
      <!-- <a-form-item
        :label="t('sys.model.serviceMethod')"
        name="method"
        :rules="[{ required: true }]"
      >
        <a-select
          ref="selectRef"
          v-model:value="formState.method"
          style="width: 60%"
          :disabled="isEdit"
        >
          <a-select-option value="GET">GET</a-select-option>
          <a-select-option value="POST">POST</a-select-option>
          <a-select-option value="PUT">PUT</a-select-option>
          <a-select-option value="DELETE">DELETE</a-select-option>
        </a-select>
      </a-form-item> -->
      <a-form-item
        class="script"
        :label="keyLabel"
        name="serviceKey"
        :rules="[{ required: true }]"
        :disabled="isEdit"
      >
        <a-select v-model:value="formState.serviceKey" style="width: 60%" :options="options" />
        <a-button class="ml-20px h-32px" type="link" @click="handleCreate">{{
          t('sys.new')
        }}</a-button>
      </a-form-item>
      <!-- <a-form-item :label="t('sys.description')" name="description">
        <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
      </a-form-item> -->
    </a-form>

    <script-modal
      @register="scriptRegister"
      :scriptCategory="options"
      @create-success="handleCreateSuccess"
    />
  </basic-modal>
</template>

<script setup lang="ts">
  import { reactive, ref, computed } from 'vue';
  import { FormInstance, message, SelectProps } from 'ant-design-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { ServiceInfo } from '../types/modal-type';

  import {
    postBizServiceCrud,
    putBizServiceCrudById,
    getBizServiceCrudInfo,
  } from '/@/apis/gct-apaas/BizServiceController';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import { UserServiceType } from '/@app-designer/enum';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import ScriptModal from '/@app-designer/views/logic-develop/modal/script-modal.vue';
  import { scriptTypeEnum } from '@gct/runtime';

  const emit = defineEmits(['refresh']);
  const { keyReset } = useKeyParser('biz');
  const props = defineProps<{
    modelKey: string;
  }>();

  const { t } = useI18n();
  const [scriptRegister, { openModal: openScriptModal }] = useModal();

  const isEdit = ref(false);
  const serviceId = ref('');
  const overrideBizKey = ref('');
  const formRef = ref<FormInstance>();
  const options = ref<SelectProps['options']>();
  const formState = reactive<ServiceInfo>({
    name: '',
    key: '',
    method: 'GET',
    type: UserServiceType.SCRIPT_SERVICE,
    serviceKey: '',
    description: '',
  });

  const keyLabel = computed(() => {
    let i18nkey = t('sys.model.serviceScript');
    switch (formState.type) {
      case UserServiceType.SO_SERVICE:
        i18nkey = t('sys.model.serviceOrchestration');
        break;
      case UserServiceType.SQL_SERVICE:
        i18nkey = t('sys.model.serviceSql');
        break;
      default:
        break;
    }
    return i18nkey;
  });

  const [registerInner, { closeModal }] = useModalInner(async (options) => {
    if (!options) return;
    const { data } = options;
    await getScriptData();
    onDataReceive(data);
  });

  const onDataReceive = async (data) => {
    if (data.overrideBizId) {
      isEdit.value = true;
      const request = (await getBizServiceCrudInfo({ id: data.overrideBizId })) || {};
      serviceId.value = request.id || '';
      overrideBizKey.value = request.overrideBizKey;
      const { name, key, method, description, serviceKey } = request;
      formState.name = name || '';
      formState.key = key || '';
      formState.method = method;
      formState.description = description || '';
      formState.serviceKey = serviceKey;
    } else {
      const { id, name, key, method, description, serviceKey } = data;
      serviceId.value = id;
      overrideBizKey.value = key;
      formState.name = name;
      formState.key = key;
      formState.method = method;
      formState.description = description;
      formState.serviceKey = serviceKey;
    }
  };

  // 获取脚本信息
  const getScriptData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT })) || [];
    options.value = formatData(data);
  };

  const formatData = (data: CategoryCompleteResponse[]) => {
    const options: any = [];
    if (data) {
      for (let folder of data) {
        const item: any = {
          id: folder.id,
          name: folder.name,
          label: folder.name,
          options: [],
        };
        if (folder.children!.length > 0) {
          for (let i of folder.children!) {
            const obj = {
              id: i.id,
              label: i.name,
              value: i.key,
            };
            item.options.push(obj);
          }
        }
        options.push(item);
      }
    }
    return options;
  };

  const handleCreate = () => {
    openScriptModal(true, {
      uuid: randomUUID(),
      contentKey: scriptTypeEnum.BUSINESSSERVICE,
    });
  };

  const handleCreateSuccess = async (id) => {
    await getScriptData();
    const service = options.value
      ?.reduce((arr, item) => {
        arr.push(...item.options!);
        return arr;
      }, [])
      .find((item) => item.id === id);
    console.log(service);
    formState.serviceKey = service.value;
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    formRef.value?.resetFields();
  };

  const handleOk = async () => {
    const data = {
      modelKey: props.modelKey,
      ...formState,
      overrideBizKey: overrideBizKey.value,
    };
    if (isEdit.value) {
      await putBizServiceCrudById({ id: serviceId.value }, data);
    } else {
      await postBizServiceCrud(data);
    }
    message.success(t('sys.operationSuccess'));
    closeModal();
    emit('refresh');
  };
</script>

<style lang="less"></style>
