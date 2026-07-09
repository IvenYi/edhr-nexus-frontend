<template>
  <div class="table-wrap">
    <BasicTable
      :dataSource="tableData"
      :columns="columns"
      :pagination="pagination"
      :striped="false"
      :bordered="true"
      @change="handleTableChange"
    >
      <template #headerTop>
        <div class="flex justify-between">
          <a-input
            v-model:value="formData.keyWord"
            style="width: 240px"
            :placeholder="
              t('sys.pleaseInputSth', {
                sth: t('sys.widgetName'),
              })
            "
            @pressEnter="getTableData()"
          >
            <template #suffix>
              <SearchOutlined @click="getTableData()" />
            </template>
          </a-input>
          <a-button class="mr-16px" type="primary" @click="handleAdd">
            <template #icon>
              <plus-outlined />
            </template>
            {{ t('sys.new') }}
          </a-button>
        </div>
      </template>
      <template
        #customFilterDropdown="{
          setSelectedKeys,
          selectedKeys,
          confirm,
          filtered,
          clearFilters,
          column,
        }"
      >
        <template v-if="column.key === 'name' || column.key === 'key'">
          <div class="bg-[#fffff] p16px pl8px pr8px">
            <a-input
              ref="searchInput"
              :placeholder="
                t('sys.inputTextTip', {
                  name: column.key === 'name' ? t('sys.widgetName') : t('sys.portal.comp') + 'KEY',
                })
              "
              v-model:value="formData[column.key]"
              style="width: 150px"
              @pressEnter="onFilter(formData[column.key], confirm, column.key, setSelectedKeys)"
              @blur="onFilter(formData[column.key], confirm, column.key, setSelectedKeys)"
            />
          </div>
        </template>
        <template v-if="column.key === 'client' || column.key === 'tag'">
          <div class="bg-[#fffff] p16px pl8px pr8px">
            <div class="flex items-center">
              <a-select
                v-model:value="formData[column.key]"
                :options="selectOptions[column.key]"
                mode="multiple"
                ref="selectRef"
                style="width: 150px"
                :placeholder="
                  t('sys.chooseTextTip', {
                    name:
                      column.key === 'client'
                        ? t('sys.developer.appCenter.client')
                        : t('sys.developer.identifier'),
                  })
                "
                @deselect="onDeselect"
                @blur="onFilter(formData[column.key], confirm, column.key, setSelectedKeys)"
              />
              <!-- <search-outlined
                @click="onFilter(formData[column.key], confirm, column.key, setSelectedKeys)"
              /> -->
            </div>
          </div>
        </template>
      </template>

      <template #bodyCell="{ column, record, index }">
        <template v-if="column.key === 'name'">
          <a @click="toDetail(record)">{{ record.name }}</a>
        </template>
        <template v-if="column.key === 'tag'">
          <a-tag v-if="record.tag.includes('common')" :bordered="false" color="blue">
            {{ t('sys.org.common') }}
          </a-tag>
          <a-tag v-if="record.tag.includes('eDHR')" :bordered="false" color="magenta">
            {{ 'eDHR' + t('sys.org.kit') }}
          </a-tag>
          <a-tag v-if="record.tag.includes('MEDPRO')" :bordered="false" color="volcano">
            {{ 'MedPro' + t('sys.org.kit') }}
          </a-tag>
        </template>
        <template v-if="column.key === 'client'">
          <a-tag
            v-if="record.client && record.client.includes('WEB')"
            :bordered="false"
            color="volcano"
          >
            WEB
          </a-tag>
          <a-tag
            v-if="record.client && record.client.includes('MOBILE')"
            :bordered="false"
            color="processing"
          >
            MOBILE
          </a-tag>
        </template>
        <template v-if="column.key === 'action'">
          <table-action-auto
            :actions="[
              {
                label: t('sys.edit'),
                onClick: () => handleRowEdit(record),
              },
              {
                label: t('sys.delete'),
                color: 'text',
                popConfirm: {
                  title: t('sys.confirmExecution'),
                  confirm: () => handleRowDelete(record),
                },
              },
            ]"
            :stopButtonPropagation="true"
          />
        </template>
      </template>
    </BasicTable>
    <create-comp @register="register" @ok="() => getTableData(1)" />
    <comp-detail @ok="() => getTableData()" ref="detailRef" :compId="compId" />
    <edit-comp @register="registerEdit" @ok="() => getTableData()" />
  </div>
