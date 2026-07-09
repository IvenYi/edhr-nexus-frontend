import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import {
  createGroup,
  createImage,
  createLine,
  createRect,
  createText,
  FederatedPointerEvent,
  IGraphic,
  IGroup,
  IImage,
} from '@visactor/vtable/es/vrender';
import { ButtonType } from '@gct/runtime';
import { IVTableActionItem, IVTableColumnPlugin, IVTableDataItem, IVTableOperationColumn } from '../../interface';
import { IGctVTableStore } from '../../store';
import { PresetPluginType } from '../../constants';
import { getIconParkSvg, suppressNextEvent } from '../../utils';
import { openVTableOperationMore } from '../../components';
import { colord } from 'colord';

/**
 * 根据按钮尺寸获取对应的样式配置
 */
interface IButtonStyle {
  // 字体大小
  fontSize: number;
  // 按钮高度
  height: number;
  // 图标大小
  iconSize: number;
  // 按钮内边距
  padding: number;
  // 图标与文字间距
  textSpacing: number;
  // 最小宽度
  minWidth: number;
  // 最大宽度
  maxWidth: number;
  // 文字最大宽度
  maxFontWidth: number;
  // 背景颜色
  bgColor: string;
  // 边框颜色
  borderColor: string;
  // 文字颜色
  textColor: string;
}

/**
 * 按钮尺寸说明:
 *  小按钮: 字号 13，padding左右16px, height 28px，图标 14px 与文字间距 4px，最小宽度 60px，最大宽度 128px，文字最宽 104px 超出部分省略号显示
 *  小按钮(纯图标): 图标 16px, padding 8px, height 28px
 *  中按钮: 字号 15，padding左右16px, height 32px，图标 16px 与文字间距 8px，最小宽度 72px，最大宽度 152px，文字最宽 120px 超出部分省略号显示
 *  中按钮(纯图标): 图标 16px, padding 8px, height 32px
 *  大按钮: 字号 17，padding左右16px, height 36px，图标 18px 与文字间距 8px，最小宽度 80px，最大宽度 168px，文字最宽 136px 超出部分省略号显示
 *  大按钮(纯图标): 图标 18px, padding 9px, height 36px
 *
 * 更多菜单按钮: 高度同按钮高度，宽高和具体尺寸的按钮高度一致，图标同按钮图标尺寸一致，文字字号同按钮字号一致，内容在按钮内水平居中显示
 *
 * 更多按钮的悬浮气泡菜单:
 *  气泡框与打开的按钮右对齐，宽度固定 160px，高度最高 360px, padding 16px
 *  菜单项高度默认 48px，字号 16px, 文字上下居中
 *
 * 按钮样式:
 *  主要按钮: 背景色 主色，文字色 #fff，边框色 主色
 *  次要按钮: 背景色 #fff，文字色(主题文字色)，边框色(主题边框色)
 *  警告按钮: 背景色(主题警告色)，文字色(白色)，边框色(主题警告色)
 *  次要警告按钮: 背景色 #fff，文字色(主题警告色)，边框色(主题警告色)
 *  虚线按钮: 背景色 #fff，文字色(主题文字色)，边框虚线(主题边框色)
 *  链接按钮: 背景色 #fff，文字色(主题文字色)，无边框
 *
 * 按钮与按钮间距 12px
 *
 * @export
 * @class OperationColumnPlugin
 * @implements {IVTableColumnPlugin}
 */
export class OperationColumnPlugin implements IVTableColumnPlugin {
  type: string = PresetPluginType.OPERATION_COLUMN;

  // 取自 CSS 变量的主题色值
  private _primaryColor: string;
  protected get _disabledPrimaryColor(): string {
    return colord(this._primaryColor).alpha(0.3).toRgbString();
  }
  protected get primaryColor(): string {
    return this.store.cfg.disabled ? this._disabledPrimaryColor : this._primaryColor;
  }

  // 取自 CSS 变量的危险色值
  private _dangerColor: string;
  protected get _disabledDangerColor(): string {
    return colord(this._dangerColor).alpha(0.3).toRgbString();
  }
  protected get dangerColor(): string {
    return this.store.cfg.disabled ? this._disabledDangerColor : this._dangerColor;
  }

  // 取自 CSS 变量的边框色值
  private _colorBorder: string;
  protected get _disabledColorBorder(): string {
    return colord(this._colorBorder).alpha(0.3).toRgbString();
  }
  protected get colorBorder(): string {
    return this.store.cfg.disabled ? this._disabledColorBorder : this._colorBorder;
  }

