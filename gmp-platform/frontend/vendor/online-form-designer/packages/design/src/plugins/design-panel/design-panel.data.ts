import { IDesignNodeData } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';

/**
 * 面板数据
 *
 * @author zhanghanrui
 * @date 2024-07-12 11:07:35
 * @export
 * @interface IDesignPanelNodeData
 * @extends {IDesignNodeData}
 */
export interface IDesignPanelNodeData extends IDesignNodeData {
  /**
   * 面板标题
   *
   * @author zhanghanrui
   * @date 2024-07-26 13:07:07
   * @type {string}
   */
  title: string;
  /**
   * 面板头部图标
   *
   * @author zhanghanrui
   * @date 2024-07-26 13:07:51
   * @type {{ icon: string; color: string; background: string }}
   */
  icon: { icon: string; color: string; background: string };
  /**
   * 是否支持折叠
   *
   * @author zhanghanrui
   * @date 2024-07-26 13:07:38
   * @type {(1 | 0)}
   */
  collapse: 1 | 0;
  /**
   * 是否默认折叠
   *
   * @default true
   * @author zhanghanrui
   * @date 2024-08-30 10:08:27
   * @type {boolean}
   */
  defaultCollapse: boolean;
}

/**
 * 设计面板节点
 *
 * @author zhanghanrui
 * @date 2024-07-12 13:07:43
 * @export
 * @class DesignPanelNode
 * @extends {DesignContainerNode<IDesignPanelNodeData>}
 */
export class DesignPanelNode extends DesignContainerNode<IDesignPanelNodeData> {
  override type: string = DesignNodeType.PANEL;

  override get label(): string {
    return this.data.title;
  }

  protected override createData(): IDesignPanelNodeData {
    return {
      name: '',
      collapse: 1,
      title: window.$t('sys.designView.components.panel.title'),
      defaultCollapse: true,
      icon: {
        icon: '',
        color: '',
        background: '',
      },
    };
  }
}
