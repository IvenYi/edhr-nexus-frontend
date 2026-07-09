import {CommonFields ,NdoFields} from '../parent'

interface UomConversion extends   NdoFields,CommonFields {
  /**
   * 转换前单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
before_uom_id_: string,


  /**
   * 转换后单位
   *
   * @author zyl
   * @see {Uom}
   * @type {string}
   */
after_uom_id_: string,


  /**
   * 公式
   *
   * @author zyl
   * @type {string}
   */
expression_: string,


}


/**
 *模型名称：单位换算
 *模型KEY:em_uom_conversion
 */
interface UomConversionMethods extends IModelService<UomConversion> {
}
