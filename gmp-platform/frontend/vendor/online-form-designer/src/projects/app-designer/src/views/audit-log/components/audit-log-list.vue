<template>
  <div :class="[ns.e('wrapper')]">
    <a-form ref="formRef" :model="formState" autocomplete="off" class="mb-12px">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item :label="t('sys.appDesigner.functionalModel')" name="module">
            <a-select
              allow-clear
              v-model:value="formState.module"
              :placeholder="t('sys.chooseText')"
              show-search
              :filter-option="filterOption"
              @change="handleModuleChange"
            >
              <a-select-option
                :value="item.value"
                v-for="item in moduleOptions"
                :key="item.label"
                >{{ t(item.label) }}</a-select-option
              >
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('sys.appDesigner.operationType')" name="operateType">
            <a-select
              allow-clear
              show-search
              optionFilterProp="label"
              v-model:value="formState.operateType"
              :placeholder="t('sys.chooseText')"
              :options="translatedOptOptions"
              @click="handleOperationClick"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item name="operateContent">
            <template #label>
              <span>
                {{ t('sys.appDesigner.operateDetail') }}
                <a-tooltip>
                  <template #title>{{ $t('sys.appDesigner.operateDetailTip') }}</template>
                  <info-circle-outlined class="info-icon" />
                </a-tooltip>
              </span>
            </template>
            <a-input
              v-model:value="formState.operateContent"
              :placeholder="t('sys.inputText')"
              @pressEnter="() => getTableData(1)"
            />
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('sys.status')" name="status">
            <a-select v-model:value="formState.status" :placeholder="t('sys.chooseText')">
              <a-select-option :value="item.value" v-for="item in statusOptions" :key="item.value">
                {{ t(item.label) }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
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
              ref="rangePickerRef"
              @change="handleDateChange"
              v-model:value="dataTime"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              :placeholder="[t('sys.startTime'), t('sys.endTime')]"
              :allowClear="false"
            />
          </a-form-item>
        </a-col>

        <a-col :span="5" :offset="19" class="text-right">
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
        :columns="columns"
        :showIndexColumn="false"
        :pagination="pagination"
        :striped="false"
        :bordered="true"
        @change="handleTableChange"
      >
        <template #headerTop>
          <div class="flex">
            <a-button
              v-if="
                props.isFront
                  ? userActions.Export
                  : hasPermission(BasicAction.Export) || props.permission
              "
              style="margin-left: auto"
              type="primary"
              @click="handleExport"
            >
              {{ t('sys.export') }}
            </a-button>
          </div>
        </template>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            <div>{{ getPageIndex(index) }}</div>
          </template>
          <template v-if="column.key === 'requestPath'">
            <span class="ellipsis-3" :title="record.requestPath">{{ record.requestPath }}</span>
          </template>
          <template v-if="column.key === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm') }}
          </template>
          <template v-if="column.key === 'inputContent'">
            <span class="ellipsis-3" :title="record.inputContent">{{ record.inputContent }}</span>
          </template>
          <template v-if="column.key === 'outputContent'">
            <span class="ellipsis-3" :title="record.outputContent">{{ record.outputContent }}</span>
          </template>
          <template v-if="column.key === 'createUserName'">
            {{ record.createUserName || '--' }}
          </template>
          <template v-if="column.key === 'status'">
            <a-tag color="success" v-if="record.status">{{ t('sys.success') }}</a-tag>
            <a-tag color="default" v-else>{{ t('sys.fail') }}</a-tag>
          </template>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts" name="audit-log-list">
  import { ref, reactive, onMounted, computed, nextTick } from 'vue';
  import type { FormInstance, SelectProps } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import { BasicTable } from '/@/components/Table';
  import type { BasicColumn } from '/@/components/Table';
  import { useNamespace } from '@gct/runtime';
  import dayjs from 'dayjs';
  import { message } from 'ant-design-vue';
  import {
    getAuditLogOperators,
    postAuditLogPageList,
    postAuditLogExport,
    getAuditLogOperateTypes,
  } from '/@/apis/gct-apaas/AuditLogController';
  import {
    getAuditLogOperators as platgetAuditLogOperators,
    postAuditLogPageList as platpostAuditLogPageList,
    postAuditLogExport as platpostAuditLogExport,
  } from '/@/apis/gct-platform/AuditLogController';
  import { UserInfo } from '/@/apis/gct-apaas/model';
  import { CropperAvatar } from '/@/components/Cropper';
  import { uploadApi } from '/@/api/sys/upload';
  import {
    ModelTypeOptions,
    EnterpriseOperateTypeOptions,
    TenantOperateTypeOptions,
    DeveloperOperateTypeOptions,
    AppDesignerOperateTypeOptions,
    AppFrontOperateTypeOptions,
    BizModelTypeEnum,
  } from '../constant/index';
  import { downloadByData } from '/@/utils/file/download';
  import exportTemplate from '../modals/export-template.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { t } = useI18n();
  const ns = useNamespace('audit-log-list');
  const props = defineProps<{ appId: string; permission?: boolean; isFront?: boolean }>();
  const { hasPermission } = usePermission();
  const appInfoStore = useAppInfoStore();

  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const dataTime = ref<[string, string]>(['', '']);
  const rangePickerRef = ref<any>();
  const shouldBlurOnChange = ref(true);
  const loading = ref<boolean>(false);
  const tableData = ref<any>([]);

  const formState = reactive({
    // createUserName: undefined,
    createUserId: undefined,
    beginCreateTime: '',
    endCreateTime: '',
    module: undefined,
    operateType: undefined,
    operateContent: '',
    status: '',
  });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  const platAppId = ['ENTERPRISE', 'TENANT', 'DEVELOPER'];

  const userOptions = ref<UserInfo[]>([]);
  const moduleOptions = ref<SelectProps['options']>([]);
  const optOptions = ref<SelectProps['options']>([]);
  const translatedOptOptions = computed(() =>
    (optOptions.value || []).map((item: any) => ({
      value: item.value,
      label: t(item.label as string),
    })),
  );
  const userActions = computed(() => {
    const page = 'AuditLog';
    return {
      Export: !!getPermissionByKey(page, 'Export'),
    };
  });
  const columns: BasicColumn[] = [
    {
      title: t('sys.pageDesigner.index'),
      dataIndex: 'index',
      width: 72,
      fixed: 'left',
    },
    {
      title: t('sys.appDesigner.operatePerson'),
      dataIndex: 'operatorName',
      fixed: 'left',
      width: 130,
    },
    {
      title: t('sys.userName'),
      dataIndex: 'createUserName',
      width: 130,
    },
    {
      title: t('sys.appDesigner.operateTime'),
      dataIndex: 'createTime',
      width: 150,
    },

    {
      title: t('sys.appDesigner.functionalModel'),
      dataIndex: 'module',
      width: 130,
    },
    {
      title: t('sys.appDesigner.operationType'),
      dataIndex: 'operateType',
      width: 100,
    },
    {
      title: t('sys.appDesigner.operateDetail'),
      children: [
        {
          title: t('sys.status'),
          dataIndex: 'status',
          width: 90,
        },
        {
          title: t('sys.interfaceName'),
          dataIndex: 'apiName',
          width: 130,
        },
        {
          title: t('sys.appDesigner.RequestType'),
          dataIndex: 'requestType',
          width: 90,
        },
        {
          title: t('sys.appDesigner.requestUrl'),
          dataIndex: 'requestPath',
          ellipsis: false,
          width: 240,
        },
        {
          title: t('sys.appDesigner.inputContent'),
          dataIndex: 'inputContent',
          ellipsis: false,
          width: 240,
        },
        {
          title: t('sys.appDesigner.outContent'),
          dataIndex: 'outputContent',
          ellipsis: false,
          width: 240,
        },
      ],
    },
  ];

  const statusOptions = [
    {
      label: t('sys.all'),
      value: '',
    },
    {
      label: t('sys.success'),
      value: true,
    },
    {
      label: t('sys.fail'),
      value: false,
    },
  ];

  const getDataTime = () => {
    const nowTime = dayjs().endOf('day').format('YYYY-MM-DD HH:mm:ss');
    const startTime = dayjs(nowTime)
      .subtract(1, 'month')
      .startOf('day')
      .format('YYYY-MM-DD HH:mm:ss');
    dataTime.value = [startTime, nowTime];
  };

  onMounted(() => {
    getUserList();
    getModuleOpts();
    getDataTime();
    // programmatic change - do not blur
    shouldBlurOnChange.value = false;
    handleDateChange(dataTime.value);
    shouldBlurOnChange.value = true;
    getTableData();
  });

  const buildSearchParams = () => {
    // adapt status to API typing: boolean | undefined
    const { status, ...rest } = formState as any;
    return {
      ...rest,
      status: status === '' ? undefined : status,
    } as any;
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const params = Object.assign(buildSearchParams(), { pageNo, pageSize: pagination.pageSize! });
    // 企业后台/租户后台/开发者中心
    if (platAppId.includes(props.appId)) {
      try {
        const res: any =
          (await platpostAuditLogPageList({ ...params, appId: props.appId }).finally(() => {
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
          (await postAuditLogPageList(params).finally(() => {
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
    const list: UserInfo[] = platAppId.includes(props.appId)
      ? (await platgetAuditLogOperators()) || []
      : (await getAuditLogOperators()) || [];
    userOptions.value = list.map((i) => ({
      ...i,
      value: i.id,
    }));
  };

  const getPageIndex = (index) => {
    const { current, pageSize } = pagination;
    return pageSize * (current - 1) + index + 1;
  };

  const getModuleOpts = () => {
    if (appInfoStore.appInfo.suiteKey) {
      moduleOptions.value = ModelTypeOptions[props.appId];
    } else {
      moduleOptions.value = ModelTypeOptions[props.appId].filter((i) => {
        return ![BizModelTypeEnum.EDHR_TMPL, BizModelTypeEnum.ONLINE_FORM_TMPL].includes(i.value);
      });
    }
  };

  const handlereset = () => {
    optOptions.value = [];
    getDataTime();
    // programmatic change - do not blur
    shouldBlurOnChange.value = false;
    handleDateChange(dataTime.value);
    shouldBlurOnChange.value = true;
    formRef.value?.resetFields();
    getTableData();
  };

  const handleUserChange = (val) => {
    console.log('handleUserChange', val);
  };

  const filterOption = (input: string, option: any) => {
    return option.key.indexOf(input.toLowerCase()) >= 0;
  };

  const handleModuleChange = async (val) => {
    formState.operateType = undefined;
    console.log('appInfoStore', appInfoStore);
    if (!val) {
      optOptions.value = [];
      return;
    }
    switch (props.appId) {
      case 'ENTERPRISE':
        optOptions.value = EnterpriseOperateTypeOptions[val];
        break;
      case 'TENANT':
        optOptions.value = TenantOperateTypeOptions[val];
        break;
      case 'DEVELOPER':
        optOptions.value = DeveloperOperateTypeOptions[val];
        break;
      case 'APPDESIGNER':
        optOptions.value = AppDesignerOperateTypeOptions[val];
        break;
      case 'APPFRONT':
        if (val === BizModelTypeEnum.BIZ_SERVICE) {
          optOptions.value = (
            await getAuditLogOperateTypes({
              moduleType: BizModelTypeEnum.BIZ_SERVICE,
            })
          )?.map((i) => {
            return {
              label: i.name,
              value: i.key,
            };
          });
        } else {
          optOptions.value = AppFrontOperateTypeOptions[val];
        }
        break;
    }
  };

  const handleDateChange = (val) => {
    formState.beginCreateTime = dayjs(val?.[0]).startOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
    formState.endCreateTime = dayjs(val?.[1]).endOf('day').format('YYYY-MM-DD HH:mm:ss') || '';
    if (shouldBlurOnChange.value) {
      // blur input after user selection
      nextTick(() => {
        rangePickerRef.value?.blur?.();
      });
    }
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const handleOperationClick = () => {
    if (!formState.module) {
      message.warn(
        t('sys.pageDesigner.pleaseSelectFirstSth', { sth: t('sys.appDesigner.functionalModel') }),
      );
      return;
    }
  };

  const handleExport = () => {
    gct.openUtil.modal(
      exportTemplate,
      {
        async exportFun() {
          let number = 0;
          let download: any;
          let exportInfo: any[] = [];

          try {
            const { data, headers } = platAppId.includes(props.appId)
              ? ((await platpostAuditLogExport(
                  {
                    ...buildSearchParams(),
                  },
                  {
                    isTransformResponse: false,
                    isReturnNativeResponse: true,
                    transferToConfig: {
                      responseType: 'blob',
                      responseEncoding: 'utf8',
                      headers: {
                        'App-Tag': '__platform__',
                      },
                    },
                  },
                )) as any)
              : ((await postAuditLogExport(
                  {
                    ...buildSearchParams(),
                  },
                  {
                    isTransformResponse: false,
                    isReturnNativeResponse: true,
                    transferToConfig: {
                      responseType: 'blob',
                      responseEncoding: 'utf8',
                    },
                  },
                )) as any);
            console.log('data, headers', data, headers);

            if (data) {
              const attachment = new URLSearchParams(
                headers?.['content-disposition'].replace('attachment;', '') || '',
              );
              const reportParsed = JSON.parse(headers?.report || '[]');
              exportInfo = Array.isArray(reportParsed) ? reportParsed : [reportParsed];
              const filename = attachment.get('filename') || '';
              download = () => downloadByData(data, { filename });
              const totalCountStr = attachment.get('totalCount');
              number = totalCountStr ? Number(totalCountStr) : 0;
              console.log('filename', exportInfo, filename, number);
            }
          } catch (error) {
            console.error(error);
          }
          return { number, download, exportInfo };
        },
      },
      {
        title: t('sys.app.exportExcel'),
        width: '640px',
        height: '520px',
        showFooter: false,
      },
    );
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
    line-clamp: 3;
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

  :deep(.ant-tag) {
    border-radius: 4px;
    border-color: #fff;
  }

  :deep(.ant-tag-default) {
    background: #e8ebf0;
    color: #797a7d;
  }
</style>
