/**
 * 套件插件类型
 *
 * @author zhanghanrui
 * @date 2024-05-25 08:05:01
 * @export
 * @enum {number}
 */
export enum KitType {
  /**
   * 测试按钮
   */
  TEST_BUTTON = 'test-button',

  /**
   * 工步选择
   */
  WORKFLOW_STEP_SELECT = 'workflow-step-select',

  /**
   * 事务数据采集
   */
  TXN_DATA_COLLECTION = 'txn-data-collection',
  /**
   * 批次查询
   */
  CONTAINER_SEARCH = 'container-search',
  /**
   * 执行按钮
   */
  EXCUTE_BUTTON = 'excute-button',
  /**
   * rdo表格
   */
  RDO_TABLE = 'rdo-table',
  /**
   * rdo表格
   */
  RDO_FORM = 'rdo-form',
  /**
   * 生产参数卡
   */
  PROCESS_PARAMETER_CARD = 'process-parameter-card',
  /**
   * 业务按钮
   */
  BUTTON_GROUP = 'button-group',
  /**
   * 文档集
   */
  FILE_COLLECT = 'file-collect',
  /**
   * 批次选择穿梭
   */
  CONTAINER_SELECT = 'container-select',
  /**
   * 批次关联
   */
  CONTAINER_ASSOCIATE = 'container-associate',
  /**
   * SOP
   */
  SOP_KIT = 'sop-kit',
  /**
   * 设备选择
   */
  DEVICE_SELECT = 'device-select',
  /**
   * 签名确认
   */
  SIGNATURECONFIRM = 'signature-confirm',
  /**
   * 表格选择按钮
   */
  TABLE_SELECT_BUTTON = 'table-select-button',
  /**
   * 治具选择
   */
  FIXSURE_SELECT = 'fixsure-select',
  /**
   * EDHR查看
   */
  EDHR_VIEW = 'edhr-view',
}
