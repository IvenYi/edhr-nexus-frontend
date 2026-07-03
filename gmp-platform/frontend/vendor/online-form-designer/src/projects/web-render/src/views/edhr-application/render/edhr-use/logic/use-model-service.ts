import { IEdhrUse } from './type';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as get,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as post,
  putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as put,
  deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as del,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';

const modelCategory = 'entity';
const modelKey = 'em_product_process';

/**
 * 分页查询
 * @return {*}
 */
export function listByPage(params: IParams) {
  return post({ modelCategory, bsKey: 'listByPage', modelKey }, params) as any;
}

/**
 * 新增
 */
export function submit(data: IEdhrUse) {
  return post({ modelCategory, bsKey: 'submit', modelKey }, data) as any;
}

/** 根据ids删除 */
export function removeByIds(ids: string) {
  return del({ modelCategory, bsKey: 'removeByIds', modelKey }, { ids }) as any;
}

export function getProduct(opts: { keyword?: string }) {
  return postModelDataQueryRefData({
    includeDeleted: false,
    fieldKey: 'product_ref_',
    modelKey,
    pageNo: 1,
    pageSize: 9999,
    ...opts,
  } as any);
}
