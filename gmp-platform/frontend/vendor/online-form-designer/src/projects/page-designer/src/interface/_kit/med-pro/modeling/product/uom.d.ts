import {CommonFields ,NdoFields} from '../parent'

interface Uom extends   NdoFields,CommonFields {
  /**
   * ml
   *
   * @author zyl
   * @type {number}
   */
f_ml_wd09: number,


  /**
   * AU
   *
   * @author zyl
   * @type {number}
   */
f_au_wd09: number,


}


/**
 *模型名称：度量单位
 *模型KEY:em_uom
 */
interface UomMethods extends IModelService<Uom> {
}
