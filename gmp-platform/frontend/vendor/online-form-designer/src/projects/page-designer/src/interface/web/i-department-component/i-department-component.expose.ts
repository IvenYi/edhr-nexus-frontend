import { ICheckboxComponentExpose } from "../i-checkbox-component/i-checkbox-component.expose";

/**
 * 部门选择组件
 *
 * @interface IDepartmentComponentExpose
 * @extends {ICheckboxComponentExpose}
 */
export interface IDepartmentComponentExpose extends ICheckboxComponentExpose {
  /**
   * 报错
   *
   */
  setError(): void;
}
