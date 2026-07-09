import {CommonFields } from '../parent'

interface ReworkInfo extends CommonFields {
  /**
   * 事务总线
   *
   * @author zyl
   * @see {TxnMainline}
   * @type {string}
   */
mainline_id_: string,


  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 返工状态
   *
   * @author zyl
   * @see {ReworkStatus}
   * @type {string}
   */
status_: string,


  /**
   * 返工项
   *
   * @author zyl
   * @see {ReworkEntry}
   * @type {string}
   */
rework_entries_: string,


  /**
   * 返回路径项
   *
   * @author zyl
   * @see {ReworkBackEntry}
   * @type {string}
   */
back_entry_: string,


  /**
   * 启用指定返回路径
   *
   * @author zyl
   * @type {boolean}
   */
back_enabled_: boolean,


}


/**
 *模型名称：返工信息
 *模型KEY:em_rework_info
 */
interface ReworkInfoMethods extends IModelService<ReworkInfo> {
}
