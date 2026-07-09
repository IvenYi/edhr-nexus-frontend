<template>
  <div :class="[ns.b()]">
    <a-table
      :striped="false"
      :bordered="true"
      :ellipsis="true"
      :dataSource="data"
      :columns="TableColumns"
      :pagination="pagination"
      @change="handleTableChange"
      :show-index-column="false"
      size="middle"
    >
      <template #bodyCell="{ column, record, index }">
        <template v-if="column.dataIndex === 'versionName'">
          <span v-if="pagination.current === 1 && index === 0" :class="[ns.e('highlight')]">{{
            $t('sys.onlineForm.releasedVersions')
          }}</span>
          <span v-else>{{ $t('sys.bpmn.versionStatus.HISTORY') }}</span>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <table-action-auto
            :actions="getRowActions(record)"
            :stopButtonPropagation="true"
            :max-dispaly-count="5"
          />
        </template>
      </template>
    </a-table>
  </div>
</template>

<script lang="ts" setup name="publish-version-table">
  import { useNamespace } from '@gct/runtime';
  import { usePublishVersion, OnlineFormPublishVersion } from '../../hooks/usePublishVersion';
  import { ActionItem, TableActionAuto } from '/@/components/Table';
  import { onMounted, reactive, ref } from 'vue';
  import PublishVersionPreviewModal from './publish-version-preview-modal.vue';
  import { TableColumnsType, TablePaginationConfig } from 'ant-design-vue';

  const TableColumns: TableColumnsType = [
    {
      title: $t('sys.model.time'),
      dataIndex: 'time',
      width: 230,
    },
    {
      title: $t('sys.updatePerson'),
      dataIndex: 'user',
      width: 230,
    },
    {
      title: $t($t('sys.kit.name_')),
      dataIndex: 'versionName',
      width: 230,
    },
    {
      title: $t('sys.operation'),
      dataIndex: 'action',
      width: 72,
      align: 'left',
      fixed: 'right',
    },
  ];

  const ns = useNamespace('publish-version-table');
  const { loadTableData } = usePublishVersion();
  /** 分页 */
  const pagination: TablePaginationConfig = reactive({
    current: 1,
    total: 0,
    pageSize: 10,
    showSizeChanger: true,
    size: 'small',
    showTotal: (total) => $t('sys.component.table.total', { total }),
  });

  const data = ref<OnlineFormPublishVersion[]>([]);

  const getFetchParams = () => {
    return {
      pageNo: pagination.current ?? 1,
      pageSize: pagination.pageSize!,
    };
  };

  const load = async () => {
    const params = getFetchParams();
    const res = await loadTableData(params);
    pagination.total = res.total!;
    data.value = res.data!;
  };

  const handleTableChange = (paginationInfo) => {
    const { current, pageSize } = paginationInfo;
    Object.assign(pagination, { current, pageSize });
    load();
  };

  onMounted(() => {
    load();
  });

  /** 获取对应的操作配置 */
  const getRowActions = (row): ActionItem[] => {
    return [
      {
        label: $t('sys.preview'),
        onClick: () => {
          gct.openUtil.modal(
            PublishVersionPreviewModal,
            {
              data: row,
            },
            { title: $t('sys.preview'), showFooter: false, width: '80%', height: '80%' },
          );
          console.log('预览', row);
        },
      },
    ];
  };
</script>

<style lang="scss" scoped>
  $publish-version-table: ();

  @include b(publish-version-table) {
    @include set-component-css-var(publish-version-table, $publish-version-table);
    padding: 16px 16px 0;

    @include e('highlight') {
      color: #3168ec;
    }
  }
</style>
