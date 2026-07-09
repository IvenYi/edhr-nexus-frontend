import { GctPopup } from '@mobile/utils/popup';
import { GctDialog } from '@mobile/utils/dialog';
import EsopSelectorPopup from '@mobile/views/edhr/_comps_/esop/esop-selector-popup.vue';
import FormFillingPopup from '@mobile/views/edhr/_comps_/form/filling-popup.vue';
import { showConfirmDialog, showSuccessToast } from 'vant';
import { GctNative } from '@native/index';
import { useRouter } from 'vue-router';
import SelectLotsnModal from './select-lotsn-modal.vue';
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
import { fetchTxnList, getLotOrSnByName } from '@mobile/views/edhr/_hooks_/useApi';
import PartEndModal from './part-end-modal.vue';
import { TxnHandler } from '../../txn/txn-handler';

dayjs.extend(duration);

export interface IContainerInfo {
  /** lot/sn数据的id */
  id: string;
  /** lot/sn号 */
  name: string;
  /** 类型 */
  type: 'LOT' | 'SN';
  /** 工单号 */
  order: string;
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
const modelKey = computed(() => (containerInfo.value?.type === 'LOT' ? 'em_container' : 'em_sn'));

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

export function useProduceRun2() {
  const router = useRouter();

  /**
   * 根据id加载数据信息
   * @param id
   * @return {*}
   */
  async function loadContainerInfo(id: string) {
    const res = await getLotOrSnByName(id);
    console.log('loadContainerInfo', res.data);
    containerOperationId.value = res.data.current_routing_operation_ids_?.split(',')[0];
    containerInfo.value = {
      name: res.data.name_,
      id: res.data.id_,
      type: res.type,
      status: res.data.status_,
      order: getTranslateValue(res, 'mfg_order_id_'),
      productName: getTranslateValue(res, 'product_id_'),
      productId: res.data.product_id_,
      currentRouteOp: getTranslateValue(res, 'current_routing_operation_ids_'),
      produceNum: res.data.qty_,
      isContinuousProduction: res.data.continuous_production_enabled_,
    };
  }

  /**
   * 加载工序集合
   * @return {*}
   */
  async function loadOperations() {
    if (!containerId.value) return;
    const paramsKey = containerInfo.value?.type === 'LOT' ? 'container_id_' : 'sn_id_';

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
      loadOperationInfo();
      return;
    }
    containerOperations.value = res as any;
    containerOperationId.value = containerOperations.value[0]?.id_;
  }

  /**
   * 加载工序的统计信息
   */
  async function loadOperationInfo() {
    const res = (await post(
      {
        bsKey: 'getOne',
        modelKey: 'em_form_report_info',
        modelCategory: 'entity',
      },
      {
        routing_operation_id_: containerOperationId.value,
        container_id_: containerId.value,
      },
    )) as any;
    console.log('loadOperationInfo', res);
    console.log(
      'duration',
      new Date(res.data.complete_time_).getTime() - new Date(res.data.start_time_).getTime(),
    );
    const { complete_time_, start_time_ } = res.data;
    const durationTime = complete_time_
      ? new Date(complete_time_).getTime() - new Date(start_time_).getTime()
      : 0;
    const duration = dayjs.duration(durationTime).format('DD天HH时mm分');
    containerOperationInfo.value = {
      totalNum: res.data.good_qty_ + res.data.not_good_qty_,
      goodNum: res.data.good_qty_,
      notGoodNum: res.data.not_good_qty_,
      totalDuration: duration,
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
        container_id_: containerId.value,
        production_type_: containerInfo.value.type === 'LOT' ? 'container' : 'sn',
        routing_operation_id_: containerOperationId.value,
        sorts: [
          {
            sortField: 'create_time_',
            sortType: 'desc',
          },
        ],
        task_type_: 'production',
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
      containerType: containerInfo.value.type,
      containerId: containerInfo.value.id,
      routingOperationId: containerOperationId.value,
      productId: containerInfo.value.productId,
    });

