import {CommonFields ,RdoFields} from '../parent'

interface Document extends RdoFields,CommonFields {
  /**
   * 文档状态
   *
   * @author zyl
   * @see {DocumentStatus}
   * @type {string}
   */
status_: string,


  /**
   * 文档类型
   *
   * @author zyl
   * @see {DocumentType}
   * @type {string}
   */
type_: string,


  /**
   * BASE_ID
   *
   * @author zyl
   * @type {string}
   */
base_id_: string,


  /**
   * 文档编码
   *
   * @author zyl
   * @type {string}
   */
code_: string,


  /**
   * 路径
   *
   * @author zyl
   * @type {string}
   */
url_: string,


  /**
   * sop文件
   *
   * @author zyl
   * @type {string}
   */
file_: string,


  /**
   * 生效时间
   *
   * @author zyl
   * @type {Date}
   */
effective_start_date_: Date,


  /**
   * 失效时间
   *
   * @author zyl
   * @type {Date}
   */
effective_end_date_: Date,


}


/**
 *模型名称：文档
 *模型KEY:em_document
 */
interface DocumentMethods extends IRdoModelService<Document> {
}
