/**
 * 递给设计界面的回调
 *
 * @author chitanda
 * @date 2025-07-09 17:07:12
 * @interface Callback
 */
interface Callback {
  /**
   * 设计界面关闭
   *
   * @author chitanda
   * @date 2025-07-09 17:07:39
   */
  close(): void;
  /**
   * 打开预览界面
   *
   * @author chitanda
   * @date 2025-07-09 17:07:53
   */
  openPreview(): void;
  /**
   * 替换当前URL的ID参数
   *
   * @author chitanda
   * @date 2025-09-22 09:09:22
   */
  replaceUrl(replaceId: string, id: string): void;
  /**
   * 显示成功消息
   *
   * @author chitanda
   * @date 2025-09-22 09:09:22
   */
  success(msg: string): void;
}

/**
 * 设计界面无界传递参数接口
 *
 * @author chitanda
 * @date 2025-07-09 17:07:12
 * @export
 * @interface IPageDesignWuJieProps
 */
export interface IPageDesignWuJieProps {
  /**
   * 设计界面参数
   *
   * @author chitanda
   * @date 2025-07-09 17:07:25
   * @type {IParams}
   */
  params: IParams;

  /**
   * 设计界面回调
   *
   * @author chitanda
   * @date 2025-07-09 17:07:41
   * @type {Callback}
   */
  fn: Callback;
}

/**
 * 设计界面 iframe 传递参数接口
 *
 * @author chitanda
 * @date 2025-09-22 09:09:22
 * @export
 * @interface IPageDesignIFrameProps
 */
export interface IPageDesignIFrameProps {
  /**
   * 设计界面参数
   *
   * @author chitanda
   * @date 2025-09-22 09:09:22
   * @type {IParams}
   */
  params: IParams;

  /**
   * 设计界面回调
   *
   * @author chitanda
   * @date 2025-09-22 09:09:22
   * @type {Callback}
   */
  fn: Callback;
}
