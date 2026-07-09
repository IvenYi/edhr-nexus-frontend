import {CommonFields ,NdoFields} from '../parent'

interface Expression extends   NdoFields,CommonFields {
  /**
   * 产品
   *
   * @author zyl
   * @see {Product}
   * @type {string}
   */
product_id_: string,


  /**
   * 公式
   *
   * @author zyl
   * @type {string}
   */
expression_: string,


}


/**
 *模型名称：计算公式
 *模型KEY:em_expression
 */
interface ExpressionMethods extends IModelService<Expression> {
}
