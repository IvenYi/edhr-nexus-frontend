<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="`${isEdit ? t('sys.edit') : t('sys.new')}${t(`sys.appDesigner.trigger`)}`"
    centered
    width="640px"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    @visible-change="handleShow"
  >
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 16 }"
      autocomplete="off"
    >
      <a-form-item
        :label="t('sys.appDesigner.triggerName')"
        name="name"
        :rules="[{ required: true }]"
      >
        <a-input v-model:value="formState.name" show-count :maxlength="32" />
      </a-form-item>

      <a-form-item
        :label="t('sys.appDesigner.triggerKey')"
        name="key"
        :rules="[
          { required: true },
          {
            validator: validateSpecialCharacters,
          },
        ]"
      >
        <a-input
          :disabled="isEdit"
          v-model:value="formState.key"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="32"
        />
      </a-form-item>

      <a-form-item
        :label="t('sys.appDesigner.triggerType')"
        name="executeType"
        :rules="[{ required: true }]"
      >
        <a-radio-group v-model:value="formState.executeType" :options="triggerTypeOptions" />
      </a-form-item>

      <a-form-item
        name="config"
        :label="t('sys.appDesigner.triggerEvents')"
        :rules="[{ required: true }]"
      >
        <a-select v-model:value="formState.config" :options="globalOptions" />
      </a-form-item>

      <a-form-item
        name="bizServiceKeys"
        :label="t('sys.appDesigner.linkBusinessServices')"
        :rules="[{ required: true }]"
      >
        <a-select
          v-model:value="formState.bizServiceKeys"
          mode="multiple"
          :maxTagCount="5"
          :maxTagTextLength="6"
          :options="bizServiceOptions"
        />
      </a-form-item>

      <a-form-item :label="t('sys.notes')" name="description">
        <a-textarea
          class="--resize-none"
          v-model:value="formState.description"
          show-count
          :maxlength="120"
        />
      </a-form-item>
    </a-form>
  </BasicModal>
</template>

<script setup lang="ts" name="trigger-modal">
  import { reactive, ref } from 'vue';
  import { message } from 'ant-design-vue';
  import { omit } from 'lodash-es';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';

  import { triggerTypeOptions, TriggerTypeEnum } from './constant/index';

  import { getEventList } from '/@/apis/gct-apaas/EventController';
  import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
  import { postTrigger, getTriggerInfo, putTriggerById } from '/@/apis/gct-apaas/TriggerController';

  import type { FormInstance, SelectProps } from 'ant-design-vue';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';

  const { t } = useI18n();

  const ADDON_KEY = '$TRIGGER_';
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser(ADDON_KEY);

  // 支持的关联业务服务
  const SupportSysBuiltin = [
    'save',
    'saveBatch',
    'saveOrUpdate',
    'update',
    'updateById',
    'remove',
    'removeById',
    'importData',
    'rdoSave',
    'rdoSaveBatch',
    'rdoUpdateVersionById',
    'rdoRemoveVersionById',
    'rdoImportData',
  ];

  interface FormState {
    /** 触发器名称 */
    name?: string;
    /** 触发器key */
    key?: string;
    /** 触发类型 */
    executeType: string;
    /** 绑定配置信息(事件id) */
    config?: string;
    /** 关联业务服务id */
    bizServiceKeys?: string[];
    /** 备注 */
    description?: string;
  }

  interface Props {
    /** 模型定义表key */
    modelKey: string;
  }

  const props = defineProps<Props>();

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    name: undefined,
    key: undefined,
    executeType: TriggerTypeEnum.EVENT,
    config: undefined,
    bizServiceKeys: undefined,
    description: undefined,
  });

  const isEdit = ref<boolean>(false);
  const currentId = ref<string>('');
  const globalOptions = ref<SelectProps['options']>();
  const bizServiceOptions = ref<SelectProps['options']>();

  const emit = defineEmits(['refresh', 'register']);

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[A-Z0-9_]*$/;
    if (!reg.test(value)) {
      callback(t('sys.appDesigner.validateKeyError', { sth: t('sys.appDesigner.variableName') }));
    }
    callback();
  };

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      isEdit.value = data.isEdit;

      if (!isEdit.value) {
        formState.key = data.uuid;
      }

      if (data.isEdit && data.info) {
        onDataReceive(data.info);
      }
    }
  });

  const onDataReceive = async (node) => {
    const detail = (await getTriggerInfo({ id: node.id })) || {};

    currentId.value = detail.id ?? '';

    formState.key = keyClip(detail.key!);
    formState.name = detail.name;
    formState.config = detail.config;
    formState.bizServiceKeys = detail.bizServiceKeys?.split(',');
    formState.description = detail.description;
  };

  // 获取全局事件列表
  const getGlobalData = async () => {
    const data = (await getEventList()) || [];
    globalOptions.value = data
      .filter((item) => item.type === 'CUSTOM')
      .map((item) => {
        return {
          label: item.key,
          value: item.id,
        };
      });
  };

  // 获取关联业务服务列表
  const getLinkBusinessData = async () => {
    const data =
      (await getBizServiceCrudList({ modelKey: props.modelKey, type: 'SYS_BUILTIN' })) || [];

    bizServiceOptions.value = data
      .map((item) => {
        return {
          label: item.name,
          value: item.key,
        };
      })
      .filter((item) => SupportSysBuiltin.includes(item.value as string));
  };

  const loadService = async () => {
    await getGlobalData();
    await getLinkBusinessData();
  };

  const handleShow = (visible: boolean) => {
    if (visible) {
      isEdit.value = false;
      loadService();
    }
  };

  const handleClose = () => {
    keyReset();
    isEdit.value = false;
    currentId.value = '';
    globalOptions.value = [];
    bizServiceOptions.value = [];
    formState.bizServiceKeys = undefined;
    formRef.value?.resetFields();
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const data = {
        ...omit(formState, ['key', 'bizServiceKeys']),
        key: keyPad(formState.key!),
        bizServiceKeys: (formState.bizServiceKeys ?? []).join(),
        modelKey: props.modelKey,
      };

      if (isEdit.value) {
        await putTriggerById({ id: currentId.value }, data);
        message.success(t('sys.developer.appCenter.editSuccess'));
      } else {
        await postTrigger(data);
        message.success(t('sys.createSuccess'));
      }
      emit('refresh');
      closeModal();
    });
  };
</script>

<style lang="less" scoped></style>
