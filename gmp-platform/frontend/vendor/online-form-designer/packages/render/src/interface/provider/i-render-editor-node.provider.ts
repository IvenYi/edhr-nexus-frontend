import { IRenderItemNodeProvider } from './i-render-item-node.provider';
import { FIELD_TYPE } from '@gct/runtime';

/**
 * 编辑器节点适配器
 *
 * @author chitanda
 * @date 2025-07-08 13:07:32
 * @export
 * @interface IRenderEditorNodeProvider
 * @extends {IRenderItemNodeProvider}
 */
export interface IRenderEditorNodeProvider extends IRenderItemNodeProvider {
  /**
   * 字段标识
   *
   * @author chitanda
   * @date 2025-07-08 13:07:05
   * @type {string}
   */
  fieldKey?: string;

  /**
   * 字段类型
   *
   * @author chitanda
   * @date 2025-07-08 13:07:14
   * @type {FIELD_TYPE}
   */
  fieldType?: FIELD_TYPE;
}
