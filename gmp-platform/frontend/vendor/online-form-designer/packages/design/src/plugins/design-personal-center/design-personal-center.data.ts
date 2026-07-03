import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';
import { PersonalCenterType } from '@gct/runtime';

/**
 * 标签页数据
 *
 * @author zhanghanrui
 * @date 2024-07-29 16:07:12
 * @export
 * @interface IDesignTabsData
 * @extends {IDesignNodeData}
 */
export interface IDesignPersonalCenterData extends IDesignNodeData {
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
export class DesignPersonalCenterNode extends DesignContainerNode<IDesignNodeData> {
  override type: string = DesignNodeType.PERSONAL_CENTER;

  protected override createData(): IDesignPersonalCenterData {
    return {
      name: '我的',
      displayContent: [
        PersonalCenterType.PROFILE,
        PersonalCenterType.GENDER,
        PersonalCenterType.ENTERPRISE,
      ],
    };
  }
}
