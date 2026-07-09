import { showConfirmDialog } from 'vant';
import { GctPopup } from '@mobile/utils/popup';
import { MobileSingleFormFillModal } from '@gct/nocode-mobile-render';
import TxnSortPopup from './txn-sort-popup.vue';
import {
  fetchTxnList,
  getLotOrSnByName,
  getTxnSubmitInfo,
} from '@mobile/views/edhr/_hooks_/useApi';
import { postStash, getStashFindByClientKey } from '/@/apis/gct-apaas/StashController';

interface constructorParams {
  /** 批次或SN的id */
  containerId: string;
  /** 批次还是SN */
  containerType: 'LOT' | 'SN';
  /** 返工还是生产 */
  type: 'rework' | 'production';
  /** 当前操作的工序id */
  routingOperationId: string;
  /** 物料产品的id */
  productId: string;
}

/**
 * 处理pad端的事务
 * @export
 * @param data
 */
export function handlePadTxn(
  data: { onlineFormInstId?: string; mfgOrderId: string },
  callback?: Function,
) {
  if (data?.onlineFormInstId) {
    // 有表单填报表单
    GctPopup.open(MobileSingleFormFillModal, {
      popupProps: {
        position: 'center',
      },
      context: {
        selfId: data.onlineFormInstId,
        isViewPage: false,
        needAutoSave: false,
        keep: false,
        paramExtraProps: {
          _gct_nocode_mfg_order_id_: data.mfgOrderId,
        },
      },
      onOk: async (payload: { instId: string }, done: Function) => {
        if (callback && typeof callback === 'function') {
          callback();
        }
      },
    });
  } else {
    // 没表单报提示信息
    showConfirmDialog({
      title: '提示',
      message: '事务中的配置节点暂不支持在Pad端处理，请在PC桌面端进行事务处理动作',
      showCancelButton: false,
    });
  }
}

export class TxnHandler {
  /**
   * 配置存储的key
   */
  configKey: string = '';

  /**
   * 列表数据
   */
  txnList: any[] = [];

  /**
   * 排序字段
   */
  sortArray: string[] = [];
  constructor(private params: constructorParams) {
    this.configKey = `txnSort-${this.params.containerId}`;
  }

  /**
   * 加载列表数据
   */
  async fetchList() {
    const res = await fetchTxnList({
      containerId: this.params.containerId,
      productId: this.params.productId,
      routingOperationId: this.params.routingOperationId,
      type: this.params.containerType,
    });

    this.sortArray = await this.loadSortConfig();
    const unSortedList = res ?? [];
    this.txnList = this.sortArr(unSortedList, this.sortArray);
    console.log('txnList', res);
  }

  /**
   * 获取配置信息
   */
  async loadSortConfig() {
    const res = await getStashFindByClientKey({ clientKey: this.configKey });
    return res?.content ? JSON.parse(res.content) : [];
  }

  /**
   * 保存配置信息
   * @param sortArr
   */
  async saveSortConfig(sortArr: string[]) {
    await postStash({
      clientKey: this.configKey,
      content: JSON.stringify(sortArr),
    });
  }

  /**
   * 排序数组
   * @param oldArr
   * @param sortArr
   * @return {*}
   */
  sortArr(oldArr: any[], sortArr: string[]) {
    // 1. 创建ID索引映射表（O(1)查找）
    const idIndexMap = new Map();
    sortArr.forEach((id, index) => idIndexMap.set(id, index));

    // 2. 分离存在和不存在于ID数组的元素
    const present = [];
    const absent = [];

    oldArr.forEach((item) => {
      if (idIndexMap.has(item.id)) {
        present.push(item);
      } else {
        absent.push(item);
      }
    });

    // 3. 对存在元素按ID数组顺序排序
    present.sort((a, b) => {
      return idIndexMap.get(a.id) - idIndexMap.get(b.id);
    });

    // 4. 合并数组（存在元素在前，不存在元素保持原顺序在后）
    return [...present, ...absent];
  }

  /**
   * 加载事务信息
   * @param opts
   * @return {*}
   */
  async loadTxnInfo(opts: { txnDefinitionId: string; procDefId: string }) {
    const containerKey = this.params.containerType === 'LOT' ? 'containerId' : 'snId';
    return getTxnSubmitInfo({
      ...opts,
      type: this.params.type,
      [containerKey]: this.params.containerId,
      routingOperationId: this.params.routingOperationId,
    });
  }

  async doBusiness(opts: { txnDefinitionId: string; procDefId: string }, callback?: Function) {
    const txnInfo = await this.loadTxnInfo(opts);
    console.log('txnInfo', txnInfo);
    handlePadTxn(txnInfo, callback);
  }

  editSort() {
    GctPopup.open(TxnSortPopup, {
      list: this.txnList,
      beforeClose: async (newArr) => {
        const newSortArr = newArr.map((item) => item.id);
        await this.saveSortConfig(newSortArr);
        this.sortArray = newSortArr;
        this.txnList = this.sortArr(this.txnList, this.sortArray);
        console.log('popup close', newArr);
      },
    });
  }
}
