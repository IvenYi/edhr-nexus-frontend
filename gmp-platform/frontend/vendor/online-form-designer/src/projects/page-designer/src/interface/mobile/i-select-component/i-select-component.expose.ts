import { IMobDepartmentComponentExpose } from '../i-department-component/i-department-component.expose';

/**
 * 选择组件
 *
 * @interface IMobSelectComponentExpose
 * @extends {IMobDepartmentComponentExpose}
 */
export interface IMobSelectComponentExpose extends IMobDepartmentComponentExpose {
  /**
   * 重新加载选项数据
   *
   * @param {IObject} queryData
   * @return {*} {IObject[]}
   */
  reload(queryData?: IObject): IObject[];


  /**
   * 设置选项数据
   *
   * @param {IObject} data 选项数据
   *
   */
  setOptions(data?: IObject): void;
}
