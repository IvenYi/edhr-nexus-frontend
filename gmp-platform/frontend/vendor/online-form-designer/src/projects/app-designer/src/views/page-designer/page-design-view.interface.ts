import { PageTypeEnum } from '/@/layouts/tree-sider-page-new/enum';

/**
 * 设计界面路由参数
 *
 * @author chitanda
 * @date 2025-08-25 16:08:10
 * @export
 * @interface PageDesignViewRouteParams
 */
export interface PageDesignViewRouteParams {
  /**
   * 页面ID
   *
   * @author chitanda
   * @date 2025-08-25 16:08:17
   * @type {string}
   */
  id: string;
  /**
   * 页面模式(移动端/网页端)
   *
   * @author chitanda
   * @date 2025-08-25 16:08:24
   * @type {PageTypeEnum}
   */
  mode: PageTypeEnum;
  /**
   * 指定归属分类
   *
   * @author chitanda
   * @date 2025-08-25 16:08:35
   * @type {string}
   */
  category?: string;
}
