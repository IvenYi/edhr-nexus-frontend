<template>
  <div :class="[ns.e('wrapper')]">
    <category-slider
      ref="categorySliderRef"
      :siderTitle="t('sys.kit.qms.expGroup')"
      @changeSelect="changeSelect"
    />
    <div :class="[ns.e('content')]">
      <div class="search-container">
        <a-form ref="formRef" name="advanced_search" class="search-form">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item name="reason_" :label="t('sys.kit.qms.outOfControlReason')">
                <a-input v-model:value="searchFormState.reason_" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="action_" :label="t('sys.kit.qms.outOfControlMeasure')">
                <a-input v-model:value="searchFormState.action_" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-button @click="handleResetSearch" class="mr-8px">
                {{ t('sys.reset') }}
              </a-button>
              <a-button type="primary" @click="handleSearch">
                {{ t('sys.query') }}
              </a-button>
            </a-col>
          </a-row>
        </a-form>
        <div class="right-area">
          <a-button type="primary" @click="showModal">
            {{ t('sys.new') }}
          </a-button>
        </div>
      </div>
      <a-table
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        size="small"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">{{ index + 1 }}</template>
          <template v-if="column.key === 'operation'">
            <div class="gct-table-actionItem">
              <a-button type="link" @click="showModal(record)">
                {{ t('sys.edit') }}
              </a-button>
              <a-divider type="vertical" />
              <a-button type="link" danger @click="handleDelete(record)">
                {{ t('sys.delete') }}
              </a-button>
            </div>
          </template>
        </template>
      </a-table>
    </div>
    <add-drawer ref="addDrawerRef" @refresh="getTableData" />
  </div>
</template>

<script setup lang="ts">
  import { onMounted, ref } from 'vue';
  import { message, Modal, FormInstance } from 'ant-design-vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { useNamespace } from '@gct/runtime';
  import { CategorySlider } from '../../components/category-slider';
  import {
    postBizServiceByModelKeyByBsKey,
    deleteBizServiceByModelKeyByBsKey,
  } from '/@/apis/gct-apaas/BsServiceController';
  import addDrawer from './add-drawer.vue';
  import { transformSourceData } from '/@page-designer/components/widgets/hooks/utils';

  const ns = useNamespace('historical-exp-lib-layout');
  const { t } = useI18n();

  const categoryId = ref('1');

  const pagination = ref({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showQuickJumper: false,
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const formRef = ref<FormInstance>();
  const searchFormState = ref({
    reason_: '',
    action_: '',
  });

  const columns = [
    {
      title: t('sys.index'),
      dataIndex: 'index',
      key: 'index',
      width: 80,
    },
    {
      title: t('sys.kit.qms.outOfControlReason'),
      dataIndex: 'reason_',
      key: 'reason_',
    },
    {
      title: t('sys.kit.qms.outOfControlMeasure'),
      dataIndex: 'action_',
      key: 'action_',
    },
    {
      title: t('sys.updatePerson'),
      dataIndex: 'modify_user_name_',
      key: 'modify_user_name_',
    },
    {
      title: t('sys.updateTime'),
      dataIndex: 'modify_time_',
      key: 'modify_time_',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'operation',
      key: 'operation',
      width: 160,
    },
  ];

  const tableData = ref<any[]>([]);
  const addDrawerRef = ref();

  const handleResetSearch = () => {
    formRef.value?.resetFields();
    searchFormState.value = {
      reason_: '',
      action_: '',
    };
    handleSearch();
  };

  const handleSearch = () => {
    pagination.value.current = 1;
    getTableData();
  };

  const changeSelect = (id) => {
    pagination.value.current = 1;
    categoryId.value = id;
    getTableData();
  };

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const getTableData = async () => {
    const res = await postBizServiceByModelKeyByBsKey(
      {
        modelKey: 'em_experience',
        bsKey: 'listByPage',
      },
      {},
      {
        pageSize: pagination.value.pageSize,
        pageNo: pagination.value.current,
        query: {
          'reason_.like': searchFormState.value.reason_,
          'action_.like': searchFormState.value.action_,
          experience_library_id_: categoryId.value === '1' ? '' : categoryId.value,
        },
      },
    );
    tableData.value = transformSourceData(res.data, res.dict).map((e) => {
      for (let k in e) {
        if (e[k] && e._DICT[k]) {
          const val = e._DICT[k][e[k]];
          e[k] = Array.isArray(val) ? val.join(';') : val;
        }
      }
      return e;
    });
    pagination.value.total = res?.totalCount ?? 0;
  };

  const showModal = (item?: any) => {
    addDrawerRef.value.open(categoryId.value, item);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      content: t('sys.sureToDo'),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      onOk() {
        deleteBizServiceByModelKeyByBsKey(
          {
            modelKey: 'em_experience',
            bsKey: 'removeByIds',
          },
          { ids: record.id_ },
        )
          .then(() => {
            message.success(t('sys.delSuccess'));
            pagination.value.current = 1;
            getTableData();
          })
          .catch((error) => {
            console.error(error);
          });
      },
      onCancel() {},
    });
  };

  onMounted(() => {
    getTableData();
  });
</script>
<style lang="scss" scoped>
  .right-area {
    display: flex;
    flex-direction: row-reverse;
    margin-bottom: 12px;
  }
  .screen-container {
    padding: 20px;
    overflow: auto;
    height: calc(100% - 70px);
  }

  .gct-historical-exp-lib-layout {
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
    }
  }

  .gct-table-actionItem {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;

    > .gct-vue3-dnd-container {
      gap: 0;
    }

    .ant-dropdown-trigger {
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }

    .ant-btn-link {
      padding: 0;
    }
  }
  :deep(th.ant-table-cell) {
    padding: 16px;
  }
</style>
