import { GctPopup } from '@mobile/utils/popup';
import { GctDialog } from '@mobile/utils/dialog';
import EsopSelectorPopup from '@mobile/views/edhr/_comps_/esop/esop-selector-popup.vue';
import FormFillingPopup from '@mobile/views/edhr/_comps_/form/filling-popup.vue';
import { showConfirmDialog, showSuccessToast, showToast } from 'vant';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as get,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as post,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { getTranslateValue } from '@mobile/utils/translate';
import { ref, computed } from 'vue';
import ContainerOperationPicker from '@mobile/views/edhr/_comps_/container-operation/picker-popup.vue';
import type { IContainerOperationEsop } from '@mobile/views/edhr/_comps_/esop/type';
import {
  fetchTxnList,
  getContainerById,
  getLotOrSnByName,
} from '@mobile/views/edhr/_hooks_/useApi';
import { TxnHandler } from '../txn/txn-handler';
import produceInfoPopup from './components/produce-info-popup.vue';
import {
  MATERIAL_STATUS_ENUM,
  TASK_TYPE__ENUM,
  selectLotSn,
  checkedScanCode,
  selectRework,
  rework_data,
} from './useBasicsRun';
import { add } from 'lodash-es';
import ArisenTxnListPopup from './components/arisen-txn-list-popup.vue';

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
  /**返工标题 */
  reworkName: string;
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

export function useReworkRun2() {
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
  const containerId = computed(() =>
    material_status_ === MATERIAL_STATUS_ENUM.LOT ? rework_data.value.id_ : containerInfo.value?.id,
  );
  /** 当前显示的工序id*/
  const containerOperationId = ref();
  /** 当前工序统计信息 */
  const containerOperationInfo = ref<IContainerOperation>();
  /** 当前并行工序集合 */
  const containerOperations = ref<any[]>([]);
  /** 接口的模型名称 */
  const modelKey = computed(() =>
    material_status_ === MATERIAL_STATUS_ENUM.LOT ? 'em_container' : 'em_sn',
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

  /** 事务列表集合 */
  const txnList = ref<any[]>([]);
  /** 事务的处理器 */
  const txnHandler = ref<TxnHandler>();
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
        reworkName: res.data.rework_name_,
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
        task_type_,
      },
    );
    if (((res ?? []) as any[]).length === 0) {
      // 没有下一工序则更新当前工序
      router.back();
      return Promise.reject();
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
        task_type_,
      } as any,
    );
    containerOperationEsops.value = (res.data ?? []).map((item) => item.sopDocument);
    containerOperationEsopId.value = containerOperationEsops.value[0]?.id;
  }

  /**
   * 加载事务列表
   * @return {*}
   */
  async function loadTxnList() {
    if (!containerInfo.value) {
      return;
    }

    // 创建事务处理器
    txnHandler.value = new TxnHandler({
      type: 'production',
      containerId: containerId.value,
      routingOperationId: containerOperationId.value,
      containerType: material_status_,
      productId: containerInfo.value.productId,
    });

    const list = await fetchTxnList({
      containerId: containerId.value,
      productId: containerInfo.value.productId,
      routingOperationId: containerOperationId.value,
      type: containerInfo.value.type,
    });
    txnList.value = list ?? [];
    console.log('txnList', list);
  }

  watch(
    () => containerOperationId.value,
    () => {
      loadOperationInfo();
      loadOperationEsops();
      loadTxnList();
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
      /**拉取工序列表 */
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
    const context = {
      containerId: containerId.value,
      containerName: containerInfo.value?.name,
      containerOperationId: containerOperationId.value,
      mfgOrderId: containerInfo.value?.mfgOrderId,
      module: 'rework',
      belongType: material_status_,
    };
    if (material_status_ === MATERIAL_STATUS_ENUM.LOT) {
      context.containerId = rework_data.value.id_;
      context.containerName = rework_data.value.name_;
    }

    GctPopup.open(FormFillingPopup, {
      context: context,
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
          type_: 'rework',
        },
      );
      showSuccessToast('开始成功');
      await handleReloadPage();
    } catch (error) {}
    loadingStartWork.value = false;
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
          type_: 'rework',
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
          resolve(containerOperationInfoById.value);
        },
      });
    });
  }

  // function toggleRework() {
  //   GctPopup.open(ReworkPickerPopup, {
  //     context: {
  //       list: reworkList.value,
  //       id: containerInfo.value?.id,
  //     },
  //     onOk: (selectItem: any) => {
  //       loadContainerInfo(selectItem.name_);
  //     },
  //   });
  // }

  /**切换单号 */
  async function selectLotSnPopup() {
    const isReworkProduce = material_status_ === MATERIAL_STATUS_ENUM.LOT;
    const { name_, id_ } = await selectLotSn(
      { material_status_, task_type_, isReworkProduce },
      containerName.value,
    );
    /**切换标题 */
    await selectReworkPopup(id_);
    containerName.value = name_;
  }

  /**扫码切换单号 */
  async function selectScanCode() {
    const { name_, id_ } = await checkedScanCode(material_status_);
    /**切换标题 */
    await selectReworkPopup(id_);
    containerName.value = name_;
  }

  /**切换返工标题 */
  async function selectReworkPopup(id_?: string) {
    if (material_status_ === MATERIAL_STATUS_ENUM.SN) return;
    rework_data.value = await selectRework(id_ || containerInfo.value.id, rework_data.value.id_);
    loadOperations();
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
        const list = await fetchTxnList({
          containerId: containerId.value,
          productId: containerInfo.value.productId,
          routingOperationId: containerOperationId.value,
          type: containerInfo.value.type,
        });
        txnList.value = list ?? [];
      },
    );
  };
  /**
   * 打开更多详情
   */
  function openInfoPopup() {
    GctPopup.open(produceInfoPopup, {
      context: {
        rework_data,
        task_type_,
        type: material_status_,
        containerInfo: containerInfo,
        containerOperationInfo: containerOperationInfoById,
        selectToggleContainerOperation: toggleContainerOperation,
        selectLotSnPopup,
        selectReworkPopup,
      },
    });
  }

  const openArisenTxnList = () => {
    const { mfgOrderId, type } = containerInfo.value;
    GctPopup.open(ArisenTxnListPopup, {
      context: {
        params: {
          sn_id_: type === 'SN' ? containerId.value : undefined,
          container_id_: type === 'SN' ? undefined : containerId.value,
          routing_operation_id_: containerOperationInfoById.value.id_,
          mfg_order_id_: mfgOrderId,
        },
        callback: loadOperationInfo,
      },
    });
  };

  return {
    containerInfo,
    containerOperationInfo,
    containerOperationInfoById,
    containerOperationEsopDetail,
    txnList,
    changeEsop,
    fillingForm,
    selectLotSnPopup,
    selectScanCode,
    selectReworkPopup,
    toggleContainerOperation,
    handleStartWork,
    handleEndWork,
    clickTxnBtn,
    containerLabel,
    material_status_,
    openInfoPopup,
    loadingStartWork,
    loadingEndWork,
    openArisenTxnList,
  };
}
