<template>
  <basic-page-render class="gct-biz-process-layout">
    <div :class="[ns.e('wrapper')]">
      <CategorySider
        :class="[ns.e('sider')]"
        module="biz_process_module"
        :needFolderIcon="true"
        v-model:value="cacheParams.categoryId"
        :siderTitle="t('sys.categoryOfSth', { sth: t('sys.process.biz') })"
        :customDelFunc="handleCategoryDel"
        :customDelTips="t('sys.process.deleteCategoryTips2', { sth: t('sys.process.biz') })"
        @changeValue="queryTableData"
        @changeCategory="initTreeData"
      />

      <div :class="[ns.e('content')]">
        <div :class="[ns.e('header')]">
          <a-input
            :class="[ns.e('search')]"
            v-model:value="searchVal"
            allowClear
            :placeholder="t('sys.searchLabelTip')"
            style="width: 360px"
            @pressEnter="onSearch"
            @change="!searchVal.trim().length && onSearch()"
          >
            <template #suffix>
              <i class="iconfont icon-sousuoMedpro text-[#212528]"></i>
            </template>
          </a-input>
          <div :class="[ns.e('toolbar')]">
            <a-button type="primary" :class="[ns.e('add')]" @click="() => handleOpenModal()">
              <i class="iconfont icon-chuangjian"></i>
              {{
                t('sys.newSth', {
                  sth: t('sys.process.biz'),
                })
              }}
            </a-button>
          </div>
        </div>
        <basic-table
          :striped="false"
          :bordered="true"
          rowKey="id"
          :expandedRowKeys="expandedRowKeys"
          :showIndexColumn="false"
          :ellipsis="true"
          :columns="ListColumns"
          :data-source="dataSource"
          :pagination="pagination"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'name'">
              <a-button
                type="link"
                style="padding: 0"
                :title="record.name"
                @click="handleDetail(record)"
              >
                {{ record.name }}
              </a-button>
            </template>
            <template v-if="column.dataIndex === 'actions'">
              <slot name="actions" v-bind="{ record }"></slot>
              <table-action-auto
                :actions="[
                  {
                    label: t('sys.detail'),
                    onClick: () => handleDetail(record),
                  },
                  {
                    label: t('sys.edit'),
                    ifShow: userActions[BasicAction.Update] === true,
                    onClick: () => handleOpenModal(record),
                  },
                  {
                    label: t('sys.design'),
                    ifShow: userActions[BasicAction.Design] === true,
                    onClick: () => handleDesign(record),
                  },
                  {
                    label: t('sys.delete'),
                    ifShow: userActions[BasicAction.Delete] === true,
                    color: 'error',
                    onClick: () => handleDelete(record),
                  },
                ]"
                :stopButtonPropagation="true"
              />
            </template>
          </template>
        </basic-table>
      </div>
    </div>
    <edit-modal @register="register" :currentCategoryId="categoryId" @refresh="getTreeData" />
    <detail-drawer ref="detailDrawerRef" />
  </basic-page-render>
</template>

