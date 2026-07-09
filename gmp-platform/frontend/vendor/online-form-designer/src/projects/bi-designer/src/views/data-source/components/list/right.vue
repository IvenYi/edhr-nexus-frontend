<template>
  <div :class="ns.b()">
    <a-tabs v-model:activeKey="activeKey" type="card" @change="handleTabChange">
      <a-tab-pane :key="TableType.DATA" :tab="t('sys.bi.dataTable')">
        <div class="flex flex-col h-100% overflow-hidden">
          <div :class="ns.e('search')">
            <a-input-search
              class="mb-4"
              v-model:value="searchVal"
              :placeholder="t('sys.inputTextTip', { name: t('sys.bi.dataTable') + t('sys.name') })"
              style="width: 200px"
              @search="onSearch"
            />
          </div>
          <a-table
            :data-source="dataSource"
            :columns="columns"
            bordered
            class="gct-edhr-table h-100px flex-1"
            ref="tableContainerRef"
            size="middle"
            :pagination="pagination"
            :loading="loading"
            :scroll="{
              y: scrollHeight,
            }"
            @change="handleTableChange"
          >
            <template #bodyCell="{ column, text, record }">
              <template v-if="column.dataIndex === 'name'">
                <a-button type="link" @click="handleDetail(record)">{{ text }}</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>
      <a-tab-pane :key="TableType.VIEW" :tab="t('sys.bi.viewTable')">
        <div class="flex flex-col h-100% overflow-hidden">
          <div :class="ns.e('search')">
            <a-input-search
              class="mb-4"
              v-model:value="searchVal"
              :placeholder="t('sys.inputTextTip', { name: t('sys.bi.viewTable') + t('sys.name') })"
              style="width: 200px"
              @search="onSearch"
            />
          </div>
          <a-table
            :scroll="{
              y: scrollHeight,
            }"
            :data-source="dataSource"
            :columns="columns"
            bordered
            class="gct-edhr-table h-100px flex-1"
            ref="tableContainerRef"
            size="middle"
            :pagination="pagination"
          >
            <template #bodyCell="{ column, text }">
              <template v-if="column.dataIndex === 'name'">
                <a-button type="link">{{ text }}</a-button>
              </template>
            </template>
          </a-table>
        </div>
      </a-tab-pane>

      <!-- <template #rightExtra>
        <a-button type="primary">
          {{ t('sys.bi.sqlCreate') }}
        </a-button>
      </template> -->
    </a-tabs>

    <detail-drawer ref="detailDrawerRef" />
  </div>
</template>

<script lang="ts" setup>
  import { ref, computed, watch, reactive } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace, useAntTableScrollHeight } from '@gct/runtime';
  import type { TablePaginationConfig } from 'ant-design-vue';
  import { TableType } from '/@bi-designer/enum/database';
  import {
    getDatabaseTableInformation,
    getDatabaseViewInformation,
  } from '/@/apis/gct-platform/DatabaseController';
  import DetailDrawer from './detail.vue';

  const ns = useNamespace('data-source-content');
  const { t } = useI18n();

  const tableContainerRef = ref();
  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const props = defineProps({
    currentDatasource: String,
  });

  const detailDrawerRef = ref();

  const activeKey = ref('data');

  const searchVal = ref('');

  const loading = ref<boolean>(false);

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const columns = computed(() => {
    return [
      {
        title:
          (activeKey.value === TableType.DATA ? t('sys.bi.dataTable') : t('sys.bi.viewTable')) +
          t('sys.name'),
        dataIndex: 'name',
        key: 'name',
      },
      {
        title: t('sys.description'),
        dataIndex: 'description',
        key: 'description',
      },
    ];
  });

  const dataSource = ref<any>([]);

  const onSearch = async (val?: string) => {
    const id = props?.currentDatasource ?? '';
    if (!id) return;

    loading.value = true;

    const res =
      (activeKey.value === TableType.DATA
        ? await getDatabaseTableInformation({ id })
        : await getDatabaseViewInformation({ id })) ?? [];
    dataSource.value = val
      ? res.filter((item) => {
          return item.name?.includes(val);
        })
      : res;

    pagination.current = 1;
    pagination.total = dataSource.value?.length;
    loading.value = false;
  };

  const handleTabChange = () => {
    searchVal.value = '';
    dataSource.value = [];
    pagination.current = 1;
    pagination.total = 0;
    onSearch();
  };

  const handleDetail = (detail: any) => {
    const params = {
      tbName: detail?.name,
      id: props?.currentDatasource,
    };
    detailDrawerRef?.value.showDrawer(params);
  };

  watch(
    () => props.currentDatasource,
    () => {
      searchVal.value = '';
      pagination.current = 1;
      pagination.total = 0;
      onSearch();
    },
    {
      immediate: true,
    },
  );

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
  };
</script>

<style lang="scss" scoped>
  @include b(data-source-content) {
    flex: 1;
    padding: 16px;
    height: 100%;
    width: 100%;
    overflow: hidden;

    @include e(search) {
      padding: 12px 16px 0;
      border: 1px solid #eaedf1;
      border-top: none;
      border-bottom: none;
    }

    .ant-tabs {
      height: 100%;
      :deep(.ant-tabs-nav) {
        margin-bottom: 0;
      }
      :deep(.ant-tabs-content-holder) {
        height: calc(100% - 46px);
      }

      :deep(.ant-tabs-content) {
        height: 100%;
      }
    }
  }
</style>
