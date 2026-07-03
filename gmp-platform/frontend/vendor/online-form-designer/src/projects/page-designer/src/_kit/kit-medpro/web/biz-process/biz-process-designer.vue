<template>
  <basic-page-render class="gct-biz-process-layout">
    <div :class="[ns.e('wrapper')]">
      <CategorySider
        :class="[ns.e('sider')]"
        module="biz_process_module"
        :needFolderIcon="true"
        v-model:value="cacheParams.categoryId"
        :siderTitle="t('sys.categoryOfSth', { sth: t('sys.process.biz') })"
      />

      <div :class="[ns.e('content')]">
        <div :class="[ns.e('header')]">
          <a-input
            :class="[ns.e('search')]"
            v-model:value="searchVal"
            allowClear
            :placeholder="t('sys.searchLabelTip')"
            style="width: 360px"
          >
            <template #suffix>
              <i class="iconfont icon-sousuoMedpro text-[#212528]"></i>
            </template>
          </a-input>
          <div :class="[ns.e('toolbar')]">
            <a-button type="primary" :class="[ns.e('add')]" @click="handleOpenModal">
              <i class="iconfont icon-chuangjian"></i>
              {{
                t('sys.newSth', {
                  sth: t('sys.process.biz'),
                })
              }}
            </a-button>
          </div>
        </div>
        <a-table
          rowKey="id"
          :expandedRowKeys="expandedRowKeys"
          :columns="ListColumns"
          :data-source="dataSource"
          :pagination="pagination"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'name'">
              <span :title="record.name" v-if="record.children">
                {{ record.name }}
              </span>
            </template>
          </template>
        </a-table>
      </div>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts" name="gct-biz-process">
  import { computed, reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { BasicColumn } from '/@/components/Table';
  import { getPermissionByKey, BasicAction } from '/@web-render/utils/UserappPermissions';
  import { CategorySider } from '/@web-render/views/components/category';
  import { useNamespace } from '@gct/runtime';

  const { t } = useI18n();

  const ns = useNamespace('biz-process-layout');

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

  const ListColumns: BasicColumn[] = [
    {
      title: t('sys.process.biz') + t('sys.name'),
      dataIndex: 'name',
      key: 'name',
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

  const handleOpenModal = async (data) => {};
</script>
<style lang="less" scoped>
  .gct-biz-process-layout {
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
