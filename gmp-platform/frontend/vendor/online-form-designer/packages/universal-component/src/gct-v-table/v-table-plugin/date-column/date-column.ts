import dayjs from 'dayjs';
import { BaseColumnPlugin } from '../base-column/base-column';
import { FIELD_TYPE } from '@gct/runtime';

/**
 * 日期类型的列绘制插件（当前为抽象类具体的字段类型继承此类）
 *
 * @export
 * @class DateColumnPlugin
 * @extends {BaseColumnPlugin}
 */
export class DateColumnPlugin extends BaseColumnPlugin {
  protected override _formatValue(value: any): string {
    if (value == null || value === '') {
      return value;
    }
    const { format } = this.widget.props;
    if (format) {
      if (this.widget.props.fieldType === FIELD_TYPE.TIME || this.widget.props.format === 'HH:mm:ss') {
        value = dayjs(`1994-03-30 ${value}`).format(format);
      } else {
        value = dayjs(value).format(format);
      }
    }
    return value;
  }
}
