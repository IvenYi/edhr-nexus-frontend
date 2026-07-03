import { IProductFamily } from './type';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as get,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as post,
  putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as put,
  deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as del,
} from '/@/apis/gct-apaas/ModelComprehensiveController';

const modelCategory = 'entity';
const modelKey = 'em_product_family';

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
export function submit(data: IProductFamily) {
  return post({ modelCategory, bsKey: 'submit', modelKey }, data) as any;
}

/** 根据ids删除 */
export function removeByIds(ids: string) {
  return del({ modelCategory, bsKey: 'removeByIds', modelKey }, { ids }) as any;
}
