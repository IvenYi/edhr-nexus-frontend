import { IGctComponent } from '@gct/runtime';

/**
 * 输入框组件
 *
 * @interface IInputComponentExpose
 * @extends {IGctComponent}
 */
export interface IInputComponentExpose extends IGctComponent {
  /**
   * 获取焦点
   *
   */
  focus(): void;
}
