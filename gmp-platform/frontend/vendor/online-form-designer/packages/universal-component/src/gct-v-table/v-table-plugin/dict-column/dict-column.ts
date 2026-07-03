import { BaseColumnPlugin } from '../base-column/base-column';

/**
 * 纯使用 DICT 进行显示转换字段绘制
 *
 * @export
 * @class DictColumnPlugin
 * @extends {BaseColumnPlugin}
 */
export class DictColumnPlugin extends BaseColumnPlugin {
  protected override _formatValue(val: string): string {
    return this.row._DICT?.[this.column.name]?.[val] ?? val;
  }
}
