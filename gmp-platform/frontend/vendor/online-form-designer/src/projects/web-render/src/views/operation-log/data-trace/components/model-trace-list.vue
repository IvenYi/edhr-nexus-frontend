<template>
  <div :class="[ns.e('wrapper')]">
    <a-form ref="formRef" :model="formState" autocomplete="off">
      <a-row :gutter="24">
        <a-col :span="8">
          <a-form-item :label="t('sys.appModel')" name="modelKey">
            <a-select
              v-if="isInEDHR"
              allow-clear
              show-search
              :filter-option="filterOption"
              v-model:value="formState.modelKey"
              :placeholder="t('sys.chooseText')"
            >
              <a-select-option
                :value="item.value"
                v-for="item in ApplicationModelOptions"
                :key="item.label"
                >{{ t(item.label) }}</a-select-option
              >
            </a-select>
            <a-select
              v-else
              allow-clear
              v-model:value="formState.modelKey"
              :placeholder="t('sys.chooseText')"
              show-search
              :filter-option="filterOption"
            >
              <a-select-opt-group v-for="(models, idx) in moduleOptions" :key="idx">
                <template #label>
                  <span>
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
                  :supportProcess="model.supportProcess"
                  >{{ model.name }}</a-select-option
                >
              </a-select-opt-group>
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
        <a-col :span="8" v-if="isInEDHR">
          <a-form-item :label="t('sys.appDesigner.detailData')" name="detailData">
            <a-input
              v-model:value="formState.detailData"
              allow-clear
              :placeholder="t('sys.inputText')"
            />
          </a-form-item>
        </a-col>
        <a-col :span="5" :offset="isInEDHR ? 3 : 11" class="text-right">
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
        <template #bodyCell="{ column, record, index }">
          <template v-if="column.key === 'index'">
            <div>{{ getPageIndex(index) }}</div>
          </template>
          <template v-if="column.key === 'triggerType'">
            <div>
              {{
                record.triggerType
                  ? t('sys.appDesigner.systemTriggered')
                  : t('sys.appDesigner.userBehavior')
              }}
            </div>
          </template>
          <template v-if="column.key === 'createTime'">
            {{ dayjs(record.createTime).format('YYYY-MM-DD HH:mm') }}
          </template>
          <template v-if="column.key === 'modelName' && isInEDHR">
            {{ ApplicationModelMap[record.modelKey] || record.modelName }}
          </template>
          <template v-if="column.key === 'operateType'">
            {{ t('sys.delete') }}
          </template>
          <template v-if="column.key === 'detailData'">
            {{ record.detailData || displayValue }}
          </template>
          <template v-if="column.key === 'action'">
            <a-button type="link" @click="createTracingBackToThePast(record)">
              {{ t('sys.viewDetails') }}
            </a-button>
          </template>
        </template>
      </BasicTable>
    </div>
  </div>
</template>

