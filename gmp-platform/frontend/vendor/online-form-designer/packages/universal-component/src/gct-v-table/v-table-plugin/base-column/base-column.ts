import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import {
  createGroup,
  createText,
  IGroup,
  IText,
  IGraphic,
  IGroupGraphicAttribute,
  ITextGraphicAttribute,
  createRect,
  FederatedPointerEvent,
  createImage,
} from '@visactor/vtable/es/vrender';
import { colord } from 'colord';
import { IVTableColumn, IVTableColumnPlugin, IVTableDataItem } from '../../interface';
import { IGctVTableStore } from '../../store';
import { FIELD_TYPE, LowCodeWidget, TagTypeEnum, truncateText } from '@gct/runtime';
import { cloneDeep } from 'lodash-es';
import { deepMerge } from '/@/utils';
import { openVTableLongText } from '../../components';
import { CustomTagRenderer } from './custom-tag-renderer';
import { suppressNextEvent } from '../../utils';

// pad 端支持表格行编辑的字段类型，此为中间版本的临时判断，等支持所有字段类型时，去掉此声明以及相关判断
export const padVTableSupportEditFieldTypes = [
  FIELD_TYPE.TEXT,
  FIELD_TYPE.LONG_TEXT,
  FIELD_TYPE.INTEGER,
  FIELD_TYPE.LONG,
  FIELD_TYPE.DOUBLE,
  FIELD_TYPE.DECIMAL,
  FIELD_TYPE.BOOLEAN,
  FIELD_TYPE.DATE,
  FIELD_TYPE.TIME,
  FIELD_TYPE.DATE_TIME,
  FIELD_TYPE.USER,
  FIELD_TYPE.USER_MULTI,
];

export interface IRenderTextConfig {
  /**
   * 是否显示 tip 提示框，在显示省略号时默认为 true
   *
   * @default true
   * @type {boolean}
   */
  showTip?: boolean;
  /**
   * 是否省略多余文本，根据实体属性配置或默认超过 12 个字符省略，默认开启
   *
   * @default true
   * @type {boolean}
   */
  ellipsis?: boolean;
  /**
   * 特殊直接指定最大显示文本长度，指定后不再根据列宽计算
   *
   * @type {number}
   */
  maxTextSize?: number;
  /**
   * 额外宽度，在自动计算文字宽度模式下，可以在调用时单独控制最大宽度偏移量
   *
   * @type {number}
   */
  extraWidth?: number;
}

/**
 * 列绘制插件基础
 *
 * @export
 * @abstract
 * @class BaseColumnPlugin
 * @implements {IVTableColumnPlugin}
 */
export abstract class BaseColumnPlugin implements IVTableColumnPlugin {
  protected widget: LowCodeWidget.BasicSchema;

  protected _basePadding: number = 16;

  protected _style: Partial<LowCodeWidget.BasicStyle> = {};

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

  protected get _justifyContent(): IGroup['justifyContent'] {
    const { contentFont } = this._style;
    if (contentFont) {
      if (contentFont.align === 'center') {
        return 'center';
      } else if (contentFont.align === 'right') {
        return 'flex-end';
      } else if (contentFont.align === 'justify') {
        return 'space-between';
      }
    }
    return undefined;
  }

  protected get _textAlign(): IText['textAlign'] {
    const { contentFont } = this._style;
    if (contentFont) {
      if (contentFont.align === 'center') {
        return 'center';
      } else if (contentFont.align === 'right') {
        return 'right';
      }
    }
    return 'left';
  }

  protected get _fontSize(): number {
    const { contentFont } = this._style;
    if (contentFont && contentFont.fontSize) {
      return Number(contentFont.fontSize) as unknown as number;
    }
    return 16;
  }

  /**
   * 文本行高，默认为字体大小的1.4倍取整
   *
   * @readonly
   * @protected
   * @type {number}
   */
  protected get _lineHeight(): number {
    return Math.floor(this._fontSize * 1.4);
  }

  /**
   * 基础行高，默认为字体大小的3倍
   *
   * @readonly
   * @protected
   * @type {number}
   */
  protected get _baseHeight(): number {
    return this._fontSize * 3;
  }

  /**
   * 实际行高，默认取基础行高，如果传入的行高大于基础行高，则使用传入的行高（传入的行高为当前行，最高列内容高度）
   *
   * @protected
   * @type {number}
   */
  protected _rowHeight: number = 48;

