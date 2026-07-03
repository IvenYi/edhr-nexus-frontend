import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';

/**
 * 标签页项
 *
 * @author zhanghanrui
 * @date 2024-07-29 16:07:46
 * @export
 * @interface IDesignTabItemData
 * @extends {IDesignNodeData}
 */
export interface IDesignTabItemData extends IDesignNodeData {
  /**
   * 标签页标题
   *
   * @author zhanghanrui
   * @date 2024-07-29 16:07:42
   * @type {(string | object)}
   */
  title: string | object;
}

/**
 * 设计选项卡项节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:43
 * @export
 * @class DesignTabItemNode
 * @extends {DesignContainerNode<IDesignTabItemData>}
 */
export class DesignTabItemNode extends DesignContainerNode<IDesignTabItemData> {
  override type: string = DesignNodeType.TAB_ITEM;

  override get label() {
    if (this.data.title) {
      return this.data.title as string;
    }
    return this.data.name!;
  }

  protected override createData(): IDesignTabItemData {
    return {
      name: '标签页',
      title: '标签页',
    };
  }
}
