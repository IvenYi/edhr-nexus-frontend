import { IDepartmentComponentExpose } from '../i-department-component/i-department-component.expose';

/**
 * 选择组件
 *
 * @interface ISelectComponentExpose
 * @extends {IDepartmentComponentExpose}
 */
export interface ISelectComponentExpose extends IDepartmentComponentExpose {
  /**
   * 重新加载选项数据
   *
   * @param {IObject} queryData
   * @return {*} {IObject[]}
   */
  reload(queryData?: IObject): IObject[];

  /**
   * 获取选项数据
   *
   * @return {*} {IObject[]}
   */
  getOptions(): IObject[];

  /**
   * 设置选项数据
   *
   * @param {IObject} data 选项数据
   *
   */
  setOptions(data?: IObject): void;
}
