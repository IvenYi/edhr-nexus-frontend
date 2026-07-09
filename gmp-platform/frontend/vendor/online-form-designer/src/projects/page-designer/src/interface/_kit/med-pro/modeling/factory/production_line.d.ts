import {CommonFields ,NdoFields} from '../parent'

interface ProductionLine extends   NdoFields,CommonFields {
  /**
   * 车间
   *
   * @author zyl
   * @see {Shopfloor}
   * @type {string}
   */
shopfloor_id_: string,


}


/**
 *模型名称：线体
 *模型KEY:em_production_line
 */
interface ProductionLineMethods extends IModelService<ProductionLine> {
}
