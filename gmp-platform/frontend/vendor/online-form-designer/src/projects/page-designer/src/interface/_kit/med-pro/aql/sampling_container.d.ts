import {CommonFields ,NdoFields} from '../parent'

interface SamplingContainer extends   NdoFields,CommonFields {
  /**
   * 单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
uom_id_: string,


  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 采样率
   *
   * @author zyl
   * @type {number}
   */
sampling_rate_: number,


  /**
   * 批次数量
   *
   * @author zyl
   * @type {number}
   */
qty_: number,


  /**
   * 超过批次数量调整样本数量
   *
   * @author zyl
   * @type {boolean}
   */
change_qty_enabled: boolean,


}


/**
 *模型名称：采样批次
 *模型KEY:em_sampling_container
 */
interface SamplingContainerMethods extends IModelService<SamplingContainer> {
}
