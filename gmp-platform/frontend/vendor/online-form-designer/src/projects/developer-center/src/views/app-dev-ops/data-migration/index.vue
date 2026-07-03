<template>
  <basic-page>
    <div class="h-full p-20px flex flex-col">
      <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off">
        <div class="w-full">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item :label="t('sys.migrantUser')" name="createUserName">
                <a-select
                  allow-clear
                  v-model:value="formState.createUserName"
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
              <a-form-item :label="t('sys.instanceStatus')" name="status">
                <a-select
                  v-model:value="formState.status"
                  allow-clear
                  :placeholder="t('sys.chooseText')"
                >
                  <a-select-option :value="item.key" v-for="item in statusOptions" :key="item.key">
                    {{ t(item.label) }}
                  </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="8" style="text-align: right">
              <a-button @click="() => handleReset()">
                <template #icon>
                  <undo-outlined />
                </template>
                {{ t('sys.reset') }}
              </a-button>
              <a-button class="ml-10px" type="primary" @click="() => getTableData(1)">
                <template #icon>
                  <search-outlined />
                </template>
                {{ t('sys.queryText') }}
              </a-button>
            </a-col>
          </a-row>
        </div>
      </a-form>

      <div class="btn-box text-right">
        <a-button type="primary" @click="onClickAdd">
          <template #icon>
            <plus-outlined />
          </template>
          {{ t('sys.newSth', { sth: t('迁移任务') }) }}
        </a-button>
      </div>

      <a-table
        class="flex-1 h-100px mt-14px"
        :columns="columns"
        :data-source="tableData"
        :pagination="pagination"
        ref="tableContainerRef"
        row-key="id"
        :loading="loading"
        :scroll="{
          y: scrollHeight,
        }"
        @expand="onExpand"
        @change="handleTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-badge v-if="record.status === 'unstart'" status="default" />
            <a-badge v-if="record.status === 'ongoing'" color="blue" />
            <a-badge v-if="record.status === 'finished'" status="success" />
            <span
              class="status"
              :style="{
                '--status-color':
                  record.status === 'finished'
                    ? '#52c41a'
                    : record.status === 'ongoing'
                      ? '#1890ff'
                      : '#d9d9d9',
              }"
            >
              {{
                record.status === 'finished'
                  ? t('sys.process.finished')
                  : record.status === 'ongoing'
                    ? t('sys.edhr.processStatusEnum.running')
                    : t('sys.process.delegation.NOT_STARTED')
              }}
            </span>
          </template>
          <template v-if="column.key === 'sourceEnv'">
            {{ EnvMap[record[column.key]] || '验证环境' }}
          </template>
          <template v-if="column.key === 'destEnv'">
            {{ EnvMap[record[column.key]] || '生产环境' }}
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
            <caret-down-outlined v-if="props.expanded" />
            <caret-right-outlined v-else />
          </i>
        </template>
        <template #expandedRowRender="{ record }">
          <a-table :columns="innerColumns" :data-source="innerData[record.id]" :pagination="false">
            <template #bodyCell="{ column, record: record1 }">
              <template v-if="column.key === 'status'">
                <a-badge v-if="record1.status === 'success'" status="success" />
                <a-badge v-if="record1.status === 'fail'" status="error" />

                <span
                  class="status"
                  :style="{
                    '--status-color': record1.status === 'success' ? '#52c41a' : '#F54547',
                  }"
                >
                  {{
                    record1.status === 'success'
                      ? t('sys.success')
                      : record1.status === 'fail'
                        ? t('sys.fail')
                        : ''
                  }}
                </span>
              </template>
              <template v-if="column.key === 'action'">
                <a-button
                  type="link"
                  v-if="record1.status === 'success'"
                  @click="openDataDetail('success', record1)"
                >
                  {{ t('查看迁移数据') }}
                </a-button>
                <a-button
                  type="link"
                  v-else-if="record1.status === 'fail'"
                  @click="openDataDetail('fail', record1)"
                >
                  {{ t('查看失败原因') }}
                </a-button>
              </template>
            </template>
          </a-table>
        </template>
      </a-table>
    </div>

    <success-list @register="register" />
    <fail-list @register="registerFail" />
  </basic-page>