  // 取自 CSS 变量的字体色值
  private _fontColor: string;
  protected get _disabledFontColor(): string {
    return colord(this._fontColor).alpha(0.3).toRgbString();
  }
  protected get fontColor(): string {
    return this.store.cfg.disabled ? this._disabledFontColor : this._fontColor;
  }

  // 白色文字颜色（用于主按钮）
  private readonly _whiteColor: string = '#ffffff';
  protected get _disabledWhiteColor(): string {
    return colord(this._whiteColor).alpha(0.3).toRgbString();
  }
  protected get whiteColor(): string {
    return this.store.cfg.disabled ? this._disabledWhiteColor : this._whiteColor;
  }

  constructor(
    protected store: IGctVTableStore,
    // 操作列配置
    protected actionColumn: IVTableOperationColumn,
    // 当前行数据
    protected row: IVTableDataItem,
    // 当前行索引
    protected rowIndex: number,
  ) {
    const domStyle = getComputedStyle(store.$el as HTMLElement);
    this._primaryColor = domStyle.getPropertyValue('--gct-color-primary').trim();
    this._dangerColor = domStyle.getPropertyValue('--gct-color-danger').trim();
    this._colorBorder = domStyle.getPropertyValue('--gct-color-border').trim();
    this._fontColor = domStyle.getPropertyValue('--gct-color-text-1').trim();
  }

  /**
   * 更新行数据
   *
   * @param {IVTableDataItem} row
   * @param {number} [rowIndex]
   */
  updateRow(row: IVTableDataItem, rowIndex?: number): void {
    this.row = row;
    if (rowIndex != null) {
      this.rowIndex = rowIndex;
    }
  }

  private _getButtonStyle(action: IVTableActionItem): IButtonStyle {
    const showText = !!action.text;
    const size = action.size || 'middle';
    let cfg: IButtonStyle;
    switch (size) {
      case 'small':
        cfg = {
          fontSize: 13,
          height: 28,
          iconSize: 14,
          padding: showText ? 16 : 8,
          textSpacing: 4,
          minWidth: 60,
          maxWidth: 128,
          maxFontWidth: 104,
          bgColor: '',
          borderColor: '',
          textColor: '',
        };
        break;
      case 'large':
        cfg = {
          fontSize: 17,
          height: 36,
          iconSize: 18,
          padding: showText ? 16 : 9,
          textSpacing: 8,
          minWidth: 80,
          maxWidth: 168,
          maxFontWidth: 136,
          bgColor: '',
          borderColor: '',
          textColor: '',
        };
        break;
      case 'middle':
      default:
        cfg = {
          fontSize: 15,
          height: 32,
          iconSize: 16,
          padding: showText ? 16 : 8,
          textSpacing: 8,
          minWidth: 72,
          maxWidth: 152,
          maxFontWidth: 120,
          bgColor: '',
          borderColor: '',
          textColor: '',
        };
    }
    const { color, bgColor, danger, type } = action;
    // 根据按钮类型设置样式
    if (type === ButtonType.DEFAULT) {
      cfg.borderColor = bgColor
        ? this._applyDisabledColor(bgColor)
        : danger
          ? this.dangerColor
          : this.colorBorder;
      cfg.textColor = color
        ? this._applyDisabledColor(color)
        : danger
          ? this.dangerColor
          : this.fontColor;
    } else if (type === ButtonType.PRIMARY) {
      cfg.bgColor = bgColor
        ? this._applyDisabledColor(bgColor)
        : danger
          ? this.dangerColor
          : this.primaryColor;
      cfg.textColor = color ? this._applyDisabledColor(color) : this.whiteColor;
    } else if (type === ButtonType.DASHED) {
      cfg.borderColor = bgColor ? this._applyDisabledColor(bgColor) : this.colorBorder;
      cfg.textColor = color ? this._applyDisabledColor(color) : this.fontColor;
    } else if (type === ButtonType.LINK) {
      cfg.textColor = color ? this._applyDisabledColor(color) : this.fontColor;
    }
    return cfg;
  }