<script setup lang="ts" name="gct-biz-process">
  import { onMounted, computed, reactive, ref, watch, onBeforeMount, createVNode } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useRouter, useRoute } from 'vue-router';
  import { getCategoryList } from '/@/apis/gct-apaas/CategoryController';
  import { BasicTable, TableActionAuto, BasicColumn } from '/@/components/Table';
  import { getPermissionByKey, BasicAction } from '/@web-render/utils/UserappPermissions';
  import { CategorySider } from '/@web-render/views/components/category';
  import { useNamespace } from '@gct/runtime';
  import {
    getBizProcessDefinitionPageList,
    deleteBizProcessDefinition,
    deleteBizProcessDefinitionDeleteCategory,
  } from '/@/apis/gct-apaas/BizProcessDefinitionController';
  import { useModal } from '/@/components/Modal';
  import EditModal from './components/modal.vue';
  import DesignModal from './components/process-design/index.vue';
  import DetailDrawer from './components/drawer.vue';
  import { Modal, message } from 'ant-design-vue';
  import { ExclamationCircleOutlined } from '@ant-design/icons-vue';

  const { t } = useI18n();
  const route = useRoute();

  const detailDrawerRef = ref();

  const props = defineProps<{}>();

  const ns = useNamespace('biz-process-layout');

  const [register, { openModal }] = useModal();

  const dataSource = ref<any>([]);
  const expandedRowKeys = ref<string[]>([]);
  const pagination = reactive({
    current: 1,
    total: 0,
    pageSize: 20,
  });

  const categoryId = ref();

  const searchVal = ref<string>('');

  const cacheParams = computed(() => ({
    categoryId: categoryId.value,
    pageNo: pagination.current ?? 1,
    pageSize: pagination.pageSize,
    query: searchVal.value?.trim(),
  }));

  const onSearch = () => {
    getTreeData();
  };

  const userActions = computed(() => {
    const pageAuthKey = route.params.linkPage as string;
    return {
      [BasicAction.Update]: pageAuthKey
        ? getPermissionByKey(pageAuthKey, BasicAction.Update)
        : true,
      [BasicAction.Delete]: pageAuthKey
        ? getPermissionByKey(pageAuthKey, BasicAction.Delete)
        : true,
      [BasicAction.Design]: pageAuthKey
        ? getPermissionByKey(pageAuthKey, BasicAction.Design)
        : true,
    };
  });

  const ListColumns: BasicColumn[] = [
    {
      title: t('sys.process.biz') + t('sys.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.process.bizKey'),
      dataIndex: 'key',
      key: 'key',
      ellipsis: true,
    },
    {
      title: t('sys.process.activeVersion'),
      dataIndex: 'activeVersion',
      key: 'activeVersion',
      ellipsis: true,
    },
    {
      title: t('sys.description'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('sys.description'),
      dataIndex: 'description',
      key: 'description',
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
      width: 220,
      title: t('sys.operation'),
      dataIndex: 'actions',
      key: 'actions',
    },
  ];

  const handleCategoryDel = (node) => {
    return new Promise((resolve, reject) => {
      deleteBizProcessDefinitionDeleteCategory({ id: node.id })
        .then(() => {
          resolve(true);
        })
        .catch((err) => {
          reject(err);
        });
    });
  };

  const getTreeData = () => {
    const params = {
      ...cacheParams.value,
      name: cacheParams.value.query,
    };
    getBizProcessDefinitionPageList(params).then((res) => {
      dataSource.value = res?.data?.map((i) => {
        delete i.children;
        return i;
      });
      pagination.total = res?.totalCount || 0;
    });
  };

  const initTreeData = () => {
    getCategoryList({ module: 'biz_process_module' }).then((res) => {
      categoryId.value = res?.length ? res[0]?.id : undefined;
      console.log(categoryId.value);
      queryTableData({ key: categoryId.value });
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTreeData();
  };

  const queryTableData = (data) => {
    if (data?.key) {
      categoryId.value = data.key;
      getTreeData();
    } else {
      categoryId.value = undefined;
      dataSource.value = [];
      pagination.total = 0;
    }
  };

  const handleOpenModal = async (data?) => {
    openModal(true, data && { ...data });
  };

  const handleDetail = (data) => {
    detailDrawerRef.value.showDrawer(data);
  };

  const handleDesign = async (params) => {
    const { id } = params;
    await gct.openUtil.fullScreen(DesignModal, { id });
  };

  const handleDelete = async (params) => {
    const { id, name } = params;
    Modal.confirm({
      title: t('sys.confirmDel', { sth: name }),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        await deleteBizProcessDefinition({ ids: id });
        getTreeData();
        message.success(t('sys.developer.appCenter.deleteSuccess'));
      },
      onCancel() {},
    });
  };

  onBeforeMount(async () => {
    const queryData = route.query?.cacheKey ? decodeURIComponent(route.query?.cacheKey) : '{}';
    const encode = JSON.parse(queryData);
    pagination.current = encode.pageNo ?? 1;
    pagination.pageSize = encode.pageSize ?? 20;
    searchVal.value = encode.query || '';
    categoryId.value = encode.categoryId?.toString() || '';
  });

  onMounted(() => {
    if (cacheParams.value.categoryId) {
      initTreeData();
    }
  });

  defineExpose({
    refresh: () => {
      getTreeData();
    },
  });
</script>
<style lang="less" scoped>
  .gct-biz-process-layout {
    border: 1px solid #eaedf1;
    padding: 0 !important;

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
    }

    &__header {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px solid #eaedf1;
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
</style>
