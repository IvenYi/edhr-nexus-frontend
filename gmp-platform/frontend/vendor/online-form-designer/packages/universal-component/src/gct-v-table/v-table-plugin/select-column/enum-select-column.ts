import {
  createGroup,
  createImage,
  createRect,
  IGraphic,
  IGroup,
  IImage,
  IRect,
} from '@visactor/vtable/es/vrender';
import { SelectColumnPlugin } from './select-column';
import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { getIconParkSvg } from '../../utils';
import { renderCheckboxItem, renderRadioItem } from '../../graphic-render';

/**
 * 枚举项渲染配置
 * @interface EnumItemConfig
 */
interface EnumItemConfig {
  /** 图标 */
  icon: IImage | null;
  /** 文本 */
  text: IGraphic;
  /** 内边距 */
  padding: IRect;
}

/**
 * 枚举类型的列绘制插件
 *
 * @export
 * @class EnumSelectColumnPlugin
 * @extends {SelectColumnPlugin}
 */
export class EnumSelectColumnPlugin extends SelectColumnPlugin {
  /**
   * 渲染枚举项图标
   *
   * @protected
   * @param {IObject} cfg
   * @returns {IImage | null}
   */
  protected _renderEnumItemIcon(cfg: IObject): IImage | null {
    if (!cfg.icon) {
      return null;
    }

    return createImage({
      image: getIconParkSvg(cfg.icon as string, this._primaryColor),
      fill: cfg.iconColor,
      width: 16,
      height: 16,
    });
  }

  /**
   * 渲染枚举项选择控件（单选框或复选框）
   *
   * @protected
   * @param {string} bindCompStyleType
   * @param {boolean} isChecked
   * @param {IGroup} group
   * @param {IGroup} padding
   * @returns {void}
   */
  protected _renderEnumItemControl(
    bindCompStyleType: string,
    isChecked: boolean,
    group: IGroup,
    padding: IRect,
  ): void {
    if (bindCompStyleType === 'RADIO') {
      group.add(renderRadioItem({ label: '', value: isChecked }));
      group.add(padding.clone());
    } else if (bindCompStyleType === 'CHECKBOX') {
      group.add(renderCheckboxItem({ label: '', value: isChecked }));
      group.add(padding.clone());
    }
  }

  /**
   * 构建枚举项配置
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {IObject} cfg
   * @param {string} label
   * @returns {EnumItemConfig}
   */
  protected _buildEnumItemConfig(
    args: CustomRenderFunctionArg,
    cfg: IObject,
    label: string,
    showTip: boolean = false,
  ): EnumItemConfig {
    const padding = createRect({ width: 4, height: args.rect?.height });
    const icon = this._renderEnumItemIcon(cfg);
    const opts: IObject = {};
    if (cfg.textColor) {
      opts.fill = cfg.textColor;
    }
    const text = this._renderTextTipBySize(args, label, opts, { showTip });

    return {
      icon,
      text,
      padding,
    };
  }

  /**
   * 渲染枚举项内容（包括图标、文本或标签）
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {EnumItemConfig} itemConfig
   * @param {IGroup} group
   * @returns {void}
   */
  protected _renderEnumItemInnerContent(
    args: CustomRenderFunctionArg,
    itemConfig: EnumItemConfig,
    group: IGroup,
  ): void {
    const tagContent = itemConfig.icon
      ? [itemConfig.icon, itemConfig.padding.clone(), itemConfig.text]
      : itemConfig.text;

    const tag = this._renderTag(args, tagContent, { boundsPadding: 4 });

    if (tag) {
      group.add(tag);
    } else {
      if (itemConfig.icon) {
        group.add(itemConfig.icon);
        group.add(itemConfig.padding.clone());
      }
      group.add(itemConfig.text);
    }
  }

