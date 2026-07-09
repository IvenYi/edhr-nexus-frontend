import {CommonFields ,RdoFields} from '../parent'

interface Bom extends RdoFields,CommonFields {
  /**
   * 物料清单项
   *
   * @author zyl
   * @see {BomEntry}
   * @type {string}
   */
bom_entry: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


}


/**
 *模型名称：物料清单
 *模型KEY:em_bom
 */
interface BomMethods extends IRdoModelService<Bom> {
}
