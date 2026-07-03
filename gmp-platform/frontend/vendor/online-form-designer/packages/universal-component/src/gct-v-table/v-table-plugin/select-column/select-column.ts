import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { BaseColumnPlugin } from '../base-column/base-column';
import { createGroup, createRect, IGroup, IImage, IRect } from '@visactor/vtable/es/vrender';
import { renderCheckboxItem, renderRadioItem } from '../../graphic-render';
import { openVTableSelectList } from '../../components';
import { measureText } from '@gct/runtime';
import { ISelectListItem } from '../../interface';
import { suppressNextEvent } from '../../utils';

/**
 * 选择项渲染配置
 * @interface SelectItemRenderConfig
 */
interface SelectItemRenderConfig {
  /** 是否启用标签样式 */
  isTag: boolean;
  /** 标签样式开启 */
  tagStyleOpen: boolean;
  /** 标签样式 */
  tagStyle: any;
  /** 绑定组件样式类型 */
  bindCompStyleType: string;
  /** 内边距矩形 */
  paddingRect: IRect;
}

/**
 * 选择类型的列绘制插件（当前为抽象类具体的字段类型继承此类）
 *
 * @export
 * @abstract
 * @class SelectColumnPlugin
 * @extends {BaseColumnPlugin}
 */
export abstract class SelectColumnPlugin extends BaseColumnPlugin {
  protected override _init(): void {
    super._init();
    this._maxTextSize = this.column._cfg?.specificConfig?.codeVisibleNum || 12;
  }

  protected _renderItemIcon(_args: CustomRenderFunctionArg, _val: string): IImage | null {
    return null;
  }

  /**
   * 获取选择项渲染配置
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {number} itemIndex
   * @returns {SelectItemRenderConfig}
   */
  protected _getSelectItemConfig(
    args: CustomRenderFunctionArg,
    _itemIndex: number,
  ): SelectItemRenderConfig {
    const { bindCompStyleType } = this.widget.props;
    const { tagStyleOpen, tagStyle } = this.widget.style;
    const isTag: boolean = tagStyleOpen === true && tagStyle != null;

    return {
      isTag,
      tagStyleOpen: tagStyleOpen!,
      tagStyle,
      bindCompStyleType,
      paddingRect: createRect({ width: 4, height: args.rect?.height }),
    };
  }

  /**
   * 渲染分隔符
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {IGroup} group
   * @param {boolean} isTag
   * @param {number} itemIndex
   * @returns {void}
   */
  protected _renderSeparator(
    args: CustomRenderFunctionArg,
    group: IGroup,
    isTag: boolean,
    itemIndex: number,
  ): void {
    if (isTag !== true && itemIndex > 0) {
      const separator = this._renderText(args, '，');
      group.add(separator);
    }
  }

  /**
   * 渲染选择控件（单选框或复选框）
   *
   * @protected
   * @param {string} bindCompStyleType
   * @param {string} value
   * @param {IGroup} group
   * @param {IGroup} paddingRect
   * @returns {void}
   */
  protected _renderSelectControl(
    bindCompStyleType: string,
    value: string,
    group: IGroup,
    paddingRect: IRect,
  ): void {
    const isChecked: boolean = !!value;

    if (bindCompStyleType === 'RADIO') {
      group.add(renderRadioItem({ label: '', value: isChecked }));
      group.add(paddingRect.clone());
    } else if (bindCompStyleType === 'CHECKBOX') {
      group.add(renderCheckboxItem({ label: '', value: isChecked }));
      group.add(paddingRect.clone());
    }
  }

  /**
   * 渲染选择项内容（包括前缀、图标、文本、后缀）
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string} itemValue
   * @param {boolean} isTag
   * @param {IGroup} group
   * @returns {void}
   */
  protected _renderSelectItemContent(
    args: CustomRenderFunctionArg,
    itemValue: string,
    isTag: boolean,
    group: IGroup,
  ): void {
    const prefix = this._renderPrefix(args);
    if (prefix) {
      group.add(prefix);
    }

    const icon = this._renderItemIcon(args, itemValue);
    const text = this._renderTextTipBySize(args, itemValue, undefined, { showTip: false });

    if (isTag) {
      const tagContent = icon ? [icon, text] : text;
      group.add(this._renderTag(args, tagContent, { boundsPadding: 4 })!);
    } else {
      if (icon && itemValue) {
        group.add(icon);
      }
      group.add(text);
    }

    const suffix = this._renderSuffix(args);
    if (suffix) {
      group.add(suffix);
    }
  }

