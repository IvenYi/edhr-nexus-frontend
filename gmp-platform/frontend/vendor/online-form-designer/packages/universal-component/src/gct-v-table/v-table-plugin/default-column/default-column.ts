import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import {
  createGroup,
  createImage,
  createRect,
  createText,
  IGraphic,
  IGroup,
} from '@visactor/vtable/es/vrender';
import { IVTableColumn, IVTableColumnPlugin, IVTableDataItem } from '../../interface';
import { IGctVTableStore } from '../../store';
import { openVTableLongText } from '../../components';
import { truncateText } from '@gct/runtime';
import { suppressNextEvent } from '../../utils';

/**
 * 绘制兜底默认插件
 *
 * @export
 * @class DefaultColumnPlugin
 * @implements {IVTableColumnPlugin}
 */
export class DefaultColumnPlugin implements IVTableColumnPlugin {
  protected get _emptyText(): string {
    switch (gct.appSetting.emptyDisplay) {
      case 'empty':
        return window.$t('sys.null');
      case 'null':
        return 'null';
      case 'N/A':
        return 'N/A';
      case '--':
        return '--';
      default:
        return '';
    }
  }

  // 取自 CSS 变量的字体色值
  protected _fontColor: string;

  protected get _isDisabled(): boolean {
    return this.store.cfg.disabled === true;
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

  constructor(
    protected store: IGctVTableStore,
    protected column: IVTableColumn,
    protected row: IVTableDataItem,
    protected rowIndex: number,
  ) {
    const domStyle = getComputedStyle(store.$el as HTMLElement);
    this._fontColor = domStyle.getPropertyValue('--gct-color-text-1').trim();
  }

  updateRow(row: IVTableDataItem, rowIndex?: number): void {
    this.row = row;
    if (rowIndex !== undefined) {
      this.rowIndex = rowIndex;
    }
  }

  /**
   * 当启用行编辑时，绘制行编辑交互图标
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @return {*}  {(IGroup | void)}
   */
  protected _renderEditIcon(args: CustomRenderFunctionArg): IGroup | void {
    if (this.column.type === 'edit') {
      const iconGroup = createGroup({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: args.rect?.height,
        cursor: this._isDisabled ? 'default' : 'pointer',
      });
      const _padding16 = createRect({ height: args.rect?.height, width: 16 });
      iconGroup.add(_padding16.clone());
      const editIcon = createImage({
        image: `<svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M69.12 819.2V204.8A135.68 135.68 0 0 1 204.8 69.12h332.8a33.28 33.28 0 0 1 0 66.56H204.8A69.12 69.12 0 0 0 135.68 204.8v614.4c0 38.1952 30.9248 69.12 69.12 69.12h614.4A69.12 69.12 0 0 0 888.32 819.2v-230.4a33.28 33.28 0 0 1 66.56 0V819.2A135.68 135.68 0 0 1 819.2 954.88H204.8A135.68 135.68 0 0 1 69.12 819.2z"></path><path d="M395.264 596.0704l1.6384 80.384 78.08-0.1024 399.5648-399.5136-80.0768-80.0768-399.2576 399.3088z m107.2128 146.944l-13.7216-0.0512-157.0304 0.1024-3.4304-159.744-0.3072-14.2336 424.8576-424.8576a58.88 58.88 0 0 1 83.3024 0l90.88 90.9312c23.04 22.9888 23.04 60.2624 0 83.3024L502.4768 742.912z"></path><path d="M840.5504 358.2976l-23.5008 23.552-23.552 23.5008L667.648 279.552l47.104-47.104 125.7984 125.8496z"></path></svg>`,
        width: 16,
        height: 16,
        cursor: this._isDisabled ? 'default' : 'pointer',
      });
      if (!this._isDisabled) {
        this._stopSelectEvent(editIcon);
        editIcon.addEventListener('pointerup', (e) => {
          e.stopImmediatePropagation();
          suppressNextEvent();
          this.store.setEditRow(this.rowIndex);
        });
      }
      iconGroup.add(editIcon);
      iconGroup.add(_padding16.clone());
      return iconGroup;
    }
  }

  /**
   * 最大显示的文本长度，多余出省略，默认为20个字符，如果字段有配置取字段配置的值
   *
   * @protected
   * @type {number}
   */
  protected _maxTextSize: number = 20;

  /**
   * 内容行宽，主要用于实际内容的呈现，在减去内边距后进行计算，开启行编辑时还需减去行编辑图标宽度
   *
   * @protected
   * @type {number}
   * @memberof BaseColumnPlugin
   */
  protected _rowContentWidth: number = 0;

  /**
   * 格式化值，子类可重写此方法进行自定义格式化
   *
   * @protected
   * @param {*} value
   * @returns {*}  {string}
   */
  protected _formatValue(value: any): string {
    return value;
  }

  /**
   *  长按出 tip 提示框
   *
   * @protected
   * @param {IGraphic} element
   * @param {string} val
   */
  protected _longPressTip(element: IGraphic, val: string) {
    let timer: any = null;
    let isLongPressTriggered: boolean = false;
    element.addEventListener('pointerdown', (e) => {
      isLongPressTriggered = false;
      timer = setTimeout(() => {
        isLongPressTriggered = true;
        openVTableLongText(e as unknown as FederatedPointerEvent, val);
      }, 600);
    });
    element.addEventListener('pointerup', (e) => {
      clearTimeout(timer);
      timer = null;
      if (isLongPressTriggered) {
        e.stopPropagation();
      }
    });
    element.addEventListener('pointerleave', () => {
      clearTimeout(timer);
      timer = null;
      isLongPressTriggered = false;
    });
  }

  /**
   * 根据列宽绘制文本省略
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string} [val=args.dataValue]
   * @param {Partial<ITextGraphicAttribute>} [opts={}]
   * @param {IRenderTextConfig} [cfg={}]
   * @returns {*}  {IText}
   */
  protected _renderTextTipByWidth(
    args: CustomRenderFunctionArg,
    val: string = args.dataValue,
    opts: Partial<ITextGraphicAttribute> = {},
    cfg: IRenderTextConfig = {},
  ): IText {
    const sourceText: string = val != null && val !== '' ? this._formatValue(val) : '';

    // 当前最大文字列宽
    let maxTextWidth = -1;

    if ((this.column.width == null || this.column.width === 'auto') && !this._rowContentWidth) {
      maxTextWidth = 128;
    } else {
      maxTextWidth = this._rowContentWidth || -1;
    }

    // 额外的最大文字宽修正
    if (cfg.extraWidth) {
      maxTextWidth += cfg.extraWidth;
    }
    let showText = String(sourceText);

    if (maxTextWidth > 0) {
      showText = truncateText(
        showText,
        maxTextWidth,
        {
          fontSize: 16,
        },
        '...',
        1, // 最少显示1个字符
      );
    } else if (showText.length > this._maxTextSize) {
      showText = showText.substring(0, this._maxTextSize) + '...';
    }
    const editIconGroup = this._renderEditIcon(args);
    const text = createText({
      text: showText,
      fontSize: 16,
      fill: this._fontColor,
      boundsPadding: [0, editIconGroup ? 0 : 16, 0, 16],
    });
    if (showText?.endsWith('...') && cfg.showTip !== false) {
      this._longPressTip(text, sourceText);
    }
    return text;
  }

  render(args: CustomRenderFunctionArg): IGroup {
    const group = createGroup({
      width: args.rect?.width,
      height: args.rect?.height,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
    });
    const editIconGroup = this._renderEditIcon(args);

    if (args.rect?.width) {
      this._rowContentWidth = args.rect?.width - 60;
    }

    let strVal = this.row[this.column.name] != null && this.row[this.column.name];

    if (strVal && this.column.pipe?.format) {
      strVal = this.column.pipe.format(
        String(this.row[this.column.name]),
        this.row,
        args.row,
        args.col,
      );
    }
    const text = this._renderTextTipByWidth(args);
    group.add(text);

    if (editIconGroup) {
      group.add(editIconGroup);
    }
    return group;
  }
}
