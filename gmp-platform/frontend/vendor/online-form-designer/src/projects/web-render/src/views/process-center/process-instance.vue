<template>
  <basic-page-render>
    <div class="p-16px" :class="ns.b('wrapper')">
      <a-form class="flex-none" ref="formRef" :model="formState" autocomplete="off">
        <div class="w-full">
          <a-row :gutter="24">
            <a-col :span="8">
              <a-form-item
                name="title"
                :label="t('sys.titleOfSth', { sth: t('sys.process.index') })"
              >
                <a-input :placeholder="t('sys.inputText')" v-model:value="formState.title" />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item
                name="processDefName"
                :label="t('sys.nameOfSth', { sth: t('sys.process.approval') })"
              >
                <a-input
                  :placeholder="t('sys.inputText')"
                  v-model:value="formState.processDefName"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8">
              <a-form-item name="combinedStatus" :label="t('sys.process.index') + t('sys.status')">
                <a-select
                  v-model:value="formState.combinedStatus"
                  :placeholder="t('sys.chooseText')"
                  allow-clear
                >
                  <a-select-option
                    v-for="value in Object.values(ProcessStatusEnum)"
                    :value="value"
                    :key="value"
                    >{{ t(ch_ProcessStatusMap[value]) }}</a-select-option
                  >
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="8">
              <a-form-item :label="t('sys.process.initiator')" name="initiator">
                <a-select
                  allow-clear
                  v-model:value="formState.initiator"
                  :placeholder="t('sys.chooseText')"
                >
                  <a-select-option
                    :value="item.id"
                    v-for="item in initiatorOptions"
                    :key="item.id"
                    >{{ item.fullname }}</a-select-option
                  >
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="8">
              <a-form-item :label="t('sys.process.currentApprover')" name="assignees">
                <a-select
                  allow-clear
                  v-model:value="formState.assignees"
                  :placeholder="t('sys.chooseText')"
                >
                  <a-select-option
                    :value="item.id"
                    v-for="item in approverOptions"
                    :key="item.id"
                    >{{ item.fullname }}</a-select-option
                  >
                </a-select>
              </a-form-item>
            </a-col>

            <a-col :span="8">
              <a-form-item name="taskNames" :label="t('sys.process.currentNode')">
                <a-input :placeholder="t('sys.inputText')" v-model:value="formState.taskNames" />
              </a-form-item>
            </a-col>

            <a-col :span="8">
              <a-form-item name="processInstanceId" :label="t('sys.process.processInstanceID')">
                <a-input
                  :placeholder="t('sys.inputText')"
                  v-model:value="formState.processInstanceId"
                />
              </a-form-item>
            </a-col>
            <a-col :span="8" :offset="8" class="text-right">
              <a-button class="mr-10px" @click="handleReset">
                {{ t('sys.reset') }}
              </a-button>
              <a-button type="primary" @click="() => getTableData(1)">
                {{ t('sys.queryText') }}
              </a-button>
            </a-col>
          </a-row>
        </div>
      </a-form>
      <BasicTable
        :class="ns.b('table')"
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
            {{ index + 1 }}
          </template>
          <template v-if="column.key === 'procDefName'">
            <span
              :class="ns.be('table', 'proc-def-name')"
              :title="record.procDefName"
              @click="clickEditRow(record)"
              >{{ record.procDefName }}</span
            >
          </template>
          <template v-if="column.key === 'id'">
            <span class="flex">
              <span class="flex-1 truncate" :title="record.id">{{ record.id }}</span>
              <i
                class="iconfont icon-fuzhi primary-gct cursor-pointer"
                @click.stop="handleClipboardKey(record.id)"
                style="margin-left: 4px"
              ></i>
            </span>
          </template>
          <template v-if="column.key === 'combinedStatus'">
            <span :class="[ns.be('table', 'status'), statusClassMap[record.combinedStatus]]">
              {{ t(ch_ProcessStatusMap[record.combinedStatus]) }}</span
            >
          </template>
          <template v-if="column.key === 'action'">
            <table-action-auto
              :actions="[
                {
                  ifShow: !!userActions.Log,
                  label: t('sys.appDesigner.log'),
                  onClick: clickEditRow.bind(null, record),
                },
                {
                  label: t('sys.process.terminate'),
                  color: 'text',
                  ifShow:
                    !!userActions.Terminate &&
                    ![ProcessStatusEnum.TERMINATED, ProcessStatusEnum.COMPLETED].includes(
                      record.combinedStatus,
                    ),
                  popConfirm: {
                    title: t('sys.sureToDo'),
                    confirm: handleTerminated.bind(null, record),
                  },
                },
                {
                  label: t('sys.process.reassign'),
                  ifShow:
                    !!userActions.Reassign && record.combinedStatus === ProcessStatusEnum.APPROVING,
                  onClick: handleReassign.bind(null, record),
                },
              ]"
              :stopButtonPropagation="true"
            />
          </template>
        </template>
      </BasicTable>
    </div>
    <process-instance-drawer ref="processInstanceDrawerRef" :userActions="userActions" />
    <process-instance-modal @register="register" @ok="handleOk" />
  </basic-page-render>
