import {CommonFields } from '../parent'

interface ReleaseTask extends CommonFields {
  /**
   * 批次
   *
   * @author zyl
   * @see {Container}
   * @type {string}
   */
container_id_: string,


  /**
   * 工艺
   *
   * @author zyl
   * @see {Spec}
   * @type {string}
   */
spec_id_: string,


  /**
   * 放行状态
   *
   * @author zyl
   * @see {ReleaseStatus}
   * @type {string}
   */
release_status_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 放行人员
   *
   * @author zyl
   * @type {string}
   */
release_user_id_: string,


  /**
   * 放行时间
   *
   * @author zyl
   * @type {Date}
   */
release_time_: Date,


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
   * 当前节点
   *
   * @author zyl
   * @type {string}
   */
current_node_name_: string,


  /**
   * 工单
   *
   * @author zyl
   * @see {MfgOrder}
   * @type {string}
   */
mfg_order_id_: string,


}


/**
 *模型名称：放行任务
 *模型KEY:em_release_task
 */
interface ReleaseTaskMethods extends IModelService<ReleaseTask> {
  /**
   * 创建表单默认参数
   *
   * @param1 releaseTaskId 放行任务id
   * @return Object
   */
makeFormDefaultParams(releaseTaskId:string):Object;


}
