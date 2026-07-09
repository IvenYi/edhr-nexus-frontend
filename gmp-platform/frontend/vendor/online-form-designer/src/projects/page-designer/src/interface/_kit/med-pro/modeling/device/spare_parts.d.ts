import {CommonFields ,NdoFields} from '../parent'

interface SpareParts extends   NdoFields,CommonFields {
  /**
   * 型号
   *
   * @author zyl
   * @type {string}
   */
specification_: string,


  /**
   * 编号
   *
   * @author zyl
   * @type {string}
   */
code_: string,


  /**
   * 供应商
   *
   * @author zyl
   * @see {Supplier}
   * @type {string}
   */
supplier_id_: string,


  /**
   * 库存数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


}


/**
 *模型名称：备品备件
 *模型KEY:em_spare_parts
 */
interface SparePartsMethods extends IModelService<SpareParts> {
}
