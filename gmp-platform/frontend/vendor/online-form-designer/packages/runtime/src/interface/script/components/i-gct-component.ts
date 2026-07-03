/**
 * 界面组件
 *
 * @private
 * @interface IGctComponent
 */
export interface IGctComponent {
  /**
   * 组件唯一标识
   *
   * @type {string}
   */
  key?: string;
  /**
   * 当前组件所对应的模型标识
   *
   * @type {string}
   */
  modelKey?: string;
  /**
   * 获取当前组件的值
   *
   * @return {*}  {({ id?: string; [key: string]: string | any[] | undefined })}
   */
  getValue?(...args: any[]): { id?: string; [key: string]: string | any[] | undefined };
  /**
   * 设置当前组件的值
   *
   * @param {...any[]} args
   */
  setValue?(...args: any[]): void;
  /**
   * 提交当前组件的值
   *
   * @param {...any[]} args
   */
  submit?(...args: any[]): void;
  /**
   * 重新加载当前组件值
   *
   * @param {...any[]} args
   */
  reload?(...args: any[]): void;
}
