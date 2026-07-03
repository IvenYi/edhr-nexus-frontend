<template>
  <basic-modal
    v-bind="$attrs"
    @register="registerInner"
    :min-height="40"
    :title="t('sys.i18n.i18nConfig')"
    centered
    width="640px"
    :canFullscreen="false"
    :maskClosable="false"
    :afterClose="handleClose"
    @ok="handleOk"
    :getContainer="getContainer"
  >
    <div class="i18n-select-container">
      <a-form ref="formRef" :model="formState" autocomplete="off" layout="horizontal">
        <a-row>
          <a-col :span="12">
            <a-form-item name="keywords" :label="t('sys.keywords')">
              <a-input
                v-model:value="formState.keywords"
                :placeholder="t('sys.keywordsPlaceholder')"
                style="display: inline-flex"
              />
            </a-form-item>
          </a-col>
          <a-col :span="12" style="text-align: right">
            <a-button type="primary" @click="handleSearch">
              <template #icon>
                <search-outlined />
              </template>
              {{ t('sys.queryText') }}
            </a-button>
            <a-button style="margin: 0 8px" type="primary" @click="handleAddI18n">
              <template #icon>
                <plus-outlined />
              </template>
              {{ t('sys.new') }}
            </a-button>
            <!-- <a-form-item label="">
            </a-form-item> -->
          </a-col>
        </a-row>
      </a-form>
      <div class="table-wrap">
        <a-table
          ref="tableRef"
          :dataSource="tableData"
          :columns="columns"
          :showIndexColumn="false"
          :pagination="pagination"
          :striped="false"
          :bordered="true"
          @change="handleTableChange"
          :rowSelection="rowSelection"
          :loading="loading"
        />
        <i18n-modal
          :lang="columns"
          :getContainer="getContainer"
          @register="userRegister"
          @ok="handleModalOk"
        />
      </div>
    </div>
  </basic-modal>
</template>

<script setup lang="ts" name="i18n-select-container">
  import { ref, reactive, computed, onMounted } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { BasicModal, useModalInner, useModal } from '/@/components/Modal';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { SearchOutlined } from '@ant-design/icons-vue';
  import { useLocaleStoreWithOut } from '/@/store/modules/locale';
  import type { TableRowSelection } from 'ant-design-vue/lib/table/interface';
  import {
    getI18nInfoPageList,
    putI18nInfoByKey,
    postI18nInfo,
  } from '/@/apis/gct-apaas/I18nInfoController';
  import I18nModal from './i18n-modal.vue';

  export interface Prop {
    i18nModalKey?: string;
    destroyCallback?: () => void;
    saveCallback?: (params: Recordable<any>) => void;
  }

  interface I18nTableType {
    key: string;
    type: string;
    [key: string]: string;
  }

  const { t } = useI18n();
  const [registerInner, { closeModal }] = useModalInner();
  const [userRegister, { openModal }] = useModal();
  const { getEnableLocaleList, getLocale } = useLocaleStoreWithOut();

  const props = defineProps<Prop>();
  const getContainer = () => document.querySelector(`#${props.i18nModalKey}`);

  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const formState = reactive({ keywords: '' });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 5,
    total: 0,
    size: 'small',
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const tableData = ref<I18nTableType[]>([]);
  const tableRef = ref<any>(null);

  const selectRows = ref();

  const rowSelection = ref<TableRowSelection>({
    type: 'radio',
    hideSelectAll: true,
    selectedRowKeys: [],
    onChange: handleRowChange,
  });

  const loading = ref<boolean>(false);

  const columns = computed(() => {
    return getEnableLocaleList.map((item) => {
      return {
        title: item.language,
        dataIndex: item.languageTag,
      };
    });
  });

  const getTableData = async (keyword?, current?) => {
    loading.value = true;
    const result = await getI18nInfoPageList({
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      searchKey: keyword,
    });
    loading.value = false;
    if (result && result.data) {
      const rows = result.data.map((item: any) => {
        const infos = JSON.parse(item?.info);
        return {
          key: item.key,
          type: item.type,
          ...Object.fromEntries(infos.map((i) => [i.locale, i.info])),
        };
      });
      pagination.current = result.pageNo;
      pagination.total = result.totalCount;
      tableData.value = rows;
    }
  };

  onMounted(getTableData);

  const handleSearch = () => {
    formRef.value?.validate().then(async () => {
      // 发送网络请求获取数据
      await getTableData(formState.keywords, 1);
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData(formState.keywords);
  };

  const handleAddI18n = () => {
    openModal();
  };

  const handleModalOk = async (data, isEdit) => {
    const langInfos = columns.value.map((item) => {
      return {
        locale: item.dataIndex,
        info: data[item.dataIndex],
      };
    });
    loading.value = true;
    try {
      if (isEdit) {
        await putI18nInfoByKey({ key: data.id }, { info: JSON.stringify(langInfos) });
      } else {
        await postI18nInfo({ info: JSON.stringify(langInfos), key: data.id });
      }
      getTableData();
      handleRowChange([data.id], [reactive(data)]);
    } catch (error) {
      loading.value = false;
    }
  };

  function handleRowChange(selectedRowKeys, selectedRows) {
    rowSelection.value.selectedRowKeys = selectedRowKeys;
    selectRows.value = selectedRows;
  }

  const handleClose = () => {
    if (props.destroyCallback && typeof props.destroyCallback === 'function') {
      props.destroyCallback();
    }
  };

  const handleOk = async () => {
    if (props.saveCallback && typeof props.saveCallback === 'function') {
      const selectRowKey = rowSelection.value.selectedRowKeys;
      const params = {};
      if (selectRowKey && selectRowKey[0]) {
        const selectRow = selectRows.value?.[0];
        Object.assign(params, {
          i18nKey: selectRowKey[0],
          i18nTitle: selectRow[getLocale],
        });
      }
      props.saveCallback(params);
    }
    closeModal();
  };
</script>

<style lang="less" scoped>
  .i18n-select-container {
    padding: 4px;
  }

  :deep(.ant-form-horizontal .ant-form-item) {
    flex-direction: row;
  }
</style>
