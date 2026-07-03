import { IBomEntry, IMaterialConsumeData } from './types';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as getApi,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as postApi,
} from '/@/apis/gct-apaas/ModelComprehensiveController';

/**
 * 扫码后查询对应信息和部分后台接口校验
 * @export
 * @param data
 * @return {*}
 */
export async function materialCheck(params: {
  /** 物料编码 */
  material_no_?: string;
  /** 批次编码 */
  production_identification_name_: string;
  /** 数量 */
  qty_?: number;
  /** 有效期 */
  validate_?: Date;
  /** bom明细 */
  bom_entries_bom: any;
  /** 工序id */
  operation_id_: string;
}) {
  const res = (await postApi(
    {
      bsKey: 'biz_single_material_check',
      modelKey: 'em_material_loading',
      modelCategory: 'entity',
    },
    params,
  )) as
    | Array<{
        /** 物料id */
        materialId: string;
        /** 物料编码 */
        materialNo: string;
        /** 物料批次id */
        productionIdentificationId: string;
        /** 物料批次编码 */
        productionIdentificationName: string;
      }>
    | undefined;
  return res;
}

/**
 * 检查库存消耗
 * @export
 * @param params
 */
export async function stockCheck(params: {
  row: IMaterialConsumeData;
  entry: IBomEntry;
  mainMaterialNo: string;
}) {
  await postApi(
    {
      bsKey: 'biz_form_single_confirm',
      modelKey: 'em_material_loading',
      modelCategory: 'entity',
    },
    {
      entry: params.entry,
      material_id_: params.row.product_id_,
      production_identification_name_: params.row.material_no_,
      qty_: params.row.qty_,
      operation_id_: params.row.routing_operation_id_,
      main_material_no_: params.mainMaterialNo,
    } as any,
  );
}

/**
 * 查询历史消耗数据
 * @export
 * @param params
 */
export async function fetchHistoryConsume(params: {
  routing_operation_id_: string;
  production_identification_id_: string;
}) {
  const res = await postApi(
    {
      bsKey: 'listAll',
      modelKey: 'em_material_consume',
      modelCategory: 'entity',
    },
    {
      query: params,
    },
  );
  console.log('查询历史消耗数据', res);
  const arr = res.data ?? [];
  arr.map((i) => {
    // 历史消耗存在了qty_consumed_ 里，同步到qty_里
    i.qty_ = i.qty_consumed_;
  });

  return arr;
}
