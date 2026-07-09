import {CommonFields ,NdoFields} from '../parent'

interface StorageArea extends   NdoFields,CommonFields {
  /**
   * 库位配置
   *
   * @author zyl
   * @see {StorageAreaEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：库区建模
 *模型KEY:em_storage_area
 */
interface StorageAreaMethods extends IModelService<StorageArea> {
}
