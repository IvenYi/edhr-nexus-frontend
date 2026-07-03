import {CommonFields ,RdoFields} from '../parent'

interface LabelTemplate extends RdoFields,CommonFields {
  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 标签模板
   *
   * @author zyl
   * @type {string}
   */
label_: string,


}


/**
 *模型名称：标签模板
 *模型KEY:em_label_template
 */
interface LabelTemplateMethods extends IRdoModelService<LabelTemplate> {
}
