import mitt, { Emitter } from 'mitt';
import {
  IVTableEditingCol,
  IVTableEditingRow,
  IGctVTableEditingColEvent,
  IVTableDataItem,
  IVTableEditColumn,
} from '../../interface';
import { LowCodeWidget } from '@gct/runtime';
import { cloneDeep, debounce } from 'lodash-es';
import { reactive } from 'vue';

/**
 * 表格编辑列
 *
 * @export
 * @class VTableEditingCol
 * @implements {IVTableEditingCol}
 */
export class VTableEditingCol implements IVTableEditingCol {
  readonly evt: Emitter<IGctVTableEditingColEvent> = mitt<IGctVTableEditingColEvent>();

  // 设计界面模型配置，只有在设计界面组件时才可使用
  readonly widget: LowCodeWidget.BasicSchema;
  /**
   * 是否允许覆盖计算出来的值，默认允许
   *
   * @protected
   * @type {boolean}
   */
  protected isOverrideCalcValue: boolean = true;

  get value(): any {
    return this.data[this.col.name];
  }

  set value(val: any) {
    if (!this.isOverrideCalcValue) {
      // 不允许覆盖计算值时，直接返回
      return;
    }
    this._value = val;
  }

  set _value(val: any) {
    // 值没有变化时，不进行任何操作
    if (this.data[this.col.name] == val) {
      return;
    }
    const oldValue = this.data[this.col.name];
    this.data[this.col.name] = val;
    this.evt.emit('change', { newValue: val, oldValue: oldValue });
    this.row.evt.emit('change', { key: this.col.name, newValue: val, oldValue: oldValue });
  }

  get disabled(): boolean {
    return this.widget.props?.disabled || false;
  }

  set disabled(val: boolean) {
    // 值没有变化时，不进行任何操作
    if (this.disabled === val) {
      return;
    }
    this.widget.props.disabled = val;
    this.evt.emit('disabledChange', val);
    this.row.evt.emit('disabledChange', { key: this.col.name, state: val });
  }

  get readonly(): boolean {
    return this.widget.props?.readonly || false;
  }

  set readonly(val: boolean) {
    // 值没有变化时，不进行任何操作
    if (this.readonly === val) {
      return;
    }
    this.widget.props.readonly = val;
    this.evt.emit('readonlyChange', val);
    this.row.evt.emit('readonlyChange', { key: this.col.name, state: val });
  }

  /**
   * Creates an instance of EditingTableCol.
   *
   * @param {IVTableEditingRow} row
   * @param {IVTableDataItem} data
   * @param {IVTableEditColumn} col
   */
  constructor(
    protected row: IVTableEditingRow,
    protected data: IVTableDataItem,
    public col: IVTableEditColumn,
  ) {
    this.widget = reactive(col._item ? cloneDeep(col._item) : {}) as LowCodeWidget.BasicSchema;
  }

  /**
   * 由 row 调用，需要在所有列实例创建完成后，调用此方法进行初始化
   */
  init(): void {
    if (this.widget.props) {
      const { field, componentDependency } = this.widget.props;
      // 根据列数据中的值，初始化字段的禁用状态
      this._initState(field);
      // 初始化组件依赖配置
      this._initComponentDependency(componentDependency, field);
    }
  }

