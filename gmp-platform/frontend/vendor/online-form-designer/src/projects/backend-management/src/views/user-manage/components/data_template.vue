<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerInner"
    :title="t('sys.component.userCmp.dataTrace')"
    centered
    width="1000px"
    :maskClosable="false"
    @ok="handleOk"
  >
    <div class="trace-log-table">
      <div class="refresh-area">
        <a-button @click="getTableData()" class="ml10px">
          <template #icon>
            <a-tooltip title="刷新列表" placement="bottom">
              <reload-outlined />
            </a-tooltip>
          </template>
        </a-button>
      </div>

      <a-table
        :dataSource="dataSource"
        :columns="columns"
        row-key="id"
        :pagination="pagination"
        @expand="onExpand"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'operate'">
            <a-tag :bordered="false" color="processing" v-if="record.operate === '新增'">
              {{ record.operate }}
            </a-tag>
            <a-tag :bordered="false" color="success" v-if="record.operate === '编辑'">
              {{ record.operate }}
            </a-tag>
            <a-tag :bordered="false" color="warning" v-if="record.operate === '重置密码'">
              {{ record.operate }}
            </a-tag>
          </template>
        </template>
        <template #expandIcon="props">
          <i
            style="cursor: pointer"
            @click="
              (e) => {
                props.onExpand(props.record, e);
              }
            "
          >
            <CaretDownOutlined v-if="props.expanded" class="color-blue" />
            <CaretRightOutlined v-else />
          </i>
        </template>
        <template #expandedRowRender="{ record }">
          <div class="grid-field-details">
            <a-table
              :columns="traceDetailColumns"
              :data-source="record.recordFieldJson"
              :pagination="false"
            >
              <template #bodyCell="{ column, record: record1 }">
                <template v-if="column.key === 'oldData'">
                  <a-image
                    v-if="record1.filedKey === 'avatar' && record1.oldData"
                    :width="32"
                    :height="32"
                    :src="transformUrl(record1.oldData)"
                  />
                  <a-image
                    v-else-if="record1.filedKey === 'signatureImage' && record1.oldData"
                    :width="56"
                    :height="32"
                    :src="transformUrl(record1.oldData)"
                  />
                  <span v-else-if="record1.filedKey === 'gender'">
                    <span v-if="record1.oldData === -1"> 保密 </span>
                    <span v-else-if="record1.oldData === 0"> 女 </span>
                    <span v-else-if="record1.oldData === 1"> 男 </span>
                  </span>
                  <span v-else-if="record1.oldData === false || record1.oldData">
                    {{ record1.oldData.toString() }}
                  </span>

                  <span v-else>{{ record1.oldData }}</span>
                </template>
                <template v-if="column.key === 'newData'">
                  <a-image
                    v-if="record1.filedKey === 'avatar' && record1.newData"
                    :width="32"
                    :height="32"
                    :src="transformUrl(record1.newData)"
                  />
                  <a-image
                    v-else-if="record1.filedKey === 'signatureImage' && record1.newData"
                    :width="56"
                    :height="32"
                    :src="transformUrl(record1.newData)"
                  />
                  <span v-else-if="record1.filedKey === 'gender'">
                    <span v-if="record1.newData === -1"> 保密 </span>
                    <span v-else-if="record1.newData === 0"> 女 </span>
                    <span v-else-if="record1.newData === 1"> 男 </span>
                  </span>
                  <span v-else-if="record1.newData === false || record1.newData">
                    {{ record1.newData.toString() }}
                  </span>

                  <span v-else>{{ record1.newData }}</span>
                </template>
                <template v-if="column.key === 'operate'">
                  <a-tag :bordered="false" color="processing" v-if="record.operate === '新增'">
                    {{ record.operate }}
                  </a-tag>
                  <a-tag :bordered="false" color="success" v-if="record.operate === '编辑'">
                    {{ record.operate }}
                  </a-tag>
                  <a-tag :bordered="false" color="warning" v-if="record.operate === '重置密码'">
                    {{ record.operate }}
                  </a-tag>
                </template>
              </template>
            </a-table>
          </div>
        </template>
      </a-table>
    </div>
  </BasicModal>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons-vue';
  import { BasicModal, useModalInner } from '/@/components/Modal';
  import { getUserInfoLogPageList } from '/@/apis/gct-platform/UserInfoLogController';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';

  const id = ref();

  // 打开弹框传参
  const [registerInner, { closeModal }] = useModalInner((data) => {
    if (data) {
      id.value = data.id;
      getTableData();
    }
  });

  const handleOk = () => {
    closeModal();
  };

  const { t } = useI18n();

  //建模追溯
  const dataSource: any = ref([]);
  const columns = ref([
    {
      title: t('sys.operatingUsers'),
      dataIndex: 'modifyUserName',
      key: 'modifyUserName',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      width: 300,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'operate',
      key: 'operate',
      width: 120,
    },
  ]);

  const traceDetailColumns = ref([
    {
      title: t('sys.appDesigner.field'),
      dataIndex: 'fieldName',
      key: 'fieldName',
    },
    {
      title: t('sys.appDesigner.beforeUpdate'),
      dataIndex: 'oldData',
      key: 'oldData',
      width: '30%',
      ellipsis: true,
    },
    {
      title: t('sys.appDesigner.afterUpdate'),
      dataIndex: 'newData',
      key: 'newData',
      width: '30%',
      ellipsis: true,
    },
    {
      title: t('sys.appDesigner.operationType'),
      dataIndex: 'operate',
      key: 'operate',
      width: 120,
    },
  ]);

  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showQuickJumper: false,
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const getTableData = async () => {
    const { data, totalCount } =
      (await getUserInfoLogPageList({
        userId: id.value,
        pageNo: pagination.value.current,
        pageSize: pagination.value.pageSize,
      })) || {};
    pagination.value.total = totalCount ?? 0;
    dataSource.value = data || [];
    dataSource.value.forEach((element) => {
      element.recordFieldJson = JSON.parse(element.recordFieldJson);
    });
    console.log(' dataSource.value', dataSource.value);
  };

  const onExpand = async (expanded, record) => {};

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.value.current = current;
    pagination.value.total = total;
    pagination.value.pageSize = pageSize;
    getTableData();
  };
