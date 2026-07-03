<template>
  <div :class="[ns.e('wrapper')]">
    <category-slider
      ref="categorySliderRef"
      @changeSelect="changeSelect"
      :module="CategoryModuleEnum.DATASET"
      :siderTitle="t('sys.categoryOfSth', { sth: t('sys.menu.dataSet') })"
    />
    <div :class="[ns.e('content')]">
      <template v-if="dataSource.length || searchVal.length">
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
            @pressEnter="onSearch"
            @change="handleChange($event)"
          >
            <template #suffix>
              <i class="iconfont icon-sousuoMedpro text-[#212528]"></i>
            </template>
          </a-input>
          <div :class="[ns.e('toolbar')]">
            <a-button type="primary" :class="[ns.e('add')]" @click="handleAdd">
              <i class="iconfont icon-chuangjian"></i>
              {{ t('sys.newSth', { sth: t('sys.menu.dataSet') }) }}
            </a-button>
          </div>
        </div>

        <BasicTable
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
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.dataIndex === 'index'">
              <span class="ml-4px">{{ index + 1 }}</span>
            </template>
            <template v-if="column.dataIndex === 'name'">
              <span @click.stop="handleEdit(record)" class="primary-gct" style="cursor: pointer">
                {{ record.name }}
              </span>
            </template>
            <template v-if="column.dataIndex === 'type'">
              <span>
                {{ t(`sys.bi.${DatasetType[record.type || record.databaseType]}`) }}
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
                    label: t('sys.component.userCmp.move'),
                    onClick: () => handleRowMove(record),
                  },
                  {
                    label: t('sys.delete'),
                    color: 'text',
                    onClick: () => handleDel(record),
                  },
                ]"
                :stopButtonPropagation="true"
              />
            </template>
          </template>
        </BasicTable>
      </template>
      <empty-page v-else :categoryId="cacheParams.categoryId" @add="handleAdd" />
      <move @register="register" @ok="handleOk" />
    </div>
  </div>
</template>

