import { ITextEditor } from './i-text-editor';
import { EditorType } from '../../../constants';

/**
 * 多语言编辑器
 *
 * @author chitanda
 * @date 2025-06-22 16:06:22
 * @export
 * @interface II18nEditor
 * @extends {ITextEditor}
 */
export interface II18nEditor extends ITextEditor {
  readonly type: EditorType.I18N;

  /**
   * 多语言配置存储在表单的哪个字段中
   *
   * @author chitanda
   * @date 2025-06-22 16:06:13
   * @type {string}
   */
  cfgKey?: string;

  /**
   * 多语言配置的模型键名，用于根据模型名称获取当前的字段模型默认配置
   *
   * @author chitanda
   * @date 2025-06-22 16:06:21
   * @type {string}
   */
  modelKey?: string;

  /**
   * 多语言配置的字段键名，用于根据字段名称获取当前的字段默认配置
   *
   * @author chitanda
   * @date 2025-06-22 16:06:39
   * @type {string}
   */
  fieldKey?: string;
}
