import {CommonFields } from '../parent'

interface MaterialCheck extends CommonFields {
  /**
   * 合格数量
   *
   * @author zyl
   * @type {number}
   */
qualified_qty_: number,


  /**
   * 不合格数量
   *
   * @author zyl
   * @type {number}
   */
unqualified_qty_: number,


  /**
   * 可入库数量
   *
   * @author zyl
   * @type {number}
   */
available_inbound_qty_: number,


  /**
   * 检验状态
   *
   * @author zyl
   * @see {MaterialCheckStatus}
   * @type {string}
   */
status_: string,


  /**
   * 接收结果
   *
   * @author zyl
   * @see {ReceiveResult}
   * @type {string}
   */
receive_result_: string,


  /**
   * 检验人员
   *
   * @author zyl
   * @type {string}
   */
inspectors_: string,


  /**
   * 检验时间
   *
   * @author zyl
   * @type {Date}
   */
check_time_: Date,


  /**
   * 检验单号
   *
   * @author zyl
   * @type {string}
   */
check_number_: string,


  /**
   * 检验单
   *
   * @author zyl
   * @see {Checklist}
   * @type {string}
   */
checklist_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 物料批次
   *
   * @author zyl
   * @see {MaterialContainer}
   * @type {string}
   */
container_id_: string,


  /**
   * 在线表单模版
   *
   * @author zyl
   * @type {string}
   */
online_form_tmpl_id_: string,


  /**
   * 在线表单
   *
   * @author zyl
   * @type {string}
   */
online_form_id_: string,


  /**
   * 检验数量
   *
   * @author zyl
   * @type {number}
   */
check_qty_: number,


  /**
   * 检验结果
   *
   * @author zyl
   * @type {boolean}
   */
check_result_: boolean,


  /**
   * 确认结果
   *
   * @author zyl
   * @type {boolean}
   */
confirm_result_: boolean,


}


/**
 *模型名称：物料检验管理
 *模型KEY:em_material_check
 */
interface MaterialCheckMethods extends IModelService<MaterialCheck> {
}
