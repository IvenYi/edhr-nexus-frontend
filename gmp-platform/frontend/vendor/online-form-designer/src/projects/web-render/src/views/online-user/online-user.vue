<template>
  <basic-page-render>
    <a-tabs v-if="tabList.length" v-model:activeKey="activeKey" @change="changeTab">
      <a-tab-pane
        v-for="item in tabList"
        :key="item.key"
        :tab="`${item.name} ${item.key === 'shared' ? sharedTotal : licenseTotal}`"
      >
        <div class="online-user-container">
          <a-form ref="formRef" :model="formState" autocomplete="off">
            <a-row :gutter="24">
              <a-col :span="6">
                <a-form-item name="username" :label="t('sys.userName')">
                  <a-input v-model:value="formState.username" :placeholder="t('sys.inputText')" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item name="fullname" :label="t('sys.fullname')">
                  <a-input v-model:value="formState.fullname" :placeholder="t('sys.inputText')" />
                </a-form-item>
              </a-col>
              <a-col :span="6">
                <a-form-item name="clientType" :label="t('sys.clientType')">
                  <a-select
                    v-model:value="formState.clientType"
                    :placeholder="t('sys.chooseText')"
                    allowClear
                  >
                    <a-select-option value="web"> PC </a-select-option>
                    <a-select-option value="mobile">MOBILE</a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>

              <a-col :span="6" style="text-align: right">
                <a-button @click="changeTab">
                  <template #icon>
                    <undo-outlined />
                  </template>
                  {{ t('sys.reset') }}
                </a-button>
                <a-button style="margin: 0 8px" type="primary" @click="handleSearch">
                  <template #icon>
                    <search-outlined />
                  </template>
                  {{ t('sys.queryText') }}
                </a-button>
              </a-col>
            </a-row>
          </a-form>
          <div class="table-wrap h-100px flex-1 mt-14px">
            <BasicTable
              :dataSource="tableData"
              :columns="filterColumn"
              :showIndexColumn="false"
              :pagination="pagination"
              :striped="false"
              :bordered="true"
              @change="handleTableChange"
            >
              <template #bodyCell="{ column, record, index }">
                <template v-if="column.key === 'index'">
                  <div>{{ getPageIndex(index) }}</div>
                </template>
                <template v-if="column.key === 'clientType'">
                  <div>
                    {{
                      record[column.key]?.toUpperCase() === 'MOBILE'
                        ? record[column.key]?.toUpperCase()
                        : 'PC'
                    }}
                  </div>
                </template>
                <template v-if="column.key === 'action'">
                  <table-action-auto
                    v-if="
                      (fingerprint !== record.browserTag ||
                        (userStore?.userInfo?.username &&
                          userStore?.userInfo?.username !== record.username)) &&
                      ['test', 'prod', 'sbx'].includes(env) &&
                      ((isShared && activeKey === 'shared') ||
                        (!isShared && activeKey === 'license')) &&
                      record.tenantId === userStore.tenantId
                    "
                    :actions="[
                      {
                        label: t('sys.kickOutApp'),
                        color: 'error',
                        onClick: handleKickOut.bind(null, record),
                      },
                    ]"
                    :stopButtonPropagation="true"
                  />
                </template>
              </template>
            </BasicTable>
          </div>
        </div>
      </a-tab-pane>
    </a-tabs>
    <div v-else class="online-user-container">
      <a-form ref="formRef" :model="formState" autocomplete="off">
        <a-row :gutter="24">
          <a-col :span="6">
            <a-form-item name="username" :label="t('sys.userName')">
              <a-input v-model:value="formState.username" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="fullname" :label="t('sys.fullname')">
              <a-input v-model:value="formState.fullname" :placeholder="t('sys.inputText')" />
            </a-form-item>
          </a-col>
          <a-col :span="6">
            <a-form-item name="clientType" :label="t('sys.clientType')">
              <a-select
                v-model:value="formState.clientType"
                :placeholder="t('sys.chooseText')"
                allowClear
              >
                <a-select-option value="web"> PC </a-select-option>
                <a-select-option value="mobile">MOBILE</a-select-option>
              </a-select>
            </a-form-item>
          </a-col>

          <a-col :span="6" style="text-align: right">
            <a-button @click="changeTab" class="">
              <template #icon>
                <undo-outlined />
              </template>
              {{ t('sys.reset') }}
            </a-button>
            <a-button style="margin: 0 8px" type="primary" @click="handleSearch">
              <template #icon>
                <search-outlined />
              </template>
              {{ t('sys.queryText') }}
            </a-button>
          </a-col>
        </a-row>
      </a-form>
      <div class="table-wrap h-100px flex-1 mt-14px">
        <BasicTable
          :dataSource="tableData"
          :columns="filterColumn"
          :showIndexColumn="false"
          :pagination="pagination"
          :striped="false"
          :bordered="true"
          @change="handleTableChange"
        >
          <template #bodyCell="{ column, record, index }">
            <template v-if="column.key === 'index'">
              <div>{{ getPageIndex(index) }}</div>
            </template>
            <template v-if="column.key === 'clientType'">
              <div>
                {{
                  record[column.key]?.toUpperCase() === 'MOBILE'
                    ? record[column.key]?.toUpperCase()
                    : 'PC'
                }}
              </div>
            </template>
            <template v-if="column.key === 'action'">
              <table-action-auto
                v-if="
                  (fingerprint !== record.browserTag ||
                    (userStore?.userInfo?.username &&
                      userStore?.userInfo?.username !== record.username)) &&
                  ['test', 'prod', 'sbx'].includes(env)
                "
                :actions="[
                  {
                    label: t('sys.kickOutApp'),
                    color: 'error',
                    onClick: handleKickOut.bind(null, record),
                  },
                ]"
                :stopButtonPropagation="true"
              />
            </template>
          </template>
        </BasicTable>
      </div>
    </div>
  </basic-page-render>