  /**
   * 验证和获取选择项数据
   *
   * @protected
   * @param {string} columnValue
   * @returns {string[] | null}
   */
  protected _getSelectItems(columnValue: string): string[] | null {
    if (columnValue == null || columnValue === '') {
      return null;
    }

    const cfg = this.row._DICT![this.column.name];
    if (!cfg) {
      return null;
    }
    let items: string | string[] = cfg?.[columnValue] as string[];
    if (typeof items === 'string') {
      items = (items as string).split('，');
    }
    if (items) {
      items = items.filter((item) => item != null && item !== '');
    }

    return items?.length > 0 ? (items as string[]) : null;
  }

  /**
   * 渲染单个选择项
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string} itemValue
   * @param {number} itemIndex
   * @param {SelectItemRenderConfig} config
   * @param {IGroup} group
   * @returns {void}
   */
  protected _renderSingleSelectItem(
    args: CustomRenderFunctionArg,
    itemValue: string,
    itemIndex: number,
    config: SelectItemRenderConfig,
    group: IGroup,
  ): void {
    if (itemValue == null || itemValue === '') {
      return;
    }

    const shouldRenderTag: boolean =
      config.tagStyleOpen === true && config.tagStyle && itemValue != null && itemValue !== '';

    // 渲染分隔符
    this._renderSeparator(args, group, shouldRenderTag, itemIndex);

    // 渲染选择控件
    this._renderSelectControl(config.bindCompStyleType, itemValue, group, config.paddingRect);

    // 渲染内容
    this._renderSelectItemContent(args, itemValue, shouldRenderTag, group);
  }

  /**
   * 计算可显示的选择项数量
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string[]} items
   * @param {SelectItemRenderConfig} config
   * @returns {number}
   */
  protected _calculateVisibleItemCount(
    args: CustomRenderFunctionArg,
    items: string[],
    config: SelectItemRenderConfig,
  ): number {
    // 获取配置的宽度或使用默认的 220px
    const availableWidth: number = this._rowContentWidth > 0 ? this._rowContentWidth : 220;

    // 计算分隔符宽度（只需计算一次）
    const separatorWidth: number = config.isTag
      ? 0
      : measureText('，', {
          fontFamily: this._fontFamily,
          fontSize: this._fontSize,
        });

    // 计算每个项的大约宽度
    let totalWidth: number = 0;
    let visibleCount: number = 0;

    for (let i = 0; i < items.length; i++) {
      const itemValue: string = items[i];
      if (!itemValue || itemValue === '') {
        continue;
      }

      // 先根据显示字符个数截取文本
      let displayText: string = itemValue;
      if (itemValue.length > this._maxTextSize) {
        displayText = itemValue.substring(0, this._maxTextSize) + '...';
      }

      // 使用 measureText 精确计算文本宽度
      const textWidth: number = measureText(displayText, {
        fontFamily: this._fontFamily,
        fontSize: this._fontSize,
      });

      // 计算单个项的宽度：文本宽度 + 图标宽度 + 内边距
      let itemWidth: number = textWidth;

      // 如果是标签样式，增加标签边距
      if (config.isTag) {
        itemWidth += this._basePadding; // 标签左右边距
      }

      // 如果有选择控件（单选框或复选框），增加控件宽度
      if (config.bindCompStyleType === 'RADIO' || config.bindCompStyleType === 'CHECKBOX') {
        itemWidth += 24; // 控件宽度 + 间距
      }

      // 如果不是第一项且不是标签样式，增加分隔符宽度
      if (i > 0) {
        itemWidth += separatorWidth;
      }

      // 检查是否超出可用宽度
      if (totalWidth + itemWidth > availableWidth - 30) {
        // 预留省略号宽度
        break;
      }

      totalWidth += itemWidth;
      visibleCount++;
    }

    // 至少显示一项
    return Math.max(1, visibleCount);
  }

