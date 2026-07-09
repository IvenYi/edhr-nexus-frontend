<template>
  <basic-table
    ref="tableRef"
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    :pagination="false"
    :columns="businessServiceColumns"
    :dataSource="filterTableData"
    class="model-designer-basic-table"
    :row-drag-api="postBizServiceCrudDrag"
    @row-drag-end="
      () => {
        createMessage.success('操作成功');
        getTableData();
      }
    "
  >
    <template #headerTop>
      <a-row justify="space-between" type="flex">
        <a-col style="display: flex">
          <a-input
            v-model:value="searchKey"
            :placeholder="t('sys.searchServiceKey')"
            @pressEnter="handleSearch"
          >
            <template #prefix>
              <!-- <search-outlined /> -->
              <i class="iconfont icon-sousuo1"></i>
            </template>
          </a-input>
          <!-- <a-dropdown-button class="ml-20px" type="primary">
            {{ t('sys.new') }}
            <template #overlay>
              <a-menu @click="handleAddService">
                <a-menu-item v-for="item in UserServiceTypeOptions" :key="item.value">{{
                  t(item.label)
                }}</a-menu-item>
              </a-menu>
            </template>
            <template #icon><DownOutlined /></template>
          </a-dropdown-button> -->
        </a-col>
        <a-col flex="242px" class="flex justify-between items-center">
          <a-checkbox v-model:checked="isShowSysField">{{
            t('sys.model.systemService')
          }}</a-checkbox>
          <a-button @click="handleAddService" type="primary">
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.new') + t('sys.model.scriptService') }}
          </a-button>
        </a-col>
      </a-row>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="record.type !== UserServiceType.BUILTIN_SERVICE && column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.edit'),
              onClick: handleRowEdit.bind(null, record),
            },
            {
              label: t('sys.design'),
              onClick: handleDesign.bind(null, record),
            },
            {
              label: t('sys.delete'),
              color: 'error',
              popConfirm: {
                title: t('sys.sureToDelete'),
                confirm: handleRowDelete.bind(null, record.id),
              },
            },
            {
              label: t('sys.openness'),
              color: 'success',
              ifShow: !record.openapiId,
              onClick: handleOpenApi.bind(null, record),
            },
            {
              label: t('sys.APIConfig'),
              color: 'success',
              ifShow: !!record.openapiId,
              onClick: handleEditApi.bind(null, record),
            },
            {
              label: t('sys.cancelOpenness'),
              color: 'error',
              ifShow: !!record.openapiId,
              popConfirm: {
                title: t('sys.confirmCancelOfOpenDesc'),
                placement: 'topRight',
                confirm: handleCancelOpen.bind(null, record.openapiId),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
      <template v-if="record.type == UserServiceType.BUILTIN_SERVICE && column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.detail'),
              onClick: handleRowDetail.bind(null, record),
              ifShow: !!record.usage || record.type === 'SYS_BUILTIN',
            },
            {
              label: t('sys.overwrite'),
              onClick: handleBuiltinEdit.bind(null, record),
            },
            {
              label: t('sys.design'),
              ifShow: !!record.overrideBizKey,
              onClick: handleDesign.bind(null, record),
            },
            {
              label: t('sys.remove'),
              ifShow: !!record.overrideBizKey,
              color: 'error',
              popConfirm: {
                title: t('sys.sureToRemove'),
                confirm: handleRowDelete.bind(null, record.overrideBizId),
              },
            },
            {
              label: t('sys.openness'),
              color: 'success',
              ifShow: !record.openapiId,
              onClick: handleOpenApi.bind(null, record),
            },
            {
              label: t('sys.APIConfig'),
              color: 'success',
              ifShow: !!record.openapiId,
              onClick: handleEditApi.bind(null, record),
            },
            {
              label: t('sys.cancelOpenness'),
              color: 'error',
              ifShow: !!record.openapiId,
              popConfirm: {
                title: t('sys.confirmCancelOfOpenDesc'),
                placement: 'topRight',
                confirm: handleCancelOpen.bind(null, record.openapiId),
              },
            },
          ]"
          :stopButtonPropagation="true"
        />
      </template>
    </template>
  </basic-table>
  <service-modal @register="register" :modelKey="model.key" @refresh="onRefresh" />
  <builtin-modal @register="builtinRegister" :modelKey="model.key" @refresh="onRefresh" />
  <function-detail-modal @register="funregister" />
  <open-api-modal
    @register="openApiRegister"
    :modelKey="model.key"
    :modelName="model.name"
    modelCategory="entity"
    @refresh="onRefresh"
  />
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import { message } from 'ant-design-vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { useModal } from '/@/components/Modal';
  import ServiceModal from './modal/service-modal.vue';
  import BuiltinModal from './modal/builtin-modal.vue';
  import OpenApiModal from './modal/open-api-modal.vue';
  import { businessServiceColumns } from '../../constant/columns';
  import { useI18n } from '/@/hooks/web/useI18n';
  import {
    deleteBizServiceCrud,
    getBizServiceCrudList,
    postBizServiceCrudDrag,
  } from '/@/apis/gct-apaas/BizServiceController';
  import { BizServiceMetaDTO } from '/@/apis/gct-apaas/model';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { getScriptInfoByKey } from '/@/apis/gct-apaas/ScriptController';
  import { getServiceOrchestrationInfoByKey } from '/@/apis/gct-apaas/ServiceOrchestrationController';
  import { UserServiceType } from '/@app-designer/enum';
  import openWindow from '/@app-designer/tools/openWindow';
  import FunctionDetailModal from '/@app-designer/views/model-desginer/data-model/components/function/modal/function-detail-modal.vue';
  import { deleteOpenapi } from '/@/apis/gct-apaas/OpenapiController';

  const props = defineProps<{
    model;
  }>();

  const tableRef = ref();

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const [register, { openModal }] = useModal();
  const [builtinRegister, { openModal: openBuiltinModal }] = useModal();
  const [funregister, { openModal: funOpenModal }] = useModal();
  const [openApiRegister, { openModal: openApiOpenModal }] = useModal();

  const getServiceDocContent = async (serviceKey: string): Promise<string | null> => {
    const modelKey = props.model?.key;
    if (!modelKey || !serviceKey) {
      return null;
    }

    const docPath = `/gct-apaas/docs/services/${encodeURIComponent(modelKey)}/${encodeURIComponent(
      serviceKey,
    )}.md`;

    try {
      const response = await fetch(docPath);
      if (!response.ok) {
        return null;
      }

      const content = await response.text();
      return content.trim() ? content : null;
    } catch {
      return null;
    }
  };

  const handleRowDetail = async (info) => {
    if (!info.usage || info.usage.trim() === '') {
      info.usage = (await getServiceDocContent(String(info.key ?? ''))) || '';
    }
    funOpenModal(true, {
      content: info.usage ?? '',
    });
  };

  const tableData = ref<BizServiceMetaDTO[]>([]);
  const filterTableData = ref<Array<BizServiceMetaDTO>>([]);

  const searchKey = ref<string>('');
  const isShowSysField = ref(true);

  const getTableData = async () => {
    tableData.value =
      (await getBizServiceCrudList({
        searchKey: searchKey.value ? searchKey.value : undefined,
        modelKey: props.model.key,
      })) || [];
    filterTableData.value = showTableData.value

  };
  const handleSearch = (e)=>{
    filterTableData.value = showTableData.value.filter((ele) => ele.name.toLowerCase().includes(searchKey.value.toLowerCase())||ele.key.toLowerCase().includes(searchKey.value.toLowerCase()));
   }
  watch(
    () => props.model.key,
    () => {
      getTableData();
    },
    {
      immediate: true,
    },
  );
  watch(
    () => searchKey.value,
    (val) => {
      if(!val){
        filterTableData.value = showTableData.value
      }
    }
  );
  const showTableData = computed(() => {
    return isShowSysField.value
      ? tableData.value
      : tableData.value.filter((item) => {
          return item.sysBuiltin === 0;
        });
  });

  const handleAddService = (e) => {
    // openModal(true, { data: { type: e.key } });
    openModal(true, { data: { type: UserServiceType.SCRIPT_SERVICE } });
  };

  const onRefresh = () => {
    getTableData();
  };

  const handleRowEdit = (record) => {
    const isSYS = record.type !== UserServiceType.BUILTIN_SERVICE && record.key.indexOf('_') < 0;
    openModal(true, {
      edit: true,
      data: {
        ...record,
        isSYS,
      },
    });
  };

  const handleBuiltinEdit = (record) => {
    openBuiltinModal(true, {
      data: record,
    });
  };

  const handleDesign = async (record) => {
    const { serviceKey, type } = record;
    if (type === UserServiceType.SCRIPT_SERVICE || type === UserServiceType.BUILTIN_SERVICE) {
      const res = await getScriptInfoByKey({ key: serviceKey });
      openWindow('#/script-editor/' + res!.id);
    } else if (type === UserServiceType.SO_SERVICE) {
      const res = await getServiceOrchestrationInfoByKey({ key: serviceKey });
      openWindow('#/service-orchestration/' + res!.id);
    }
  };

  const handleRowDelete = async (id: string) => {
    await deleteBizServiceCrud({ ids: id });
    message.success(t('sys.delSuccess'));
    onRefresh();
  };

  const handleOpenApi = async (record) => {
    openApiOpenModal(true, {
      data: record,
    });
  };

  const handleEditApi = async (record) => {
    openApiOpenModal(true, {
      edit: true,
      data: record,
    });
  };

  const handleCancelOpen = async (id: string) => {
    await deleteOpenapi({ ids: id });
    message.success(t('sys.appDesigner.deleteSuccess') + '，' + t('sys.openAPICancelOpen'));
    onRefresh();
  };

  defineExpose({
    redoHeight() {
      tableRef.value && tableRef.value.redoHeight();
    },
  });
</script>

<style lang="less"></style>
