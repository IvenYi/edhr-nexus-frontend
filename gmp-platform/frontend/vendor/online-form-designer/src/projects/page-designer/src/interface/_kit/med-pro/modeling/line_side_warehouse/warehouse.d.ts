import {CommonFields ,NdoFields} from '../parent'

interface Warehouse extends   NdoFields,CommonFields {
  /**
   * 库区配置
   *
   * @author zyl
   * @see {WarehouseEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：仓库建模
 *模型KEY:em_warehouse
 */
interface WarehouseMethods extends IModelService<Warehouse> {
}
