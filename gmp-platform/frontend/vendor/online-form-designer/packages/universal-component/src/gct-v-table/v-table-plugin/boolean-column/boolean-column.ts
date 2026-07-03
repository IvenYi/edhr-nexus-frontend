import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { createGroup, IGroup } from '@visactor/vtable/es/vrender';
import { colord } from 'colord';
import { BaseColumnPlugin } from '../base-column/base-column';
import { renderCheckboxList, renderRadioList, renderSwitch } from '../../graphic-render';
import { BindCmpStyleEnum } from '@gct/runtime';

/**
 * 布尔类型的列绘制插件
 *
 * @export
 * @class BooleanColumnPlugin
 * @extends {BaseColumnPlugin}
 */
export class BooleanColumnPlugin extends BaseColumnPlugin {
  protected get _specificConfig(): IObject {
    return this.column._cfg?.specificConfig || { true: '是', false: '否' };
  }

  protected override _renderContent(args: CustomRenderFunctionArg): IGroup {
    const { bindCompStyleType } = this.widget.props;
    const val = args.dataValue == null || args.dataValue === '' ? false : args.dataValue;
    const group = createGroup({
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'nowrap',
      justifyContent: this._justifyContent,
      height: this._rowHeight,
      width: this._rowContentWidth,
    });
    switch (bindCompStyleType) {
      case BindCmpStyleEnum.CMP_SELECT_LIST:
        const text = this._renderTextTipByWidth(args, val, undefined, { ellipsis: false });
        const tag = this._renderTag(args, text, {}, val);
        group.add(tag ? tag : text);
        break;
      case BindCmpStyleEnum.CMP_RADIO:
        group.add(
          renderRadioList([
            { label: this._specificConfig['true'], value: val == true },
            { label: this._specificConfig['false'], value: val == false },
          ]),
        );
        break;
      case BindCmpStyleEnum.CMP_CHECKBOX:
        group.add(
          renderCheckboxList([{ label: this._specificConfig['true'], value: val == true }]),
        );
        break;
      default:
        group.add(
          renderSwitch(args.dataValue, {
            checkColor: colord(this._primaryColor).alpha(0.5).toRgbString(),
          }),
        );
    }
    return group;
  }

  protected override _formatValue(value: any): string {
    return value ? this._specificConfig['true'] : this._specificConfig['false'];
  }
}
