import {CommonFields ,RdoFields} from '../parent'

interface Recipe extends RdoFields,CommonFields {
  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 配方详细信息
   *
   * @author zyl
   * @see {RecipeEntry}
   * @type {string}
   */
entries_: string,


  /**
   * 按顺序投料
   *
   * @author zyl
   * @type {boolean}
   */
in_sequence_: boolean,


}


/**
 *模型名称：配方
 *模型KEY:em_recipe
 */
interface RecipeMethods extends IRdoModelService<Recipe> {
}
