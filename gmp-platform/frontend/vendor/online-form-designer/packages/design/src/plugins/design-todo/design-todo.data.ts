import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';
import { TODO_TYPE } from '@gct/runtime';

/**
 * 标签页数据
 *
 * @author zhanghanrui
 * @date 2024-07-29 16:07:12
 * @export
 * @interface IDesignTabsData
 * @extends {IDesignNodeData}
 */
export interface IDesignTodoData extends IDesignNodeData {
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
export class DesignTodoNode extends DesignContainerNode<IDesignNodeData> {
  override type: string = DesignNodeType.TODO;

  protected override createData(): IDesignTodoData {
    return {
      name: '审批',
      displayContent: [TODO_TYPE.TODO, TODO_TYPE.APPLICATION, TODO_TYPE.DONE, TODO_TYPE.DELEGATE],
    };
  }
}