</template>

<script setup lang="ts">
  import { ref, reactive, onMounted, createVNode, computed } from 'vue';
  import type { FormInstance } from 'ant-design-vue';
  import { SearchOutlined, UndoOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue';
  import { useI18n } from 'vue-i18n';
  import { BasicTable, TableActionAuto } from '/@/components/Table';
  import { getOnlineExit, getOnlinePageList } from '/@/apis/gct-apaas/OnlineUsersController';
  import { getBrowserFingerprint } from '/@/hooks/event/userBrowser';
  import { message, Modal } from 'ant-design-vue';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { useUserStore } from '/@/store/modules/user';
  import { getLicenseShareTag, getLicenseSourceTag } from '/@/apis/gct-platform/LicenseController';
  import { usePathQueryStore } from '/@/store/modules/pathQuery';

  type ColumType = {
    title: string;
    dataIndex: string;
  };

  const { t } = useI18n();
  const { getEnv } = useEnv();
  const userStore = useUserStore();
  const usePathQuery = usePathQueryStore();
  const env = getEnv();
  const fingerprint = ref();

  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const formState = reactive({
    username: undefined,
    fullname: undefined,
    clientType: undefined,
  });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
  });

  const loading = ref<boolean>(false);

  const tableData = ref([]);

  const isShared = ref(false);

  const activeKey = ref('license');

  const sharedTotal = ref(0);

  const licenseTotal = ref(0);

  const columns: ColumType[] = [
    {
      title: t('sys.pageDesigner.index'),
      dataIndex: 'index',
      width: 72,
    },
    {
      title: t('sys.userName'),
      dataIndex: 'username',
    },
    {
      title: t('sys.fullname'),
      dataIndex: 'fullname',
    },
    {
      title: t('sys.model.tenant'),
      dataIndex: 'tenantName',
    },
    {
      title: t('sys.clientType'),
      dataIndex: 'clientType',
    },
    {
      title: t('sys.ipAddress'),
      dataIndex: 'ip',
    },
    {
      title: t('sys.browserTag'),
      dataIndex: 'browserTag',
      width: 330,
    },
    {
      title: t('sys.lastLoginTime'),
      dataIndex: 'connectedTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      fixed: 'right',
      width: 120,
      align: 'left',
    },
  ];

  const tabList = ref<any>([]);
  const filterColumn = computed(() => {
    return activeKey.value === 'license'
      ? columns.filter((i) => i.dataIndex !== 'tenantName')
      : columns;
  });

  const changeTab = () => {
    formState.username = undefined;
    formState.fullname = undefined;
    formState.clientType = undefined;
    getTableData(formState, 1);
  };
  /** 判断是否是被共享应用 */
  const judgeShared = () => {
    getLicenseShareTag({ appId: usePathQuery.getAid() }).then((res) => {
      isShared.value = res || false;
      if (res) {
        tabList.value = [
          {
            name: '共享用户',
            key: 'shared',
          },
          {
            name: '授权用户',
            key: 'license',
          },
        ];
        activeKey.value = 'shared';
      } else {
        // 如果不是被共享应用要判断是否为授权应用，授权应用需要显示tab，非授权应用不需要显示tab
        getLicenseSourceTag({ appId: usePathQuery.getAid() }).then((result) => {
          if (result) {
            tabList.value = [
              {
                name: '授权用户',
                key: 'license',
              },
              {
                name: '共享用户',
                key: 'shared',
              },
            ];
          }
        });
      }
    });
  };
  const getLicenseList = async (params?, current?) => {
    loading.value = true;
    const result = await getOnlinePageList({
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      ...params,
      userAuthType: 0,
    });
    loading.value = false;

    if (result && result.data) {
      pagination.total = result.totalCount;
      tableData.value = result.data;
      licenseTotal.value = result.totalCount;
    }
  };

  const getSharedList = async (params?, current?) => {
    loading.value = true;
    const result = await getOnlinePageList({
      pageNo: current ?? pagination.current,
      pageSize: pagination.pageSize,
      ...params,
      userAuthType: 1,
    });
    loading.value = false;

    if (result && result.data) {
      pagination.total = result.totalCount;
      tableData.value = result.data;
      sharedTotal.value = result.totalCount;
    }
  };
  const getTableData = (params?, current?) => {
    if (activeKey.value === 'shared') {
      getSharedList(params, current);
    } else {
      getLicenseList(params, current);
    }
  };

  const getPageIndex = (index) => {
    const { current, pageSize } = pagination;
    return pageSize * (current - 1) + index + 1;
  };

  onMounted(async () => {
    fingerprint.value = await getBrowserFingerprint();
    await judgeShared();
    await getSharedList();
    await getLicenseList();

    await getTableData();
  });

  const handleSearch = () => {
    getTableData(formState, 1);
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData(formState);
  };

  const handleKickOut = async (record) => {
    Modal.confirm({
      title: t('sys.sureTOKickOutAppTitle'),
      content: t('sys.sureTOKickOutAppTip'),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        await getOnlineExit({
          clientId: record.clientId,
        });
        message.success(t('sys.doSuccess'));
        getTableData();
      },
      onCancel() {},
    });
  };
</script>

<style lang="less" scoped>
  .online-user-container {
    padding: 16px;
  }

  :deep(.ant-tabs-nav-wrap) {
    padding-left: 16px;
  }

  :deep(.ant-tabs) {
    height: 100%;
  }

  :deep(.ant-form) {
    padding: 12px 0 0;
    border-radius: 4px;
    background: #fafafb;
  }

  :deep(.ant-row) {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }

  :deep(.ant-tabs-top > .ant-tabs-nav) {
    margin: 0;
  }
</style>
