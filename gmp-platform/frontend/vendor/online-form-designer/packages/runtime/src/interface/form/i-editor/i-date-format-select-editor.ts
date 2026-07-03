import { IEditorBasic } from './i-editor-basic';

/**
 * 级联选择编辑器接口
 *
 * @author chitanda
 * @date 2025-06-23 17:06:28
 * @export
 * @interface IDateFormatSelectEditor
 * @extends {IEditorBasic}
 */
export interface IDateFormatSelectEditor extends IEditorBasic {
  /**
   * 分割符存储的配置项
   *
   * @author chitanda
   * @date 2025-06-23 19:06:22
   * @type {string}
   */
  separatorKey?: string;
  /**
   * 字段类型标识，默认取 key 值
   *
   * @author chitanda
   * @date 2025-06-23 18:06:47
   * @type {string}
   */
  fieldTypeKey?: string;
  /**
   * 字段映射类型标识，默认取 mapping_type
   *
   * @author chitanda
   * @date 2025-06-30 13:06:55
   * @type {string}
   */
  mappingTypeKey?: string;
}
