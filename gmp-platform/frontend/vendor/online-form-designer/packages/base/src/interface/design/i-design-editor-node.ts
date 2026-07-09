import { IDesignEditorData } from './i-design-editor-data';
import { IDesignNode } from './i-design-node';

/**
 * 设计编辑器节点接口
 *
 * @author chitanda
 * @date 2025-07-07 15:07:25
 * @export
 * @interface IDesignEditorNode
 * @extends {IDesignNode<T>}
 * @template T
 */
export interface IDesignEditorNode<T extends IDesignEditorData = IDesignEditorData>
  extends IDesignNode<T> {
  [key: string]: any;
}
