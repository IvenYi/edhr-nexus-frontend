<template>
  <basic-page-render>
    <div class="p16px h100%" v-show="!isPreview">
      <div
        class="table-wrap empty"
        v-if="
          tableData &&
          !tableData.length &&
          !loading &&
          !formData.name &&
          !formData.modelKey &&
          !selectKey
        "
      >
        <van-empty :image="emptyPng">
          <template #description>
            <div class="main-desc">还没有创建任何卡片</div>
            <div class="sub-desc">您可以立即开始创建</div>
          </template>
        </van-empty>
        <a-button class="mr-16px" type="primary" @click="createOrEditDataSet()">
          <i class="gct-iconfont icon-a-btn_add2"></i> {{ t('sys.model.newInfoCard') }}
        </a-button>
      </div>
      <BasicTable
        v-else
        :dataSource="tableData"
        :columns="columns"
        :striped="false"
        :pagination="pagination"
        @change="handleTableChange"
      >
        <template #headerTop>
          <div class="flex">
            <a-input
              v-model:value="formData.name"
              style="width: 240px"
              placeholder="搜索卡片名称"
              @pressEnter="getTableData()"
            >
              <template #suffix>
                <SearchOutlined @click="getTableData()" />
              </template>
            </a-input>
            <a-button style="margin-left: auto" type="primary" @click="createOrEditDataSet()">
              <i class="gct-iconfont icon-a-btn_add2"></i> {{ t('sys.model.newInfoCard') }}
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
            visible,
          }"
        >
          <template v-if="column.key === 'modelName'">
            <div class="bg-[#fffff] p16px">
              <div class="flex justify-between">
                <div class="title"> 筛选 </div>
                <a
                  v-if="formData.modelKey && formData.modelKey.length"
                  class="title"
                  @click="clear"
                >
                  清除筛选
                </a>
              </div>
              <div class="flex items-center mb24px mt8px">
                <a-select
                  v-model:value="formData.modelKey"
                  ref="selectRef"
                  style="width: 150px"
                  allowClear
                  showSearch
                  :placeholder="t('sys.chooseTextTip')"
                  @deselect="onDeselect"
                  :filter-option="filterOption"
                >
                  <!-- @blur="onFilter(formData[column.key], confirm, setSelectedKeys)" -->

                  <a-select-opt-group v-for="(models, idx) in moduleOptions" :key="idx">
                    <template #label>
                      <span :title="models.name">
                        {{ models.name }}
                      </span>
                    </template>
                    <a-select-option
                      :key="model.key"
                      v-for="model in models.children"
                      :value="model.key"
                      :name="model.name"
                      :type="model.type"
                      :subModel="model.subModel"
                      :category="model.category"
                      :title="model.name"
                      :supportProcess="model.supportProcess"
                      >{{ model.name }}</a-select-option
                    >
                  </a-select-opt-group>
                </a-select>
              </div>
              <div class="flex justify-end">
                <a-button size="small" @click="cancel(confirm, selectedKeys)"> 取消</a-button>
                <a-button
                  type="primary"
                  size="small"
                  class="ml8px"
                  @click="confirmSelect(formData.modelKey, confirm, setSelectedKeys)"
                >
                  确认</a-button
                >
              </div>
            </div>
          </template>
        </template>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'name'">
            <a @click="createOrEditDataSet(record)">
              {{ record.name }}
            </a>
          </template>
          <template v-else-if="column.key === 'action'">
            <table-action-auto
              :actions="[
                {
                  label: t('sys.edit'),

                  onClick: createOrEditDataSet.bind(null, record),
                },

                {
                  label: t('sys.delete'),
                  color: 'text',

                  popConfirm: {
                    title: t('sys.confirmExecution'),
                    confirm: handleRowDelete.bind(null, record),
                  },
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
          <template v-else-if="column.key === 'description'">
            {{ record[column.key] || '--' }}
          </template>
        </template>
      </BasicTable>
    </div>
    <ReportDataSetPreview
      v-if="isPreview"
      :key="previewRow.id"
      :id="previewRow.id"
      @back="previewBack"
    />
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, reactive, computed } from 'vue';
  import { useI18n } from 'vue-i18n';
  import { openCardDesign } from '@gct/runtime-web-next';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { message, SelectProps } from 'ant-design-vue';
  import emptyPng from '/@/assets/svg/pic_nocard.svg';

  import {
    deleteCommonInfoCard,
    postCommonInfoCardPageList,
  } from '/@/apis/gct-apaas/CommonInfoCardController';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';

  const { t } = useI18n();
  const loading = ref(false);
  const tableData = ref([]);
  // 是否正在预览
  const isPreview = ref(false);
  // 当前预览的数据
  const previewRow = ref({});
  const moduleOptions = ref<SelectProps['options']>([]);
  const selectKey = ref([]);

  const selectRef = ref();
  // const userActions = computed(() => {
  //   const page = 'ReportDataSet';
  //   return {
  //     Create: !!getPermissionByKey(page, 'Create'),
  //     Update: !!getPermissionByKey(page, 'Update'),
  //     Delete: !!getPermissionByKey(page, 'Delete'),
  //   };
  // });

  const formData = reactive({
    type: 'CARD',
    name: '',
    modelKey: undefined,
  });

  const columns = [
    {
      title: t('sys.pageDesigner.card') + t('sys.pageDesigner.name'),
      key: 'name',
      dataIndex: 'name',
      width: 200,
      fixed: 'left',
    },
    {
      title: t('sys.pageDesigner.model'),
      key: 'modelName',
      dataIndex: 'modelName',
      customFilterDropdown: true,
      onFilterDropdownVisibleChange: (visible, setSelectedKeys) => {
        if (!visible) {
          formData.modelKey = selectKey.value;
        } else {
          selectKey.value = formData.modelKey;
        }
      },
    },
    {
      title: t('sys.description'),
      key: 'description',
      dataIndex: 'description',
    },

    {
      title: t('sys.creator'),
      key: 'createUserName',
      dataIndex: 'createUserName',
    },
    {
      title: t('sys.createTime'),
      key: 'createTime',
      dataIndex: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.modifier'),
      key: 'modifyUserName',
      dataIndex: 'modifyUserName',
    },
    {
      title: t('sys.modifyTime'),
      key: 'modifyTime',
      dataIndex: 'modifyTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      width: 150,
      fixed: 'right',
    },
  ];

  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  const handleTableChange = (paginationInfo, filters) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const getTableData = () => {
    loading.value = true;

    const params = {
      type: formData.type,
      modelKey:
        formData.modelKey && Array.isArray(formData.modelKey)
          ? formData.modelKey.join(',')
          : formData.modelKey || '',
      name: formData.name,
      pageNo: pagination.current,
      pageSize: pagination.pageSize,
    };
    postCommonInfoCardPageList(params)
      .then((res) => {
        pagination.current = res?.pageNo;
        pagination.total = res?.totalCount;
        tableData.value = res?.data ?? [];
      })
      .finally(() => {
        loading.value = false;
      });
  };

  /** 获取模型选项 */
  const getModel = () => {
    getCategoryListComplete({ module: 'entity_module' }).then((res) => {
      moduleOptions.value = res.filter((e) => {
        return e.children && e.children.length;
      });
    });
  };

  const onFilter = (value, confirm, setSelectedKeys) => {
    setSelectedKeys(value ? (Array.isArray(value) ? value : [value]) : '');
    formData.modelKey = value;
    getTableData();
    confirm();
  };

  const filterOption = (input: string, option: any) => {
    if (!option.label) {
      return option.name.includes(input) || option.value.includes(input);
    }
    return false;
  };

  const onDeselect = () => {
    selectRef.value.focus();
    // setSelectedKeys(value ? (Array.isArray(value) ? value : [value]) : '');
    // formData.value[key] = value;
    // getTableData(1);
  };

  /** 删除行数据 */
  const handleRowDelete = (record) => {
    deleteCommonInfoCard({ ids: record.id }).then(() => {
      message.success(t('sys.deleteSuccess'));
      getTableData();
    });
  };

  /** 新建数据集 */
  const createOrEditDataSet = async (record) => {
    // 打开设计器
    const res = await openCardDesign(record ? record.id : '', {
      isEdit: !!record,
    });

    getTableData();
  };

  function onInit(): void {
    getTableData();
    getModel();
    // 打开设计器
    // openCardDesign('');
  }

  const clear = () => {
    formData.modelKey = [];
  };

  const cancel = (confirm, selectedKeys) => {
    confirm();
    formData.modelKey = selectedKeys;
  };

  const confirmSelect = (value, confirm, setSelectedKeys) => {
    setSelectedKeys(value ? (Array.isArray(value) ? value : [value]) : []);
    formData.modelKey = value || [];
    selectKey.value = value;
    getTableData();
    confirm();
  };

  onInit();
</script>
<style lang="scss" scoped>
  .table-wrap {
    padding: 16px;
    overflow: hidden;
    width: 100%;
    height: 100%;
  }
  .empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  :deep(.van-empty__description) {
    margin-top: 4px;
    color: #8f8f8f;
  }
  :deep(.van-empty__image) {
    width: 200px;
    height: 128px;
  }
  .main-desc {
    font-weight: 500;
    font-size: 18px;
    color: #1a1d23;
    text-align: center;
    margin-bottom: 8px;
  }
  .sub-desc {
    font-size: 14px;
    color: #5a5f6b;
    text-align: center;
  }
  .gct-iconfont {
    font-size: 14px;
    margin-right: 4px;
  }
</style>
