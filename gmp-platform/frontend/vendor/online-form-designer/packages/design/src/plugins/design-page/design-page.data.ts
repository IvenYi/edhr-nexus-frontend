import { IDesignPageNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';

/**
 * 设计选项卡节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:43
 * @export
 * @class DesignTabsNode
 * @extends {DesignContainerNode<IDesignPageNodeData>}
 */
export class DesignPageNode extends DesignContainerNode<IDesignPageNodeData> {
  override type: string = DesignNodeType.PAGE;

  protected override createData(): IDesignPageNodeData {
    return {
      name: '',
      background: '',
      padding: '',
    };
  }
}
