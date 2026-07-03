<template>
  <div :class="[ns.e('wrapper')]">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="8" v-if="props.platform === 'TENANT'">
          <a-form-item :label="t('sys.app.index')" name="appId">
            <a-select
              allow-clear
              v-model:value="formState.appId"
              :placeholder="t('sys.chooseText')"
            >
              <a-select-option :value="item.value" v-for="item in tenantOptions" :key="item.value">
                {{ t(item.label) }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('sys.pageDesigner.eventType')" name="eventType">
            <a-select
              allow-clear
              v-model:value="formState.eventType"
              :placeholder="t('sys.chooseText')"
            >
              <a-select-option :value="item.value" v-for="item in eventOptions" :key="item.value">
                {{ t(item.label) }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>

        <a-col :span="8" v-if="props.platform">
          <a-form-item :label="t('sys.appDesigner.operatePerson')" name="createUserId">
            <a-select
              allow-clear
              v-model:value="formState.createUserId"
              option-label-prop="fullname"
              :options="userOptions"
              show-search
              optionFilterProp="fullname"
              :placeholder="t('sys.chooseText')"
              @change="handleUserChange"
            >
              <template #option="option">
                <div class="p8x flex items-center user-options-box">
                  <cropper-avatar
                    :uploadApi="uploadApi"
                    :value="option.avatar"
                    :showBtn="false"
                    width="30"
                    :class="['mr-8px', { 'is-readonly': true }]"
                  />
                  <div
                    class="flex user-options-name justify-between"
                    style="width: calc(100% - 38px)"
                  >
                    <div class="flex flex-1 justify-between truncate">
                      <span class="fullname mr-8px">{{ option.fullname }}</span>
                      <span calss="username text-[#888888]">
                        {{ option.username }}
                      </span>
                    </div>
                    <span class="disabled-tag ml-8px" v-if="!option.enabled">
                      {{ t('sys.disabled') }}
                    </span>
                  </div>
                </div>
              </template>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('sys.appDesigner.operateTime')" name="dataTime">
            <a-range-picker
              style="width: 100%"
              @change="handleDateChange"
              v-model:value="dataTime"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              :placeholder="[t('sys.startTime'), t('sys.endTime')]"
              :allowClear="false"
            />
          </a-form-item>
        </a-col>
        <a-col
          :span="5"
          :offset="props.platform ? (props.platform === 'TENANT' ? 11 : 19) : 3"
          class="text-right mb-12px"
        >
          <a-button class="mr-10px" @click="handlereset">
            <template #icon>
              <undo-outlined />
            </template>
            {{ t('sys.reset') }}
          </a-button>
          <a-button type="primary" @click="() => getTableData(1)">
            <template #icon>
              <search-outlined />
            </template>
            {{ t('sys.query') }}
          </a-button>
        </a-col>
      </a-row>
    </a-form>
    <div class="table-wrap">
      <BasicTable
        :dataSource="tableData"
        :columns="columnOptions"
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
          <template v-else-if="column.key === 'signWay'">
            {{ t(signWayName[record.signWay]) }}
          </template>
          <template v-else-if="column.key === 'platform'">
            {{ t(platformName[record.platform]) }}
          </template>
          <template v-else-if="column.key === 'eventType'">
            {{ t(eventTypeName[record.eventType]) }}
          </template>
          <template v-else-if="column.key === 'source'">
            {{ t(sourceName[record.source]) }}
          </template>
          <template v-else-if="column.key === 'ip'">
            {{ record.ip.replaceAll('_', '.') }}
          </template>
          <template v-else-if="column.key === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm') }}
          </template>
          <template v-else>
            {{ record[column.key] || '--' }}
          </template>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts" name="audit-log-list">
  import { ref, reactive, onMounted, watch, computed } from 'vue';
  import type { FormInstance, SelectProps } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import { BasicTable } from '/@/components/Table';
  import { useNamespace } from '@gct/runtime';
  import dayjs from 'dayjs';
  import { UserInfo } from '/@/apis/gct-apaas/model';
  import { CropperAvatar } from '/@/components/Cropper';
  import { uploadApi } from '/@/api/sys/upload';
  import { signWayName, eventTypeName, platformName, sourceName } from './loginLogHook';
  import {
    postSignLogPageList as platpostSignLogPageList,
    postSignLogOperators as platpostSignLogOperators,
  } from '/@/apis/gct-platform/SignLogController';
  import { postSignLogPageList, postSignLogOperators } from '/@/apis/gct-apaas/SignLogController';
  import { getAppTenantApps } from '/@/apis/gct-platform/AppController';
  import { useUserStore } from '/@/store/modules/user';
  import { useEnv } from '/@/hooks/develop/useEnv';

  const { getEnv, isAppRun } = useEnv();

  const { t } = useI18n();
  const ns = useNamespace('audit-log-list');
  const props = defineProps(['appId', 'platform', 'tenantId', 'createUserId']);

  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const dataTime = ref<[string, string]>(['', '']);
  const loading = ref<boolean>(false);
  const tableData = ref<any>([]);
  const userStore = useUserStore();
  type ColumType = {
    title: string;
    dataIndex?: string;
    width?: number;
    fixed?: string;
    children?: any[];
  };

  const formState = reactive({
    // createUserName: undefined,
    createUserId: props.createUserId,
    beginCreateTime: '',
    endCreateTime: '',
    eventType: '',
    appId: props.appId,
    platform: props.platform,
    tenantId: props.platform === 'ENTERPRISE' ? '' : userStore.tenantId,
    personal: !props.platform ? true : false,
    env: getEnv(),
  });
  // 分页
  let pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  watch(
    () => props.tenantId,
    (val) => {
      formState.tenantId = val;
      getAppList();
      pagination = {
        current: 1,
        pageSize: 20,
        total: 0,
        pageSizeOptions: ['10', '20', '50', '100'],
      };
      handlereset();
    },
  );

  const platAppId = ['ENTERPRISE', 'TENANT', 'DEVELOPER'];

  const isFront = computed(() => {
    const pathname = window.location.pathname;
    return isAppRun || pathname.includes('/app-designer/');
  });
  const tenantOptions = ref<SelectProps['options']>([]);
  const userOptions = ref<UserInfo[]>([]);
  const eventOptions = ref<SelectProps['options']>([
    {
      label: t('sys.all'),
      value: '',
    },
    {
      label: t('sys.login'),
      value: 1,
    },
    {
      label: t('sys.loginOut'),
      value: 0,
    },
  ]);

  const columns: ColumType[] = [
    {
      title: t('sys.pageDesigner.index'),
      dataIndex: 'index',
      width: 70,
      fixed: 'left',
    },
    {
      title: t('sys.appDesigner.operatePerson'),
      dataIndex: 'createUserName',
      fixed: 'left',
      width: 130,
    },
    {
      title: t('sys.userName'),
      dataIndex: 'userName',
      width: 130,
    },
    {
      title: t('sys.pageDesigner.eventType'),
      dataIndex: 'eventType',
      width: 130,
    },

    {
      title: t('sys.loginAndLoginOutStyle'),
      dataIndex: 'signWay',
      width: 130,
    },
    {
      title: t('sys.tableColumnDate'),
      dataIndex: 'createTime',
      minWidth: 152,
    },
    {
      title: t('sys.org.plat'),
      dataIndex: 'platform',
    },
    {
      title: t('sys.app.index'),
      dataIndex: 'appName',
    },
    {
      title: t('sys.clientType'),
      dataIndex: 'source',
    },
    {
      title: 'IP',
      dataIndex: 'ip',
    },
    // {
    //   title: t('sys.pageDesigner.address'),
    // },
  ];
  const columnOptions = computed(() => {
    if (['TENANT'].includes(props.platform)) {
      return columns;
    } else {
      return columns.filter((i) => {
        return i.dataIndex !== 'appName';
      });
    }
  });
  const getDataTime = () => {
    const nowTime = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    const startTime = dayjs(nowTime)
      .subtract(30, 'day')
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    dataTime.value = [startTime, nowTime];
  };

  const getAppList = () => {
    if (props.platform === 'TENANT') {
      getAppTenantApps(
        { pageNo: 1, pageSize: 99999, deleted: 0, type: 'PRO' },
        { transferToConfig: { headers: { tenantId: props.tenantId } } },
      ).then((res: any) => {
        tenantOptions.value = res.data.map((i) => ({
          label: i.name,
          value: i.id,
        }));
      });
    }
  };

  onMounted(() => {
    if (props.tenantId) {
      formState.tenantId = props.tenantId;
    }
    getAppList();
    getUserList();
    getDataTime();
    handleDateChange(dataTime.value);
    getTableData();
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const params = Object.assign(formState, { pageNo, pageSize: pagination.pageSize! });
    if (props.platform === 'TENANT' && !props.tenantId && !userStore.tenantId) {
      return;
    }
    // 企业后台/租户后台/开发者中心
    if (platAppId.includes(props.platform) || (!props.appId && !isFront.value)) {
      try {
        const res: any =
          (await platpostSignLogPageList({ ...params }).finally(() => {
            loading.value = false;
          })) || {};
        pagination.current = res?.pageNo;
        pagination.total = res?.totalCount;
        tableData.value = res?.data ?? [];
      } catch (e) {
        loading.value = false;
      }
    } else {
      try {
        const res: any =
          (await postSignLogPageList({ ...params }).finally(() => {
            loading.value = false;
          })) || {};
        pagination.current = res?.pageNo;
        pagination.total = res?.totalCount;
        tableData.value = res?.data ?? [];
      } catch (e) {
        loading.value = false;
      }
    }
  };

  const getUserList = async () => {
    const params = {
      appId: props.appId,
      platform: props.platform,
      tenantId: props.platform === 'ENTERPRISE' ? '' : userStore.tenantId,
      personal: !props.platform ? true : false,
      env: getEnv(),
    };
    const list: UserInfo[] =
      platAppId.includes(props.platform) || (!props.appId && !isFront.value)
        ? (await platpostSignLogOperators(params)) || []
        : (await postSignLogOperators(params)) || [];
    userOptions.value = list.map((i) => ({
      ...i,
      value: i.id,
    }));
  };

  const getPageIndex = (index) => {
    const { current, pageSize } = pagination;
    return pageSize * (current - 1) + index + 1;
  };

  const handlereset = () => {
    getDataTime();
    handleDateChange(dataTime.value);
    formRef.value?.resetFields();
    getTableData();
  };

  const handleUserChange = (val) => {
    console.log('handleUserChange', val);
  };

  const handleDateChange = (val) => {
    formState.beginCreateTime = dayjs(val?.[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
    formState.endCreateTime = dayjs(val?.[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };
</script>

<style lang="scss" scoped>
  $audit-log-list: ();

  @include b(audit-log-list) {
    @include e(wrapper) {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 16px;
      overflow: hidden;
    }
  }

  .user-options-name {
    .fullname,
    .username {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .disabled-tag {
    padding: 0 4px;
    border-radius: 2px;
    background: #f7f8fa;
    color: #8f8f8f;
  }

  .ellipsis-3 {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    word-break: break-all;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
  }

  .info-icon {
    &:hover {
      color: var(--ant-primary-color);
    }
  }

  :deep(
    .ant-table.ant-table-bordered
      > .ant-table-container
      > .ant-table-header
      > table
      > thead
      > tr
      > th
  ) {
    &:nth-child(6)::before {
      height: 100%;
    }
  }

  .is-readonly {
    pointer-events: none;
  }
</style>
<style lang="scss">
  .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
    background-color: transparent;

    &:hover {
      background-color: #f5f5f5;
    }
  }
</style>
