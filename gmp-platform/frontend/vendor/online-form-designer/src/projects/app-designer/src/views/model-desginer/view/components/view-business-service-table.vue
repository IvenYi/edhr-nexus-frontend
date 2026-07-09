<template>
  <basic-table
    ref="tableRef"
    :striped="false"
    :bordered="true"
    :showIndexColumn="false"
    :ellipsis="true"
    :pagination="false"
    class="model-designer-basic-table"
    :columns="viewBusinessServiceColumns"
    :dataSource="filterTableData"
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
        </a-col>
      </a-row>
    </template>
    <template #bodyCell="{ column, record }">
      <template v-if="column.key === 'action'">
        <table-action-auto
          :actions="[
            {
              label: t('sys.openness'),
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
  <open-api-modal
    @register="openApiRegister"
    :modelKey="model.key"
    :modelName="model.name"
    modelCategory="view"
    @refresh="onRefresh"
  />
</template>

<script setup lang="ts">
  import { ref, watch,computed } from 'vue';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { viewBusinessServiceColumns } from '../constant/columns';
  import { getBizServiceCrudViewModelList } from '/@/apis/gct-apaas/BizServiceController';
  import { BizServiceMetaDTO } from '/@/apis/gct-apaas/model';
  import OpenApiModal from '../../entity/components/business-service/modal/open-api-modal.vue';
  import { deleteOpenapi } from '/@/apis/gct-apaas/OpenapiController';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { message } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';

  const props = defineProps<{
    model;
  }>();

  const { t } = useI18n();
  const tableRef = ref();
  const searchKey = ref<string>('');

  const tableData = ref<Array<BizServiceMetaDTO>>([]);
      const filterTableData = ref<Array<BizServiceMetaDTO>>([]);

  const [openApiRegister, { openModal: openApiOpenModal }] = useModal();



  const getTableData = async () => {
    tableData.value =
      (await getBizServiceCrudViewModelList({
        searchKey: searchKey.value ? searchKey.value : undefined,
        modelKey: props.model.key,
      })) || [];
      filterTableData.value = tableData.value

      
  };
   const handleSearch = (e)=>{
    filterTableData.value = tableData.value.filter((ele) => ele.name.toLowerCase().includes(searchKey.value.toLowerCase())||ele.key.toLowerCase().includes(searchKey.value.toLowerCase()));
   }

  watch(
    () => props.model.id,
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
        filterTableData.value = tableData.value
      }
    }
  );


  const onRefresh = () => {
    getTableData();
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
