import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { createGroup, createRect, IGroup, IRect } from '@visactor/vtable/es/vrender';
import { SelectColumnPlugin } from './select-column';
import { renderCheckboxItem, renderRadioItem } from '../../graphic-render';
import { BindCmpStyleEnum } from '@gct/runtime';

/**
 * 模型选择类型的列绘制插件
 * 支持 CHECKBOX、RADIO 等选择类型的绘制
 *
 * @export
 * @class ModelSelectColumnPlugin
 * @extends {SelectColumnPlugin}
 */
export class ModelSelectColumnPlugin extends SelectColumnPlugin {
  /**
   * 判断是否为选择类型（复选框或单选框）
   *
   * @protected
   * @param {string} bindCompStyleType
   * @returns {boolean}
   */
  protected _isSelectType(bindCompStyleType: string): boolean {
    return (
      bindCompStyleType === BindCmpStyleEnum.CMP_CHECKBOX ||
      bindCompStyleType === BindCmpStyleEnum.CMP_RADIO
    );
  }

  /**
   * 创建模型项容器组
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @returns {IGroup}
   */
  protected _createModelItemGroup(_args: CustomRenderFunctionArg): IGroup {
    return createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
    });
  }

  /**
   * 渲染选择类型的模型项
   * 根据绑定的组件样式类型渲染复选框或单选框
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @param {IGroup} group
   * @param {IRect} padding
   * @param {string} bindCompStyleType
   * @returns {void}
   */
  protected _renderSelectTypeModelItems(
    args: CustomRenderFunctionArg,
    group: IGroup,
    padding: IRect,
    bindCompStyleType: string,
  ): void {
    const vals = args.dataValue?.split(',') ?? [];
    const enumList = this.column.enumList || [];

    // 将模型项转换为字符串数组，复用父类的计算逻辑
    const items: string[] = enumList.map((cfg: IObject) => cfg.__LABEL__ as string);
    const config = this._getSelectItemConfig(args, 0);
    const visibleCount: number = this._calculateVisibleItemCount(args, items, config);
    const hasMore: boolean = enumList.length > visibleCount;

    // 渲染可见的项
    const visibleItems: IObject[] = enumList.slice(0, visibleCount);
    visibleItems.forEach((cfg: IObject, index: number) => {
      if (index > 0) {
        group.add(padding.clone());
      }

      const isChecked = vals.includes(cfg.id_ as string);
      const itemGroup = this._createModelItemGroup(args);

      // 渲染选择控件
      if (bindCompStyleType === BindCmpStyleEnum.CMP_RADIO) {
        itemGroup.add(renderRadioItem({ label: '', value: isChecked }));
      } else if (bindCompStyleType === BindCmpStyleEnum.CMP_CHECKBOX) {
        itemGroup.add(renderCheckboxItem({ label: '', value: isChecked }));
      }

      // 添加小间距
      const smallPadding = createRect({ width: 4, height: args.rect?.height });
      itemGroup.add(smallPadding.clone());

      // 渲染文本
      const text = this._renderTextTipBySize(args, cfg.__LABEL__ as string);
      itemGroup.add(text);

      group.add(itemGroup);
    });

    // 如果有更多项，添加省略号
    if (hasMore) {
      group.add(padding.clone());
      const ellipsis = this._renderText(args, '...');
      group.add(ellipsis);

      // 长按出现全部内容
      this._longPressSelectList(
        group,
        enumList.map((cfg: IObject) => ({
          ...cfg,
          label: cfg.__LABEL__ as string,
        })),
      );
    }
  }

  /**
   * 绘制单元格实际内容
   * 根据 bindCompStyleType 选择对应的渲染模式
   *
   * @protected
   * @param {CustomRenderFunctionArg} args
   * @returns {IGroup}
   */
  protected override _renderContent(args: CustomRenderFunctionArg): IGroup {
    const { rect } = args;
    const { bindCompStyleType } = this.widget.props;

    if (!this._isSelectType(bindCompStyleType)) {
      return super._renderContent(args);
    }

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

    this._renderSelectTypeModelItems(args, group, padding, bindCompStyleType);
    return group;
  }
}
