<template>
  <basic-page-render>
    <div :class="[ns.e('wrapper')]">
      <CategorySider
        :class="[ns.e('sider')]"
        :module="ProcessTypeEnum.APPROVAL"
        v-model:value="formState.categoryId"
        :readonly="true"
        :siderTitle="t('sys.categoryOfSth', { sth: t('sys.process.approval') })"
        @changeValue="queryTableData"
        :isTree="false"
        needFolderIcon
      />
      <div :class="[ns.e('content')]">
        <a-form ref="formRef" :model="formState" autocomplete="off">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item name="name" label="">
                <a-input
                  :class="[ns.e('search')]"
                  allowClear
                  v-model:value="formState.query"
                  :placeholder="t('sys.searchApprovalKey')"
                  style="width: 360px"
                  @pressEnter="handleSearch"
                  @change="handleSearch()"
                >
                  <template #suffix>
                    <i class="iconfont icon-sousuoMedpro text-[#212528]"></i>
                  </template>
                </a-input>
              </a-form-item>
            </a-col>
            <a-col :span="8" :offset="8" style="text-align: right">
              <!-- <a-button type="primary" :class="[ns.e('add')]" @click="handleAdd">
              <i class="iconfont icon-chuangjian"></i>
              {{t('sys.newSth', {sth: '审批流'}) }}
            </a-button> -->
            </a-col>
          </a-row>
        </a-form>
        <div class="table-wrap">
          <BasicTable
            :dataSource="tableData"
            :columns="columns"
            :showIndexColumn="false"
            :pagination="pagination"
            :striped="false"
            :bordered="true"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, record, index }">
              <template v-if="column.key === 'index'">
                <div>{{ getPageIndex(index) }}</div>
              </template>
              <template v-if="column.key === 'titleConfig'">
                {{ titleConfig(record.titleConfig) }}
              </template>
              <template v-if="column.key === 'action'">
                <table-action-auto
                  :actions="[
                    {
                      label: t('sys.config'),
                      onClick: () => handleConfig(record),
                      ifShow: !!userActions[CustomAction.Setting],
                    },
                    {
                      label: t('sys.detail'),
                      onClick: () => handleDetail(record),
                    },
                  ]"
                  :stopButtonPropagation="true"
                />
              </template>
            </template>
          </BasicTable>
        </div>
      </div>
    </div>
    <detail-drawer ref="detailRef" :userActions="userActions" />
  </basic-page-render>
</template>

<script setup lang="ts" name="approval-mgt">
  import { ref, reactive, onMounted, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { CustomAction } from '/@/enums/authActionEnum';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { getPmProcessDefinitionPageList } from '/@/apis/gct-apaas/PmProcessDefinitionController';
  import { CategorySider } from '../components/category';
  import { useNamespace } from '@gct/runtime';
  import { ProcessTypeEnum } from '/@/layouts/tree-sider-page/enum';
  import DetailDrawer from './modal/detail.vue';
  // import openWindow from '/@app-designer/tools/openWindow';
  import { useRouter } from 'vue-router';

  type ColumType = {
    title: string;
    dataIndex: string;
  };

  const { t } = useI18n();
  const router = useRouter();
  const ns = useNamespace('approval-mgt');
  const detailRef = ref();
  const userActions = computed(() => {
    return {
      [CustomAction.Setting]: getPermissionByKey('ProcessDefinition', CustomAction.Setting),
    };
  });

  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const formState = reactive({
    query: undefined,
    categoryId: undefined,
  });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const loading = ref<boolean>(false);
  const tableData = ref<any>([]);

  const columns: ColumType[] = [
    {
      title: t('sys.pageDesigner.index'),
      dataIndex: 'index',
      width: 72,
    },
    {
      title: t('sys.process.approvalName'),
      dataIndex: 'name',
    },
    {
      title: t('sys.process.approvalKey'),
      dataIndex: 'key',
    },

    {
      title: t('sys.process.titleConfig'),
      dataIndex: 'titleConfig',
    },
    {
      title: t('sys.process.activeVersion'),
      dataIndex: 'activeVersion',
    },
    {
      title: t('sys.description'),
      dataIndex: 'description',
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      fixed: 'right',
      align: 'left',
      width: 120,
    },
  ];

  const queryTableData = (data) => {
    formState.categoryId = data.key;
    getTableData(formState);
  };

  const getTableData = async (params?, current?) => {
    loading.value = true;
    try {
      const result = await getPmProcessDefinitionPageList({
        pageNo: current ?? pagination.current,
        pageSize: pagination.pageSize,
        ...params,
      });
      loading.value = false;
      pagination.total = result?.totalCount ?? 0;
      tableData.value = result?.data || [];
    } catch (e) {
      loading.value = false;
    }
  };

  const getPageIndex = (index) => {
    const { current, pageSize } = pagination;
    return pageSize * (current - 1) + index + 1;
  };

  onMounted(() => {
    // getTableData(formState);
  });

  const titleConfig = computed(() => {
    return (config) => {
      if (config) {
        try {
          const data = JSON.parse(config);
          return data.exprEcho;
        } catch (err) {
          console.warn('title config error');
        }
      }
      return '';
    };
  });

  const handleSearch = () => {
    formRef.value?.validate().then(async () => {
      // 发送网络请求获取数据
      await getTableData(formState, 1);
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData(formState);
  };

  const handleDetail = (record) => {
    detailRef.value?.onOpen(record.id);
  };

  const handleConfig = (record) => {
    const routeData = router.resolve({
      name: 'ProcessDesignerNew',
      params: { id: record.id },
      query: { front: 1 },
    });
    window.open(routeData.href, '_blank');
    // openWindow('#/process-designer-new/' + record.id);
  };
</script>

<style lang="scss" scoped>
  $approval-mgt: ();

  @include b(approval-mgt) {
    @include set-component-css-var(approval-mgt, $approval-mgt);
    border: 1px solid #eaedf1;

    :deep(.basic-page-render__body) {
      height: 100%;
      // display: flex;
      // flex: 0 0 auto;
    }
    @include e(wrapper) {
      height: 100%;
      display: flex;
      flex: 0 0 auto;
    }

    @include e(sider) {
      border-width: 0 1px 0 0;
    }

    @include e(content) {
      flex-grow: 1;
      padding: 16px;
      width: calc(100% - 222px);
    }
  }
</style>
