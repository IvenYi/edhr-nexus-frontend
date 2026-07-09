export enum AppPublishStateEnum {
  /** 发布成功 */
  SUCCESS = 'SUCCESS',
  /** 发布失败 */
  FAILURE = 'FAILURE',
  /** 准备中 */
  PREPARING = 'PREPARING',
  /** 事件执行中 */
  EVENTING = 'EVENTING',
  /** 流程同步中 */
  PROCESSIING = 'PROCESSIING',
  /** 部署中 */
  DEPLOYING = 'DEPLOYING',
}
