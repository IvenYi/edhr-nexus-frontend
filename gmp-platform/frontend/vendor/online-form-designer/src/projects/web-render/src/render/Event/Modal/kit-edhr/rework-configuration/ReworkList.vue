<!--
  @description: 返工任务列表
  @author: Jayson
  @date: 2025-07-25
-->
<template>
  <div :class="ns.b()">
    <div class="flex items-center justify-between mb-4">
      <div :class="ns.e('title')">{{ $t('sys.edhr.reworkList') }}</div>
      <div v-if="!isViewMode" :class="ns.e('action')">
        <a-button type="primary" @click="onCreateTask">{{ $t('sys.new') }}</a-button>
      </div>
    </div>

    <a-table
      size="small"
      :columns="tableColumns"
      :dataSource="computedTableData"
      :pagination="false"
      :loading="tableLoading"
    >
      <template #bodyCell="{ record, index, column }">
        <div v-if="column.dataIndex === 'index'">{{ index + 1 }}</div>

        <status-tag v-if="column.dataIndex === 'status_'" :status="record.status_" />

        <div class="flex items-center" v-if="column.dataIndex === 'action'">
          <template v-if="!record.status_ || (record.status_ === 'waiting' && !isViewMode)">
            <a-button type="link" @click="onEditTask(EOpeType.EDIT, record, index)">
              {{ $t('sys.edit') }}
            </a-button>
            <a-popconfirm
              :title="$t('sys.edhr.confirmToDelete')"
              :ok-text="$t('sys.true')"
              :cancel-text="$t('sys.false')"
              @confirm="onDeleteTask(record, index)"
            >
              <a-button type="link" danger>{{ $t('sys.delText') }}</a-button>
            </a-popconfirm>
          </template>
          <a-button v-else type="link" @click="onEditTask(EOpeType.DETAIL, record, index)">
            {{ $t('sys.view') }}
          </a-button>
        </div>
      </template>
    </a-table>
  </div>

  <div
    v-if="modal && !isViewMode"
    class="absolute p-24px bottom-0px left-0px border-top w-full text-right"
    :class="ns.e('footer')"
  >
    <a-button style="margin-right: 8px" @click="onCancel">{{ $t('sys.cancelText') }}</a-button>
    <a-button type="primary" @click="onSubmit" :loading="submitLoading">
      {{ $t('sys.okText') }}
    </a-button>
  </div>
</template>

