<template>
  <div class="document-item-container" v-if="categoryId">
    <div class="content-top bg-[#F7F8FA] p16px mb16px">
      <a-form ref="formRef" :model="formState" autocomplete="off">
        <a-row :gutter="24">
          <a-col :span="8">
            <a-form-item name="name" :label="t('sys.webRender.edhrApplication.projectName')">
              <a-input
                v-model:value="formState.name"
                :placeholder="
                  t('sys.inputTextTip', { name: t('sys.webRender.edhrApplication.projectName') })
                "
              />
            </a-form-item>
          </a-col>

          <a-col :span="8" :offset="8" style="text-align: right">
            <a-button @click="handleReset">
              <template #icon>
                <undo-outlined />
              </template>
              {{ t('sys.reset') }}
            </a-button>
            <a-button class="ml-8px" type="primary" @click="handleSearch">
              <template #icon>
                <search-outlined />
              </template>
              {{ t('sys.queryText') }}
            </a-button>
          </a-col>
        </a-row>
      </a-form>
    </div>
    <div class="bg-[#F8F8F8] p8px text-[#797A7D] mb16px">
      <i class="iconfont icon-a-zhuyi_attention2 text-[#F77E4A] mr4px"></i>
      {{ $t('sys.edhr.documentItemTips') }}
    </div>
    <div class="table-operations" v-show="userActions.Insert || userActions.IMPORT">
      <a-button v-if="userActions.Insert" type="primary" @click="handleAdd">
        <template #icon>
          <plus-outlined />
        </template>
        {{ t('sys.new') }}
      </a-button>
      <a-button v-if="userActions.IMPORT" class="ml-8px" @click="handleImport">
        {{ t('sys.import') }}
      </a-button>
    </div>
    <div class="flex-1 table-wrap">
      <a-table
        class="gct-edhr-table h-full"
        rowKey="id_"
        :loading="loading"
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        @change="handleTableChange"
        size="middle"
        ref="tableContainerRef"
        :scroll="{
          y: scrollHeight,
        }"
      >
        <template #bodyCell="{ column, record, text }">
          <template v-if="column.key === 'type_'">
            <div>
              <IconNext
                :size="16"
                :value="icons[text]"
                :style="{
                  marginRight: '4px',
                  '--color': 'var(--ant-primary-color)',
                  lineHeight: '1',
                  verticalAlign: 'text-bottom',
                }"
              />
              {{ t(`sys.pageDesigner.dynamicFormType.${text}`) }}
            </div>
          </template>
          <template v-if="column.key === 'action'">
            <table-action-auto
              :actions="[
                {
                  ifShow: Boolean(userActions.Update),
                  label: t('sys.edit'),
                  onClick: handleEditRow.bind(null, record),
                },
                {
                  ifShow: Boolean(userActions.Trace),
                  label: t('sys.appDesigner.modelTrace'),
                  onClick: handleModelTraceRow.bind(null, record),
                },
                {
                  ifShow: Boolean(userActions.Delete),
                  label: t('sys.delete'),
                  color: 'error',
                  popConfirm: {
                    title: t('sys.sureToDelete'),
                    confirm: handleDeleteRow.bind(null, record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </a-table>
    </div>
  </div>
  <div class="document-item-empty-area" v-else>
    <a-empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
  </div>
</template>

<script setup lang="ts" name="document-item-container">
  import { ref, reactive, watch, computed } from 'vue';
  import { message, Empty } from 'ant-design-vue';
  import type { FormInstance, TablePaginationConfig } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { TableActionAuto } from '/@/components/Table';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import ItemModal from './modal/item-modal/index.vue';
  import { TracingBackToThePast } from '/@web-render/render/Event/Modal';
  import { columns, icons } from './utils';
  import { EntityModelCategoryEnum } from '@gct/runtime';
  import { postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { IconNext } from '/@/components/Icon';
  import { importDataForModal } from '/@web-render/render/Event/utils/builtInMethods';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';

  const { t } = useI18n();

  const title = t('sys.webRender.edhrApplication.item');
  const modelKey = 'em_data_collection_entry';

  const props = defineProps<{
    categoryId: string;
  }>();

  const userActions = computed(() => {
    const page = 'document-item';
    return {
      Insert: getPermissionByKey(page, 'Insert'),
      Update: getPermissionByKey(page, 'Update'),
      Delete: getPermissionByKey(page, 'Delete'),
      Trace: getPermissionByKey(page, 'Trace'),
      IMPORT: getPermissionByKey(page, 'IMPORT'),
    };
  });

  const formRef = ref<FormInstance>();

  const formState = reactive({
    name: undefined,
  });

  const loading = ref<boolean>(false);
  const tableContainerRef = ref();

  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  // 分页
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const tableData = ref([]);

  watch(
    () => props.categoryId,
    () => {
      if (props.categoryId) {
        // 切换时重置分页数据
        pagination.current = 1;
        pagination.pageSize = 10;
        getDataSource();
      }
    },
    {
      immediate: true,
    },
  );

  /** 项目模态框 */
  const useItemModal = async (args: {
    data?: any;
    params?: Record<string, any>;
    shouldClose?: (data) => Promise<boolean>;
    title: string;
  }) => {
    const res = await gct.openUtil.modal(
      ItemModal,
      {
        data: args.data,
        params: args.params,
        shouldClose: args.shouldClose,
      },
      {
        title: args.title,
        width: 640,
        height: 'auto',
        okText: $t('sys.okText'),
        showFooter: true,
      },
    );
    if (res.ok) {
      return res.data![0];
    }
  };

  async function getDataSource() {
    loading.value = true;
    try {
      const res: any = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
        {
          bsKey: 'listByPage',
          modelKey: modelKey,
          modelCategory: EntityModelCategoryEnum.ENTITY,
        },
        {
          query: { [`name_.like`]: formState.name, category_id_: props.categoryId },
          pageNo: pagination.current,
          pageSize: pagination.pageSize,
        },
      );
      pagination.current = res?.pageNo;
      pagination.total = res?.totalCount;

      tableData.value = res?.data;
    } catch (error) {
      console.warn(error);
    }
    loading.value = false;
  }

  async function handleAdd() {
    const res = await useItemModal({
      data: {
        category_id_: props.categoryId,
      },
      title: t('sys.newSth', { sth: title }),
      shouldClose: async (data) => {
        try {
          await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
            {
              bsKey: 'save',
              modelCategory: EntityModelCategoryEnum.ENTITY,
              modelKey: modelKey,
            },
            { ...data, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
          );
          return true;
        } catch (error) {
          return false;
        }
      },
    });

    if (res) {
      message.success($t('sys.webRender.edhrApplication.createSuccessOfSth', { sth: title }));
      await getDataSource();
    }
  }

  async function handleImport() {
    importDataForModal(
      {
        tmplKey: 'import_data_collection_tmpl_ebjd',
        modelKey: 'em_data_collection_entry',
        useGetExcelTmplDownloadById: true,
      },
      {
        async onSuccess() {
          await getDataSource();
          loading.value = false;
        },
        onError() {
          loading.value = false;
        },
      },
    );
  }

  async function handleEditRow(record) {
    const res = await useItemModal({
      data: record,
      title: t('sys.editSth', { sth: title }),
      shouldClose: async (data) => {
        try {
          await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
            {
              bsKey: 'saveOrUpdate',
              modelCategory: EntityModelCategoryEnum.ENTITY,
              modelKey: modelKey,
            },
            { ...data, _DICT: undefined, _OPCT: undefined, _NOSUBMIT: undefined },
          );
          return true;
        } catch (error) {
          return false;
        }
      },
    });

    if (res) {
      message.success($t('sys.webRender.edhrApplication.editSuccessOfSth', { sth: title }));
      await getDataSource();
    }
  }

  function handleModelTraceRow(record) {
    TracingBackToThePast({ id: record.id_ }).open();
  }

  async function handleDeleteRow(record) {
    await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        bsKey: 'remove',
        modelCategory: EntityModelCategoryEnum.ENTITY,
        modelKey: modelKey,
      },
      {
        query: {
          'id_:': record.id_,
        },
      },
    );

    message.success($t('sys.webRender.edhrApplication.deleteSuccessOfSth', { sth: title }));
    pagination.current = 1;
    getDataSource();
  }

  const handleSearch = () => {
    pagination.current = 1;
    getDataSource();
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getDataSource();
  };

  const handleReset = () => {
    formRef.value?.resetFields();
    handleSearch();
  };
</script>

<style scoped lang="less">
  .document-item-container {
    display: flex;
    flex-direction: column;
    position: relative;
    padding: 16px 16px 16px 20px;
    background-color: #fff;
    overflow: hidden;

    .table-operations {
      margin-bottom: 16px;
      display: flex;
      justify-content: flex-end;
    }

    .table-wrap {
      // overflow: hidden;
      flex: 1;
      overflow: auto;
    }
  }

  .document-item-empty-area {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
  }
</style>
<style lang="less" scoped>
  :deep(.ant-form .ant-form-item) {
    margin-bottom: 0;
  }
</style>