    await txnHandler.value.fetchList();
  }

  watch(
    () => containerOperationId.value,
    () => {
      loadOperationInfo();
      loadOperationEsops();
      initTxn();
    },
  );

  watch(containerId, () => {
    loadOperations();
  });

  async function init() {
    const route = useRoute();
    // 监听路由参数变化
    watch(
      () => route.query.id,
      (newId, oldId) => {
        if (newId && newId !== oldId) {
          console.log('newId', newId);
          loadContainerInfo(route.query.id as string);
        }
      },
      { immediate: true },
    );
  }

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
        containerName: containerOperationInfo.value?.container_name_,
        containerOperationId: containerOperationId.value,
        module: 'production',
      },
    });
  };

  /** 开工 */
  async function handleStartWork() {
    if (!containerId.value || !containerOperationId.value) return;
    await showConfirmDialog({
      title: '提示',
      message: '是否确认将当前工序开工？',
    });
    await post(
      {
        bsKey: 'work_start',
        modelKey: modelKey.value,
        modelCategory: 'entity',
      },
      {
        txn_subject_id_: containerId.value,
        container_id_: containerId.value,
        routing_operation_id_: containerOperationId.value,
      },
    );
    showSuccessToast('开工成功');
    loadContainerInfo(containerInfo.value?.name);
  }

  /** 部分完工 */
  async function handlePartEndWork() {
    if (!containerId.value || !containerOperationId.value) return;

    GctDialog.open(PartEndModal, {
      beforeClose: async (data) => {
        const partNum = data.num;
        if (!partNum) {
          return;
        }
        console.log('popup close', partNum);
        await post(
          {
            bsKey: 'work_complete_partially',
            modelKey: modelKey.value,
            modelCategory: 'entity',
          },
          {
            txn_subject_id_: containerId.value,
            container_id_: containerId.value,
            routing_operation_id_: containerOperationId.value,
            work_complete_partially_qty_: partNum,
          },
        );
        showSuccessToast('部分完工成功');
        loadContainerInfo(containerInfo.value?.name);
      },
    });
  }

  /** 完工 */
  async function handleEndWork() {
    if (!containerId.value || !containerOperationId.value) return;
    await post(
      {
        bsKey: 'work_complete',
        modelKey: modelKey.value,
        modelCategory: 'entity',
      },
      {
        txn_subject_id_: containerId.value,
        container_id_: containerId.value,
        routing_operation_id_: containerOperationId.value,
      },
    );
    showSuccessToast('完工成功');
    loadContainerInfo(containerInfo.value?.name);
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

  /**
   * 扫描
   */
  const scan = () => {
    GctNative.CAMERA.scanCode({
      sourceType: ['album', 'camera'],
      scanType: ['qrCode', 'barCode'],
      success: async (value) => {
        router.push({
          name: 'edhr-produce-run',
          query: {
            id: value.result,
          },
        });
      },
    });
  };

  /**
   * 选择批次或sn，并且切换页面
   */
  const selectLotSn = () => {
    GctDialog.open(SelectLotsnModal, {
      beforeClose: (data) => {
        if (!data) {
          return;
        }
        console.log('popup close', data);
      },
    });
  };

  const clickTxnBtn = (data: any) => {
    console.log('clickTxnBtn', data);
    txnHandler.value?.doBusiness({
      procDefId: data.procDefId,
      txnDefinitionId: data.id,
    });
  };

  const sortTxn = () => {
    txnHandler.value?.editSort();
  };

  return {
    containerInfo,
    containerOperationInfo,
    containerOperationInfoById,
    containerOperationEsopDetail,
    txnList,
    changeEsop,
    fillingForm,
    scan,
    selectLotSn,
    init,
    toggleContainerOperation,
    handleStartWork,
    handleEndWork,
    handlePartEndWork,
    clickTxnBtn,
    sortTxn,
  };
}
