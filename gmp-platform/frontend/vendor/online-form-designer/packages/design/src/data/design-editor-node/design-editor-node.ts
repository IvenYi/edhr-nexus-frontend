import { IDesignEditorNode, IDesignEditorData } from '@gct/base';
import { DesignNode } from '../design-node/design-node';
import { DesignNodeType } from '../../constant';

/**
 * 设计编辑器节点
 *
 * @author chitanda
 * @date 2025-07-07 14:07:21
 * @export
 * @class DesignEditorNode
 * @extends {DesignNode<T>}
 * @implements {IDesignEditorNode<T>}
 * @template T
 */
export class DesignEditorNode<T extends IDesignEditorData = IDesignEditorData>
  extends DesignNode<T>
  implements IDesignEditorNode<T>
{
  type: string = DesignNodeType.DESIGN_EDITOR;
}
