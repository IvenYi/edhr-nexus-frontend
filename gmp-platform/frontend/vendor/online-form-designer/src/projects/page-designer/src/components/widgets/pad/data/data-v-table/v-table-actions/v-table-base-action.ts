import { IVTableActionItem } from '@gct/universal-component/gct-v-table';
import { Events } from '/@web-render/render/Event/baseEvent';
import { showConfirmDialog } from 'vant';

export class VTableBaseAction {
  config: IVTableActionItem;

  constructor(
    protected table,
    protected event: Events,
    protected widget: IObject,
    children?: IVTableActionItem[],
  ) {
    const { props } = widget;
    this.config = {
      tag: widget.id,
      size: props.size || 'middle',
      type: props.type || 'default',
      danger: props.danger || undefined,
      color: props.enableCustomColor ? props.fontColor : undefined,
      bgColor: props.enableCustomColor ? props.backgroundColor : undefined,
      _item: widget,
      action: this.onAction.bind(this),
      hidden: this.hidden.bind(this),
    };
    if (props.confirm) {
      this.config.confirm = {
        title: props.confirmText || window.$t('sys.confirmExecution'),
        okText: window.$t('sys.okText'),
        cancelText: window.$t('sys.cancelText'),
      };
    }
    if (props.hasText) {
      this.config.text =
        widget.i18n && widget.i18n.title
          ? window.$t(widget.i18n.title)
          : window.$t(props.title) || widget.alias;
    }
    if (props.hasIcon) {
      this.config.icon = props.icon as string;
    }
    if (children && children.length > 0) {
      this.config.children = children;
    }
    this.onInit();
  }

  protected onInit(): void {
    // 做初始化操作，主要用于子类重写和继承
  }

  protected hidden(row: IData, rowIndex?: number): boolean {
    // 做按钮隐藏判断，主要用于子类重写和继承
    if (row._ACTIONS && Array.isArray(row._ACTIONS)) {
      return !row._ACTIONS.includes(this.widget.id);
    }
    return false;
  }

  protected async onAction(row: IData, rowIndex?: number): Promise<void> {
    if (this.config.confirm) {
      const res = await showConfirmDialog({
        title: this.config.confirm.title,
      });
      if (res === 'cancel') {
        return;
      }
    }
    await this.event.runEventByName('beforeClick', this.widget.events, row, rowIndex);
    await this.onClick(row, rowIndex);
    await this.event.runEventByName('afterClick', this.widget.events, row, rowIndex);
  }

  protected async onClick(row: IData, rowIndex?: number): Promise<void> {
    // 根据具体的子类实现不同的点击事件
  }

  destroy(): void {
    // 表格销毁时会调用
  }
}