<script setup lang="ts" name="print-designer-layout">
  import { onMounted, computed, reactive, ref, onBeforeMount, nextTick } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRoute } from 'vue-router';
  import { BasicTable, TableActionAuto, BasicColumn } from '/@/components/Table';
  import { CategorySlider } from '/@bi-designer/views/components/category-slider';
  import { CategoryModuleEnum } from '/@bi-designer/views/components/category/type';
  import { useNamespace } from '@gct/runtime';
  import EmptyPage from './empty.vue';
  import {
    getDatasetPageList,
    deleteDataset,
    getDatasetListIds,
  } from '/@/apis/gct-platform/PnDatasetController';
  import { DatasetType } from '/@bi-designer/enum/database';
  import DesignView from './design/design-view.vue';
  import { message, Modal } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import Move from './modal/move.vue';
  import { debounce } from 'lodash-es';

  const { t } = useI18n();
  const route = useRoute();
  const ns = useNamespace('print-designer-layout');
  const [register, { openModal }] = useModal();

  const categorySliderRef = ref();
  const dataSource = ref<any>([]);
  const pagination = reactive({
    current: 1,
    total: 0,
    pageSize: 20,
  });
  const categoryId = ref();
  const searchVal = ref();
  const cacheParams = computed(() => ({
    categoryId: categoryId.value,
    pageNo: pagination.current ?? 1,
    pageSize: pagination.pageSize,
    query: searchVal.value?.trim(),
  }));
  const selectKeys = ref('1');

  const onSearch = () => {
    getTableData();
  };

  const changeSelect = async (id) => {
    pagination.current = 1;
    selectKeys.value = id == 1 ? '' : id;
    if (id) {
      categoryId.value = id;
      await getTableData(true);
      searchVal.value = '';
    }
  };

  const handleChange = debounce(async (e) => {
    if (e.target.value?.trim()) {
      searchVal.value = e.target.value;
      await nextTick();
      getTableData();
    } else {
      searchVal.value = ' ';
      await getTableData(true);
      searchVal.value = e.target.value;
    }
  }, 200);

  const ListColumns: BasicColumn[] = [
    {
      key: 'index',
      dataIndex: 'index',
      title: t('sys.index'),
      width: 56,
      fixed: 'left',
    },
    {
      title: t('sys.menu.dataSet') + t('sys.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.menu.dataSet') + 'key',
      dataIndex: 'key',
      key: 'key',
      width: 170,
    },
    {
      title: t('sys.pageDesigner.dataSourcetype'),
      dataIndex: 'type',
      key: 'type',
      ellipsis: true,
    },
    {
      title: t('sys.pageDesigner.dataSource'),
      dataIndex: 'databaseName',
      key: 'databaseName',
      ellipsis: true,
    },
    {
      title: t('sys.creator'),
      dataIndex: 'createUserName',
      key: 'createUserName',
      ellipsis: true,
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      ellipsis: true,
    },
    {
      title: t('sys.modifier'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
      ellipsis: true,
    },
    {
      title: t('sys.modifyTime'),
      dataIndex: 'modifyTime',
      key: 'modifyTime',
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
    const res: any = await gct.openUtil.fullScreen(DesignView, {
      data: { name: '未命名数据集'  },
      categoryInfo: {
        categoryList: categorySliderRef.value?.getCategoryData(),
        categoryId: categoryId.value,
      },
    });
    if (res?.ok) {
      getTableData();
    }
  };

  const handleEdit = async (record) => {
    const data = {
      ...record,
    };
    const res: any = await gct.openUtil.fullScreen(DesignView, {
      data,
      categoryInfo: {
        categoryList: categorySliderRef.value?.getCategoryData(),
        categoryId: categoryId.value,
      },
    });
    if (res?.ok) {
      getTableData();
    }
  };

  const handleRowMove = (record) => {
    openModal(true, {
      ...record,
    });
  };

  const handleDel = (record) => {
    Modal.confirm({
      title: t('sys.model.confirmDelDataSet', { sth: record.name }),
      okText: t('sys.okText'),
      cancelText: t('sys.cancelText'),
      onOk: async () => {
        await deleteDataset({ ids: record.id });
        message.success(t('sys.delSuccess'));
        getTableData();
      },
      onCancel: () => {},
    });
  };

  const getTableData = async (isSel = false) => {
    const params = {
      ...cacheParams.value,
      query: isSel ? '' : cacheParams.value.query,
      name: isSel ? '' : cacheParams.value.query,
    };
    const res = await getDatasetPageList(params);
    dataSource.value = res?.data?.map((i) => {
      return i;
    });
    pagination.total = res?.totalCount || 0;
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const handleOk = () => {
    getTableData();
  };

  onBeforeMount(async () => {
    const queryData = route.query?.cacheKey ? decodeURIComponent(route.query?.cacheKey) : '{}';
    console.log(queryData, route.query?.cacheKey);
    const encode = JSON.parse(queryData);
    pagination.current = encode?.pageNo ?? 1;
    pagination.pageSize = encode?.pageSize ?? 20;
    searchVal.value = encode?.query || '';
  });

  onMounted(async () => {
    if (route.query.categoryId) {
      categorySliderRef.value?.setCategoryId(route.query.categoryId);
      if (route.query.datasetId) {
        const params: any = {
          ids: route.query?.datasetId,
        };
        const res = (await getDatasetListIds(params)) || [];
        res.length && handleEdit(res[0]);
      }
    }
  });

  defineExpose({
    refresh: () => {
      getTableData();
    },
  });
</script>
<style lang="less" scoped>
  @print-designer-layout: ();

  .gct-print-designer-layout {
    border: 1px solid #eaedf1;

    &__wrapper {
      height: 100%;
      display: flex;
      flex: 0 0 auto;
      border-left: 1px solid #eaeaea;
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
      justify-content: space-between;
    }

    &__search {
      margin-bottom: 14px;
    }

    &__upload,
    &__add {
      > * {
        vertical-align: middle;
      }
      i {
        font-size: 9px;
        padding-right: 4px;
      }
    }
  }
  :deep(.vben-basic-table.bi-data-set-table-wrapper .ant-table-wrapper) {
    padding: 0;
  }
  :deep(.ant-table .ant-btn.ant-btn-sm) {
    padding: 0;
  }
</style>
