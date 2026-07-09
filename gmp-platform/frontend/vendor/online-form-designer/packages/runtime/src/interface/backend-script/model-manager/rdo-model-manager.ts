import {
  IModelDataSubmit,
  IObject,
  IPaginationResponse,
  IRdoCondition,
  IRdoConditionPagination,
} from '../base-type';

/**
 *
 * @deprecated
 * @hidden
 * @class RdoModelManager
 */
export interface RdoModelManager {
  /**
   * 查询Rdo模型表下所有的父的数据,可以携带查询算子，keyword只能查询名称
   * @param modelKey
   * @param condition
   */
  listAll(modelKey: string, condition: IRdoCondition): Array<IObject>;

  /**
   * 查询Rdo模型表下所有父的数据（分页查询）
   * @param modelKey
   * @param condition
   */
  listByPage(modelKey: string, condition: IRdoConditionPagination): IPaginationResponse<IObject>;

  /**
   * 查询Rdo模型下所有版本的数据（id等于父Rdo的id）
   * @param modelKey
   * @param id
   */
  listVersionById(modelKey: string, id: string): Array<IObject>;

  /**
   * 查询Rdo模型下版本数据根据版本id
   * @param modelKey
   * @param id
   */
  getVersionById(modelKey: string, id: string): IObject;

  /**
   * Rdo模型数据新增保存或者修改
   * @param modelKey
   * @param modelData
   */
  save(modelKey: string, modelData: IModelDataSubmit<IObject>);

  /**
   * Rdo模型数据新增保存或者修改
   * @param modelKey
   * @param modelArrayData
   */
  saveBatch(modelKey: string, modelArrayData: Array<IModelDataSubmit<IObject>>);

  /**
   * Rdo模型新增版本数据
   * @param modelKey
   * @param modelData
   */
  saveVersion(modelKey: string, modelData: IModelDataSubmit<IObject>);

  /**
   * Rdo模型更新版本数据 指定id
   * @param modelKey
   * @param modelData
   * @param id
   */
  updateVersionById(modelKey: string, modelData: IModelDataSubmit<IObject>, id: string);

  /**
   * Rdo模型删除版本数据 指定id
   * @param modelKey
   * @param id
   */
  removeVersionById(modelKey: string, id: string);
}
