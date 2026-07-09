import { getFormRelateCategory } from '/@/apis/gct-apaas/FormRelateCategoryController';
import {
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey,
} from '/@/apis/gct-apaas/ModelComprehensiveController';

/**
 * 分类的模块类型
 */
export enum CategoryModuleEnum {
  /** 在线表单 */
  ONLINE_FORM = 'online_form_module',
  /** eDHR */
  EDHR = 'edhr_module',
  /** 单据项目 */
  CHECK_LIST = 'check_list_module',
  /** 检验模板 */
  INSPECTION = 'inspection_module',
  /** 放行模板 */
  RELEASE = 'release_module',
}

const moduleConfig = {
  [CategoryModuleEnum.ONLINE_FORM]: {
    modelKey: 'em_form_category',
    bsKeyList: {
      list: 'biz_tree',
      tmpls: 'biz_get_form_tmpls',
    },
  },
  [CategoryModuleEnum.EDHR]: {
    modelKey: 'em_edhr_category',
    bsKeyList: {
      list: 'biz_tree',
      tmpls: 'biz_get_edhr_tmpls',
      querylist: 'biz_list_edhr_tmpls',
    },
  },
  [CategoryModuleEnum.INSPECTION]: {
    modelKey: 'em_inspection_category',
    bsKeyList: {
      list: 'biz_tree',
      tmpls: 'biz_get_edhr_tmpls',
      querylist: 'biz_list_edhr_tmpls',
    },
  },
  [CategoryModuleEnum.RELEASE]: {
    modelKey: 'em_product_release_category',
    bsKeyList: {
      list: 'biz_tree',
      tmpls: 'biz_get_edhr_tmpls',
      querylist: 'biz_list_edhr_tmpls',
    },
  },
};

export interface GetInterfaceParams {
  moduleType: CategoryModuleEnum;
  [key: string]: any;
}

export const getInterfaceApi = {
  /** 获取分类列表 */
  getCategoryList: ({ moduleType }: { moduleType: CategoryModuleEnum }, config?: Record<string, any>) => {
    if (moduleType === CategoryModuleEnum.CHECK_LIST) {
      return getFormRelateCategory({ moduleType });
    }

    const { modelKey, bsKeyList } = moduleConfig[moduleType] || {};
    return postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey,
        bsKey: bsKeyList.list,
      },
      {},
      {},
      config,
    );
  },

  /** 获取模板列表 */
  getTmplsList: (params: GetInterfaceParams, config?: Record<string, any>) => {
    if (params.moduleType === CategoryModuleEnum.CHECK_LIST) {
      throw new Error('该模块不支持模板列表接口');
    }

    const { isQuery, ...otherParams } = params || {};
    const { moduleType } = otherParams || {};
    const { modelKey, bsKeyList } = moduleConfig[moduleType] || {};
    const operatingState = Object.hasOwnProperty.call(otherParams, 'operatingState')
      ? otherParams.operatingState
      : true;
    return getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey(
      {
        modelCategory: 'entity',
        modelKey,
        bsKey: isQuery ? bsKeyList.querylist : bsKeyList.tmpls,
      },
      {
        ...otherParams,
        operatingState,
      },
      config,
    );
  },
};
