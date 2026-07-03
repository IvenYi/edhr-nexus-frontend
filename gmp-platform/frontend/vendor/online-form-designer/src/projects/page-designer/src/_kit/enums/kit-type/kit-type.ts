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
   * 包装查询
   */
  PACKAGE_SEARCH = 'package-search',
  /**
   * 包装条码
   */
  PACKAGE_BARCODE = 'package-barcode',
  /**
   * 执行按钮
   */
  EXCUTE_BUTTON = 'excute-button',
  /**
   * pad业务按钮
   */
  BUSINESS_BUTTON = 'business-button',
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
   * 批次合并
   */
  CONTAINER_COMBINE = 'container-combine',
  /**
   * 治具选择【勿删】
   */
  FIXTURE_SELECT = 'fixture-select',
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
   * 签名确认
   */
  SIGNATURE_CONFIRM = 'signature-confirm',
  /**
   * 人员签名确认
   */
  STAFF_SIGNATURE_CONFIRM = 'staff-signature-confirm',
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
  /**
   * EDHR-SE
   */
  EDHR_SE = 'edhr-se',
  /**
   * 空状态
   */
  EMPTY = 'empty',

  /**
   * eDHR:工单管理
   */
  ORDER_MANAGE = 'order-manage',
  /**
   * eDHR:任务管理
   */
  TASK_MANAGE = 'task-manage',
  /**
   * eDHR:查询分页
   */
  SEARCH_TAB = 'search-tab',
  /**
   * eDHR:业务表格
   */
  BUSINESS_TABLE = 'business-table',
  /**
   * eDHR: 生产执行（开工、完工）
   */
  TXN_WITH_WORK = 'txn-with-work',
  /**
   * eDHR: 静态图片组件
   */
  ASSET_GEN_IMAGE = 'asset-gen-image',

  /**
   * eDHR:SOP
   */
  ESOP_KIT = 'esop-kit',
  /**
   * 工序列表
   */
  OPERATION_LIST = 'operation-list',
  /**
   * 工序配置
   */
  OPERATION_CONFIG = 'operation-config',
  /**
   * 生产拆分列表
   */
  TXN_SPLIT_TABLE = 'txn-split-table',
  /**
   * 选择切换器： eDHR > 工序选择切换
   */
  SELECT_SWITCHER = 'select-switcher',
  /** 事务执行按钮列表组 */
  TXN_BUTTONS_GROUP = 'txn-buttons-group',
  /** 模型配置字段展示 */
  MODEL_EXT_FIELD_CONTAINER = 'model-ext-field-container',
  /**
   * eDHR: 模板审核(旧的document-control-config)
   */
  TEMP_AUDIT_PROCESS = 'temp-audit-process',
  /** eDHR: affix输入框（事务编码） */
  AFFIX_INPUT = 'affix-input',
  CUSTOM_SELECT = 'custom-select',
  /**
   * 业务流程
   */
  BUSINESS_PROCESS = 'business-process',
  /**
   * 业务流
   */
  BIZ_PROCESS = 'biz-process',
  /**
   * 业务开关
   */
  BIZ_SWITCH = 'biz-switch',
  /**
   * 自定义下拉框
   */
  CUS_SELECT = 'cus-select',
  /**
   * 控制图查看按钮
   */
  VIEW_CHART_BUTTON = 'view-chart-button',
  /**
   * 工作流查看
   */
  WORKFLOW_VIEW = 'workflow-view',
  /**
   * 树
   */
  TREE = 'tree',
  /**
   * 动态表格
   */
  DYNAMIC_DATA_TABLE = 'dynamic-data-table',
  /**
   * 向其他组件提供业务方法的功能组件
   */
  FUNCTIONAL_UNIT = 'functional-unit',
  /**
   * 事务流程路径
   */
  TXN_FLOW_PATH = 'txn-flow-path',
  /**
   * 事务流程路径
   */
  CATEGORY_TREE = 'category-tree',
  /**
   * excel上传解析组件
   */
  EXCEL_UPLOAD = 'excel-upload',
  /**
   * 条码扫描
   */
  QRCODE_READER = 'qrcode-reader',
  /**
   * 下拉按钮
   */
  DROPDOWN_BUTTON = 'dropdown-button',
  /**
   * 条码解析规则
   */
  LABEL_PARSING_RULES = 'label-parsing-rules',
  /**
   * 标签选择表
   */
  LABEL_SELECT_TABLE = 'label-select-table',
  /**
   * 物料平衡表
   */
  MATERIAL_BALANCE_TABLE = 'material-balance-table',
}
