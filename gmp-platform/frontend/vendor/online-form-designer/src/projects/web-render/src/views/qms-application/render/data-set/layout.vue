<template>
  <div :class="[ns.e('wrapper')]">
    <div :class="[ns.e('content')]">
      <template v-if="!emptyVisible">
        <div :class="[ns.e('header')]">
          <a-input
            :class="[ns.e('search')]"
            v-model:value="searchVal"
            allowClear
            :placeholder="
              t('sys.searchTextTip', {
                sth: t('sys.menu.dataSet'),
              })
            "
            style="width: 360px"
          >
          </a-input>
          <div :class="[ns.e('toolbar')]">
            <a-button class="mr-2" type="default" @click="handleReset">
              {{ t('sys.reset') }}
            </a-button>
            <a-button type="primary" @click="handleSearch">
              {{ t('sys.query') }}
            </a-button>
          </div>
        </div>

        <basic-table
          class="bi-data-set-table-wrapper"
          :striped="false"
          :bordered="true"
          rowKey="id"
          :showIndexColumn="false"
          :ellipsis="true"
          :columns="ListColumns"
          :data-source="dataSource"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #beforeTable>
            <a-button type="primary" :class="[ns.e('add')]" @click="handleAdd">
              <i class="iconfont icon-chuangjian"></i>
              {{ t('sys.newSth') }}
            </a-button>
          </template>
          <template #bodyCell="{ column, record, text, index }">
            <template v-if="column.dataIndex === 'index'">
              <span>
                {{ index + 1 }}
              </span>
            </template>
            <template v-if="column.dataIndex === 'datasource_'">
              <span>
                {{ t(`sys.kit.qms.${record.datasource_}Source`) }}
              </span>
            </template>
            <template v-if="['create_user_id_', 'modify_user_id_'].includes(column.dataIndex)">
              <span>
                {{ dataDict?.[column.dataIndex]?.[text] }}
              </span>
            </template>
            <template v-if="column.dataIndex === 'actions'">
              <slot name="actions" v-bind="{ record }"></slot>
              <table-action-auto
                :actions="[
                  {
                    label: t('sys.edit'),
                    onClick: () => handleEdit(record),
                  },
                  {
                    label: t('sys.delete'),
                    onClick: () => handleDel(record),
                  },
                ]"
                :stopButtonPropagation="true"
              />
            </template>
          </template>
        </basic-table>
      </template>

      <empty-page v-else @add="handleAdd" />
    </div>
  </div>
</template>

<script setup lang="ts" name="data-set-layout">
  import { onMounted, computed, reactive, ref, onBeforeMount } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRoute } from 'vue-router';
  import { BasicTable, TableActionAuto, BasicColumn } from '/@/components/Table';
  import { EntityModelCategoryEnum, useNamespace } from '@gct/runtime';
  import EmptyPage from './empty.vue';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import DesignView from './design/design-view.vue';
  import { message, Modal } from 'ant-design-vue';
  import { deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';

  const { t } = useI18n();

  const route = useRoute();

  const ns = useNamespace('data-set-layout');

  const dataSource = ref<any>([]);
  const pagination = reactive({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const dataDict = ref<any>({});
  // const categorySiderRef = ref();
  // const categoryId = ref();
  const searchVal = ref<string>('');
  const cacheParams = computed(() => ({
    pageNo: pagination.current ?? 1,
    pageSize: pagination.pageSize,
    query: searchVal.value?.trim(),
  }));

  const emptyVisible = computed(() => !dataSource.value?.length && !searchVal.value);

  const ListColumns: BasicColumn[] = [
    {
      title: t('sys.kit.qms.indicator.index'),
      dataIndex: 'index',
      key: 'index',
      width: 80,
    },
    {
      title: t('sys.menu.dataSet') + t('sys.name'),
      dataIndex: 'name_',
      key: 'name_',
      ellipsis: true,
    },
    {
      title: t('sys.kit.qms.datasetSource'),
      dataIndex: 'datasource_',
      key: 'datasource_',
      ellipsis: true,
    },
    // {
    //   title: t('sys.kit.qms.description'),
    //   dataIndex: 'description_',
    //   key: 'description_',
    //   ellipsis: true,
    // },
    {
      title: t('sys.creator'),
      dataIndex: 'create_user_id_',
      key: 'create_user_id_',
      ellipsis: true,
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'create_time_',
      key: 'create_time_',
      ellipsis: true,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modify_user_id_',
      key: 'modify_user_id_',
      ellipsis: true,
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modify_time_',
      key: 'modify_time_',
      ellipsis: true,
    },
    {
      fixed: 'right',
      width: 160,
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const handleAdd = async () => {
    const res = await gct.openUtil.fullScreen(DesignView, {
      data: { name: '未命名数据集' + (dataSource.value?.length + 1) },
    });
    if (res.ok) {
      getTableData();
    }
  };

  const handleSearch = async () => {
    getTableData();
  };

  const handleReset = async () => {
    searchVal.value = '';
    getTableData();
  };

  const handleEdit = async (record) => {
    const data = {
      ...record,
    };
    console.log(data);
    const res = await gct.openUtil.fullScreen(DesignView, {
      data,
    });
    if (res.ok) {
      getTableData();
    }
  };

  const handleDel = (record) => {
    Modal.confirm({
      title: t('sys.model.confirmDelDataSet', { sth: record.name_ }),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        await deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
          {
            modelCategory: EntityModelCategoryEnum.ENTITY,
            modelKey: 'em_dataset',
            bsKey: 'removeByIds',
          },
          { ids: record.id_ },
        );
        message.success(t('sys.delSuccess'));
        getTableData();
      },
      onCancel: () => {},
    });
  };

  const getTableData = () => {
    postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_dataset',
        bsKey: 'listByPage',
      },
      {
        pageSize: pagination.pageSize,
        pageNo: pagination.current,
        query: {
          name_: cacheParams.value.query,
        },
      },
    ).then((res) => {
      dataSource.value = res?.data ?? [];
      pagination.total = res?.totalCount || 0;
      dataDict.value = res?.dict ?? {};
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  onBeforeMount(async () => {
    const queryData = route.query?.cacheKey ? decodeURIComponent(route.query?.cacheKey) : '{}';
    const encode = JSON.parse(queryData);
    pagination.current = encode.pageNo ?? 1;
    pagination.pageSize = encode.pageSize ?? 20;
    searchVal.value = encode.query || '';
  });

  onMounted(() => {
    getTableData();
  });

  defineExpose({
    refresh: () => {
      getTableData();
    },
  });
</script>
<style lang="less" scoped>
  @data-set-layout: ();

  .gct-data-set-layout {
    border: 1px solid #eaedf1;

    &__wrapper {
      height: 100%;
      display: flex;
      flex: 0 0 auto;
    }

    &__sider {
      border-width: 0 1px 0 0;
    }

    &__content {
      flex-grow: 1;
      padding: 16px;
      width: calc(100% - 222px);
      overflow: hidden;

      .bi-data-set-table-wrapper {
        :deep(.ant-pagination) {
          margin: 0;
          padding-top: 10px;
        }
      }
    }

    &__header {
      display: flex;
      align-items: center;
    }

    &__toolbar {
      display: flex;
      align-items: center;
      margin-left: 16px;
    }

    &__add {
      float: right;
      margin-bottom: 12px;
      > * {
        vertical-align: middle;
      }
      i {
        font-size: 9px;
        padding-right: 4px;
      }
    }
  }
</style>