<script setup lang="ts" name="audit-log-list">
  import {
    ref,
    reactive,
    onMounted,
    createVNode,
    createApp,
    render as vueRender,
    computed,
  } from 'vue';
  import type { FormInstance, SelectProps, TableColumnsType } from 'ant-design-vue';
  import { useI18n } from 'vue-i18n';
  import { BasicTable } from '/@/components/Table';
  import { useNamespace } from '@gct/runtime';
  import dayjs from 'dayjs';

  import { UserInfo } from '/@/apis/gct-apaas/model';
  import { CropperAvatar } from '/@/components/Cropper';
  import { uploadApi } from '/@/api/sys/upload';
  import { registerGlobComp } from '@/components/registerGlobComp';
  import { useGlobalSetting } from '/@/hooks/platform/globalSetting';
  import { usePermission } from '/@/hooks/web/usePermission';
  import ModelingTrace from '/@web-render/render/Event/Modal/modeling_template.vue';
  import {
    postTraceLogDetailsAppDataTracePageList,
    getTraceLogDetailsOperators,
  } from '/@/apis/gct-apaas/TraceLogDetailsController';
  import { getCategoryListComplete } from '/@/apis/gct-apaas/CategoryController';
  import { EntityModelTypeEnum } from '/@/projects/app-designer/src/enum';
  import { ApplicationModelMap, ApplicationModelOptions } from '../constant/index';
  import { useAppInfoStore } from '/@/store/modules/app-info';

  const { displayValue } = useGlobalSetting();
  const appInfoStore = useAppInfoStore();

  const { t } = useI18n();
  const ns = useNamespace('audit-log-list');
  const { hasPermission } = usePermission();
  const innerData = ref({});

  const isInEDHR = computed(() => appInfoStore.appInfo.suiteKey === 'eDHR');
  //搜索过滤部分
  const formRef = ref<FormInstance>();
  const dataTime = ref<[string, string]>(['', '']);
  const loading = ref<boolean>(false);
  const tableData = ref<any>([]);

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
    modelKey: undefined,
    triggerType: '',
    detailData: undefined,
  });
  // 分页
  const pagination = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    pageSizeOptions: ['10', '20', '50', '100'],
  });

  const userOptions = ref<UserInfo[]>([]);
  const moduleOptions = ref<SelectProps['options']>([]);
  const optOptions = ref<SelectProps['options']>([]);
  const traceNotSupport = [EntityModelTypeEnum.TRANSACTION, EntityModelTypeEnum.DYNAMIC_FORM];

  const columns: ColumType[] = [
    {
      title: t('sys.pageDesigner.index'),
      dataIndex: 'index',
      width: 70,
      fixed: 'left',
    },
    {
      title: t('sys.appDesigner.operatePerson'),
      dataIndex: 'operatorName',
      width: 130,
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
      minWidth: 170,
      width: 170,
    },

    {
      title: t('sys.triggerMode'),
      dataIndex: 'triggerType',
      width: 130,
    },
    {
      title: t('sys.appModel'),
      dataIndex: 'modelName',
      width: 130,
    },
    {
      title: t('sys.model.data') + 'ID',
      dataIndex: 'recordId',
      width: 150,
    },
    {
      title: t('sys.appDesigner.operateType'),
      dataIndex: 'operateType',
      width: 120,
    },
    {
      title: t('sys.appDesigner.detailData'),
      dataIndex: 'detailData',
      width: 300,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      width: 130,
      fixed: 'right',
    },
  ];

  const triggerOptions = [
    {
      label: t('sys.all'),
      value: '',
    },
    {
      label: t('sys.appDesigner.userBehavior'),
      value: '0',
    },
    {
      label: t('sys.appDesigner.systemTriggered'),
      value: '1',
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
    getDataTime();
    handleDateChange(dataTime.value);
    getTableData();
    getModel();
  });

  const getModel = () => {
    getCategoryListComplete({ module: 'entity_module' }).then((res) => {
      moduleOptions.value = res
        .map((i) => {
          i.children = i.children.filter((p) => {
            return !p.subModel && !traceNotSupport.includes(p.type);
          });
          return { ...i };
        })
        .filter((e) => {
          return e.children && e.children.length;
        });
    });
  };
  const filterOption = (input: string, option: any) => {
    if (!option.label) {
      return (
        option.name?.includes(input) || option.key?.includes(input) || option.value?.includes(input)
      );
    }
    return false;
  };

  function createTracingBackToThePast({ recordId, modelKey }) {
    const container = document.createDocumentFragment() as any;
    const vm = createVNode(ModelingTrace, {
      id: recordId,
      modelKey,
      title: t('sys.traceDetail'),
      destroyVm: () => {
        setTimeout(() => {
          vueRender(null, container);
          this.instanceCache[id] = null;
        }, 300);
      },
    });
    // vueRender(vm, container);
    const app = createApp(vm);
    //引入国际化和vxetable
    registerGlobComp(app);
    const modalRef = app.mount(container!);
    const data = modalRef.open();
    // app.use(i18n);
    // this.instanceCache[id] = app.mount(container);
  }

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const params = Object.assign(formState, { pageNo, pageSize: pagination.pageSize! });

    try {
      const res: any =
        (await postTraceLogDetailsAppDataTracePageList(params).finally(() => {
          loading.value = false;
        })) || {};
      pagination.current = res?.pageNo;
      pagination.total = res?.totalCount;
      tableData.value = res?.data.map((item) => {
        const testCases = item.detailData;

        const regex = /.*?\（.*?[:：].*?\）/;
        const regex1 = /(.*?)\（(.*?)[:：](.*?)）/;
        if (!regex.test(testCases)) {
          return { ...item };
        }

        if (regex.test(testCases) && !testCases.match(regex1)[1]) {
          item.detailData = `${displayValue.value}${item.detailData}`;
        }
        if (regex.test(testCases) && testCases.match(regex1)[1] === 'null') {
          item.detailData = item.detailData.replace('null', displayValue.value);
        }
        return { ...item };
      });
    } catch (e) {
      loading.value = false;
    }
  };

  const getUserList = async () => {
    const list: UserInfo[] = (await getTraceLogDetailsOperators()) || [];
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
    optOptions.value = [];
    getDataTime();
    handleDateChange(dataTime.value);
    formRef.value?.resetFields();
    getTableData();
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
