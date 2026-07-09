import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import {
  createGroup,
  createImage,
  createRect,
  createText,
  FederatedPointerEvent,
  IGroup,
  IText,
} from '@visactor/vtable/es/vrender';
import { IVTableColumnPlugin, IVTableDataItem, IVTableEditColumn } from '../../interface';
import { IGctVTableStore } from '../../store';
import { openVTableLongText } from '../../components';
import { suppressNextEvent } from '../../utils';

export class HeaderColumnRender implements IVTableColumnPlugin {
  protected _basePadding: number = 16;

  protected _padding16Rect = createRect({
    width: this._basePadding,
  });

  // 取自 CSS 变量的主题色值
  protected _primaryColor: string;
  // 取自 CSS 变量的危险色值
  protected _dangerColor: string;
  // 取自 CSS 变量的边框色值
  protected _colorBorder: string;
  // 取自 CSS 变量的字体色值
  protected _fontColor: string;
  // 表格字体样式
  protected _fontFamily: string;

  constructor(
    protected store: IGctVTableStore,
    protected column: IVTableEditColumn,
    protected colIndex: number,
  ) {
    const domStyle = getComputedStyle(store.$el as HTMLElement);
    this._primaryColor = domStyle.getPropertyValue('--gct-color-primary').trim();
    this._dangerColor = domStyle.getPropertyValue('--gct-color-danger').trim();
    this._colorBorder = domStyle.getPropertyValue('--gct-color-border').trim();
    this._fontColor = domStyle.getPropertyValue('--gct-color-text-1').trim();
    this._fontFamily = domStyle.getPropertyValue('font-family').trim();
  }

  updateRow(row: IVTableDataItem, rowIndex?: number): void {
    // 表头列暂时不需要更新行数据
  }

  protected _renderRequiredMark(): IText | void {
    if (
      (typeof this.column.required === 'function' &&
        this.column.required(this.column._item as any) == true) ||
      this.column.required === true
    ) {
      return createText({
        text: '*',
        fontSize: 16,
        fill: this._dangerColor,
        fontFamily: this._fontFamily,
        boundsPadding: [4, 4, 0, 0],
        lineHeight: 20,
      });
    }
  }

  /**
   * 获取填写说明 Tip 图标 SVG 代码
   *
   * @protected
   * @param {string} color
   * @return {*}  {string}
   */
  protected _getTipIconImage(color: string): string {
    return `<svg fill="${color}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M866.157714 512a352.914286 352.914286 0 0 0-103.716571-250.441143A352.914286 352.914286 0 0 0 512 157.842286a352.914286 352.914286 0 0 0-250.441143 103.716571A352.914286 352.914286 0 0 0 157.842286 512c0 97.792 39.570286 186.294857 103.716571 250.441143A352.987429 352.987429 0 0 0 512 866.157714a352.914286 352.914286 0 0 0 250.441143-103.716571A352.914286 352.914286 0 0 0 866.157714 512z m73.142857 0a426.057143 426.057143 0 0 1-125.147428 302.08A426.057143 426.057143 0 0 1 512 939.373714a426.057143 426.057143 0 0 1-302.08-125.147428A426.057143 426.057143 0 0 1 84.626286 512c0-117.979429 47.908571-224.841143 125.147428-302.08A426.057143 426.057143 0 0 1 512 84.626286c117.979429 0 224.841143 47.835429 302.08 125.147428A426.057143 426.057143 0 0 1 939.373714 512z" p-id="8024"></path><path d="M512 401.042286a48.859429 48.859429 0 1 0 0-97.718857 48.859429 48.859429 0 0 0 0 97.718857z"></path><path d="M548.571429 464.603429v256h-73.142858v-256h73.142858z"></path></svg>`;
  }

  /**
   * 绘制填写说明 Tip 功能
   *
   * @protected
   * @return {*}  {(IGroup | void)}
   */
  protected _renderTip(): IGroup | void {
    const widget = this.column._item;
    if (widget && widget.props.showExplain == true) {
      const group = createGroup({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
        boundsPadding: [0, 0, 0, -8],
      });
      const img = createImage({
        image: this._getTipIconImage('#a6a6a6'),
        width: 18,
        height: 18,
        boundsPadding: [3, 0, 0, 0],
      });
      group.add(img);
      group.addEventListener('pointerup', (e) => {
        img.setAttribute('image', this._getTipIconImage('#5a5f6b'));
        e.stopImmediatePropagation();
        suppressNextEvent();
        const popover = openVTableLongText(
          e as unknown as FederatedPointerEvent,
          widget.props.explain || '',
        );
        popover.onWillDismiss().then(() => {
          img.setAttribute('image', this._getTipIconImage('#a6a6a6'));
        });
      });
      return group;
    }
  }

  protected _renderContent(group: IGroup, args: CustomRenderFunctionArg): void {
    const textGroup = createGroup({
      width: args.rect?.width,
      height: args.rect?.height,
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
    });
    group.add(textGroup);
    textGroup.add(this._padding16Rect.clone());
    const mark = this._renderRequiredMark();
    if (mark) {
      textGroup.add(mark);
    }
    const text = createText({
      text: this.column.title,
      fontSize: 16,
      fill: this._fontColor,
      fontFamily: this._fontFamily,
      lineHeight: 20,
      ellipsis: true,
      maxLineWidth: args.rect?.width
        ? args.rect.width - (mark ? 20 : 0) - this._basePadding * 2
        : undefined,
    });
    textGroup.add(text);
    const tip = this._renderTip();
    if (tip) {
      textGroup.add(tip);
    }
    textGroup.add(this._padding16Rect.clone());
  }

  render(args: CustomRenderFunctionArg): IGroup {
    // 创建 16px padding 矩形
    this._padding16Rect = createRect({
      width: this._basePadding,
      height: args.rect?.height,
    });
    // 创建根容器
    const group = createGroup({
      width: args.rect?.width,
      height: args.rect?.height,
    });
    this._renderContent(group, args);
    return group;
  }
}
