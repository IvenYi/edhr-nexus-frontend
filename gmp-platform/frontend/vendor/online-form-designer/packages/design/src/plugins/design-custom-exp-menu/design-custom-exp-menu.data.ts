import { IDesignNodeData, IMobileHomeMenuItem } from '@gct/base';
import { DesignNodeType } from '../../constant';
import { DesignContainerNode } from '../../data';
import { uuid } from '@jsplumb/browser-ui';

/**
 * 自定义导航菜单节点数据
 *
 * @author zhanghanrui
 * @date 2024-08-24 10:08:12
 * @export
 * @interface IDesignCustomExpMenuNode
 * @extends {IDesignNodeData}
 */
export interface IDesignCustomExpMenuNode extends IDesignNodeData {
  /**
   * 菜单项
   *
   * @author zhanghanrui
   * @date 2024-08-24 11:08:40
   * @type {IMobileHomeMenuItem[]}
   */
  menus: IMobileHomeMenuItem[];
  /**
   * 字重
   *
   * @author zhanghanrui
   * @date 2024-08-24 11:08:11
   * @type {number}
   */
  fontWeight: number;
  /**
   * 未选中颜色
   *
   * @author zhanghanrui
   * @date 2024-08-24 11:08:24
   * @type {string}
   */
  notSelectColor: string;
}

/**
 * 自定义导航菜单节点实例
 *
 * @author zhanghanrui
 * @date 2024-08-24 10:08:51
 * @export
 * @class DesignCustomExpNodeNode
 * @extends {DesignContainerNode<IDesignCustomExpMenuNode>}
 */
export class DesignCustomExpNodeNode extends DesignContainerNode<IDesignCustomExpMenuNode> {
  override type: string = DesignNodeType.CUSTOM_EXP_MENU;

  protected override createData(): IDesignCustomExpMenuNode {
    const menus: IMobileHomeMenuItem[] = [
      {
        id: uuid(),
        menuMode: 'system',
        presetType: 'message',
        label: window.$t('sys.developer.designView.message'),
        isHome: false,
        isHidden: false,
        icon: {
          icon: 'iconfont:icon-yidongduan-xiaoxi',
          color: 'var(--van-text-color)',
        },
        selectIcon: {
          icon: 'iconfont:icon-yidongduan-xiaoxi',
          color: 'var(--ant-primary-color)',
        },
        isSystem: true,
      },
      {
        id: uuid(),
        menuMode: 'system',
        presetType: 'workbench',
        label: window.$t('sys.developer.designView.workbench'),
        isHome: true,
        isHidden: false,
        icon: {
          icon: 'iconfont:icon-yidongduan-gongzuotai',
          color: 'var(--van-text-color)',
        },
        selectIcon: {
          icon: 'iconfont:icon-yidongduan-gongzuotai',
          color: 'var(--ant-primary-color)',
        },
        isSystem: true,
      },
      {
        id: uuid(),
        menuMode: 'system',
        presetType: 'personalCenter',
        label: window.$t('sys.developer.designView.personalCenter'),
        isHome: false,
        isHidden: false,
        icon: {
          icon: 'iconfont:icon-yidongduan-wode',
          color: 'var(--van-text-color)',
        },
        selectIcon: {
          icon: 'iconfont:icon-yidongduan-wode',
          color: 'var(--ant-primary-color)',
        },
        isSystem: true,
      },
      {
        id: uuid(),
        menuMode: 'system',
        presetType: 'todo',
        label: window.$t('sys.developer.designView.todo'),
        isHome: false,
        isHidden: false,
        icon: {
          icon: 'iconfont:icon-daiban',
          color: 'var(--van-text-color)',
        },
        selectIcon: {
          icon: 'iconfont:icon-daiban',
          color: 'var(--ant-primary-color)',
        },
        isSystem: true,
      },
    ];
    return {
      name: '',
      menus,
      fontWeight: 3,
      notSelectColor: '#8F8F8F',
    };
  }
}
