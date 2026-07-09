import { IDesignNodeData } from './i-design-node-data';

/**
 * 设计编辑器数据接口
 *
 * @author chitanda
 * @date 2025-07-07 15:07:57
 * @export
 * @interface IDesignEditorData
 * @extends {IDesignNodeData}
 */
export interface IDesignEditorData extends IDesignNodeData {
  /**
   * 属性配置
   *
   * @author chitanda
   * @date 2025-07-07 15:07:03
   * @type {IObject}
   */
  field: IObject;
}