  /**
   * 初始化字段状态
   */
  protected _initState(field: string): void {
    // 列默认禁用状态配置，如果配置中是 disabled 函数，则优先执行函数获取值
    if (this.col.disabled && typeof this.col.disabled === 'function') {
      this.widget.props.disabled = this.col.disabled(this.widget, this.data);
    }
    // 没有 disabled 函数，则优先判断行数据中的禁用状态配置
    else if (this.data._DISABLED?.[field] != null) {
      this.widget.props.disabled = true;
    }
    // 数据中未指定禁用状态，则使用列默认禁用状态配置
    else if (this.col.disabled != null) {
      this.widget.props.disabled = this.col.disabled;
    }
    // 否则默认不禁用
    else {
      this.widget.props.disabled = false;
    }

    // 列默认只读状态配置，如果配置中是 readonly 函数，则优先执行函数获取值
    if (this.col.readonly && typeof this.col.readonly === 'function') {
      this.widget.props.readonly = this.col.readonly(this.widget, this.data);
    }
    // 没有 readonly 函数，则优先判断行数据中的只读状态配置
    else if (this.data._READONLY?.[field] != null) {
      this.widget.props.readonly = true;
    }
    // 数据中未指定只读状态，则使用列默认只读状态配置
    else if (this.col.readonly != null) {
      this.widget.props.readonly = this.col.readonly;
    }
    // 否则默认不只读
    else {
      this.widget.props.readonly = false;
    }
  }

  /**
   * 计算出表达式中，涉及到的列字段
   *
   * @protected
   * @param {string} expression
   * @return {*}  {string[]}
   */
  protected _calcExpressionKeys(expression: string): string[] {
    // 解析出表达式中的变量，全是当前行数据的字段
    const exprVars = window.gct_expression.identify(expression);
    // 截取出所有的字段key
    const keys = exprVars.map((varName) => {
      const parts = varName.split('.');
      return parts[1];
    });
    return keys;
  }

  /**
   *  根据表达式监听值变化，并执行表达式计算
   *
   * @protected
   * @param {string} expression
   * @param {(val: unknown) => void} callback
   */
  protected _listenChangeExecuteExpression(
    expression: string,
    callback: (val: unknown) => void,
  ): void {
    // 截取出所有的字段key
    const keys = this._calcExpressionKeys(expression);
    // 获取或创建该表达式对应的防抖执行器（仅保留尾部触发）
    const debouncedExec = debounce(
      (context: Record<string, unknown>) => {
        // 每当字段值变化时，重新执行表达式计算（只最后一次触发生效）
        window.gct_expression.execute(expression as string, context).then((res) => {
          callback(res);
        });
      },
      300,
      { leading: false, trailing: true },
    );
    // 监听这些字段的值变化
    keys.forEach((key) => {
      this.row.col[key]?.evt.on('change', () => {
        debouncedExec!({
          [this.widget.preLocation!]: this.data,
        });
      });
    });
    // 需要默认触发一次计算，避免状态不正确
    debouncedExec!({
      [this.widget.preLocation!]: this.data,
    });
  }

  /**
   * 初始化列公式计算相关配置
   *
   * @protected
   * @param {*} componentDependency
   * @param {string} field
   * @return {*}  {void}
   */
  protected _initComponentDependency(componentDependency: any, field: string): void {
    if (!componentDependency?.configDependency) {
      return;
    }
    const { assignment, disabled, readonly } = componentDependency.configDependency;
    // 赋值计算
    if (assignment?.expression) {
      // 此配置生效时，值被界面更改时，永远使用计算的结果，不可以被覆盖
      this.isOverrideCalcValue = assignment.strategy !== 'alwaysCover';
      this._listenChangeExecuteExpression(assignment.expression, (val: unknown) => {
        console.info(
          '【表格行编辑】',
          this.col.name,
          '【赋值计算】',
          assignment.expression,
          '结果：',
          val,
        );
        this._value = val;
      });
    }
    // 禁用计算
    if (disabled?.expression) {
      this._listenChangeExecuteExpression(disabled.expression, (val: unknown) => {
        console.info(
          '【表格行编辑】',
          this.col.name,
          '【禁用计算】',
          disabled.expression,
          '结果：',
          val,
        );
        this.disabled = !!val;
      });
    }
    // 只读计算
    if (readonly?.expression) {
      this._listenChangeExecuteExpression(readonly.expression, (val: unknown) => {
        console.info(
          '【表格行编辑】',
          this.col.name,
          '【只读计算】',
          readonly.expression,
          '结果：',
          val,
        );
        this.readonly = !!val;
      });
    }
  }

  dispose(): void {
    this.evt.all.clear();
  }
}
