<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="`${isEdit ? t('sys.edit') : t('sys.new')}${t(`sys.appDesigner.events`)}`"
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
      <a-form-item name="events" :label="t(`sys.appDesigner.events`)" :rules="[{ required: true }]">
        <a-select
          :disabled="isEdit"
          v-model:value="formState.events"
          :placeholder="`${t('sys.chooseText')}${t(`sys.appDesigner.events`)}`"
          :options="eventsOptions"
          @select="handleSelect"
        />
      </a-form-item>

      <a-form-item
        :label="`${t('sys.appDesigner.events')}KEY`"
        name="key"
        :rules="[
          { required: true },
          {
            validator: validateSpecialCharacters,
          },
        ]"
      >
        <a-input
          :disabled="isEdit || formState.type === EventsEnum.SYSTEM"
          v-model:value="formState.key"
          :addon-before="keyPrefix"
          :addon-after="keySuffix"
          show-count
          :maxlength="32"
        />
      </a-form-item>

      <a-form-item :label="t('sys.appDesigner.eventsType')" name="jsType">
        {{ t('sys.model.serviceScript') }}
        <!-- <a-radio-group
          v-model:value="formState.jsType"
          :options="eventsTypeOptions"
          @change="onRadioChange"
        /> -->
      </a-form-item>

      <a-form-item :label="jsKeyLabel" name="jsKey" :rules="[{ required: true }]">
        <a-select
          v-model:value="formState.jsKey"
          style="width: 80%"
          :options="options[formState.jsType]"
        />
        <a-button class="ml-4px h-32px" type="link" @click="handleCreate">{{
          t('sys.new')
        }}</a-button>
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
    <so-modal
      @register="soRegister"
      :category="options[EventsTypeEnum.SO_SERVICE]"
      @create-success="handleCreateSuccess"
    />
    <script-modal
      @register="scriptRegister"
      :scriptCategory="options[EventsTypeEnum.SCRIPT_SERVICE]"
      @create-success="handleCreateSuccess"
    />
  </BasicModal>
</template>

