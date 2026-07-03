import {CommonFields ,NdoFields} from '../parent'

interface DocumentSet extends   NdoFields,CommonFields {
  /**
   * 文档集配置项
   *
   * @author zyl
   * @see {DocumentSetEntry}
   * @type {string}
   */
entries_: string,


}


/**
 *模型名称：文档集
 *模型KEY:em_document_set
 */
interface DocumentSetMethods extends IModelService<DocumentSet> {
}
