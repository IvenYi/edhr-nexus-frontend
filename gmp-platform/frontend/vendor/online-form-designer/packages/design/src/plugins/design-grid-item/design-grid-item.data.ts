import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';

export interface IDesignGridItemNodeData extends IDesignNodeData {
  /**
   * 栅格占位
   *
   * @author zhanghanrui
   * @date 2024-07-12 13:07:43
   * @type {number}
   * @memberof IDesignGridItemNodeData
   */
  span: number;
}

/**
 * 设计栅格容器项节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:43
 * @export
 * @class DesignGridItemNode
 * @extends {DesignContainerNode<IDesignGridItemNodeData>}
 */
export class DesignGridItemNode extends DesignContainerNode<IDesignGridItemNodeData> {
  override type: string = DesignNodeType.GRID_ITEM;

  protected override createData(): IDesignGridItemNodeData {
    return {
      name: window.$t('sys.designView.components.gridCol.label'),
      span: 24,
    };
  }
}