  /**
   * 阻止事件冒泡以避免触发行或单元格的选中等交互冲突
   *
   * @protected
   * @param {IGraphic} container
   */
  protected _stopSelectEvent(container: IGraphic): void {
    container.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
    });
  }

  /**
   * 根据禁用状态应用颜色透明度
   * @private
   * @param {string} color 原始颜色值
   * @returns {string} 处理后的颜色值
   */
  private _applyDisabledColor(color: string): string {
    if (this.store.cfg.disabled) {
      return colord(color).alpha(0.3).toRgbString();
    }
    return color;
  }

  private async _onBtnClick(action: IVTableActionItem): Promise<void> {
    // 操作确认功能需要放在具体的实现端，这个组件是通用的
    await action.action?.(this.row, this.rowIndex);
    await this.actionColumn.action?.(action, this.row, this.rowIndex);
  }

  private _onListenerClick(container: IGraphic, action: IVTableActionItem): void {
    if (this.store.cfg.disabled) {
      return;
    }
    this._stopSelectEvent(container);
    container.addEventListener('pointerup', (e) => {
      e.stopImmediatePropagation();
      suppressNextEvent();
      this._onBtnClick(action);
    });
  }

  private _openMoreMenu(e: FederatedPointerEvent, actions: IVTableActionItem[]): void {
    if (this.store.cfg.disabled) {
      return;
    }
    openVTableOperationMore(e, actions, (action: IVTableActionItem) => {
      this._onBtnClick(action);
    });
  }

  private _renderIconImage(style: IButtonStyle, action: IVTableActionItem): IImage {
    return createImage({
      image: getIconParkSvg(action.icon!, style.textColor),
      width: style.iconSize,
      height: style.iconSize,
      cursor: 'pointer',
      boundsPadding: [0, style.textSpacing, 0, style.padding],
    });
  }

  private _renderBtn(args: CustomRenderFunctionArg, action: IVTableActionItem): IGroup {
    const style = this._getButtonStyle(action);
    const btn = createGroup({
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      height: style.height,
      lineWidth: 1,
      lineDash: action.type === ButtonType.DASHED ? [4, 2] : undefined,
      stroke: style.borderColor,
      background: style.bgColor,
      cornerRadius: 4,
      // boundsPadding: [0, 12, 0, 0],
    });
    // 目前只支持 icon park 图标
    if (action.icon) {
      btn.add(this._renderIconImage(style, action));
    }
    if (action.text) {
      // 渲染按钮
      const text = createText({
        text: action.text,
        cursor: 'pointer',
        fontSize: 14,
        fill: style.textColor,
        ellipsis: true,
        maxWidth: style.maxFontWidth,
        // 实际渲染有向上偏移，给 3 让视觉上居中
        boundsPadding: [3, style.padding, 0, !action.icon ? style.padding : 0],
      });
      this._onListenerClick(btn, action);
      btn.add(text);
    }
    return btn;
  }

  /**
   * 绘制携带子按钮的更多菜单操作按钮
   *
   * @private
   * @param {CustomRenderFunctionArg} args
   * @param {IVTableActionItem} action
   * @returns {*}  {IGroup}
   */
  private _renderMoreMenu(
    args: CustomRenderFunctionArg,
    action: IVTableActionItem,
    childrenActions: IVTableActionItem[],
  ): IGroup {
    const style = this._getButtonStyle(action);
    // 基础布局
    const group = createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      lineWidth: 1,
      lineDash: action.type === ButtonType.DASHED ? [4, 2] : undefined,
      height: style.height,
      stroke: style.borderColor,
      background: style.bgColor,
      cornerRadius: 4,
      // boundsPadding: [0, 12, 0, 0],
    });
    // 左侧按钮操作区
    if (action.icon) {
      const btnGroup = createGroup({
        height: style.height,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      });
      this._onListenerClick(btnGroup, action);
      group.add(btnGroup);
      const img = this._renderIconImage(style, action);
      btnGroup.add(img);
    }
    if (action.text) {
      const btnGroup2 = createGroup({
        height: style.height,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
      });
      this._onListenerClick(btnGroup2, action);
      group.add(btnGroup2);
      // 渲染按钮文字
      const text = createText({
        cursor: 'pointer',
        text: action.text,
        fontSize: style.fontSize,
        fill: style.textColor,
        ellipsis: true,
        maxWidth: style.maxFontWidth,
        boundsPadding: [3, style.padding, 0, !action.icon ? style.padding : 0],
      });
      btnGroup2.add(text);
    }
    // 间隔竖线
    const divider = createLine({
      points: [
        { x: 0, y: 0 },
        { x: 0, y: style.height },
      ],
      stroke: this.colorBorder,
      lineWidth: 1,
    });
    group.add(divider);
    const moreGroup = createGroup({
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: style.height,
    });
    group.add(moreGroup);
    // 渲染更多菜单
    const moreImage = createImage({
      cursor: 'pointer',
      image: `<svg color="${style.textColor}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M243.2 512c0 42.24-34.56 76.8-76.8 76.8s-76.8-34.56-76.8-76.8 34.56-76.8 76.8-76.8 76.8 34.56 76.8 76.8zM588.8 512c0 42.24-34.56 76.8-76.8 76.8s-76.8-34.56-76.8-76.8 34.56-76.8 76.8-76.8 76.8 34.56 76.8 76.8zM934.4 512c0 42.24-34.56 76.8-76.8 76.8s-76.8-34.56-76.8-76.8 34.56-76.8 76.8-76.8 76.8 34.56 76.8 76.8z"></path></svg>`,
      width: style.iconSize,
      height: style.iconSize,
      boundsPadding: [0, 8, 0, 8],
    });
    this._stopSelectEvent(moreGroup);
    moreGroup.addEventListener('pointerup', (e) => {
      e.stopImmediatePropagation();
      suppressNextEvent();
      this._openMoreMenu(e as unknown as FederatedPointerEvent, childrenActions);
    });
    moreGroup.add(moreImage);
    return group;
  }

  private _renderSingleMoreMenu(
    args: CustomRenderFunctionArg,
    moreActions: IVTableActionItem[],
  ): IGroup {
    const group = createGroup({
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      height: 32,
    });
    const moreGroup = createGroup({
      height: 32,
    });
    group.add(moreGroup);
    // 渲染更多菜单
    const moreImage = createImage({
      cursor: 'pointer',
      image: `<svg color="${this.primaryColor}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M243.2 512c0 42.24-34.56 76.8-76.8 76.8s-76.8-34.56-76.8-76.8 34.56-76.8 76.8-76.8 76.8 34.56 76.8 76.8zM588.8 512c0 42.24-34.56 76.8-76.8 76.8s-76.8-34.56-76.8-76.8 34.56-76.8 76.8-76.8 76.8 34.56 76.8 76.8zM934.4 512c0 42.24-34.56 76.8-76.8 76.8s-76.8-34.56-76.8-76.8 34.56-76.8 76.8-76.8 76.8 34.56 76.8 76.8z"></path></svg>`,
      width: 16,
      height: 16,
      boundsPadding: [0, 8, 0, 8],
    });
    moreGroup.add(moreImage);
    this._stopSelectEvent(moreGroup);
    moreGroup.addEventListener('pointerup', (e) => {
      e.stopImmediatePropagation();
      suppressNextEvent();
      this._openMoreMenu(e as unknown as FederatedPointerEvent, moreActions);
    });
    return group;
  }

  render(args: CustomRenderFunctionArg): IGroup {
    // 操作列大容器，用于水平排列各个按钮，禁止换行
    const container = createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      height: args.rect?.height,
    });
    const _padding16 = createRect({ height: args.rect?.height, width: 16 });
    container.add(_padding16);
    const _padding12 = createRect({ height: args.rect?.height, width: 12 });

    const actions = (this.actionColumn.actions || []).filter((action) => {
      if (action.hidden) {
        return !action.hidden(this.row, this.rowIndex);
      }
      return true;
    });
    // 计算出实际显示的按钮数量，默认显示一个然后显示更多
    const visibleCount = this.actionColumn.visibleButtons ?? 1;

    if (visibleCount === 0) {
      // 纯更多模式
      container.add(this._renderSingleMoreMenu(args, actions));
    } else {
      const showBtns = actions.slice(0, visibleCount);
      const moreBtns = actions.slice(visibleCount);
      // 渲染显示的按钮
      showBtns.forEach((action, i) => {
        if (i > 0) {
          container.add(_padding12.clone());
        }
        if (i === showBtns.length - 1 && moreBtns.length > 0) {
          container.add(this._renderMoreMenu(args, action, moreBtns));
        } else {
          container.add(this._renderBtn(args, action));
        }
      });
    }
    container.add(_padding16.clone());
    return container;
  }

  dispose(): void {
    // 置空引用，防止内存泄漏
    this.actionColumn = null as any;
    this.row = null as any;
  }
}

export function createOperationColumnPlugin(
  store: IGctVTableStore,
  actionColumn: IVTableOperationColumn,
  row: IVTableDataItem,
  rowIndex: number,
): IVTableColumnPlugin {
  return new OperationColumnPlugin(store, actionColumn, row, rowIndex);
}