<script setup lang="ts" name="global-events-modal">
  import { reactive, ref, computed } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import {
    EventsEnum,
    EventsTypeEnum,
    eventsOptions,
    eventsTypeOptions,
    formatData,
    getCh_TriggerType,
  } from '../constants/index';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';

  import ScriptModal from '/@app-designer/views/logic-develop/modal/script-modal.vue';
  import SoModal from '/@app-designer/views/logic-develop/modal/service-orchestration-modal.vue';

  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { postEvent, putEventById, getEventInfo } from '/@/apis/gct-apaas/EventController';

  import type { FormInstance } from 'ant-design-vue';
  import { omit } from 'lodash-es';
  import { useKeyParser } from '/@/hooks/develop/useKeyParser';

  const { t } = useI18n();

  interface FormState {
    /** 事件 */
    events?: string;
    /** 事件名 */
    key?: string;
    /** 事件类型 */
    jsType: EventsTypeEnum | string;
    /** 关联的脚本/业务编排 */
    jsKey?: string;
    /** 备注 */
    description?: string;
    /** 类型 */
    type?: EventsEnum | string;
  }

  const formRef = ref<FormInstance>();

  const formState = reactive<FormState>({
    events: undefined,
    key: '',
    // jsType: EventsTypeEnum.SO_SERVICE,
    jsType: EventsTypeEnum.SCRIPT_SERVICE,
    jsKey: '',
    description: '',
    type: undefined,
  });

  const ADDON_KEY = '$SYSTEM_EVENT_';
  const ADDON_AFTER = computed(() => {
    return formState.type === EventsEnum.SYSTEM ? '' : undefined;
  });
  const { keyPrefix, keySuffix, keyPad, keyClip, keyReset } = useKeyParser(
    ADDON_KEY,
    ADDON_AFTER as any,
  );

  const isEdit = ref<boolean>(false);

  const currentId = ref<string>('');

  const options = ref<any>({
    [EventsTypeEnum.SO_SERVICE]: [],
    [EventsTypeEnum.SCRIPT_SERVICE]: [],
  });

  const emit = defineEmits(['refresh', 'register']);

  const [soRegister, { openModal: openSoModal }] = useModal();
  const [scriptRegister, { openModal: openScriptModal }] = useModal();

  const jsKeyLabel = computed(() => {
    let i18nKey;
    switch (formState.jsType) {
      case EventsTypeEnum.SO_SERVICE:
        i18nKey = t('sys.model.serviceOrchestration');
        break;
      case EventsTypeEnum.SCRIPT_SERVICE:
        i18nKey = t('sys.model.serviceScript');
        break;
      default:
        break;
    }
    return i18nKey;
  });

  const validateSpecialCharacters = (_, value, callback) => {
    const reg = /^[a-zA-Z_]*$/;
    if (!reg.test(value)) {
      callback(
        t('sys.printDesigner.moduleValidateKeyErrorMsg', {
          sth: t('sys.pageDesigner.globalEvent'),
        }),
      );
    }
    callback();
  };

  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      isEdit.value = data.isEdit;
      if (data.isEdit && data.info) {
        onDataReceive(data.info);
      }
    }
  });

  const onDataReceive = async (node) => {
    const detail = (await getEventInfo({ id: node.id })) || {};

    currentId.value = detail.id ?? '';
    formState.type = detail.type;
    const key = keyClip(detail.key!);
    formState.events = `${detail.type},${detail.type === EventsEnum.CUSTOM ? 'custom' : key}`;
    formState.key = key;
    formState.jsType = getCh_TriggerType(detail.jsKey).key;
    formState.jsKey = detail.jsKey;
    formState.description = detail.description;
  };

  // 获取脚本信息
  const getScriptData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT })) || [];
    options.value[EventsTypeEnum.SCRIPT_SERVICE] = formatData(data);
  };

  // 编排列表
  const getSoData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.ORCHESTRATION })) || [];
    options.value[EventsTypeEnum.SO_SERVICE] = formatData(data);
  };

  const loadService = async (tag = '') => {
    if (tag === EventsTypeEnum.SO_SERVICE) {
      await getSoData();
    } else if (tag === EventsTypeEnum.SCRIPT_SERVICE) {
      await getScriptData();
    } else {
      await getScriptData();
      await getSoData();
    }
  };

  const handleShow = (visible: boolean) => {
    if (visible) {
      isEdit.value = false;
      loadService();
    }
  };

  const handleCreate = () => {
    if (formState.jsType === EventsTypeEnum.SO_SERVICE) {
      openSoModal(true, {
        data: {
          uuid: randomUUID(),
        },
      });
    } else if (formState.jsType === EventsTypeEnum.SCRIPT_SERVICE) {
      openScriptModal(true, {
        uuid: randomUUID(),
      });
    }
  };

  const handleCreateSuccess = async (id) => {
    await loadService(formState.jsType);
    const service = options.value[formState.jsType]
      ?.reduce((arr, item) => {
        arr.push(...item.options!);
        return arr;
      }, [])
      .find((item) => item.id === id);
    formState.jsKey = service.value;
  };

  const handleSelect = (value) => {
    formRef.value?.clearValidate(['key']);
    const [type, key] = value.split(',');
    formState.type = type;
    if (type === EventsEnum.SYSTEM) {
      formState.key = key;
    } else {
      formState.key = '';
    }
  };

  const onRadioChange = () => {
    formRef.value?.clearValidate(['jsKey']);
    formState.jsKey = '';
  };

  const handleClose = () => {
    isEdit.value = false;
    currentId.value = '';
    options.value[EventsTypeEnum.SO_SERVICE] = [];
    options.value[EventsTypeEnum.SCRIPT_SERVICE] = [];
    formRef.value?.resetFields();
    keyReset();
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const data = {
        ...omit(formState, ['events', 'jsType']),
        key: keyPad(formState.key!),
      };

      if (isEdit.value) {
        await putEventById({ id: currentId.value }, data);
        message.success(t('sys.developer.appCenter.editSuccess'));
      } else {
        await postEvent(data);
        message.success(t('sys.createSuccess'));
      }
      emit('refresh');
      closeModal();
    });
  };
</script>

<style lang="less" scoped></style>
