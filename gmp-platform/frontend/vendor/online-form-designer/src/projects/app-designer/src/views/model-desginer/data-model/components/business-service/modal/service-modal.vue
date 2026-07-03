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
      <a-form-item :label="t('sys.model.serviceName')" name="name" :rules="[{ required: true }]">
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
          :maxlength="55"
          :disabled="isEdit"
          :placeholder="`${t('sys.inputText')}${t('sys.model.serviceKey')}`"
        />
      </a-form-item>
      <a-form-item
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
      </a-form-item>
      <a-form-item
        class="script"
        :label="keyLabel"
        name="serviceKey"
        :rules="[{ required: true }]"
        :disabled="isEdit"
      >
        <a-select
          v-model:value="formState.serviceKey"
          show-search
          allowClear
          style="width: 60%"
          :filter-option="filterOption"
          :options="options"
          placeholder="请选择"
        />
        <a-button class="ml-20px h-32px" type="link" @click="handleCreate">{{
          t('sys.new')
        }}</a-button>
      </a-form-item>
      <a-form-item :label="t('sys.description')" name="description">
        <a-textarea v-model:value="formState.description" show-count :maxlength="120" />
      </a-form-item>
    </a-form>

    <so-modal @register="soRegister" :category="options" @create-success="handleCreateSuccess" />
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
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { CategoryCompleteResponse } from '/@/apis/gct-apaas/model';

  import { UserServiceType } from '/@app-designer/enum';

  import ScriptModal from '/@app-designer/views/logic-develop/modal/script-modal.vue';
  import SoModal from '/@app-designer/views/logic-develop/modal/service-orchestration-modal.vue';

  import { randomUUID } from '/@/hooks/web/useUUid';
  import { scriptTypeEnum } from '@gct/runtime';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';
  import {
    putModelComprehensiveBizServiceApiById,
    postModelComprehensiveBizServiceApiByModelCategory,
  } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const emit = defineEmits(['refresh']);
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser('biz');

  const props = defineProps<{
    modelKey: string | undefined;
  }>();

  const { t } = useI18n();

  const [soRegister, { openModal: openSoModal }] = useModal();
  const [scriptRegister, { openModal: openScriptModal }] = useModal();

  const isEdit = ref(false);
  const serviceId = ref('');
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

  const [registerInner, { closeModal }] = useModalInner((options) => {
    if (!options) return;

    const { edit, data } = options;
    isEdit.value = !!edit;
    formState.type = data.type;
    edit && onDataReceive(data);
    loadService();
  });

  const onDataReceive = (data) => {
    const { name, key, description, method, id, serviceKey } = data;
    serviceId.value = id;
    formState.name = name;
    formState.key = keyClip(key);
    formState.method = method;
    formState.description = description;
    formState.serviceKey = serviceKey;
  };

  // 获取脚本信息
  const getScriptData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT })) || [];
    options.value = formatData(data);
  };

  const filterOption = (input: string, option: any) => {
    const val = input.trim();
    if (!option.name) {
      return option.label.includes(val) || option.value.includes(val);
    }
    return false;
  };

  // 编排列表
  const getSoData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.ORCHESTRATION })) || [];
    options.value = formatData(data);
  };

  const loadService = async () => {
    if (formState.type === UserServiceType.SCRIPT_SERVICE) {
      await getScriptData();
    } else if (formState.type === UserServiceType.SO_SERVICE) {
      await getSoData();
    }
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
    if (formState.type === UserServiceType.SO_SERVICE) {
      openSoModal(true, {
        data: {
          uuid: randomUUID(),
        },
      });
    } else if (formState.type === UserServiceType.SCRIPT_SERVICE) {
      openScriptModal(true, {
        uuid: randomUUID(),
        contentKey: scriptTypeEnum.BUSINESSSERVICE,
      });
    }
  };

  const handleCreateSuccess = async (id) => {
    await loadService();
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
      key: keyPad(formState.key),
    };
    if (isEdit.value) {
      await putModelComprehensiveBizServiceApiById({ id: serviceId.value }, data);
    } else {
      await postModelComprehensiveBizServiceApiByModelCategory({ modelCategory: 'data' }, data);
    }
    message.success(t('sys.operationSuccess'));
    closeModal();
    emit('refresh');
  };
</script>

<style lang="less"></style>
