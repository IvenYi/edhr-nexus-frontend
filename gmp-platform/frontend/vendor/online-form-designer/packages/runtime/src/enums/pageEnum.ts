export enum PageEnum {
  BASE_LOGIN = '/login',
  BASE_TENANT = '/tenant',
  BASE_HOME = '/home',
  USER_CENTER = '/user-center',
  PROCESS_CENTER = '/process',
  MESSAGE_CENTER = '/message',
  ERROR_PAGE = '/exception',
  ERROR_LOG_PAGE = '/error-log/list',
  USER_CENTER_LOGIN = '/user-center/login-history',
  USER_CENTER_PWD = '/user-center/password',
  NOT_FOUND = '/notFound',
}

/**快速搜索查询导航 */
export enum QuickSearchEnum {
  /**模型实体 */
  MODEL_ENITY = 1,
  /**模型枚举 */
  MODEL_ENUM = 2,
  /**模型视图 */
  MODEL_VIEW = 3,
  /**模型数据 */
  MODEL_DATA = 4,
  /**pc页面设计 */
  WEB_PAGE = 5,
  /**移动页面设计 */
  MOBILE_PAGE = 6,
  /**PAD页面设计 */
  PAD_PAGE = 13,
  /**标签设计 */
  LABLE_PRINT = 7,
  /**单据设计 */
  DOCUMENT_PRINT = 8,
  /**流程设计 */
  PROCESS_DESIGNER = 9,
  /**脚本开发 */
  DEV_SCRIPT = 10,
  /**编排开发 */
  DEV_LOGIC = 11,
  /**方法开发 */
  DEV_METHOD = 12,
}

/**
 * 页面设计模式枚举
 *
 * @author chitanda
 * @date 2025-07-27 18:07:38
 * @export
 * @enum {number}
 */
export enum PageDesignModeEnum {
  /**
   * Mobile PDA 设计模式
   */
  PDA = 'pda',
  /**
   * Pad 设计模式
   * 适用于平板设备
   */
  PAD = 'pad',
  /**
   * Web 设计模式
   */
  WEB = 'web',
}