<script lang="ts" setup>
  import { computed, onMounted, ref } from 'vue';
  import { message as Message } from 'ant-design-vue';
  import { EntityModelCategoryEnum, IModal, useNamespace } from '@gct/runtime';
  import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
  import { postBizServiceByModelKeyByBsKey } from '/@/apis/gct-apaas/BsServiceController';
  import { taskTableColumns } from './config';
  import { EOpeType, EReworkTaskType } from '../types';

  import ProcessConfig from './ProcessConfiguration.vue';
  import StatusTag from './status-tag/status-tag.vue';

  const defProps = defineProps<{
    modal: IModal;
    data: any;
    isViewMode?: boolean;
  }>();

  const ns = useNamespace('rework-process-list');

  const isSn = computed(() => {
    return defProps.data.taskType === EReworkTaskType.SN;
  });
  const isViewMode = computed(() => defProps.isViewMode);

  const submitLoading = ref(false);
  const tableColumns = computed(() => {
    const type = defProps.data.taskType ?? EReworkTaskType.CONTAINER;
    return taskTableColumns[type]?.columns ?? [];
  });
  const tableLoading = ref(false);
  const dataSource = ref<any[]>([]);
  const computedTableData = computed(() => {
    return dataSource.value.filter((item) => !item.deleted_);
  });
  // 存储提交至后端的数据
  const copyDataSource = computed(() => {
    return dataSource.value.filter((item) => item.operation_type_);
  });

  const baseTaskData = {
    taskType: defProps.data?.taskType,
    txn_inst_id_: defProps.data?.txn_inst_id_,
    sn_id_: defProps.data?.sn_id_ ?? undefined,
    container_id_: defProps.data?.container_id_ ?? undefined,
    product_id_: defProps.data?.product_id_ ?? undefined,
  };

  async function loadReworkConfigsData() {
    try {
      tableLoading.value = true;
      const res: any =
        await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
          {
            bsKey: 'listAll',
            modelKey: isSn.value ? 'em_sn_rework' : 'em_container',
            modelCategory: EntityModelCategoryEnum.ENTITY,
          },
          {
            query: {
              split_from_id_: isSn.value ? undefined : defProps.data.container_id_,
              sn_id_: isSn.value ? defProps.data.sn_id_ : undefined,
              txn_inst_id_: defProps.data.txn_inst_id_ ?? undefined,
            },
            sorts: [
              {
                sortField: 'create_time_',
                sortType: 'desc',
              },
            ],
          },
        );
      dataSource.value = res.data;
    } catch (error) {
      console.log(error);
    }
    tableLoading.value = false;
  }

  async function onCreateTask() {
    const res: any = await gct.openUtil.drawer(
      ProcessConfig,
      {
        opeType: EOpeType.ADD,
        taskData: {
          id_: null,
          ...baseTaskData,
        },
      },
      {
        title: $t('sys.edhr.reworkConfiguration'),
        width: 1200,
        showFooter: false,
        class: 'rework-process-drawer',
      },
    );
    if (res && res.ok && res.data) {
      dataSource.value.unshift(Object.assign(res.data, { operation_type_: EOpeType.ADD }));
    }
  }
  async function onEditTask(opeType: EOpeType, rowData, idx) {
    const res: any = await gct.openUtil.drawer(
      ProcessConfig,
      {
        opeType,
        taskData: {
          ...rowData,
          ...baseTaskData,
        },
      },
      {
        title: $t('sys.edhr.reworkConfiguration'),
        width: 1200,
        showFooter: false,
        class: 'rework-process-drawer',
      },
    );
    if (opeType === EOpeType.DETAIL) return;

    if (res && res.ok && res.data) {
      dataSource.value.splice(idx, 1, {
        ...res.data,
        operation_type_: res.data?.id_ ? EOpeType.EDIT : EOpeType.ADD,
      });
    }
  }

  async function onDeleteTask(rowData, index) {
    if (rowData.id_) {
      rowData.deleted_ = true;
      rowData.operation_type_ = 'delete';
    } else {
      dataSource.value.splice(index, 1);
    }
  }

  /**
   * do submit!!!
   * @description 提交数据.（兼容SN的批量提交，此版本SN的返工任务提交本质上只支持单个任务提交不走此处的逻辑）
   */
  async function onSubmit() {
    try {
      submitLoading.value = true;
      const res = await postBizServiceByModelKeyByBsKey(
        {
          bsKey: 'biz_rework',
          modelKey: isSn.value ? 'em_sn' : 'em_container',
        },
        copyDataSource.value,
      );
      Message.success($t('sys.saveSuccess'));
      defProps.modal.dismiss({ ok: true, data: res } as any);
    } catch (err) {
      /* empty */
    } finally {
      submitLoading.value = false;
    }
  }

  function onCancel() {
    defProps.modal.dismiss();
  }

  onMounted(() => {
    loadReworkConfigsData();
  });
</script>
<style lang="scss">
  @include b(rework-process-list) {
    @include e(title) {
      position: relative;
      padding-left: 12px;

      &::before {
        content: '';
        background-color: var(--ant-primary-color);
        width: 3px;
        height: 16px;
        position: absolute;
        top: 50%;
        left: 0;
        transform: translateY(-50%);
      }
    }

    @include e(footer) {
      display: flex;
      align-items: center;
      justify-content: end;
      min-height: 60px;
      padding: 0 16px 6px;
      background-color: #ffffff;
      box-shadow: 0 -2px 10px 0 rgba(0, 0, 0, 0.06);
      z-index: 999;
    }
  }
</style>
