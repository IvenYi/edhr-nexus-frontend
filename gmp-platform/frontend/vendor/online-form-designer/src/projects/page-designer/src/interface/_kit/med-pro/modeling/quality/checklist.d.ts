import {CommonFields ,RdoFields} from '../parent'

interface Checklist extends RdoFields,CommonFields {
  /**
   * 应用状态
   *
   * @author zyl
   * @see {UsageStatus}
   * @type {string}
   */
status_: string,


  /**
   * 使用规则配置项
   *
   * @author zyl
   * @see {ChecklistUsageRuleEntry}
   * @type {string}
   */
entries_: string,


  /**
   * 检验单类型
   *
   * @author zyl
   * @see {ChecklistCollectionMethod}
   * @type {string}
   */
type_: string,


  /**
   * 数据采集
   *
   * @author zyl
   * @see {DataCollection}
   * @type {string}
   */
data_collection_id_: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 在线表单模版
   *
   * @author zyl
   * @type {string}
   */
online_form_tmpl_id_: string,


}


/**
 *模型名称：检验单
 *模型KEY:em_checklist
 */
interface ChecklistMethods extends IRdoModelService<Checklist> {
}
