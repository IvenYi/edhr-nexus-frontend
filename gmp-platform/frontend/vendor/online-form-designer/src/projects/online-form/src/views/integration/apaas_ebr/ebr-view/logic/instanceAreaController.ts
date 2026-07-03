import { EntityModelCategoryEnum } from '@gct/runtime';
import { ESubCategoryEnum } from '../enums';
import { postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey } from '/@/apis/gct-apaas/ModelComprehensiveController';
import { getOnlineFormInstancePageList } from '/@/apis/gct-apaas/OnlineFormInstanceController';
import { InstanceStatusValues } from '@gct/nocode-base';

async function loadInstances({
  tid,
  description,
  docOutlineId,
  edhrInstanceId,
  ignoreAbandon,
}: {
  tid: string; // 在线表单模板id
  description?: string;
  docOutlineId?: string; // 目录树选择的节点id、检验表单选择节点
  edhrInstanceId?: string; // edhr实例id
  ignoreAbandon?: boolean; // 是否忽略作废表单
}) {
  const res: any = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
    {
      modelCategory: EntityModelCategoryEnum.ENTITY,
      modelKey: 'em_edhr_summary_form_inst',
      bsKey: 'biz_search_in_select',
    },
    {
      docOutlineId: docOutlineId,
      ofTmplId: tid,
      edhrInstanceId: edhrInstanceId,
      ignoreAbandon: ignoreAbandon ?? false,
      pageNo: 1,
      pageSize: 9999999,
      description,
    },
  );

  return res?.data || [];
}

async function loadInspectionInstances(payload: { selectDocId?: string; description?: string }) {
  if (!payload.selectDocId) return null;

  const res: any = await getOnlineFormInstancePageList({
    relationId: payload.selectDocId,
    // @ts-ignore
    description: payload.description,
    instanceStatusNe: InstanceStatusValues.ABANDON,
    pageNo: 1,
    pageSize: 999,
  });

  return res?.data || [];
}

/**
 * 判断是否需要新建一条实例
 * false 表示不需要新增 true 表示需要新增
 * @param params
 * @param params.ofTmplId 模板id
 * @param params.edhrInstanceId edhr实例id
 * @param params.ignoreAbandon 是否忽略作废表单
 */
async function needCreateNewInstanceByCatalog(params, props) {
  if (props.useIsViewPage) {
    return false;
  }
  const res = await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
    {
      modelCategory: EntityModelCategoryEnum.ENTITY,
      modelKey: 'em_routing_operation_config',
      bsKey: 'biz_form_list',
    },
    {
      ...params,
      pageNo: 1,
      pageSize: 20,
      businessId: props?.paramExtraProps?._gct_nocode_business_id_, // 当前工序节点id or 检验节点id
    },
  );

  return res;
}

/**
 * 新建一条实例
 * @param {*} params
 * @param params.docOutlineId 目录树选择的节点id、检验表单选择节点
 * @param params.edhrInstanceId 检验表单选择的节点id
 * @param params.tmplId 模板id
 * @param params.description 描述
 */
async function createOnlineFormInstanceByCatalog(params, props) {
  const ext1 = props?.paramExtraProps?._gct_nocode_ext1_ ?? 'production'; // 根据实际场景传production或rework 默认传production
  await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
    {
      modelCategory: EntityModelCategoryEnum.ENTITY,
      modelKey: 'gct_edhr_instance',
      bsKey: 'insertFormInstance',
    },
    {
      ...params,
      businessId: props?.paramExtraProps?._gct_nocode_business_id_, // 当前工序节点id or 检验节点id
      businessType: ext1 === 'rework' ? 'REWORK' : 'DHR',
      ext1,
    },
  );
}

/**
 * 新建一条检验表单实例
 * @param params.tmplId
 * @param params.description
 * @param params.businessId
 */
async function createOnlineFormInstanceByInspection(params) {
  await postModelComprehensiveBizServiceGeneralByModelCategoryByModelKeyByBsKey(
    {
      modelCategory: EntityModelCategoryEnum.ENTITY,
      modelKey: 'em_inspection_list',
      bsKey: 'biz_inspection_execute_insert_form',
    },
    {
      ...params,
    },
  );
}

export class InstanceAreaController {
  constructor() {}

  /**
   * 加载目录实例列表
   * @returns Promise<any[]>
   */
  static loadCatalogInstanceList(payload) {
    return loadInstances({
      ...payload,
    });
  }

  /**
   * 加载检验表单实例列表·
   * @returns Promise<any[]>
   */
  static loadInspectionInstanceList(payload) {
    return loadInspectionInstances({
      ...payload,
    });
  }

  /**
   * 加载通用实例列表
   * @returns Promise<any[]>
   */
  static loadGeneralInstanceList(payload) {
    return loadInstances({
      ...payload,
    });
  }

  /**
   * 根据子分类类型加载实例列表
   * @param subCategory 子分类类型
   * @returns Promise<any[]>
   */
  static loadInstanceList(subCategory: ESubCategoryEnum, payload) {
    switch (subCategory) {
      case ESubCategoryEnum.INSPECTION_FORM:
        return this.loadInspectionInstanceList(payload);
      default:
        return this.loadGeneralInstanceList(payload);
    }
  }

  /**
   * 判断是否需要新建一条实例
   * false 表示不需要新增 true 表示需要新增
   * @param params
   */
  static async needCreateNewInstance(subCategory, params, props) {
    switch (subCategory) {
      case ESubCategoryEnum.INSPECTION_FORM:
        const res = await loadInspectionInstances(params);
        return res && res.length === 0;
      default:
        return needCreateNewInstanceByCatalog(params, props);
    }
  }

  /**
   * 新增表单实例
   */
  static async createOnlineFormInstance(subCategory, params, props) {
    switch (subCategory) {
      case ESubCategoryEnum.INSPECTION_FORM:
        return createOnlineFormInstanceByInspection(params);
      default:
        return createOnlineFormInstanceByCatalog(params, props);
    }
  }
}
