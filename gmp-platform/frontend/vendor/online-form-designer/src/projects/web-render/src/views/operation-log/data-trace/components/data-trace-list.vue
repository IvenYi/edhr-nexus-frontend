<template>
  <div :class="[ns.e('wrapper')]">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item :label="t('sys.appDesigner.functionalModel')" name="module">
            <a-select
              allow-clear
              show-search
              :filter-option="filterOption"
              v-model:value="formState.module"
              :placeholder="t('sys.chooseText')"
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
              v-model:value="formState.operateType"
              :placeholder="t('sys.chooseText')"
              @click="handleOperationClick"
            >
              <a-select-option :value="item.value" v-for="item in optOptions" :key="item.value">
                {{ t(item.label) }}
              </a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item :label="t('sys.triggerMode')" name="triggerType">
            <a-select
              allow-clear
              v-model:value="formState.triggerType"
              :placeholder="t('sys.chooseText')"
              :options="triggerOptions"
            />
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
              @change="handleDateChange"
              v-model:value="dataTime"
              format="YYYY-MM-DD"
              valueFormat="YYYY-MM-DD HH:mm:ss"
              :placeholder="[t('sys.startTime'), t('sys.endTime')]"
              :allowClear="false"
            />
          </a-form-item>
        </a-col>
        <a-col :span="5" :offset="3" class="text-right">
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
        row-key="id"
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
        <template #expandIcon="props">
          <i
            v-if="props.record.updateJson"
            style="cursor: pointer"
            @click="
              (e) => {
                props.onExpand(props.record, e);
              }
            "
          >
            <caret-down-outlined v-if="props.expanded" />
            <caret-right-outlined v-else />
          </i>
        </template>
        <template #expandedRowRender="{ record }">
          <a-table :columns="innerColumns" :data-source="record.children" :pagination="false">
            <template #bodyCell="{ column, record: record1, index }">
              <template v-if="record1[column.key] === false || record1[column.key] === 0">
              </template>
              <!-- 图片 -->
              <template v-else-if="record1.oldFieldType === 'IMAGE' && column.key === 'old'">
                <a-image
                  v-if="record1[column.key]"
                  :width="56"
                  :src="transformUrl(record1[column.key])"
                />
                <span v-else>--</span>
              </template>
              <template v-else-if="record1.currentFieldType === 'IMAGE' && column.key === 'now'">
                <a-image
                  v-if="record1[column.key]"
                  :width="56"
                  :src="transformUrl(record1[column.key])"
                />
                <span v-else>--</span>
              </template>
              <!-- 文件 -->
              <template v-else-if="record1.oldFieldType === 'ATTACHMENT' && column.key === 'old'">
                <div v-if="record1[column.key]" class="flex file-list__item">
                  <SvgIcon
                    class="file-list__item-svg, no-size"
                    :size="20"
                    :name="fileTypeParser(record1[column.key])"
                  />

                  <div class="file-list__item-name ell">
                    <span @click.stop="downFile(record1[column.key])" :title="record1[column.key]">
                      {{ record1[column.key] }}
                    </span>
                  </div>
                </div>

                <span v-else>--</span>
              </template>
              <template
                v-else-if="record1.currentFieldType === 'ATTACHMENT' && column.key === 'now'"
              >
                <div v-if="record1[column.key]" class="flex">
                  <SvgIcon
                    class="file-list__item-svg, no-size"
                    :size="20"
                    :name="fileTypeParser(record1[column.key])"
                  />

                  <div class="file-list__item-name ell">
                    <span @click.stop="downFile(record1[column.key])" :title="record1[column.key]">
                      {{ record1[column.key] }}
                    </span>
                  </div>
                </div>

                <span v-else>--</span>
              </template>
              <!-- 图标 -->
              <template v-else-if="record1.oldFieldType === 'ICON' && column.key === 'old'">
                <div
                  v-if="record1[column.key]"
                  class="icon-picker-next__trigger cursor-pointer"
                  :style="{ background: record1['oldLogoBgColor'] }"
                >
                  <icon-next
                    :value="record1[column.key]"
                    :size="30"
                    :color="record1.oldLogoColor"
                  />
                </div>

                <span v-else>--</span>
              </template>
              <template v-else-if="record1.currentFieldType === 'ICON' && column.key === 'now'">
                <div
                  v-if="record1[column.key]"
                  class="icon-picker-next__trigger cursor-pointer"
                  :style="{
                    background: record1.logoBgColor,
                  }"
                >
                  <icon-next :value="record1[column.key]" :size="30" :color="record1.logoColor" />
                </div>

                <span v-else>--</span>
              </template>
              <template v-else-if="record1.changeRow">
                <div
                  class="word-break"
                  v-html="record1[column.key]?.replace(/\n/g, '<br>') || '--'"
                ></div>
              </template>
              <template v-else-if="record1.cust && (column.key === 'now' || column.key === 'old')">
                <MessageTemp :content="record1[column.key]" />
              </template>
              <template v-else-if="record1.currentFieldType === 'LONG_TEXT'">
                <span v-html="record1[column.key] || '--'"> </span>
              </template>
              <template v-else>
                {{ record1[column.key] || '--' }}
              </template>
            </template>
          </a-table>
        </template>
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'triggerType'">
            <div>
              {{
                record.triggerType
                  ? t('sys.appDesigner.systemTriggered')
                  : t('sys.appDesigner.userBehavior')
              }}
            </div>
          </template>
          <template v-else-if="column.key === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm') }}
          </template>
          <template v-else-if="record[column.key] === false">
            {{ record[column.key].toString() }}
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
  import { ref, reactive, onMounted, computed } from 'vue';
  import type { FormInstance, SelectProps, TableColumnsType } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import { BasicTable } from '/@/components/Table';
  import { useNamespace } from '@gct/runtime';
  import dayjs from 'dayjs';
  import { message } from 'ant-design-vue';
  import { IconNext, SvgIcon } from '/@/components/Icon';
  import {
    postDataTracePageList,
    getDataTraceOperators,
    postDataTraceExport,
  } from '/@/apis/gct-apaas/DataTraceController';
  import {
    getDataTraceOperators as platgetDataTraceOperators,
    postDataTracePageList as platpostDataTracePageList,
    postDataTraceExport as platpostDataTraceExport,
  } from '/@/apis/gct-platform/DataTraceController';

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
  import { downloadByData, downloadByUrl } from '/@/utils/file/download';
  import exportTemplate from '../modals/export-template.vue';
  import { usePermission } from '/@/hooks/web/usePermission';
  import { BasicAction } from '/@/enums/authActionEnum';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { transformUrl } from '/@/components/Cropper/hooks/useFile';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import MessageTemp from './message-temp.vue';
  import { typeParser } from '/@/components/FieldUpload/src/hooks/hooks';

  const { t } = useI18n();
  const ns = useNamespace('audit-log-list');
  const props = defineProps(['appId', 'permission', 'isFront']);
  const { hasPermission } = usePermission();
  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const dataTime = ref<[string, string]>(['', '']);
  const loading = ref<boolean>(false);
  const tableData = ref<any>([]);
  const appInfoStore = useAppInfoStore();

  const userActions = computed(() => {
    const page = 'DataTracing';
    return {
      Export: !!getPermissionByKey(page, 'Export'),
    };
  });

  type ColumType = {
    title: string;
    dataIndex?: string;
    width?: number;
    fixed?: string;
    children?: any[];
  };

  const formState = reactive({
    // createUserName: undefined,
    createUserId: undefined,
    beginCreateTime: '',
    endCreateTime: '',
    module: undefined,
    operateType: undefined,
    triggerType: '',
  });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  const platAppId = ['BACKEND_MANAGEMENT', 'TENANT_CENTER', 'DEVELOPER'];

  const userOptions = ref<UserInfo[]>([]);
  const moduleOptions = ref<SelectProps['options']>([]);
  const optOptions = ref<SelectProps['options']>([]);

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
      width: 150,
      fixed: 'left',
    },
    {
      title: t('sys.userName'),
      dataIndex: 'userName',
      width: 130,
    },
    {
      title: t('sys.appDesigner.operateTime'),
      dataIndex: 'createTime',
      width: 170,
    },
    {
      title: t('sys.triggerMode'),
      dataIndex: 'triggerType',
      width: 200,
    },
    {
      title: t('sys.appDesigner.functionalModel'),
      dataIndex: 'module',
      width: 200,
    },
    {
      title: t('sys.appDesigner.operationType'),
      dataIndex: 'operateType',
      width: 150,
    },
    {
      title: t('sys.appDesigner.detailData'),
      dataIndex: 'detail',
      width: 200,
    },
    {
      title: t('sys.model.data') + 'ID',
      dataIndex: 'dataId',
      width: 130,
    },
  ];
  const innerColumns: TableColumnsType = [
    {
      title: t('sys.model.fieldName'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.pageDesigner.oldData'),
      dataIndex: 'old',
      key: 'old',
    },
    {
      title: t('sys.pageDesigner.newData'),
      dataIndex: 'now',
      key: 'now',
    },
  ];

  const triggerOptions = [
    {
      label: t('sys.all'),
      value: '',
    },
    {
      label: t('sys.appDesigner.userBehavior'),
      value: 0,
    },
    {
      label: t('sys.appDesigner.systemTriggered'),
      value: 1,
    },
  ];

  const fileTypeParser = computed(() => {
    return (item) => {
      return typeParser(item);
    };
  });

  function downFile(item) {
    downloadByUrl({ url: import.meta.env.VITE_MINIO_PATH + '/' + item });
  }

  const filterOption = (input: string, option: any) => {
    console.log('option', option, input);

    return option.key.indexOf(input.toLowerCase()) >= 0;
  };

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
    handleDateChange(dataTime.value);
    getTableData();
  });

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const params = Object.assign(formState, { pageNo, pageSize: pagination.pageSize! });
    // 企业后台/租户后台/开发者中心
    if (platAppId.includes(props.appId)) {
      try {
        const res: any =
          (await platpostDataTracePageList({
            ...params,
            appId: props.appId,
          }).finally(() => {
            loading.value = false;
          })) || {};
        pagination.current = res?.pageNo;
        pagination.total = res?.totalCount;
        tableData.value =
          res?.data.map((item, idx) => {
            return {
              ...item,
              children: item.updateJson ? JSON.parse(item.updateJson) : [],
              index: getPageIndex(idx),
            };
          }) ?? [];
      } catch (e) {
        loading.value = false;
      }
    } else {
      try {
        const res: any =
          (await postDataTracePageList({ ...params, modules: ['USER_GROUP', 'ROLE'] }).finally(
            () => {
              loading.value = false;
            },
          )) || {};
        pagination.current = res?.pageNo;
        pagination.total = res?.totalCount;
        tableData.value =
          res?.data.map((item, idx) => {
            return {
              ...item,
              children: item.updateJson ? JSON.parse(item.updateJson) : [],
              index: getPageIndex(idx),
            };
          }) ?? [];
      } catch (e) {
        loading.value = false;
      }
    }
  };

  const getUserList = async () => {
    const list: UserInfo[] = platAppId.includes(props.appId)
      ? (await platgetDataTraceOperators()) || []
      : (await getDataTraceOperators()) || [];
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
    const suiteKey = appInfoStore.appInfo?.suiteKey;
    const allOpts = ModelTypeOptions[props.appId] ?? [];

    if (!suiteKey) {
      const excluded = new Set([BizModelTypeEnum.EDHR_TMPL, BizModelTypeEnum.ONLINE_FORM_TMPL]);
      moduleOptions.value = allOpts.filter((opt) => !excluded.has(opt.value));
      return;
    }

    if (suiteKey === 'eDHR') {
      const allowed = new Set([BizModelTypeEnum.USER_GROUP, BizModelTypeEnum.ROLE]);
      moduleOptions.value = allOpts.filter((opt) => allowed.has(opt.value));
      return;
    }

    moduleOptions.value = allOpts.slice();
  };

  const handlereset = () => {
    optOptions.value = [];
    getDataTime();
    handleDateChange(dataTime.value);
    formRef.value?.resetFields();
    getTableData();
  };

  const handleUserChange = (val) => {
    console.log('handleUserChange', val);
  };

  const handleModuleChange = async (val) => {
    formState.operateType = undefined;

    if (!val) {
      optOptions.value = [];
      return;
    }
    switch (props.appId) {
      case 'BACKEND_MANAGEMENT':
        optOptions.value = EnterpriseOperateTypeOptions[val];
        break;
      case 'TENANT_CENTER':
        optOptions.value = TenantOperateTypeOptions[val];
        break;
      case 'DEVELOPER':
        optOptions.value = DeveloperOperateTypeOptions[val];
        break;
      case 'APPDESIGNER':
        optOptions.value = AppDesignerOperateTypeOptions[val];
        break;
      case 'USER_DEFINED':
        optOptions.value = AppFrontOperateTypeOptions[val];
        break;
    }
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
          let download;
          let exportInfo = [];

          try {
            const { data, headers } = platAppId.includes(props.appId)
              ? ((await platpostDataTraceExport(
                  {
                    ...formState,
                    appId: props.appId,
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
              : ((await postDataTraceExport(
                  {
                    ...formState,
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

            if (data) {
              const attachment = new URLSearchParams(
                headers?.['content-disposition'].replace('attachment;', '') || '',
              );
              exportInfo = Array.isArray(JSON.parse(headers?.report))
                ? JSON.parse(headers?.report)
                : [JSON.parse(headers?.report)] || [];
              const filename = attachment.get('filename') || '';
              download = () => downloadByData(data, { filename });
              number = attachment.get('totalCount') || 0;
              console.log('filename', exportInfo, filename, number);
            }
          } catch (error) {}
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

  :deep(.ant-tabs-nav-wrap) {
    padding-left: 20px;
  }

  .table-wrap {
    :deep(.ant-table-row.ant-table-row-level-1) {
      display: none;
    }

    :deep(.ant-table.ant-table-middle .ant-table-tbody .ant-table-wrapper:only-child .ant-table) {
      width: auto;
    }
  }

  .word-break {
    width: 100%;
    word-break: break-all; /* 任意字符处都可换行（包括单词中间） */
    overflow-wrap: break-word; /* 允许在单词内换行 */
  }

  .icon-picker-next__trigger {
    width: 48px;
    height: 48px;
  }

  :deep(.ant-table-expanded-row-level-1 > .ant-table-cell) {
    padding: 10px 0 !important;
  }

  .file-list__item {
    &-name {
      &:hover {
        color: var(--ant-primary-color);
        cursor: pointer;
      }
    }
  }
</style>
