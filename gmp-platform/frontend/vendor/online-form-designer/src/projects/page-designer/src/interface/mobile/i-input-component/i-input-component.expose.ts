import { IGctComponent } from '@gct/runtime';

/**
 * 输入框组件
 *
 * @interface IMobInputComponentExpose
 * @extends {IGctComponent}
 */
export interface IMobInputComponentExpose extends IGctComponent {
  /**
   * 获取焦点
   *
   */
  focus(): void;
}