  /**
   * 内容行宽，主要用于实际内容的呈现，在减去内边距后进行计算，开启行编辑时还需减去行编辑图标宽度
   *
   * @protected
   * @type {number}
   * @memberof BaseColumnPlugin
   */
  protected _rowContentWidth: number = 0;

  /**
   * 自定义标签组的总宽度
   *
   * @protected
   * @type {number}
   */
  protected _customTagsWidth: number = 0;

  /**
   * 最大显示的文本长度，多余出省略，默认为20个字符，如果字段有配置取字段配置的值
   *
   * @protected
   * @type {number}
   */
  protected _maxTextSize: number = 20;

  // 取自 CSS 变量的主题色值
  protected _primaryColor: string;
  protected get _disabledPrimaryColor() {
    return colord(this._primaryColor).alpha(0.3).toRgbString();
  }
  // 取自 CSS 变量的危险色值
  protected _dangerColor: string;
  protected get _disabledDangerColor() {
    return colord(this._dangerColor).alpha(0.3).toRgbString();
  }
  // 取自 CSS 变量的边框色值
  protected _colorBorder: string;
  protected get _disabledColorBorder() {
    return colord(this._colorBorder).alpha(0.3).toRgbString();
  }
  // 取自 CSS 变量的字体色值
  protected _fontColor: string;
  protected get _disabledFontColor() {
    return colord(this._fontColor).alpha(0.3).toRgbString();
  }
  protected _fontColor5: string;
  protected get _disabledFontColor5() {
    return colord(this._fontColor5).alpha(0.3).toRgbString();
  }
  // 表格字体样式
  protected _fontFamily: string;
  // 自定义标签渲染器
  protected _customTagRenderer: CustomTagRenderer;

  protected get _isReadonly(): boolean {
    return this.store.cfg.readonly === true;
  }

  protected get _isDisabled(): boolean {
    return this.store.cfg.disabled === true;
  }

  /**
   * 是否启用行编辑
   *
   * @protected
   * @type {boolean}
   */
  protected get _isRowEdit(): boolean {
    if (
      this.store.cfg.readonly !== true &&
      this.widget.props.fieldReadonly === false &&
      this.widget.props.readonly === false &&
      this.row._READONLY?.[this.widget.props.field] !== true &&
      padVTableSupportEditFieldTypes.includes(this.widget.props.fieldType as FIELD_TYPE)
    ) {
      return true;
    }
    return false;
  }

