import { IObject } from '../base-type';
import {
  ICondition,
  IConditionPagination,
  IModelDataSubmit,
  IPaginationResponse,
} from '../old-types';

/**
 *
 * @deprecated
 * @hidden
 * @class ModelManager
 */
export interface ModelManager {
  /**
   * 查询模型表下所有的数据
   * @param modelKey
   */
  listAll(modelKey: string): Array<IObject>;

  /**
   * 根据算子分页查询模型表下的数据
   * @param modelKey
   * @param condition
   */
  listByPage(modelKey: string, condition: IConditionPagination): IPaginationResponse<IObject>;

  /**
   * 根据批量的数据主键id查询模型的的数据
   * @param modelKey
   * @param ids
   */
  listByIds(modelKey: string, ids: string[]): Array<IObject>;

  /**
   * 根据算子条件返回模型表的一条数据
   * @param modelKey
   * @param condition
   */
  getOne(modelKey: string, condition: ICondition): IObject;

  /**
   * 根据id查询模型数据
   * @param modelKey
   * @param id
   */
  getById(modelKey: string, id: string): IObject;

  /**
   * 给模型表新增一条数据
   * @param modelKey
   * @param modelData
   */
  save(modelKey: string, modelData: IModelDataSubmit<IObject>);

  /**
   * 给模型批量新增数据
   * @param modelKey
   * @param modelArrayData
   */
  saveBatch(modelKey: string, modelArrayData: Array<IModelDataSubmit<IObject>>);

  /**
   * 给模型表新增一条数据或者修改一条数据，区别在于modelData里面是否传递id
   * 传递id视为更新，不传递就是新增
   * @param modelKey
   * @param modelData
   */
  saveOrUpdate(modelKey: string, modelData: IModelDataSubmit<IObject>);

  /**
   * 根据算子条件更新模型表数据
   * @param modelKey
   * @param modelData
   * @param condition
   */
  update(modelKey: string, modelData: IModelDataSubmit<IObject>, condition: ICondition);

  /**
   * 根据id更新模型表数据
   * @param modelKey
   * @param modelData
   * @param id
   */
  updateById(modelKey: string, modelData: IModelDataSubmit<IObject>, id: string);

  /**
   * 根据ids批量更新模型表对应的数据
   * @param modelKey
   * @param modelData
   * @param ids
   */
  updateByIds(modelKey: string, modelData: IModelDataSubmit<IObject>, ids: string[]);

  /**
   * 根据算子条件删除模型表数据
   * @param modelKey
   * @param condition
   */
  remove(modelKey: string, condition: ICondition);

  /**
   * 根据id删除数据
   * @param modelKey
   * @param id
   */
  removeById(modelKey: string, id: string);

  /**
   * 根据ids 批量删除数据
   * @param modelKey
   * @param ids
   */
  removeByIds(modelKey: string, ids: string[]);
}
