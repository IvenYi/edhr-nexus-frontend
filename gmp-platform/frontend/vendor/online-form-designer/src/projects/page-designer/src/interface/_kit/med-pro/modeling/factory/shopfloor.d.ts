import {CommonFields ,NdoFields} from '../parent'

interface Shopfloor extends   NdoFields,CommonFields {
  /**
   * 工厂
   *
   * @author zyl
   * @see {Factory}
   * @type {string}
   */
factory_id_: string,


}


/**
 *模型名称：车间
 *模型KEY:em_shopfloor
 */
interface ShopfloorMethods extends IModelService<Shopfloor> {
}
