import {
  getModelComprehensiveEnumInfoByModelCategory,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as post,
  deleteModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as del,
  putModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as put,
} from '/@/apis/gct-apaas/ModelComprehensiveController';
import { postModelDataQueryRefData } from '/@/apis/gct-apaas/ModelDataController';

const modelCategory = 'entity';
const modelKey = 'em_product';

/** 获取产品类型数据 */
export function getProductType() {
  return getModelComprehensiveEnumInfoByModelCategory(
    { modelCategory: 'entity' },
    { modelKey, fieldKey: 'product_type_' },
  );
}

/** 获取所有产品家族的数据 */
export function getProductFamily() {
  return postModelDataQueryRefData({
    includeDeleted: false,
    fieldKey: 'product_family_id_',
    modelKey,
    refModelKey: 'em_product_family',
    pageNo: 1,
    pageSize: 9999,
  } as any);
}

/**
 * 分页查询
 * @return {*}
 */
export function listByPage(params: IParams) {
  return post({ modelCategory, bsKey: 'rdoListByPage', modelKey }, params) as any;
}

/**
 * 创建RDO
 */
export function createRdo(data: IData) {
  return post({ modelCategory, bsKey: 'rdoSave', modelKey }, data) as any;
}

/**
 * 创建版本
 */
export function createVersion(data: IData) {
  return post({ modelCategory, bsKey: 'rdoSaveVersion', modelKey }, data) as any;
}

/**
 * 更新版本
 */
export function updateVersion(data: IData) {
  return put({ modelCategory, bsKey: 'rdoUpdateVersionById', modelKey }, data, {
    id: data.id_,
  } as any) as any;
}

/** 根据id删除 */
export function removeRdo(id: string) {
  return del({ modelCategory, bsKey: 'rdoRemoveById', modelKey }, { id }) as any;
}

/** 根据id删除版本 */
export function removeVersion(id: string) {
  return del({ modelCategory, bsKey: 'rdoRemoveVersionById', modelKey }, { id }) as any;
}
