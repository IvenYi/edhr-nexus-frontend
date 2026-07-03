import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';

/**
 * 标签页数据
 *
 * @author zhanghanrui
 * @date 2024-07-29 16:07:12
 * @export
 * @interface IDesignTabsData
 * @extends {IDesignNodeData}
 */
export interface IDesignTabsData extends IDesignNodeData {
  /**
   * 标签呈现类型
   *
   * @author zhanghanrui
   * @date 2024-07-29 16:07:26
   * @type {string}
   */
  tabType: string;

  /**
   * 标签页间距
   *
   * @author zhanghanrui
   * @date 2024-07-29 16:07:33
   * @type {number}
   */
  gutter: number;

  /**
   * 标签页是否居中
   *
   * @author zhanghanrui
   * @date 2024-07-29 16:07:25
   * @type {boolean}
   */
  center: boolean;

  /**
   * 切换销毁
   *
   * @author zhanghanrui
   * @date 2024-07-29 16:07:19
   * @type {boolean}
   */
  selectDestroy: boolean;

  /**
   * 默认标签页
   *
   * @author zhanghanrui
   * @date 2024-07-30 14:07:30
   * @type {string}
   */
  defaultTab?: string;
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
export class DesignTabsNode extends DesignContainerNode<IDesignNodeData> {
  override type: string = DesignNodeType.TABS;

  protected override createData(): IDesignTabsData {
    return {
      name: '选项卡',
      tabType: 'base',
      gutter: 20,
      center: false,
      selectDestroy: false,
    };
  }
}
