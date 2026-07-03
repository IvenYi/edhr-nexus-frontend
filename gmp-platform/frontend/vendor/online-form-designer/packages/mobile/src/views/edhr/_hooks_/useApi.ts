import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as get,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as post,
  postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey as postGeneral,
} from '/@/apis/gct-apaas/ModelComprehensiveController';

/**
 * 通过名称查询lot或sn的id和类型
 *
 * @export
 * @param name
 * @return {*}
 */
export async function findContainerByName(name: string) {
  return (await postGeneral(
    {
      bsKey: 'scan',
      modelKey: 'em_mfg_order',
      modelCategory: 'entity',
    },
    undefined,
    {
      name_: name,
    },
  )) as {
    type_: 'LOT' | 'SN';
    id_: string;
    name_: string;
  };
}

/**
 * 获取lot/sn的具体信息
 * @export
 * @param type
 * @param id
 */
export async function getContainerById(type: 'LOT' | 'SN', id: string) {
  const info = (await get(
    {
      bsKey: 'getById',
      modelKey: type === 'LOT' ? 'em_container' : 'em_sn',
      modelCategory: 'entity',
    },
    {
      id: id,
    },
  )) as any;
  if (type === 'SN') {
    // SN的时候生产数量固定为1
    info.data.qty_ = 1;
  }
  console.log('getContainerById', info);
  return info;
}

/**
 * 通过lot或sn的name_获取具体信息
 * @export
 * @param name
 * @return {*}
 */
export async function getLotOrSnByName(name: string) {
  const res = await findContainerByName(name);
  const { id_, type_ } = res;
  // 加载Lot/SN数据
  const info = await getContainerById(type_, id_);
  return {
    type: type_,
    data: info.data,
    dict: info.dict,
  };
}

/**
 * 获取批次返工列表
 *
 * @export
 * @param lotId
 * @return {*}
 */
export async function getReworkList(lotId: string) {
  const res = await get(
    {
      bsKey: 'get_rework_list',
      modelKey: 'em_container',
      modelCategory: 'entity',
    },
    {
      container_id_: lotId,
    },
  );
  console.log('getReworkList', res);
  return res;
}

/**
 * 获取事务列表数据
 *
 * @export
 * @param params
 */
export async function fetchTxnList(params: {
  productId: string;
  routingOperationId: string;
  containerId: string;
  type: 'LOT' | 'SN';
}) {
  const { productId, routingOperationId, containerId, type } = params;
  const res = (await get(
    {
      bsKey: 'biz_txn_def_list_search',
      modelKey: 'em_txn_definition',
      modelCategory: 'entity',
    },
    {
      type: 'production',
      productId: productId,
      routingOperationId: routingOperationId,
    },
  )) as any;

  const txnListIds = res.map((item) => item.id);

  const count = (await post(
    {
      bsKey: 'biz_exception_txn_count',
      modelKey: 'em_txn_inst',
      modelCategory: 'entity',
    },
    {
      routingOperationId: routingOperationId,
      snId: type === 'SN' ? containerId : undefined,
      containerId: type === 'LOT' ? containerId : undefined,
      txnDefinitionIdList: txnListIds,
    },
  )) as any;
  const countMap = new Map();
  count.forEach((item) => {
    countMap.set(item.txnDefinitionId, item.totalCount);
  });

  return res.map((item) => ({
    id: item.id,
    name: item.name,
    count: countMap.get(item.id) ?? 0,
    procDefId: item.procDefId,
  }));
}

/**
 * 获取事务执行的相关信息
 * @export
 * @param params
 * @return {*}
 */
export function getTxnSubmitInfo(params: {
  txnDefinitionId: string;
  procDefId: string;
  routingOperationId: string;
  containerId?: string;
  snId?: string;
  type: 'rework' | 'production';
}) {
  return post(
    {
      bsKey: 'biz_inst_submit',
      modelKey: 'em_txn_inst',
      modelCategory: 'entity',
    },
    params,
  ) as any;
}