  constructor(
    protected store: IGctVTableStore,
    protected column: IVTableColumn,
    protected row: IVTableDataItem,
    protected rowIndex: number,
  ) {
    this.widget = column._item as LowCodeWidget.BasicSchema;

    const domStyle = getComputedStyle(store.$el as HTMLElement);
    this._primaryColor = domStyle.getPropertyValue('--gct-color-primary').trim();
    this._dangerColor = domStyle.getPropertyValue('--gct-color-danger').trim();
    this._colorBorder = domStyle.getPropertyValue('--gct-color-border').trim();
    this._fontColor = domStyle.getPropertyValue('--gct-color-text-1').trim();
    this._fontColor5 = domStyle.getPropertyValue('--gct-color-text-5').trim();
    this._fontFamily = domStyle.getPropertyValue('font-family').trim();
    this._customTagRenderer = new CustomTagRenderer(this._primaryColor);
    this.resetStyle();
    this._init();
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

  protected _init(): void {
    // do nothing
  }

  /**
   * 重置样式，合并基础样式和动态样式
   * 在样式变更后调用此方法进行样式重置，否则样式更新不及时
   *
   * @memberof BaseColumnPlugin
   */
  resetStyle(): void {
    this._style = deepMerge(
      cloneDeep(this.widget.style) || {},
      this.row._STYLE?.[this.widget.props.field] || {},
    );
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
   * 绘制前缀
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @returns {*}  {(IGraphic | null)}
   */
  protected _renderPrefix(_args: CustomRenderFunctionArg): IGraphic | null {
    return null;
  }

  /**
   * 绘制后缀
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @returns {*}  {(IGraphic | null)}
   */
  protected _renderSuffix(_args: CustomRenderFunctionArg): IGraphic | null {
    return null;
  }

  /**
   * 当启用行编辑时，绘制行编辑交互图标
   *
   * @protected
   * @param {IGroup} group
   * @param {CustomRenderFunctionArg} args
   */
  protected _renderEditIcon(group: IGroup, _args: CustomRenderFunctionArg): void {
    if (this._isRowEdit) {
      const iconGroup = createGroup({
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 48,
        height: this._rowHeight,
        cursor: 'pointer',
      });
      group.add(iconGroup);
      const _padding16 = createRect({ height: this._rowHeight, width: 16 });
      iconGroup.add(_padding16.clone());
      const editIcon = createImage({
        image: `<svg viewBox="0 0 1024 1024" fill="${
          this._isDisabled ? this._disabledFontColor5 : this._fontColor5
        }" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M69.12 819.2V204.8A135.68 135.68 0 0 1 204.8 69.12h332.8a33.28 33.28 0 0 1 0 66.56H204.8A69.12 69.12 0 0 0 135.68 204.8v614.4c0 38.1952 30.9248 69.12 69.12 69.12h614.4A69.12 69.12 0 0 0 888.32 819.2v-230.4a33.28 33.28 0 0 1 66.56 0V819.2A135.68 135.68 0 0 1 819.2 954.88H204.8A135.68 135.68 0 0 1 69.12 819.2z"></path><path d="M395.264 596.0704l1.6384 80.384 78.08-0.1024 399.5648-399.5136-80.0768-80.0768-399.2576 399.3088z m107.2128 146.944l-13.7216-0.0512-157.0304 0.1024-3.4304-159.744-0.3072-14.2336 424.8576-424.8576a58.88 58.88 0 0 1 83.3024 0l90.88 90.9312c23.04 22.9888 23.04 60.2624 0 83.3024L502.4768 742.912z"></path><path d="M840.5504 358.2976l-23.5008 23.552-23.552 23.5008L667.648 279.552l47.104-47.104 125.7984 125.8496z"></path></svg>`,
        width: 16,
        height: 16,
        cursor: 'pointer',
      });
      if (this._isDisabled !== true) {
        this._stopSelectEvent(editIcon);
        editIcon.addEventListener('pointerup', (e) => {
          e.stopImmediatePropagation();
          suppressNextEvent();
          this.store.setEditRow(this.rowIndex);
        });
      }
      iconGroup.add(editIcon);
      iconGroup.add(_padding16.clone());
    }
  }

  /**
   * 渲染列内容，非特殊呈现不要覆写此方法，统一对外暴露的容器，会有基础的样式计算
   *
   * @param {CustomRenderFunctionArg} args
   * @returns {*}  {IGroup}
   */
  render(args: CustomRenderFunctionArg): IGroup {
    const { table, rect, row, col } = args;
    const { width, height } = rect ?? table.getCellRect(row, col);
    // 如果本身的表格的行高大于基础行高，则使用表格的行高
    this._rowHeight = height || this._baseHeight;
    this._rowContentWidth = width ?? 0;

    // 减去内边距计算实际内容宽度
    if (this._rowContentWidth != null && this._rowContentWidth > 0) {
      // 减去左右内边距
      // this._rowContentWidth -= this._basePadding * 2;
      // 当开启行编辑时，需要减去行编辑图标宽度和左内边距
      if (this._isRowEdit) {
        this._rowContentWidth -= 48;
        this._rowContentWidth -= this._basePadding;
      } else {
        // 未开启行编辑时，减去左右内边距
        this._rowContentWidth -= this._basePadding * 2;
      }
      const customTags = this.row._CUSTOM_TAGS?.[this.widget.props.field];
      if (customTags?.length) {
        // tags 可以显示的最大宽度，确保文本内容至少有30px显示空间
        const maxTagsWidth = this._rowContentWidth - 30;
        // 计算自定义标签组的宽度
        const tagsWidth = this._customTagRenderer.calculateTagsWidth(
          customTags || [],
          this._fontFamily,
        );
        this._customTagsWidth = Math.min(tagsWidth, maxTagsWidth);
      }
    }

    const container = createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      height: this._rowHeight,
      fill: this._style.backgroundColor || undefined,
      stroke: 'transparent',
    });
    const content = this._renderContent(args);
    content.setAttribute('boundsPadding', [
      0,
      this._isRowEdit ? 0 : this._basePadding,
      0,
      this._basePadding,
    ]);
    container.add(content);
    if (this._isRowEdit) {
      this._renderEditIcon(container, args);
    }
    return container;
  }

  /**
   * 渲染多个自定义标签
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string} key - 字段标识，用于从 _CUSTOM_TAGS 中获取对应标签数组
   * @returns {*}  {(IGraphic | null)}
   */
  protected _renderCustomTags(args: CustomRenderFunctionArg, key: string): IGraphic | null {
    const customTags = this.row._CUSTOM_TAGS?.[key];
    return this._customTagRenderer.renderTags(customTags || [], this._customTagsWidth);
  }

