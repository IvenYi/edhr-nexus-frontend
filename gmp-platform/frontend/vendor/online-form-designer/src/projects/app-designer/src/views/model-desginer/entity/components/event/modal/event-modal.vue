<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :title="isEdit ? t('sys.edit') : t('sys.new') + t('sys.pageDesigner.event')"
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
      <a-form-item
        :label="t('sys.appDesigner.service')"
        name="bizServiceKey"
        :rules="[{ required: true, message: t('sys.chooseText') + t('sys.appDesigner.service') }]"
      >
        <a-select
          v-model:value="formState.bizServiceKey"
          :placeholder="t('sys.chooseText') + t('sys.appDesigner.service')"
          style="width: 90%"
        >
          <template v-for="item in serviceOptions" :key="item.id">
            <a-select-option :value="item.key">{{
              item.name + ' [' + item.key + ']'
            }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item
        :label="t('sys.pageDesigner.eventType')"
        name="type"
        :rules="[
          { required: true, message: t('sys.chooseText') + t('sys.pageDesigner.eventType') },
        ]"
      >
        <a-select v-model:value="formState.type" style="width: 90%">
          <template v-for="item in eventTypeEnum" :key="item">
            <a-select-option :value="item">{{ t(i18nKeyMap[item]) }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item
        :label="t('sys.executeType')"
        name="executeType"
        :rules="[{ required: true, message: t('sys.chooseText') + t('sys.executeType') }]"
      >
        <a-select v-model:value="formState.executeType" style="width: 90%">
          <template v-for="item in executeTypeEnum" :key="item">
            <a-select-option :value="item">{{ t(i18nKeyMap[item]) }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item
        :label="t('sys.triggerMode')"
        name="resourceType"
        :rules="[{ required: true, message: t('sys.chooseText') + t('sys.triggerMode') }]"
      >
        <a-select v-model:value="formState.resourceType" @change="loadService" style="width: 90%">
          <template v-for="item in triggerEnum" :key="item">
            <a-select-option :value="item">{{ t(i18nKeyMap[item]) }}</a-select-option>
          </template>
        </a-select>
      </a-form-item>

      <a-form-item
        class="script"
        :label="keyLabel"
        name="relationId"
        :rules="[{ required: true, message: t('sys.chooseText') + keyLabel }]"
        :disabled="isEdit"
      >
        <a-select
          v-model:value="formState.relationId"
          :placeholder="t('sys.chooseText') + keyLabel"
          style="width: 60%"
          show-search
          :filter-option="filterOption"
          @search="handleSearch"
          :options="optionsList"
        />
        <a-button class="ml-20px h-32px" type="link" @click="handleCreate">{{
          t('sys.new')
        }}</a-button>
      </a-form-item>

      <a-form-item :label="t('sys.explain')" name="description">
        <a-textarea
          :placeholder="t('sys.inputText')"
          v-model:value="formState.description"
          show-count
          style="width: 90%"
          :maxlength="120"
        />
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
  import { reactive, ref, computed, onMounted } from 'vue';
  import { FormInstance, message, SelectProps } from 'ant-design-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import { getBizServiceCrudList } from '/@/apis/gct-apaas/BizServiceController';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { postBizEvent, putBizEventById } from '/@/apis/gct-apaas/BizEventController';
  import { BizServiceResponse, CategoryCompleteResponse } from '/@/apis/gct-apaas/model';
  import {
    eventDataTypeEnum,
    eventTypeEnum,
    executeTypeEnum,
    triggerEnum,
    i18nKeyMap,
  } from '../type';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { randomUUID } from '/@/hooks/web/useUUid';

  import ScriptModal from '/@app-designer/views/logic-develop/modal/script-modal.vue';
  import SoModal from '/@app-designer/views/logic-develop/modal/service-orchestration-modal.vue';
  import { scriptTypeEnum } from '@gct/runtime';

  const props = defineProps<{
    modelKey: string;
  }>();
  const emit = defineEmits(['refresh']);
  const { t } = useI18n();
  const [registerInner, { closeModal }] = useModalInner((data) => {
    data && onDeactivated(data);
  });
  const [soRegister, { openModal: openSoModal }] = useModal();
  const [scriptRegister, { openModal: openScriptModal }] = useModal();

  const keyLabel = computed(() => {
    let i18nkey = '';
    if (formState.resourceType === 'SCRIPT') {
      i18nkey = t('sys.model.serviceScript');
    } else if (formState.resourceType === 'ORCHESTRATION') {
      i18nkey = t('sys.model.serviceOrchestration');
    }
    return i18nkey;
  });

  const formState = reactive<eventDataTypeEnum>({
    type: eventTypeEnum.BEFORE,
    executeType: executeTypeEnum.SYNC,
    resourceType: triggerEnum.SCRIPT_SERVICE,
    bizServiceKey: null,
    relationId: null,
    description: '',
  });

  const isEdit = ref(false);
  const dataEventId = ref('');
  const formRef = ref<FormInstance>();
  const serviceOptions = ref<BizServiceResponse[]>([]);
  const options = ref<SelectProps['options']>();
  const searchVal = ref<String>('');

  const onDeactivated = (data) => {
    const { edit, id, type, executeType, resourceType, bizServiceKey, relationId, description } =
      data;
    isEdit.value = edit;
    dataEventId.value = id;
    formState.type = type;
    formState.executeType = executeType;
    formState.resourceType = resourceType;
    formState.bizServiceKey = bizServiceKey;
    formState.relationId = relationId;
    formState.description = description;
  };

  const optionsList = computed(() => {
    if (searchVal.value) {
      let newList = [];
      options.value.forEach((ele) => {
        let newChildren = [];
        newChildren = ele?.options.filter((item) =>
          item.label.toLowerCase().includes(searchVal.value.toLowerCase()),
        );
        if (newChildren.length > 0) {
          newList.push({
            ...ele,
            options: newChildren,
          });
        }
      });
      return newList;
    } else {
      return options.value;
    }
  });

  const getServiceOpts = async () => {
    serviceOptions.value =
      (await getBizServiceCrudList({
        searchKey: '',
        modelKey: props.modelKey,
      })) || [];
  };

  const handleSearch = (e) => {
    searchVal.value = e;
  };

  const filterOption = (input: string, option: any) => {
    return !!option.value;
  };

  // 获取脚本信息
  const getScriptData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.DEFAULT })) || [];
    options.value = formatData(data);
  };

  // 编排列表
  const getSoData = async () => {
    const data = (await getCategoryListComplete({ module: ScriptTypeEnum.ORCHESTRATION })) || [];
    options.value = formatData(data);
  };

  const loadService = async () => {
    formState.relationId = '';
    if (formState.resourceType === 'SCRIPT') {
      await getScriptData();
    } else {
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
    if (formState.resourceType === 'ORCHESTRATION') {
      openSoModal(true, {
        data: {
          uuid: randomUUID(),
        },
      });
    } else if (formState.resourceType === 'SCRIPT') {
      openScriptModal(true, {
        uuid: randomUUID(),
        contentKey: scriptTypeEnum.EVENT,
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
    formState.relationId = service.value;
  };

  const handleClose = () => {
    isEdit.value = false;
    formRef.value?.resetFields();
    closeModal();
  };

  const handleOk = () => {
    formRef.value?.validate().then(async () => {
      const data = {
        ...formState,
        modelKey: props.modelKey,
      };

      if (isEdit.value) {
        // 编辑
        await putBizEventById({ id: dataEventId.value }, data);
        message.success('编辑成功');
      } else {
        // 新建
        await postBizEvent(data);
        message.success('新建成功');
      }
      emit('refresh');
      closeModal();
    });
  };

  onMounted(() => {
    getServiceOpts();
    loadService();
  });
</script>

<style lang="less"></style>
