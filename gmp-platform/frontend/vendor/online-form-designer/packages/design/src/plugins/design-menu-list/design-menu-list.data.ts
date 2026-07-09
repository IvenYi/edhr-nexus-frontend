import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';

export interface IDesignMenuListNode extends IDesignNodeData {
  /**
   * 是否启用搜索
   *
   * @author zhanghanrui
   * @date 2024-07-17 15:07:10
   * @type {boolean}
   */
  enableSearch: boolean;
  /**
   * 列表模式
   *
   * @author zhanghanrui
   * @date 2024-07-17 15:07:02
   * @type {'horizontal' | 'vertical'}
   */
  mode: 'horizontal' | 'vertical';

  /**
   * 名称显示模式
   * @author lingxiaoming
   * @date 2024-07-19 01:39:27
   * @type {('hidden' 截取 | 'wrap' 换行)}
   */
  titleOverflow: 'hidden' | 'wrap';

  /**
   * 启用显示范围
   *
   * @author zhanghanrui
   * @date 2024-07-17 15:07:20
   * @type {boolean}
   */
  enabledRange: boolean;

  /**
   * 行数
   * @author lingxiaoming
   * @date 2024-07-19 02:47:47
   * @type {number}
   */
  rowNum: number;

  /**
   * 列数
   * @author lingxiaoming
   * @date 2024-07-19 02:48:07
   * @type {number}
   */
  colNum: number;
}

/**
 * 设计选项卡节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:43
 * @export
 * @class DesignMenuListNode
 * @extends {DesignContainerNode<IDesignMenuListNode>}
 */
export class DesignMenuListNode extends DesignContainerNode<IDesignMenuListNode> {
  override type: string = DesignNodeType.MENU_LIST;

  protected override createData(): IDesignMenuListNode {
    return {
      name: '菜单列表',
      enableSearch: true,
      mode: 'vertical',
      titleOverflow: 'hidden',
      enabledRange: true,
      rowNum: 5,
      colNum: 4,
    };
  }
}
