import { GctPopup } from '@mobile/utils/popup';
import { GctDialog } from '@mobile/utils/dialog';
import EsopSelectorPopup from '@mobile/views/edhr/_comps_/esop/esop-selector-popup.vue';
import FormFillingPopup from '@mobile/views/edhr/_comps_/form/filling-popup.vue';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as get,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as post,
  postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey as postGeneral,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { getTranslateValue } from '@mobile/utils/translate';
import { ref, computed } from 'vue';
import ContainerOperationPicker from '@mobile/views/edhr/_comps_/container-operation/picker-popup.vue';
import type { IContainerOperationEsop } from '@mobile/views/edhr/_comps_/esop/type';
import {
  fetchTxnList,
  getLotOrSnByName,
  findContainerByName,
} from '@mobile/views/edhr/_hooks_/useApi';
import PartEndModal from './components/part-end-modal.vue';
import { TxnHandler } from '../txn/txn-handler';
import produceInfoPopup from './components/produce-info-popup.vue';
import ArisenTxnListPopup from './components/arisen-txn-list-popup.vue';
import { add } from 'lodash-es';
import {
  MATERIAL_STATUS_ENUM,
  TASK_TYPE__ENUM,
  selectLotSn,
  checkedScanCode,
} from './useBasicsRun';

dayjs.extend(duration);

export interface IContainerInfo {
  /** lot/sn数据的id */
  id: string;
  /** lot/sn号 */
  name: string;
  /** 类型 */
  type: MATERIAL_STATUS_ENUM.LOT | 'SN';
  /** 工单号 */
  order: string;
  /** 工单号id */
  mfgOrderId: string;
  /**产品名称 */
  productName: string;
  /**产品id */
  productId: string;
  /** 生产数量 */
  produceNum: number;
  /** 当前状态 */
  status: 'running' | 'waiting';
  /** 是否可持续生产 */
  isContinuousProduction: boolean;
  /** 当前工序名称 */
  currentRouteOp: string;
  /**
   * 是否隐藏结束按钮
   */
  continuous_?: boolean;
}

export interface IContainerOperation {
  /** 总数 */
  totalNum: number;
  /** 良品数 */
  goodNum: number;
  /** 不良品数 */
  notGoodNum: number;
  /** 总时长 */
  totalDuration: string;
}

