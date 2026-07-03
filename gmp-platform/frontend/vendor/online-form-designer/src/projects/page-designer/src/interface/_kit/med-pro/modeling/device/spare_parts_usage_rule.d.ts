import {CommonFields } from '../parent'

interface SparePartsUsageRule extends CommonFields {
  /**
   * 备品备件多选
   *
   * @author zyl
   * @see {SpareParts}
   * @type {string}
   */
spare_parts_ids_: string,


  /**
   * 设备
   *
   * @author zyl
   * @see {Device}
   * @type {string}
   */
device_id_: string,


}


/**
 *模型名称：备品备件应用
 *模型KEY:em_spare_parts_usage_rule
 */
interface SparePartsUsageRuleMethods extends IModelService<SparePartsUsageRule> {
}
