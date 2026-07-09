import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';
import { MessageType } from '@gct/runtime';

/**
 * 标签页数据
 *
 * @author zhanghanrui
 * @date 2024-07-29 16:07:12
 * @export
 * @interface IDesignTabsData
 * @extends {IDesignNodeData}
 */
export interface IDesignMessageData extends IDesignNodeData {
  displayContent: string[];
}
/**
 * 设计选项卡节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:43
 * @export
 * @class DesignTabsNode
 * @extends {DesignContainerNode<IDesignNodeData>}
 */
export class DesignMessageNode extends DesignContainerNode<IDesignNodeData> {
  override type: string = DesignNodeType.MESSAGE;

  protected override createData(): IDesignMessageData {
    return {
      name: '消息',
      displayContent: [MessageType.ALL, MessageType.UNREAD],
      padding: {
        top: 0,
        left: '12px',
        right: '12px',
        bottom: 0,
      },
    };
  }
}
