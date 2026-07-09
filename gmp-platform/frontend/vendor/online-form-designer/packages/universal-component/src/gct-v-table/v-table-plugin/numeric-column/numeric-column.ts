import { BindCmpStyleEnum, FIELD_TYPE } from '@gct/runtime';
import { BaseColumnPlugin } from '../base-column/base-column';

interface TimeObj {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

/**
 * 数值类型的列绘制插件（当前为抽象类具体的字段类型继承此类）
 *
 * @export
 * @class NumericColumnPlugin
 * @extends {BaseColumnPlugin}
 */
export class NumericColumnPlugin extends BaseColumnPlugin {
  formatter = new Intl.NumberFormat('zh-CN');

  private _calcTime(start: 'd' | 'h' | 'm', value: number): TimeObj {
    const obj: TimeObj = { days: 0, hours: 0, minutes: 0, seconds: 0 };

    const timeUnits = [
      { unit: 'days', seconds: 86400 },
      { unit: 'hours', seconds: 3600 },
      { unit: 'minutes', seconds: 60 },
      { unit: 'seconds', seconds: 1 },
    ] as const;

    const startIndex = start === 'd' ? 0 : start === 'h' ? 1 : 2;
    let remaining = value;

    for (let i = startIndex; i < timeUnits.length; i++) {
      const { unit, seconds } = timeUnits[i];
      obj[unit] = Math.floor(remaining / seconds);
      remaining %= seconds;
    }

    return obj;
  }

  /**
   * 使用字符串方式格式化小数位数，避免浮点数精度问题
   * 小数位数不足时使用 0 补足
   */
  private _formatPrecision(value: string, precision: number): string {
    const [intPart, decPart = ''] = value.split('.');
    const paddedDecPart = decPart.padEnd(precision, '0').slice(0, precision);
    return precision > 0 ? `${intPart}.${paddedDecPart}` : intPart;
  }

  /**
   * 时间值格式化，保证为两位数（0 显示为 00）
   */
  private _formatTimeValue(value: number): string {
    return String(value).padStart(2, '0');
  }

  protected override _formatValue(value: any): string {
    if (value == null || value === '') {
      return value;
    }
    if (this.widget.props.bindCompStyleType === BindCmpStyleEnum.CMP_TIME) {
      const { days, hours, minutes, seconds } = this._calcTime(
        this.widget.props.displayTimeType.substring(0, 1),
        value,
      );
      switch (this.widget.props.displayTimeType) {
        case 'd':
          return `${days} 天`;
        case 'd:h':
          return `${days} 天 ${this._formatTimeValue(hours)} 时`;
        case 'd:h:m':
          return `${days} 天 ${this._formatTimeValue(hours)} 时 ${this._formatTimeValue(
            minutes,
          )} 分`;
        case 'd:h:m:s':
          return `${days} 天 ${this._formatTimeValue(hours)} 时 ${this._formatTimeValue(
            minutes,
          )} 分 ${this._formatTimeValue(seconds)} 秒`;
        case 'h':
          return `${this._formatTimeValue(hours)} 时`;
        case 'h:m':
          return `${this._formatTimeValue(hours)} 时 ${this._formatTimeValue(minutes)} 分`;
        case 'h:m:s':
          return `${this._formatTimeValue(hours)} 时 ${this._formatTimeValue(
            minutes,
          )} 分 ${this._formatTimeValue(seconds)} 秒`;
        case 'm':
          return `${this._formatTimeValue(minutes)} 分`;
      }
    }
    // 根据 this.widget.props.precision 设置小数位数（使用字符串处理避免精度丢失）
    if (this.widget.props.precision) {
      const precision = Number(this.widget.props.precision);
      value = this._formatPrecision(String(value), precision);
    }
    // 如果配置了千分位显示模式处理
    if (value && this.widget.props.separator) {
      value = this.formatter.format(value);
    }
    // 显示币种
    if (this.widget.props.bindCompStyleType === 'CURRENCY') {
      value = `${this.widget.props.currency || '¥'} ${value}`;
    }
    return value;
  }
}
