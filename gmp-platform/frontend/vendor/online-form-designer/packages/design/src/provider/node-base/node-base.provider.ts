import { Component } from 'vue';
import { IDesignNode } from '@gct/base';
import { IEditForm } from '@gct/runtime';
import { IDesignItemAction, INodeProvider } from '../../interface';
import { DesignItemActionTag, DesignNodeMode } from '../../constant';

/**
 * 节点基础适配器
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:54
 * @export
 * @class NodeBaseProvider
 * @implements {INodeProvider<T>}
 * @template T
 */
export abstract class NodeBaseProvider<T extends IDesignNode = IDesignNode>
  implements INodeProvider<T>
{
  abstract mode: DesignNodeMode;

  abstract type: string;

  abstract component: string | Component;

  get actions(): IDesignItemAction[] {
    return this.createActions();
  }

  abstract model: IEditForm | ((ctx?: IContext, node?: T) => IEditForm);

  abstract create(data?: T): T;

  isDrag: boolean = true;

  isDrop: boolean = true;

  protected createActions(): IDesignItemAction[] {
    return [
      {
        tag: DesignItemActionTag.SELECT_PARENT,
        icon: 'icon-fuzujian',
        tooltip: window.$t('sys.designView.tips.selectParent'),
      },
      {
        tag: DesignItemActionTag.DELETE,
        icon: 'icon-shanchu1',
        tooltip: window.$t('sys.designView.tips.delete'),
      },
    ];
  }
}
