import { ref, computed } from 'vue';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { GctPopup } from '@mobile/utils/popup';
import EsopSelectorPopup from '@mobile/views/edhr/_comps_/esop/esop-selector-popup.vue';
import FormFillingPopup from '@mobile/views/edhr/_comps_/form/filling-popup.vue';
import ReworkReportPopup from '@mobile/views/edhr/_comps_/report/rework-report-popup.vue';
import { showSuccessToast } from 'vant';
import { useRoute, useRouter } from 'vue-router';
import ContainerOperationPicker from '@mobile/views/edhr/_comps_/container-operation/picker-popup.vue';
import dayjs from 'dayjs';
import EsopSvg from '@mobile/assets/svg/esop.svg';
import FillingSvg from '@mobile/assets/svg/filling.svg';
import ReportSvg from '@mobile/assets/svg/report.svg';
import ReturnSvg from '@mobile/assets/svg/return.svg';

interface IContainerOperation {
  container_name_: string;
  current_routing_operation_ids_: string;
  f_material_name_jhwd: string;
  f_mfg_order_jhwd: string;
  good_qty_sum_: number;
  mfg_order_id_: string;
  not_good_qty_sum_: number;
  operation_qty_: number;
  original_qty_: number;
  product_id_: string;
  report_enabled_: boolean;
  report_qty_sum_: number;
  reports?: Array<{
    id: string;
    good_qty_: number;
    not_good_qty_: number;
    scrap_qty_: number;
    create_time_: string;
  }>;
  scrap_qty_sum_: number;
  start_work_date_: string;
  status_: string;
}

interface IContainerOperationEsop {
  file: string;
  id: string;
  name: string;
  pageNumber: number;
  type: string;
  url: string;
}

const containerId = ref<string>();
const containerOperations = ref<any[]>([]);
const containerOperationId = ref<string>('');
const containerOperationInfo = ref<IContainerOperation>();
const containerOperationEsops = ref<IContainerOperationEsop[]>([]);
const containerOperationEsopId = ref<string>('');

const containerOperationProcess = computed(() => {
  if (!containerOperationInfo.value) return 0;
  const { report_qty_sum_, original_qty_ } = containerOperationInfo.value;
  const value = ((report_qty_sum_ / original_qty_) * 100).toFixed(1);
  return Number(value);
});
const containerOperationEsopDetail = computed(() => {
  return containerOperationEsops.value.find((item) => item.id === containerOperationEsopId.value);
});

const containerOperationInfoById = computed(() => {
  return containerOperations.value.find((item) => item.id_ === containerOperationId.value);
});

async function loadOperations() {
  if (!containerId.value) return;
  const res = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      bsKey: 'biz_get_current_operations',
      modelKey: 'em_container',
      modelCategory: 'entity',
    },
    {
      container_id_: containerId.value,
    },
  );
  if (((res ?? []) as any[]).length === 0) {
    // 没有下一工序则更新当前工序
    loadOperationInfo();
    return;
  }
  containerOperations.value = res as any;
  containerOperationId.value = containerOperations.value[0]?.id_;
}

async function loadOperationInfo() {
  if (!containerId.value || !containerOperationId.value) return;
  const res = await getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      bsKey: 'biz_rework_task_operaion_info_jhwd',
      modelKey: 'dm_rework_task_operaion_info_jhwd',
      modelCategory: 'data',
    },
    {
      container_id_: containerId.value,
      routing_operation_id_: containerOperationId.value,
      withReport: 1,
    },
  );
  containerOperationInfo.value = res as IContainerOperation;
  if (containerOperationInfo.value?.reports) {
    containerOperationInfo.value.reports.forEach(
      (item) => (item.create_time_ = dayjs(item.create_time_).format('YYYY-MM-DD HH:mm:ss')),
    );
  }
}

async function loadOperationEsops() {
  if (!containerId.value || !containerOperationId.value) return;
  const res = await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      bsKey: 'biz_get_sop',
      modelKey: 'em_routing_operation_config',
      modelCategory: 'entity',
    },
    {
      container_id_: containerId.value,
      routing_operation_id_: containerOperationId.value,
      sorts: [
        {
          sortField: 'create_time_',
          sortType: 'desc',
        },
      ],
      task_type_: 'rework',
    },
  );
  containerOperationEsops.value = (res.data ?? []).map((item) => item.sopDocument);
  containerOperationEsopId.value = containerOperationEsops.value[0]?.id;
}

/**
 * 开工
 */
const handleStartWork = async () => {
  if (!containerId.value || !containerOperationId.value) return;
  await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      bsKey: 'execute',
      modelKey: 'em_txn_start_work',
      modelCategory: 'entity',
    },
    {
      container_id_: containerId.value,
      routing_operation_id_: containerOperationId.value,
    },
  );
  showSuccessToast('开工成功');
  loadOperationInfo();
};

/**
 * 完工
 */
const handleCompleteWork = async () => {
  if (!containerId.value || !containerOperationId.value) return;
  await postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
    {
      bsKey: 'execute',
      modelKey: 'em_txn_complete_work',
      modelCategory: 'entity',
    },
    {
      container_id_: containerId.value,
      routing_operation_id_: containerOperationId.value,
    },
  );
  showSuccessToast('完工成功');
  loadOperations();
  // loadOperationInfo();
};

function init() {
  const route = useRoute();
  containerId.value = route.query.id as string;
  containerOperationId.value = undefined;
}

function toggleContainerOperation() {
  GctPopup.open(ContainerOperationPicker, {
    context: {
      list: containerOperations.value,
      id: containerOperationId.value,
    },
    onOk: (id: string) => {
      containerOperationId.value = id;
    },
  });
}

export function useReworkRun() {
  const router = useRouter();
  const floatingBtns = computed(() => {
    const actions = [
      {
        name: 'ESOP',
        svg: EsopSvg,
        callback: () => {
          GctPopup.open(EsopSelectorPopup, {
            context: {
              esops: containerOperationEsops.value,
              esopId: containerOperationEsopId.value,
            },
            onOk: (value: string) => {
              containerOperationEsopId.value = value;
            },
          });
        },
      },
      {
        name: '表单填报',
        svg: FillingSvg,
        callback: () => {
          GctPopup.open(FormFillingPopup, {
            context: {
              containerId: containerId.value,
              containerName: containerOperationInfo.value.container_name_,
              containerOperationId: containerOperationId.value,
              module: 'rework',
              vueRouterInst: router,
            },
          });
        },
      },
      {
        name: '不良处置',
        svg: ReportSvg,
        callback: () => {
          GctPopup.open(ReworkReportPopup, {
            context: {
              containerId: containerId.value,
              containerOperationId: containerOperationId.value,
              module: 'production',
            },
            onOk: () => {
              loadOperationInfo();
            },
          });
        },
        // 未开始
        hidden: containerOperationInfo.value?.status_ !== 'running',
      },
      {
        name: '返回列表',
        svg: ReturnSvg,
        callback: () => {
          router.back();
        },
      },
    ];
    return actions;
  });

  return {
    init,
    containerId,
    containerOperations,
    containerOperationId,
    containerOperationInfoById,
    containerOperationInfo,
    containerOperationProcess,
    containerOperationEsops,
    containerOperationEsopId,
    loadOperations,
    loadOperationInfo,
    loadOperationEsops,
    floatingBtns,
    containerOperationEsopDetail,
    handleStartWork,
    handleCompleteWork,
    toggleContainerOperation,
  };
}
