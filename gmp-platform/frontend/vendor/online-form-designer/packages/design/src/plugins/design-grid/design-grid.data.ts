import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';

/**
 * 表格节点
 *
 * @author zhanghanrui
 * @date 2024-07-30 10:07:58
 * @export
 * @interface IDesignGridNode
 * @extends {IDesignNodeData}
 */
export interface IDesignGridNode extends IDesignNodeData {
  /**
   * 间距
   *
   * @author zhanghanrui
   * @date 2024-07-30 10:07:53
   * @type {number}
   */
  gutter: number;
}

/**
 * 设计栅格容器节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:43
 * @export
 * @class DesignGridNode
 * @extends {DesignContainerNode<IDesignGridNode>}
 */
export class DesignGridNode extends DesignContainerNode<IDesignGridNode> {
  override type: string = DesignNodeType.GRID;

  protected override createData(): IDesignGridNode {
    return {
      name: window.$t('sys.designView.components.grid.title'),
      gutter: 8,
    };
  }
}