  /**
   * 渲染标签样式
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {(IGraphic | IGraphic[])} content
   * @param {Partial<IGroupGraphicAttribute>} [opts={}]
   * @param {string} [val=args.dataValue]
   * @returns {*}  {IGraphic}
   */
  protected _renderTag(
    args: CustomRenderFunctionArg,
    content: IGraphic | IGraphic[],
    opts: Partial<IGroupGraphicAttribute> = {},
    val: string = args.dataValue,
  ): IGraphic | null {
    const { tagStyle, tagStyleOpen } = this._style;
    if (tagStyleOpen !== true || !tagStyle || val == null || val === '') {
      return null;
    }
    const styleOpts: Partial<IGroupGraphicAttribute> = {};
    // 根据配置绘制圆角
    switch (tagStyle.tagType) {
      case TagTypeEnum.RADIUS:
        Object.assign(styleOpts, {
          cornerRadius: 4,
          fill: tagStyle.color || this._primaryColor,
        });
        break;
      case TagTypeEnum.LINEAR_RADIUS:
        Object.assign(styleOpts, {
          cornerRadius: 4,
          stroke: tagStyle.color || this._primaryColor,
        });
        break;
      case TagTypeEnum.BIG_RADIUS:
        Object.assign(styleOpts, {
          cornerRadius: 100,
          fill: tagStyle.color || this._primaryColor,
        });
        break;
      case TagTypeEnum.LINEAR_BIG_RADIUS:
        Object.assign(styleOpts, {
          cornerRadius: 100,
          stroke: tagStyle.color || this._primaryColor,
        });
        break;
      case TagTypeEnum.DASHED_RADIUS:
        Object.assign(styleOpts, {
          cornerRadius: 100,
          stroke: tagStyle.color || this._primaryColor,
          lineDash: [4, 2],
        });
        break;
      case TagTypeEnum.STATUS:
        Object.assign(styleOpts, {
          cornerRadius: [15, 4, 4, 4],
          fill: tagStyle.color || this._primaryColor,
        });
        break;
    }
    const tagGroup = createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      ...styleOpts,
      ...opts,
    });
    const padding = createRect({ width: this._basePadding / 2, height: 30 });
    tagGroup.add(padding);
    if (Array.isArray(content)) {
      content.forEach((c) => tagGroup.add(c));
    } else {
      tagGroup.add(content);
    }
    tagGroup.add(padding.clone());
    return tagGroup;
  }

  /**
   * 绘制单元格实际内容，子类覆写此方法进行具体内容绘制
   *
   * @protected
   * @param {IGroup} group
   * @param {CustomRenderFunctionArg} args
   */
  protected _renderContentIn(group: IGroup, args: CustomRenderFunctionArg): void {
    const text = this._renderTextTipByWidth(args);
    const tag = this._renderTag(args, text);
    if (tag) {
      group.add(tag);
    } else {
      group.add(text);
    }
  }

  /**
   * 绘制单元格实际内容
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @returns {*}  {IGroup}
   */
  protected _renderContent(args: CustomRenderFunctionArg): IGroup {
    const group = createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      height: this._rowHeight,
      justifyContent: this._justifyContent,
      width: this._rowContentWidth,
      overflow: 'hidden',
      stroke: 'transparent',
    });
    const prefix = this._renderPrefix(args);
    if (prefix) {
      group.add(prefix);
    }
    this._renderContentIn(group, args);

    // 渲染多个自定义标签（在行编辑图标之前）
    const customTags = this._renderCustomTags(args, this.widget.props.field);
    if (args.dataValue != null && args.dataValue !== '' && customTags) {
      const spacing = createRect({ width: 8, height: this._rowHeight });
      group.add(spacing);
      group.add(customTags);
    }

    const suffix = this._renderSuffix(args);
    if (suffix) {
      group.add(suffix);
    }
    return group;
  }

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
      e.stopPropagation();
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
        e.stopImmediatePropagation();
        suppressNextEvent();
      } else {
        // 非长按时需要设置之前被阻止的行选中状态，以保证点击交互的正常进行
        this.store.tableInst.selectRow(this.rowIndex);
      }
    });
    element.addEventListener('pointerleave', () => {
      clearTimeout(timer);
      timer = null;
      isLongPressTriggered = false;
    });
  }

  /**
   * 绘制文本元素，会根据样式进行处理
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string} [val=args.dataValue]
   * @param {Partial<ITextGraphicAttribute>} [opts]
   * @returns {*}  {IText}
   */
  protected _renderText(
    args: CustomRenderFunctionArg,
    val: string = args.dataValue,
    opts: Partial<ITextGraphicAttribute> = {},
  ): IText {
    const { contentFont } = this._style;
    if (val == null || val === '') {
      return createText({
        fill: this._fontColor,
        fontSize: this._fontSize,
        lineHeight: this._lineHeight,
        text: this._emptyText,
        fontWeight: contentFont?.bold ? 'bold' : undefined,
        fontStyle: contentFont?.italic ? 'italic' : undefined,
        whiteSpace: 'no-wrap',
        textAlign: this._textAlign,
        ...opts,
      });
    }
    const text = createText({
      fill: this._fontColor,
      fontSize: this._fontSize,
      lineHeight: this._lineHeight,
      text: val != null && val !== '' ? val : this._emptyText,
      fontWeight: contentFont?.bold ? 'bold' : undefined,
      fontStyle: contentFont?.italic ? 'italic' : undefined,
      underline: contentFont?.textDecoration === 'underline' ? 1 : undefined,
      lineThrough: contentFont?.textDecoration === 'line-through' ? 1 : undefined,
      whiteSpace: 'no-wrap',
      textAlign: this._textAlign,
      ...opts,
    });
    return text;
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
    if (!sourceText || cfg.ellipsis === false) {
      return this._renderText(args, sourceText, opts);
    }
    const { contentFont } = this._style;
    // 当前最大文字列宽
    let maxTextWidth = -1;
    if (cfg.maxTextSize) {
      // 特殊指定不自动计算最大宽度
      maxTextWidth = cfg.maxTextSize;
    } else {
      if ((this.column.width == null || this.column.width === 'auto') && !this._rowContentWidth) {
        maxTextWidth = 128;
      } else {
        // 默认为列宽减去左右padding，如果开启 tag 的情况下，再减去 tag 的 padding 宽度
        maxTextWidth = this._rowContentWidth || -1;
      }
      // 启用了自定义的标签组，需要减去标签组的宽度
      if (maxTextWidth !== -1 && this._customTagsWidth > 0) {
        maxTextWidth -= this._customTagsWidth + 8; // 8 为标签组与文本间距
      }
      // 启用了标签，需要减去标签的内padding宽度
      if (maxTextWidth !== -1 && this._style.tagStyleOpen) {
        maxTextWidth -= this._basePadding;
      }
      // 额外的最大文字宽修正
      if (cfg.extraWidth) {
        maxTextWidth += cfg.extraWidth;
      }
    }
    let showText = String(sourceText);
    if (maxTextWidth > 0) {
      showText = truncateText(
        showText,
        maxTextWidth,
        {
          fontSize: this._fontSize,
          fontFamily: this._fontFamily,
          fontWeight: contentFont?.bold ? 'bold' : undefined,
          fontStyle: contentFont?.italic ? 'italic' : undefined,
        },
        '...',
        1, // 最少显示1个字符
      );
    } else if (showText.length > this._maxTextSize) {
      showText = showText.substring(0, this._maxTextSize) + '...';
    }
    const text = this._renderText(args, showText, opts);
    if (showText?.endsWith('...') && cfg.showTip !== false) {
      this._longPressTip(text, sourceText);
    }
    return text;
  }

  /**
   * 根据指定限制的文字个数绘制文本省略
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string} [val=args.dataValue]
   * @param {Partial<ITextGraphicAttribute>} [opts={}]
   * @param {IRenderTextConfig} [cfg={}]
   * @returns {*}  {IText}
   */
  protected _renderTextTipBySize(
    args: CustomRenderFunctionArg,
    val: string = args.dataValue,
    opts: Partial<ITextGraphicAttribute> = {},
    cfg: IRenderTextConfig = {},
  ): IText {
    const sourceText: string = val != null && val !== '' ? this._formatValue(val) : '';
    if (!sourceText || cfg.ellipsis === false) {
      return this._renderText(args, sourceText, opts);
    }
    let showText = String(sourceText);
    if (cfg.maxTextSize && showText.length > cfg.maxTextSize) {
      showText = showText.substring(0, cfg.maxTextSize) + '...';
    } else if (!cfg.maxTextSize && showText.length > this._maxTextSize) {
      showText = showText.substring(0, this._maxTextSize) + '...';
    }
    const text = this._renderText(args, showText, opts);
    if (showText?.endsWith('...') && cfg.showTip !== false) {
      this._longPressTip(text, sourceText);
    }
    return text;
  }
}
