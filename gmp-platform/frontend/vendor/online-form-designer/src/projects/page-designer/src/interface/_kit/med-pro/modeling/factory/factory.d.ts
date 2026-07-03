import {CommonFields ,NdoFields} from '../parent'

interface Factory extends   NdoFields,CommonFields {
  /**
   * 公司
   *
   * @author zyl
   * @see {Enterprise}
   * @type {string}
   */
enterprise_id_: string,


}


/**
 *模型名称：工厂
 *模型KEY:em_factory
 */
interface FactoryMethods extends IModelService<Factory> {
}
