import {CommonFields } from '../parent'

interface MaterialReturnEntry extends CommonFields {
  /**
   * 指定批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
material_container_id_: string,


  /**
   * 领料ID
   *
   * @author zyl
   * @type {string}
   */
requisition_entry_id_: string,


  /**
   * 引用主模型数据 id
   *
   * @author zyl
   * @type {string}
   */
ref_master_id_: string,


  /**
   * 引用主模型key
   *
   * @author zyl
   * @type {string}
   */
ref_model_key_: string,


  /**
   * 引用主模型字段key
   *
   * @author zyl
   * @type {string}
   */
ref_field_key_: string,


  /**
   * 退料数量
   *
   * @author zyl
   * @type {number}
   */
return_qty_: number,


  /**
   * 已出数量
   *
   * @author zyl
   * @type {number}
   */
inbound_qty_: number,


  /**
   * 仓库
   *
   * @author zyl
   * @see {Warehouse}
   * @type {string}
   */
warehouse_id_: string,


  /**
   * 接收数量
   *
   * @author zyl
   * @type {number}
   */
f_receive_qty_6ze6: number,


  /**
   * 排序号
   *
   * @author zyl
   * @type {number}
   */
sort_num_: number,


}


/**
 *模型名称：生产退料明细
 *模型KEY:em_material_return_entry
 */
interface MaterialReturnEntryMethods extends IModelService<MaterialReturnEntry> {
}
