import { IGctComponent, ResetRuleType } from '@gct/runtime';

/**
 * 表单组件
 *
 * @interface IMobFormComponentExpose
 * @extends {IGctComponent}
 */
export interface IMobFormComponentExpose extends IGctComponent {
  /**
   * 删除当前表单数据
   *
   * @return {*}  {Promise<void>}
   */
  deleteData(): Promise<void>;
  /**
   * 设置值
   *
   * @param {IObject} data 数据
   * @param {IObject} [dict] 字典数据
   */
  addValue(data: IObject, dict?: IObject): void;
  /**
   * 表单值效验
   *
   * @param {string[]} [names] 需要效验的字段
   * @return {*}  {(Promise<void | Error>)}
   */
  validate(names?: string[]): Promise<void | Error>
  /**
   * 重置表单
   *
   * @param {ResetRuleType} type
   * @return {*}  {Promise<void>}
   */
  reset(type: ResetRuleType): Promise<void>;
}