</template>
<script setup lang="ts">
  import { onMounted, reactive, ref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { FormInstance, TableColumnsType, TablePaginationConfig } from 'ant-design-vue';
  import { useAntTableScrollHeight } from '/@/hooks/component/useAntTable';
  import successList from './modals/success-list.vue';
  import failList from './modals/fail-list.vue';
  import { useModal } from '/@/components/Modal';
  import { postDatasourceMovePageList } from '/@/apis/gct-platform/DatasourceMoveController';
  import designer from './designer/index.vue';
  import { DatasourceMoveResponse } from '/@/apis/gct-platform/model';
  import { getDatasourceMoveDetailList } from '/@/apis/gct-platform/DatasourceMoveDetailController';
  import { uploadApi } from '/@/api/sys/upload';
  import { CropperAvatar } from '/@/components/Cropper';
  import { getTenantManagementUserPageList } from '/@/apis/gct-platform/TenantManagementUserController';
  import { CaretDownOutlined, CaretTightOutlined } from '@ant-design/icons-vue';

  const { t } = useI18n();

  const tableContainerRef = ref();

  const formRef = ref<FormInstance>();

  const { scrollHeight } = useAntTableScrollHeight(tableContainerRef);
  //modal框
  const [register, { openModal: openSucessModal }] = useModal();
  const [registerFail, { openModal: openFailModal }] = useModal();

  const EnvMap = {
    dev: $t('sys.integration.env.dev'),
    prod: $t('sys.integration.env.prod'),
    test: $t('sys.integration.env.test'),
  };

  const columns: TableColumnsType = [
    {
      title: t('sys.app.index'),
      dataIndex: 'appName',
      key: 'appName',
      ellipsis: true,
    },
    {
      title: t('sys.migrantUser'),
      dataIndex: 'createUserName',
      key: 'createUserName',
      ellipsis: true,
    },
    {
      title: '源环境',
      dataIndex: 'sourceEnv',
      key: 'sourceEnv',
      ellipsis: true,
    },
    {
      title: '目标环境',
      dataIndex: 'destEnv',
      key: 'destEnv',
      ellipsis: true,
    },
    {
      title: t('sys.migrantTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.instanceStatus'),
      dataIndex: 'status',
      key: 'status',
      width: 150,
    },
  ];

  const innerColumns: TableColumnsType = [
    {
      title: t('sys.name'),
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
    },
    {
      title: t('sys.type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: t('sys.status'),
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      key: 'action',
      width: 150,
    },
  ];

  const statusOptions = [
    {
      key: 'unstart',
      label: t('sys.process.delegation.NOT_STARTED'),
    },
    {
      key: 'ongoing',
      label: t('sys.edhr.processStatusEnum.running'),
    },
    {
      key: 'finished',
      label: t('sys.process.finished'),
    },
  ];

  const loading = ref(false);

  const userOptions = ref([
    {
      fullname: '管理员',
      enabled: 1,
      username: 'gct-admin',
      value: '管理员',
      avatar: 'system/user_default_img-fddbb29e-63ec-46e9-bf70-6330df2cf555.png',
    },
  ]);

  const tableData = ref<DatasourceMoveResponse[]>([]);

  const innerData = ref({});

  const formState = reactive({
    createUserName: undefined,
    status: undefined,
  });

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const onExpand = async (expanded, record) => {
    if (expanded) {
      getDatasourceMoveDetailList({ id: record.id }).then((res) => {
        innerData.value[record.id] = res || [];
        loading;
      });
    }
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const res = await postDatasourceMovePageList({
      ...formState,
      pageNo,
      pageSize: pagination.pageSize,
    }).finally(() => {
      loading.value = false;
    });
    pagination.current = res?.pageNo;
    pagination.total = res?.totalCount;
    tableData.value = res?.data ?? [];
  };

  const getUserOptions = async () => {
    const result = await getTenantManagementUserPageList({
      pageNo: 1,
      pageSize: 9999,
    });
    if (result?.data) {
      userOptions.value = userOptions.value.concat(
        result?.data.map((i) => ({
          ...i,
          value: i.fullname,
        })),
      );
    }
  };

  const handleTableChange = (paginationInfo) => {
    const { current, total, pageSize } = paginationInfo;
    pagination.current = current;
    pagination.total = total;
    pagination.pageSize = pageSize;
    getTableData();
  };

  const handleReset = () => {
    formRef.value?.resetFields();
    getTableData(1);
  };

  const onClickAdd = async () => {
    const res = await gct.openUtil.fullScreen(designer, {});
    if (res.ok) {
      getTableData(1);
    }
  };

  const openDataDetail = (state, record) => {
    if (state === 'success') {
      openSucessModal(true, { id: record.id });
    }
    if (state === 'fail') {
      openFailModal(true, { id: record.id });
    }
  };

  onMounted(() => {
    getTableData(1);
    getUserOptions();
  });
</script>
<style lang="less" scoped>
  .status {
    color: var(--status-color);
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

  .is-readonly {
    pointer-events: none;
  }
</style>