</template>
<script setup lang="ts" name="custom-table">
  import { ref, reactive, onMounted, createVNode, h, watch } from 'vue';
  import { BasicTable, TableActionAuto, BasicColumn } from '/@/components/Table';
  import { useI18n } from 'vue-i18n';
  import CreateComp from '../modal/create-comp.vue';
  import CompDetail from '../modal/comp-detail.vue';
  import EditComp from '../modal/edit-comp.vue';
  import { message } from 'ant-design-vue';
  import { useModal } from '/@/components/Modal';
  import { postPluginPageList, deletePlugin } from '/@/apis/gct-platform/PluginController';

  const props = defineProps<{
    catagroy: string;
  }>();

  const { t } = useI18n();
  const selectRef = ref();
  const [register, { openModal }] = useModal();
  const [registerEdit, { openModal: openModalEdit }] = useModal();

  const loading = ref<boolean>(false);

  const options = ref([]);

  const compId = ref({});

  const selectOptions = {
    client: [
      {
        value: 'WEB',
        label: 'WEB',
      },
      {
        value: 'MOBILE',
        label: 'MOBILE',
      },
    ],
    tag: [
      {
        value: 'common',
        label: t('sys.org.common'),
      },
      {
        value: 'eDHR',
        label: 'eDHR' + t('sys.org.kit'),
      },
      {
        value: 'MEDPRO',
        label: 'MedPro' + t('sys.org.kit'),
      },
    ],
  };

  watch(
    props,
    (val) => {
      if (val) {
        formData.value.categoryId = val.catagroy;
        getTableData(1);
      }
    },
    { deep: true },
  );

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const tableData = ref([]);

  const detailRef = ref();

  const formData = ref({
    keyWord: '',
    key: '',
    name: '',
    tag: [],
    client: [],
    categoryId: '',
  });

  const getTableData = (current?) => {
    loading.value = true;
    postPluginPageList({
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      ...formData.value,
      tag: formData.value.tag.join(','),
      client: formData.value.client.join(','),
    })
      .then((result) => {
        console.log('result', result.totalCount, result.data);
        pagination.total = result?.totalCount ?? 0;
        if (result && result.data) {
          tableData.value = result.data;
        }
      })
      .finally(() => {
        loading.value = false;
      });
  };

  const columns: BasicColumn[] = [
    {
      title: t('sys.widgetName'),
      dataIndex: 'name',
      fixed: 'left',
      customFilterDropdown: true,
    },
    {
      title: t('sys.portal.comp') + 'KEY',
      dataIndex: 'key',
      customFilterDropdown: true,
    },
    {
      title: t('sys.app.version.no'),
      dataIndex: 'version',
    },
    {
      title: t('sys.developer.appCenter.client'),
      dataIndex: 'client',
      customFilterDropdown: true,
    },
    {
      title: t('sys.developer.identifier'),
      dataIndex: 'tag',
      customFilterDropdown: true,
    },
    {
      title: t('sys.developer.versionTip'),
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: t('sys.creator'),
      dataIndex: 'createUserName',
    },
    {
      title: t('sys.createTime'),
      dataIndex: 'createTime',
      minWidth: 170,
      width: 170,
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
    },
  ];

  const handleAdd = () => {
    openModal(true, {
      categoryId: formData.value.categoryId,
    });
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const onFilter = (value, confirm, key, setSelectedKeys) => {
    setSelectedKeys(value ? (Array.isArray(value) ? value : [value]) : '');
    formData.value[key] = value;
    getTableData(1);
    confirm();
  };

  const onDeselect = () => {
    selectRef.value.focus();
    // setSelectedKeys(value ? (Array.isArray(value) ? value : [value]) : '');
    // formData.value[key] = value;
    // getTableData(1);
  };

  const onSearch = (searchText, column) => {
    const params = {
      pageNo: 1,
      pageSize: 9999,
      ...formData.value,
      tag: formData.value.tag.join(','),
      client: formData.value.client.join(','),
    };
    params[column] = searchText;

    postPluginPageList(params).then((res) => {
      options.value =
        res.data.map((i) => {
          return {
            label: i[column],
            value: i[column],
          };
        }) || [];
    });
  };

  /** 删除行数据 */
  const handleRowDelete = (record) => {
    deletePlugin({ ids: record.id }).then(() => {
      message.success(t('sys.deleteSuccess'));
      getTableData();
    });
  };

  /** 编辑行数据 */
  const handleRowEdit = (record) => {
    openModalEdit(true, {
      ...record,
    });
  };

  /** 打开详情页 */
  const toDetail = (record) => {
    compId.value = { id: record.id, version: record.version };
    detailRef.value.open = true;
  };

  // onMounted(getTableData);
</script>
<style lang="less" scoped>
  .table-wrap {
    width: calc(100% - 246px);
    padding: 16px;
  }
  :deep(.ant-drawer-title) {
    text-align: center;
  }
  .vben-basic-table .ant-table-cell .ant-tag {
    margin-right: 4px;
  }
</style>