  /**
   * 渲染单个枚举项
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {IObject} cfg
   * @param {string} label
   * @param {boolean} isChecked
   * @param {string} bindCompStyleType
   * @returns {IGraphic}
   */
  protected _renderEnumItem(
    args: CustomRenderFunctionArg,
    cfg: IObject,
    label: string,
    isChecked: boolean,
    bindCompStyleType: string,
    showTip: boolean,
  ): IGraphic {
    const group = createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
    });
    const padding = createRect({ width: 4, height: args.rect?.height });

    // 渲染选择控件
    this._renderEnumItemControl(bindCompStyleType, isChecked, group, padding);

    // 构建枚举项配置
    const itemConfig = this._buildEnumItemConfig(args, cfg, label, showTip);

    // 渲染内容
    this._renderEnumItemInnerContent(args, itemConfig, group);

    return group;
  }

  /**
   * 判断是否为选择类型（复选框或单选框）
   *
   * @protected
   * @param {string} bindCompStyleType
   * @returns {boolean}
   */
  protected _isSelectType(bindCompStyleType: string): boolean {
    return bindCompStyleType === 'CHECKBOX' || bindCompStyleType === 'RADIO';
  }

  /**
   * 渲染选择类型的枚举项
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {IGroup} group
   * @param {IGroup} padding
   * @param {string} bindCompStyleType
   * @returns {void}
   */
  protected _renderSelectTypeEnumItems(
    args: CustomRenderFunctionArg,
    group: IGroup,
    padding: IRect,
    bindCompStyleType: string,
  ): void {
    const vals = args.dataValue?.split(',') ?? [];
    const enumList = this.column.enumList || [];

    // 将枚举项转换为字符串数组，复用父类的计算逻辑
    const items: string[] = enumList.map((cfg: IObject) => cfg.text as string);
    const config = this._getSelectItemConfig(args, 0);
    const visibleCount: number = this._calculateVisibleItemCount(args, items, config);
    const hasMore: boolean = enumList.length > visibleCount;

    // 渲染可见的项
    const visibleItems: IObject[] = enumList.slice(0, visibleCount);
    visibleItems.forEach((cfg: IObject, index: number) => {
      if (index > 0) {
        group.add(padding.clone());
      }

      const isChecked = vals.includes(cfg.value as string);
      group.add(
        this._renderEnumItem(
          args,
          cfg,
          cfg.text as string,
          isChecked,
          bindCompStyleType,
          items.length === 1,
        ),
      );
    });

    // 如果有更多项，添加省略号
    if (hasMore) {
      group.add(padding.clone());
      const ellipsis = this._renderText(args, '...');
      group.add(ellipsis);

      // 多选时，需要长按出现全部内容
      this._longPressSelectList(
        group,
        enumList.map((cfg: IObject) => ({
          ...cfg,
          label: cfg.text as string,
          icon: getIconParkSvg(cfg.icon as string, this._primaryColor),
        })),
      );
    }
  }

  /**
   * 渲染非选择类型的枚举项
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {IGroup} group
   * @param {IGroup} padding
   * @returns {void}
   */
  protected _renderNonSelectTypeEnumItems(
    args: CustomRenderFunctionArg,
    group: IGroup,
    padding: IRect,
  ): void {
    const cfg = this.row._DICT![this.column.name] as IObject;
    if (!cfg) {
      return;
    }

    const vals = cfg[args.dataValue];
    const keys = args.dataValue?.split(',') ?? [];
    const configs = keys
      .map((key: string) => {
        return this.column.enumList?.find((item: IObject) => item.value === key);
      })
      .filter((item): item is IObject => item !== undefined);

    // 将枚举项转换为字符串数组，复用父类的计算逻辑
    const items: string[] = configs.map((cfg: IObject) => cfg.text as string);
    const config = this._getSelectItemConfig(args, 0);
    const visibleCount: number = this._calculateVisibleItemCount(args, items, config);
    const hasMore: boolean = configs.length > visibleCount;

    // 渲染可见的项
    const visibleConfigs: IObject[] = configs.slice(0, visibleCount);
    visibleConfigs.forEach((cfg: IObject, index: number) => {
      if (index > 0) {
        group.add(padding.clone());
      }

      group.add(this._renderEnumItem(args, cfg, vals[index], false, 'DISPLAY', items.length === 1));
    });

    // 如果有更多项，添加省略号
    if (hasMore) {
      group.add(padding.clone());
      const ellipsis = this._renderText(args, '...');
      group.add(ellipsis);

      this._longPressSelectList(
        group,
        configs.map((cfg: IObject) => ({
          ...cfg,
          label: cfg.text as string,
          icon: getIconParkSvg(cfg.icon as string, this._primaryColor),
        })),
      );
    }
  }

  /**
   * 绘制单元格实际内容
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @returns {IGroup}
   */
  protected override _renderContent(args: CustomRenderFunctionArg): IGroup {
    const { rect } = args;
    const { bindCompStyleType } = this.widget.props;

    const group = createGroup({
      display: 'flex',
      alignItems: 'center',
      justifyContent: this._justifyContent,
      flexWrap: 'nowrap',
      height: this._rowHeight,
      width: this._rowContentWidth,
    });

    if (!args.dataValue) {
      group.add(this._renderText(args, ''));
      return group;
    }

    const padding = createRect({ width: 8, height: rect?.height });

    if (this._isSelectType(bindCompStyleType)) {
      this._renderSelectTypeEnumItems(args, group, padding, bindCompStyleType);
    } else {
      this._renderNonSelectTypeEnumItems(args, group, padding);
    }

    return group;
  }
}