</script>
<style lang="scss" scoped>
  :deep(.ant-table) {
    .ant-table-thead {
      > tr {
        > .ant-table-cell {
          background-color: #f3f5f9;
        }
      }
    }

    .ant-table-row.ant-table-row-level-0 {
      > .ant-table-cell {
        padding: 10.5px 16px;
      }
    }

    .ant-table-expanded-row.ant-table-expanded-row-level-1 {
      > .ant-table-cell {
        padding: 0;
        padding-left: 16px;
      }
    }
  }

  :deep(.grid-field-details) {
    .ant-table-thead {
      .ant-table-cell {
        padding: 10.5px 16px;
      }
    }
  }

  .trace-log-table {
    max-height: 80%;
  }

  .trace-log-table {
    .column-operation-type {
      padding: 3px 6px;
      border-radius: 4px;
      font-size: 14px;
    }

    .column-operation-type.update {
      color: #309c41;
      background-color: #def8e2;
    }

    .column-operation-type.insert {
      color: #3168ec;
      background-color: #ebf0ff;
    }
  }

  :deep(.ant-table-expanded-row .ant-table-bordered > .ant-table-container) {
    border-right: none !important;
  }
  :deep(
      .ant-table.ant-table-bordered
        > .ant-table-container
        > .ant-table-content
        > table
        > thead
        > tr
        > th:last-child
    ),
  :deep(
      .ant-table.ant-table-bordered
        > .ant-table-container
        > .ant-table-content
        > table
        > tbody
        > tr
        > td:last-child
    ) {
    border-right: none !important;
  }
  :deep(.ant-table-tbody .ant-table-row-level-1 td) {
    border-bottom: none !important;
  }
  .color-blue {
    color: #3168ec;
  }
  :deep(
      .ant-table-thead
        > tr
        > th:not(:last-child):not(.ant-table-selection-column):not(
          .ant-table-row-expand-icon-cell
        ):not([colspan])::before
    ) {
    width: 1px;
  }
  .col-table-border {
    border-right: 1px solid #e0e3ea;
  }
  .refresh-area {
    margin: 0 12px 12px;
    float: right;
  }
</style>
