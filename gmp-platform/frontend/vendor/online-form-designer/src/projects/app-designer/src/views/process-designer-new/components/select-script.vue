<template>
  <div class="pt40px">
    <a-form
      ref="formRef"
      :model="formState"
      name="basic"
      :label-col="{ span: 6 }"
      :wrapper-col="{ span: 13 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.appDesigner.eventsType')" name="executeResourceType">
        <a-radio-group
          v-model:value="formState.executeResourceType"
          :options="eventsTypeOptions"
          @change="onRadioChange"
        />
      </a-form-item>
      <a-form-item
        :label="
          formState.executeResourceType === EventsTypeEnum.SCRIPT_SERVICE
            ? t('sys.model.serviceScript')
            : t('sys.model.serviceOrchestration')
        "
        name="executeResourceId"
        :rules="[
          {
            required: true,
            message: t('sys.chooseTextTip', {
              name:
                formState.executeResourceType === EventsTypeEnum.SCRIPT_SERVICE
                  ? t('sys.model.serviceScript')
                  : t('sys.model.serviceOrchestration'),
            }),
          },
        ]"
      >
        <div class="ks-row-middle">
          <div class="ks-col">
            <a-select
              v-model:value="formState.executeResourceId"
              :options="
                formState.executeResourceType === EventsTypeEnum.SCRIPT_SERVICE
                  ? scriptOptions
                  : soOptions
              "
              :field-names="{ label: 'name', value: 'id', options: 'children' }"
              style="width: 100%"
            />
          </div>
          <div class="primary-gct cursor-pointer pl8px" @click="handleCreate">
            {{ t('sys.new') }}
          </div>
        </div>
      </a-form-item>
    </a-form>

    <so-modal @register="soRegister" :category="soOptions" @create-success="handleCreateSuccess" />
    <script-modal
      @register="scriptRegister"
      :scriptCategory="scriptOptions"
      @create-success="handleCreateSuccess"
    />
  </div>
</template>
<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { EventsTypeEnum } from '../../global-events/constants';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { randomUUID } from '/@/hooks/web/useUUid';
  import { useModal } from '/@/components/Modal';
  import ScriptModal from '/@app-designer/views/logic-develop/modal/script-modal.vue';
  import SoModal from '/@app-designer/views/logic-develop/modal/service-orchestration-modal.vue';
  import { useModal as useGctModal, IModal } from '@gct/runtime';
  import type { IGctBpmnEventConfig } from '@gct/flow/src/plugins/paas-bpmn/types';

  const props = defineProps<{
    modal: IModal;
    data: IGctBpmnEventConfig;
  }>();

  const [soRegister, { openModal: openSoModal }] = useModal();
  const [scriptRegister, { openModal: openScriptModal }] = useModal();

  const formState = ref(props.data);
  const { t } = useI18n();
  const formRef = ref();
  const scriptOptions = ref<any[]>([]);
  const soOptions = ref<any[]>([]);
  const refresh = ref(false);

  const eventsTypeOptions = [
    {
      label: t('sys.model.serviceOrchestration'),
      value: EventsTypeEnum.SO_SERVICE,
    },
    {
      label: t('sys.model.serviceScript'),
      value: EventsTypeEnum.SCRIPT_SERVICE,
    },
  ];

  onMounted(() => {
    getScriptData();
  });

  const onRadioChange = () => {
    formRef.value?.clearValidate(['executeResourceId']);
    formState.value!.executeResourceId = '';
  };

  const getScriptData = async () => {
    scriptOptions.value = (await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT })) || [];
  };

  const getSoData = async () => {
    soOptions.value =
      (await getCategoryListComplete({ module: ScriptTypeEnum.ORCHESTRATION })) || [];
  };

  const handleCreate = () => {
    if (formState.value.executeResourceType === EventsTypeEnum.SO_SERVICE) {
      openSoModal(true, {
        data: {
          uuid: randomUUID(),
        },
      });
    } else if (formState.value.executeResourceType === EventsTypeEnum.SCRIPT_SERVICE) {
      openScriptModal(true, {
        uuid: randomUUID(),
      });
    }
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

  const handleCreateSuccess = async (id) => {
    await loadService(formState.value.executeResourceType);
    const options =
      formState.value.executeResourceType === EventsTypeEnum.SCRIPT_SERVICE
        ? scriptOptions.value
        : soOptions.value;
    const service = options
      .reduce((arr, item) => {
        arr.push(...item.children!);
        return arr;
      }, [])
      .find((item) => item.id === id);
    formState.value.executeResourceId = service.value;
    refresh.value = true;
  };

  const onSave = async () => {
    await formRef.value.validate();
    return {
      ok: true,
      params: formState.value,
      refresh: refresh.value,
    };
  };

  useGctModal(onSave);
</script>
<style lang="less" scoped></style>