</template>

<script setup lang="ts" name="process-instance">
  import { ref, reactive, onMounted, computed, unref } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import type { FormInstance, TablePaginationConfig } from 'ant-design-vue';
  import { ProcessStatusEnum, ch_ProcessStatusMap, useNamespace } from '@gct/runtime';
  import { CustomAction } from '/@/enums/authActionEnum';
  import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
  import { message } from 'ant-design-vue';
  import ProcessInstanceDrawer from './modal/process-instance-drawer.vue';
  import { useModal } from '/@/components/Modal';
  import {
    getPmProcessEnginePageList,
    getPmProcessEngineListAllAssignees,
    getPmProcessEngineListAllInitiators,
    postPmProcessEngineProcExecute,
  } from '/@/apis/gct-apaas/PmProcessEngineController';
  import { ProcessInstanceResponse, UserBase } from '/@/apis/gct-apaas/model';
  import { BasicTable, TableActionAuto, BasicColumn } from '/@/components/Table';
  import ProcessInstanceModal from './modal/process-instance-modal.vue';
  import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
  import { useMessage } from '/@/hooks/web/useMessage';

  const { createMessage } = useMessage();
  const formRef = ref<FormInstance>();
  const { t } = useI18n();
  const [register, { openModal }] = useModal();

  const initiatorOptions = ref<UserBase[]>([]);
  const approverOptions = ref<UserBase[]>([]);
  const loading = ref<boolean>(false);
  const tableData = ref<ProcessInstanceResponse[]>([]);
  const ns = useNamespace('process-isnstance');
  const processInstanceDrawerRef = ref();

  const pagination: TablePaginationConfig = reactive({
    current: 1,
    pageSize: 20,
    total: 0,
    size: 'small',
    showSizeChanger: true,
    showTotal: (total) => t('sys.component.table.total', { total }),
  });

  const formState = reactive({
    title: '', // 流程标题
    processDefName: '', // 流程名称
    combinedStatus: undefined, // 流程状态
    initiator: undefined, // 发起人
    assignees: undefined, // 当前审批人
    taskNames: '', // 当前环节
    processInstanceId: '', // 流程实例id
  });

  const statusClassMap = {
    [ProcessStatusEnum.APPROVING]: 'approving',
    [ProcessStatusEnum.COMPLETED]: 'completed',
    [ProcessStatusEnum.REFUSED]: 'refused',
    [ProcessStatusEnum.REJECTED]: 'rejected',
    [ProcessStatusEnum.TERMINATED]: 'terminated',
    [ProcessStatusEnum.WITHDRAWN]: 'withdrawn',
  };

  const userActions = computed(() => {
    return {
      [CustomAction.Log]: getPermissionByKey('ProcessInstance', CustomAction.Log),
      [CustomAction.Terminate]: getPermissionByKey('ProcessInstance', CustomAction.Terminate),
      [CustomAction.Reassign]: getPermissionByKey('ProcessInstance', CustomAction.Reassign),
    };
  });

  // const tableContainerRef = ref();
  // const { scrollHeight, calcScrollHeight } = useAntTableScrollHeight(tableContainerRef);

  const columns: BasicColumn[] = [
    {
      title: '序号',
      dataIndex: 'index',
      key: 'index',
      width: 72,
    },
    {
      title: t('sys.process.approvalName'),
      dataIndex: 'procDefName',
      key: 'procDefName',
    },
    {
      title: t('sys.process.processInstanceID'),
      dataIndex: 'id',
      key: 'id',
      width: 180,
    },
    {
      title: t('sys.titleOfSth', { sth: t('sys.process.index') }),
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: t('sys.status'),
      dataIndex: 'combinedStatus',
      key: 'combinedStatus',
    },
    {
      title: t('sys.process.initiator'),
      dataIndex: 'initiatorName',
      key: 'initiatorName',
    },
    {
      title: t('sys.process.currentNode'),
      dataIndex: 'taskNames',
      key: 'taskNames',
    },
    {
      title: t('sys.process.currentApprover'),
      dataIndex: 'assigneeNames',
      key: 'assigneeNames',
    },

    {
      title: t('sys.process.submitTime'),
      dataIndex: 'createTime',
      key: 'createTime',
      minWidth: 170,
      width: 170,
    },
    {
      title: t('sys.operation'),
      dataIndex: 'action',
      fixed: 'right',
      align: 'left',
      width: 180,
    },
  ];

  onMounted(() => {
    getTableData();
    getInitiators();
    getAssignees();
  });

  const handleTableChange = (paginationInfo) => {
    Object.assign(pagination, paginationInfo);
    getTableData();
  };

  const getTableData = async (pageNo: number = pagination.current!) => {
    loading.value = true;
    const params = Object.assign(formState, { pageNo, pageSize: pagination.pageSize! });
    try {
      const res = await getPmProcessEnginePageList(params).finally(() => {
        loading.value = false;
      });
      pagination.current = res?.pageNo;
      pagination.total = res?.totalCount;
      tableData.value = res?.data ?? [];
    } catch (e) {
      loading.value = false;
    }
  };

  const getInitiators = async () => {
    const res = await getPmProcessEngineListAllInitiators();
    initiatorOptions.value = res || [];
  };

  const getAssignees = async () => {
    const res = await getPmProcessEngineListAllAssignees();
    approverOptions.value = res || [];
  };

  const handleReset = () => {
    formRef.value?.resetFields();
    getTableData();
  };

  const clickEditRow = async (record) => {
    processInstanceDrawerRef.value?.onOpen(record.id);
  };

  const handleTerminated = async (record) => {
    const processData = {
      procInstId: record.id,
      button: 'ForceTerminate',
    } as any;
    await postPmProcessEngineProcExecute(processData);
    message.success(t('sys.doSuccess'));
    getTableData();
  };

  const handleReassign = (record) => {
    openModal(true, { data: record });
  };

  const handleOk = () => {
    message.success(t('sys.doSuccess'));
    getTableData();
  };

  function handleClipboardKey(id) {
    const { isSuccessRef } = useCopyToClipboard(id);
    unref(isSuccessRef) && createMessage.success(t('sys.copySuccess'));
  }
</script>

<style lang="scss" scoped>
  @include b(process-isnstance-table) {
    // padding: 0 16px;
    @include e(proc-def-name) {
      cursor: pointer;
      color: var(--ant-primary-color);
    }

    @include e(status) {
      border-radius: 4px;
      border-color: transparent;
      display: inline-block;
      line-height: 22px;
      padding: 0 6px;
      &.approving {
        color: #3168ec;
        background: #ecf1fd;
      }
      &.completed {
        color: #309c41;
        background: #def8e2;
      }
      &.refused {
        color: #f54547;
        background: #fef5f5;
      }
      &.rejected {
        color: #ff8c4b;
        background: #fff5e7;
      }
      &.terminated {
        color: #bd0a0c;
        background: #fce3e3;
      }
      &.withdrawn {
        color: #797a7d;
        background: #e8ebf0;
      }
    }
  }
</style>
