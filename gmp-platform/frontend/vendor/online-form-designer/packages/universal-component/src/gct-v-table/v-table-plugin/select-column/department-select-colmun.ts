import { CustomRenderFunctionArg } from '@visactor/vtable/es/ts-types';
import { SelectColumnPlugin } from './select-column';
import { createImage, IGroup, IImage } from '@visactor/vtable/es/vrender';
import { ISelectListItem } from '../../interface';

/**
 * 部门选择类型的列绘制插件
 *
 * @export
 * @class DepartmentSelectColumnPlugin
 * @extends {SelectColumnPlugin}
 */
export class DepartmentSelectColumnPlugin extends SelectColumnPlugin {
  protected _getIconContent(): string {
    return `<svg fill="${this._primaryColor}" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"><path d="M360.512 171.52a64 64 0 0 1 64-64h174.976a64 64 0 0 1 64 64v124.416a64 64 0 0 1-64 64H424.512a64 64 0 0 1-64-64V171.52zM736 608a64 64 0 0 0-64-64h-320a64 64 0 0 0-64 64v32h-64v-32a128 128 0 0 1 128-128h320a128 128 0 0 1 128 128v32h-64v-32z m-614.4 118.848a64 64 0 0 1 64-64h174.912a64 64 0 0 1 64 64v124.48a64 64 0 0 1-64 64H185.6a64 64 0 0 1-64-64v-124.416z m477.888 0a64 64 0 0 1 64-64H838.4a64 64 0 0 1 64 64v124.48a64 64 0 0 1-64 64h-174.912a64 64 0 0 1-64-64v-124.416zM544 385.28V480h-64V385.28h64z"></path></svg>`;
  }

  protected override _renderItemIcon(_args: CustomRenderFunctionArg, _val: string): IImage {
    return createImage({
      image: this._getIconContent(),
      width: 16,
      height: 16,
      boundsPadding: [0, 4, 0, 0],
    });
  }

  protected override _longPressSelectList(element: IGroup, items: ISelectListItem[]): void {
    items.forEach((item) => {
      item.icon = this._getIconContent();
    });
    return super._longPressSelectList(element, items);
  }
}