  /**
   * 长按显示选择列表
   *
   * @protected
   * @param {IGroup} element
   * @param {ISelectListItem[]} items
   */
  protected _longPressSelectList(element: IGroup, items: ISelectListItem[]): void {
    let timer: any = null;
    let isLongPressTriggered: boolean = false;
    element.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      isLongPressTriggered = false;
      timer = setTimeout(() => {
        isLongPressTriggered = true;
        openVTableSelectList(e as any, items);
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
    element.addEventListener('pointerleave', (e) => {
      e.stopPropagation();
      clearTimeout(timer);
      timer = null;
      isLongPressTriggered = false;
    });
  }

  /**
   * 渲染多个选择项
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string[]} items
   * @param {IGroup} group
   * @returns {void}
   */
  protected _renderSelectItems(
    args: CustomRenderFunctionArg,
    items: string[],
    group: IGroup,
  ): void {
    const config = this._getSelectItemConfig(args, 0);

    // 计算可显示的项数
    const visibleCount: number = this._calculateVisibleItemCount(args, items, config);
    const hasMore: boolean = items.length > visibleCount;

    // 渲染可见的项
    const visibleItems: string[] = items.slice(0, visibleCount);
    visibleItems.forEach((itemValue: string, itemIndex: number) => {
      this._renderSingleSelectItem(args, itemValue, itemIndex, config, group);
    });

    // 如果有更多项，添加省略号
    if (hasMore) {
      const ellipsisText: string = config.isTag ? '' : '，';
      const ellipsis = this._renderText(args, `${ellipsisText}...`);
      group.add(ellipsis);

      // 多选时，需要长按出现全部内容
      this._longPressSelectList(
        group,
        items.map((text) => ({ label: text })),
      );
    }
  }

  /**
   * 渲染单一项内容（包括前缀、图标、文本、后缀）
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string} itemValue
   * @param {boolean} isTag
   * @param {IGroup} group
   * @returns {void}
   */
  protected _renderSingleItemContent(
    args: CustomRenderFunctionArg,
    itemValue: string,
    isTag: boolean,
    group: IGroup,
  ): void {
    const prefix = this._renderPrefix(args);
    if (prefix) {
      group.add(prefix);
    }

    const icon = this._renderItemIcon(args, itemValue);
    const text = this._renderTextTipByWidth(args, itemValue, undefined, {
      extraWidth: icon ? -20 : 0,
    });

    if (isTag) {
      const tagContent = icon ? [icon, text] : text;
      group.add(this._renderTag(args, tagContent, { boundsPadding: 4 })!);
    } else {
      if (icon && itemValue) {
        group.add(icon);
      }
      group.add(text);
    }

    const suffix = this._renderSuffix(args);
    if (suffix) {
      group.add(suffix);
    }
  }

  /**
   * 只有单一一个项时的渲染
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {string} itemValue
   * @param {SelectItemRenderConfig} config
   * @param {IGroup} group
   * @returns {*}  {void}
   */
  protected _renderSingleItem(
    args: CustomRenderFunctionArg,
    itemValue: string,
    config: SelectItemRenderConfig,
    group: IGroup,
  ): void {
    if (itemValue == null || itemValue === '') {
      return;
    }

    const shouldRenderTag: boolean =
      config.tagStyleOpen === true && config.tagStyle && itemValue != null && itemValue !== '';

    // 渲染选择控件
    this._renderSelectControl(config.bindCompStyleType, itemValue, group, config.paddingRect);

    // 渲染内容
    this._renderSingleItemContent(args, itemValue, shouldRenderTag, group);
  }

  /**
   * 绘制单元格实际内容
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @returns {IGroup}
   */
  protected override _renderContent(args: CustomRenderFunctionArg): IGroup {
    const group = createGroup({
      display: 'flex',
      alignItems: 'center',
      justifyContent: this._justifyContent,
      flexWrap: 'nowrap',
      height: this._rowHeight,
      width: this._rowContentWidth,
      boundsPadding: 16,
    });

    const items = this._getSelectItems(args.dataValue);
    if (items && items.length > 0) {
      if (items.length === 1) {
        this._renderSingleItem(args, items[0], this._getSelectItemConfig(args, 0), group);
      } else {
        this._renderSelectItems(args, items, group);
      }
    } else {
      group.add(this._renderText(args, ''));
    }
    return group;
  }
}