export function useProduceRun2() {
  const route = useRoute();
  const router = useRouter();
  const loadingStartWork = ref(false);
  const loadingEndWork = ref(false);
  /**
   * 批次/sn的状态类型
   */
  const material_status_ = route.meta.material_status_ as MATERIAL_STATUS_ENUM;
  /** 批次 返工 */
  const task_type_ = route.meta.task_type_ as TASK_TYPE__ENUM;

  const containerLabel = material_status_ === MATERIAL_STATUS_ENUM.LOT ? '生产批次' : 'SN';
  /**部分接口参数key */
  const paramsKey = material_status_ === MATERIAL_STATUS_ENUM.LOT ? 'container_id_' : 'sn_id_';
  /** 批次/sn号的 name*/
  const containerName = ref(route.query.id as string);
  /** 批次/sn相关信息 */
  const containerInfo = ref<IContainerInfo>();
  /** 批次/sn号的id */
  const containerId = computed(() => containerInfo.value?.id);
  /** 当前显示的工序id*/
  const containerOperationId = ref();
  /** 当前工序统计信息 */
  const containerOperationInfo = ref<IContainerOperation>();
  /** 当前并行工序集合 */
  const containerOperations = ref<any[]>([]);
  /** 接口的模型名称 */
  const modelKey = computed(() =>
    containerInfo.value?.type === MATERIAL_STATUS_ENUM.LOT ? 'em_container' : 'em_sn',
  );

  /** 点前选中的工序具体信息 */
  const containerOperationInfoById = computed(() => {
    return containerOperations.value.find((item) => item.id_ === containerOperationId.value);
  });

  /** 当前工序的ESOP集合 */
  const containerOperationEsops = ref<IContainerOperationEsop[]>([]);
  /** 当前展示的ESOPId */
  const containerOperationEsopId = ref<string>('');

  /** 当前显示的ESOP详情 */
  const containerOperationEsopDetail = computed(() => {
    return containerOperationEsops.value.find((item) => item.id === containerOperationEsopId.value);
  });

  /** 事务的处理器 */
  const txnHandler = ref<TxnHandler>();
  /** 事务列表集合 */
  const txnList = computed(() => {
    return txnHandler.value?.txnList ?? [];
  });

  /**切换单号 */
  async function selectLotSnPopup() {
    const { name_ } = await selectLotSn({ material_status_, task_type_ }, containerName.value);
    containerName.value = name_;
  }

  /**扫码切换单号 */
  async function selectScanCode() {
    const { name_ } = await checkedScanCode(material_status_);
    containerName.value = name_;
  }
  /**
   * 根据id加载数据信息
   * @param id
   * @return {*}
   */
  async function loadContainerInfo() {
    try {
      const res = await getLotOrSnByName(containerName.value);
      containerInfo.value = {
        name: res.data.name_,
        id: res.data.id_,
        type: res.type,
        status: res.data.status_,
        order: getTranslateValue(res, 'mfg_order_id_'),
        mfgOrderId: res.data.mfg_order_id_,
        productName: getTranslateValue(res, 'product_id_'),
        productId: res.data.product_id_,
        currentRouteOp: getTranslateValue(res, 'current_routing_operation_ids_'),
        produceNum: res.data.qty_,
        isContinuousProduction: res.data.continuous_production_enabled_,
      };
    } catch (error) {
      router.back();
    }
  }

  /**
   * 加载工序集合
   * @return {*}
   */
  async function loadOperations() {
    if (!containerId.value) return;
    const res = await get(
      {
        bsKey: 'biz_get_current_operations',
        modelKey: modelKey.value,
        modelCategory: 'entity',
      },
      {
        [paramsKey]: containerId.value,
      },
    );
    if (((res ?? []) as any[]).length === 0) {
      // 没有下一工序则更新当前工序
      router.back();
      return;
    }
    containerOperations.value = res as any;
    const current =
      containerOperations.value.find((i) => i.id_ === containerOperationId.value) ||
      containerOperations.value[0];
    const { id_, status_ } = current;
    containerOperationId.value = id_;
    if (status_) {
      containerInfo.value.status = status_;
    }
    containerInfo.value.continuous_ = !!containerOperationInfoById.value.continuous_;
    return res;
  }

  /**
   * 加载工序的统计信息
   */
  async function loadOperationInfo() {
    const data = (await post(
      {
        bsKey: 'biz_summary_search',
        modelKey: 'em_form_report_info',
        modelCategory: 'entity',
      },
      {
        query: {
          routing_operation_id_: containerOperationId.value,
          [paramsKey]: containerId.value,
        },
      },
    )) as any;
    const { goodQtySum, notGoodQtySum, scrapQtySum, workHoursSum } = data;
    containerOperationInfo.value = {
      totalNum: add(goodQtySum, notGoodQtySum),
      goodNum: goodQtySum,
      notGoodNum: notGoodQtySum,
      totalDuration: workHoursSum?.toFixed(1) || 0,
    };
  }

  /**
   * 加载工序的ESOP
   * @return {*}
   */
  async function loadOperationEsops() {
    if (!containerId.value || !containerOperationId.value) return;
    const res = await post(
      {
        bsKey: 'biz_get_sop',
        modelKey: 'em_routing_operation_config',
        modelCategory: 'entity',
      },
      {
        [paramsKey]: containerId.value,
        production_type_: material_status_ === MATERIAL_STATUS_ENUM.LOT ? 'container' : 'sn',
        routing_operation_id_: containerOperationId.value,
        sorts: [
          {
            sortField: 'create_time_',
            sortType: 'desc',
          },
        ],
        task_type_: task_type_,
      } as any,
    );
    containerOperationEsops.value = (res.data ?? []).map((item) => item.sopDocument);
    containerOperationEsopId.value = containerOperationEsops.value[0]?.id;
  }

  /**
   * 初始化事务相关逻辑
   * 顺便加载列表
   *
   * @return {*}
   */
  async function initTxn() {
    if (!containerInfo.value) {
      return;
    }

    // 创建事务处理器
    txnHandler.value = new TxnHandler({
      type: 'production',
      containerType: material_status_,
      containerId: containerInfo.value.id,
      routingOperationId: containerOperationId.value,
      productId: containerInfo.value.productId,
    });

    await txnHandler.value.fetchList();
  }

  watch(
    () => containerOperationId.value,
    (val) => {
      if (!val) return;
      loadOperationInfo();
      loadOperationEsops();
      initTxn();
      if (!containerOperationInfoById.value?.has_permission_) {
        showToast('抱歉您没有权限操作该工序，请选择其它工序进行操作');
      }
    },
  );

  // 监听路由参数变化
  watch(
    containerName,
    async () => {
      await loadContainerInfo();
      await loadOperations();
    },
    { immediate: true },
  );

  /** 切换ESOP */
  const changeEsop = () => {
    GctPopup.open(EsopSelectorPopup, {
      context: {
        esops: containerOperationEsops.value,
        esopId: containerOperationEsopId.value,
      },
      onOk: (value: string) => {
        containerOperationEsopId.value = value;
      },
    });
  };

  const fillingForm = () => {
    GctPopup.open(FormFillingPopup, {
      context: {
        containerId: containerId.value,
        containerName: containerInfo.value?.name,
        containerOperationId: containerOperationId.value,
        mfgOrderId: containerInfo.value?.mfgOrderId,
        module: 'production',
        belongType: material_status_,
      },
    });
  };

  /** 开工 */
  async function handleStartWork() {
    if (!containerId.value || !containerOperationId.value) return;
    loadingStartWork.value = true;
    try {
      await showConfirmDialog({
        title: '提示',
        message: '是否确认将当前工序开始？',
      });
      await post(
        {
          bsKey: 'work_start',
          modelKey: modelKey.value,
          modelCategory: 'entity',
        },
        {
          txn_subject_id_: containerId.value,
          [paramsKey]: containerId.value,
          routing_operation_id_: containerOperationId.value,
          type_: 'production',
        },
      );
      showSuccessToast('开始成功');
      await handleReloadPage();
    } catch (error) {}
    loadingStartWork.value = false;
  }

  /** 部分完工 */
  async function handlePartEndWork() {
    if (!containerId.value || !containerOperationId.value) return;
    GctDialog.open(PartEndModal, {
      beforeClose: async (data: any) => {
        if (!data) return;
        await post(
          {
            bsKey: 'work_complete_partially',
            modelKey: modelKey.value,
            modelCategory: 'entity',
          },
          {
            txn_subject_id_: containerId.value,
            [paramsKey]: containerId.value,
            routing_operation_id_: containerOperationId.value,
            type_: 'production',
          },
        );
        showSuccessToast('部分执行成功');
        handleReloadPage();
      },
    });
  }

  /** 完工 */
  async function handleEndWork() {
    if (!containerId.value || !containerOperationId.value) return;
    loadingEndWork.value = true;
    try {
      await post(
        {
          bsKey: 'work_complete',
          modelKey: modelKey.value,
          modelCategory: 'entity',
        },
        {
          txn_subject_id_: containerId.value,
          [paramsKey]: containerId.value,
          routing_operation_id_: containerOperationId.value,
          type_: 'production',
        },
      );
      showSuccessToast('执行成功');
      await handleReloadPage();
    } catch (error) {}
    loadingEndWork.value = false;
  }
  async function handleReloadPage() {
    const { status_ } = await loadOperations();
    await loadContainerInfo();
    if (status_) {
      containerInfo.value.status = status_;
    }
  }
  function toggleContainerOperation() {
    return new Promise((resolve) => {
      GctPopup.open(ContainerOperationPicker, {
        context: {
          list: containerOperations.value,
          id: containerOperationId.value,
        },
        onOk: (id: string) => {
          containerOperationId.value = id;
          containerOperationInfoById.value.status_ &&
            (containerInfo.value.status = containerOperationInfoById.value.status_);
          containerInfo.value.continuous_ = !!containerOperationInfoById.value.continuous_;
          resolve(containerOperationInfoById.value);
        },
      });
    });
  }

  const clickTxnBtn = (data: any) => {
    txnHandler.value?.doBusiness(
      {
        procDefId: data.procDefId,
        txnDefinitionId: data.id,
      },
      // callback after txn done
      async () => {
        await loadOperationInfo();
        await txnHandler.value!.fetchList();
      },
    );
  };

  const sortTxn = () => {
    txnHandler.value?.editSort();
  };

  const openArisenTxnList = () => {
    const { id, mfgOrderId, type } = containerInfo.value;
    GctPopup.open(ArisenTxnListPopup, {
      context: {
        params: {
          sn_id_: type === 'SN' ? id : undefined,
          container_id_: type === 'SN' ? undefined : id,
          routing_operation_id_: containerOperationInfoById.value.id_,
          mfg_order_id_: mfgOrderId,
        },
        callback: loadOperationInfo,
      },
    });
  };
  /**
   * 打开更多详情
   */
  function openInfoPopup() {
    GctPopup.open(produceInfoPopup, {
      context: {
        type: material_status_,
        task_type_,
        containerInfo: containerInfo,
        containerOperationInfo: containerOperationInfoById,
        selectToggleContainerOperation: toggleContainerOperation,
        selectLotSnPopup,
      },
    });
  }
  return {
    selectScanCode,
    selectLotSnPopup,
    containerInfo,
    containerOperationInfo,
    containerOperationInfoById,
    containerOperationEsopDetail,
    txnList,
    changeEsop,
    fillingForm,
    toggleContainerOperation,
    handleStartWork,
    handleEndWork,
    handlePartEndWork,
    clickTxnBtn,
    sortTxn,
    material_status_,
    openInfoPopup,
    containerLabel,
    loadingStartWork,
    loadingEndWork,
    openArisenTxnList,
  };
}
