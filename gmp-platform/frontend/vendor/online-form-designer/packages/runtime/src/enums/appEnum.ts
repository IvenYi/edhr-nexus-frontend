export const SIDE_BAR_MINI_WIDTH = 48;
export const SIDE_BAR_SHOW_TIT_MINI_WIDTH = 80;

export enum ContentEnum {
  // auto width
  FULL = 'full',
  // fixed width
  FIXED = 'fixed',
}

// menu theme enum
export enum ThemeEnum {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum SettingButtonPositionEnum {
  AUTO = 'auto',
  HEADER = 'header',
  FIXED = 'fixed',
}

export enum SessionTimeoutProcessingEnum {
  ROUTE_JUMP,
  PAGE_COVERAGE,
}

/**
 * 权限模式
 */
export enum PermissionModeEnum {
  // role
  // 角色权限
  ROLE = 'ROLE',
  // black
  // 后端
  BACK = 'BACK',
  // route mapping
  // 路由映射
  ROUTE_MAPPING = 'ROUTE_MAPPING',
  // 平台角色、平台默认该权限模式
  PLATFORM_ROLE = 'PLATFORM_ROLE',
}

// Route switching animation
// 路由切换动画
export enum RouterTransitionEnum {
  ZOOM_FADE = 'zoom-fade',
  ZOOM_OUT = 'zoom-out',
  FADE_SIDE = 'fade-slide',
  FADE = 'fade',
  FADE_BOTTOM = 'fade-bottom',
  FADE_SCALE = 'fade-scale',
}

export enum ProjectName {
  /** 门户 */
  PORTAL = 'portal',
  /** 后台管理 */
  BACKEND_MANAGEMENT = 'backend-management',
  /** 开发者中心 */
  DEVELOPER_CENTER = 'developer-center',
  /** 租户管理后题啊 */
  TENANT_CENTER = 'tenant-center',
  /** 应用设计器 */
  APP_DESIGNER = 'app-designer',
  /** 页面设计器 */
  PAGE_DESIGNER = 'page-designer',
  /** web端渲染 */
  WEB_RENDER = 'web-render',
  /** 移动端渲染 */
  MOBILE_RENDER = 'mobile-render',
}
export enum FIELD_TYPE_CATEGORY {
  'ALL' = 'field_type_all',
  'BASIC' = 'field_type_basic',
  'LOGIC' = 'field_type_logic',
  /** 追溯 */
  'TRACE' = 'field_type_trace',
  /** 业务 */
  'BUSINESS' = 'field_type_business',
  /** 物料 */
  'MATERIAL' = 'field_type_material',
  /** 生产 */
  'PRODUCE' = 'field_type_produce',
  /** 物料平衡 */
  'BALANCE' = 'field_type_material_balance',
}
// 系统预置字段 key
export enum SYSTEM_FIELD_KEY {
  // 创建人
  CREATE_BY = 'create_user_id_',
  // 创建时间
  CREATE_AT = 'create_time_',
  // 创建部门
  CREATE_DEPT = 'create_org_id_',
  // 修改人
  UPDATE_BY = 'modify_user_id_',
  // 修改时间
  UPDATE_AT = 'modify_time_',
  // 修改部门
  UPDATE_DEPT = 'modify_org_id_',
}
export enum FIELD_TYPE {
  /**
   * 主键
   */
  PRIMARY_KEY = 'primary_key',
  /**
   * 子表关联主键
   */
  ASSOCIATED_PRIMARY_KEY = 'associated_primary_key',
  /**
   * 文本
   */
  TEXT = 'text',
  /**
   * 长文本
   */
  LONG_TEXT = 'long_text',
  /**
   * 整数
   */
  INTEGER = 'integer',
  /**
   * 长整数
   */
  LONG = 'long',
  /**
   * 小数
   */
  DOUBLE = 'double',
  /**
   * 精度小数
   */
  DECIMAL = 'decimal',
  /**
   * 布尔
   */
  BOOLEAN = 'boolean',
  /**
   * 二进制流
   */
  // BINARY = 'binary',
  /**
   * 日期
   */
  DATE = 'date',
  /**
   * 时间
   */
  TIME = 'time',
  /**
   * 日期时间
   */
  DATE_TIME = 'date_time',
  /**
   * 图片
   */
  IMAGE = 'image',
  /**
   * 附件
   */
  ATTACHMENT = 'attachment',
  /**
   * 序列号
   */
  SERIAL = 'serial_number',
  /**
   * 主从关联
   */
  MASTERSLAVE = 'master_slave',
  /**
   * 人员关联
   */
  USER = 'user',
  /**
   * 人员多选
   */
  USER_MULTI = 'user_multi',
  /**
   * 部门关联
   */
  ORG = 'org',
  /**
   * 部门多选
   */
  ORG_MULTI = 'org_multi',
  /**
   * 枚举关联
   */
  ENUM = 'enum',
  /**
   * 枚举多选
   */
  ENUM_MULTI = 'enum_multi',

  /**
   * 枚举单选
   * @deprecated
   */
  OPTION = 'option',
  /**
   * 枚举多选
   * @deprecated
   */
  OPTION_MULTI = 'option_multi',

  /**
   * 模型关联
   */
  REF = 'ref',
  /**
   * 模型多选
   */
  REF_MULTI = 'ref_multi',
  /**
   * rdo模型关联
   */
  RDO_REF = 'rdo_ref',
  /**
   * 公式
   */
  EXPRESSION = 'expression',
  /**
   * 公式条件
   */
  EXPRESSION_CONDITION = 'expression_condition',
  /**
   * 公式显示字段
   */
  FUNCTION = 'function',
  /**
   * 汇总
   */
  AGG = 'agg',
  /**
   * E-SOP
   */
  ESOP = 'esop',
  /**
   * 动态表单关联
   */
  // DF_MASTERSLAVE = 'df_master_slave',
  /**
   * 事务
   */
  TRANSACTION = 'transaction',
  /**
   * 标签设计
   */
  LABEL_TEMPLATE = 'label_template',
  /**
   * 标签模版
   */
  LABEL_TEMPLATE_REF = 'label_template_ref',
  /**
   * 单据模版
   */
  DOCUMENT_TEMPLATE = 'document_template',
  /**
   * 序列号规则
   */
  SERIALRULE = 'serial_number_rule',
  /**
   * 打印机
   */
  PRINTER = 'printer',
  /**
   * 消息模板
   */
  MESSAGE_TMPL = 'message_tmpl',
  /**
   * 范围人员
   */
  RANGE_USER = 'range_user',
  /**
   * 签名
   */
  SIGNATURE = 'electronic_signature',
  /**
   * 表单模板、在线表单模板
   */
  ONLINE_FORM_TEMPLATE = 'online_form_tmpl',
  /**
   * eDHR模板
   */
  E_DHR_TEMPLATE = 'edhr_tmpl',
  /**
   * 在线表单
   */
  // ONLINE_FORM = 'online_form',
  /**
   * 前端公式字段
   */
  DATA_TABLE_FORMULA = 'data_table_formula',
  /**
   * 只读字段
   */
  READONLYCMP = 'readonlycmp',
  /**
   * lot/sn
   */
  MATERIAL_NO = 'material_no',
  /**
   * 关联批次
   */
  RELATED_LOT_NO = 'related_lot_no',
  /**
   * 产品
   */
  PRODUCT = 'product',
  /**
   * 设备
   */
  DEVICE = 'device',
  /**
   * 业务流
   */
  Biz_Process = 'biz_process',
  /**
   * 审批流
   */
  Approval_Process = 'approval_process',
  /**
   * 工单号
   */
  MFG_ORDER = 'mfg_order',
  /**
   * 记录单号
   */
  RECORD_NO = 'record_no',
  /**
   * 追溯日期
   */
  TRACE_DATE = 'trace_date',
  /**
   * 订单号
   */
  ORDER_NO = 'order_no',
  /**
   * 在线表单
   */
  // ONLINE_FORM = 'online_form',

  /**
   * 工序
   */
  ROUTING_OPERATION = 'routing_operation',
  /**
   * 良品数量
   */
  GOOD_QTY = 'good_qty',
  /**
   * 不良品数量
   */
  NOT_GOOD_QTY = 'not_good_qty',
  /**
   * 报工开始时间
   */
  REPORT_START_TIME = 'report_start_time',
  /**
   * 报工结束时间
   */
  REPORT_END_TIME = 'report_end_time',
  /**
   * 工时
   */
  WORK_HOURS = 'work_hours',
  /**
   * 生产日期
   */
  PRODUCTION_DATE = 'production_date',
  /**
   * 报工人
   */
  REPORTER = 'reporter',
  /**
   * 不良原因
   */
  NOT_GOOD_REASON = 'not_good_reason',
  /**
   * 不良分类
   */
  NOT_GOOD_GROUP = 'not_good_group',
  /**
   * 报废原因
   */
  SCRAP_REASON = 'scrap_reason',
  /**
   * 报废分类
   */
  SCRAP_GROUP = 'scrap_group',
  /**
   * 报废数量
   */
  SCRAP_QTY = 'scrap_qty',
  /**
   * 报废物料
   */
  SCRAP_MATERIAL = 'scrap_material',
  /**
   * 报废物料批次
   */
  SCRAP_MATERIAL_NO = 'scrap_material_no',
  /**
   * 破坏性试验数量
   */
  DESTRUCTIVE_TEST_QTY = 'destructive_test_qty',
  /**
   * 产品检验数量
   */
  PRODUCT_CHECK_QTY = 'product_check_qty',
  /**
   * 材料检验数量
   */
  MATERIAL_CHECK_QTY = 'material_check_qty',
  /**
   * 设备关联（MedPro）
   */
  DEVICE_REF = 'device_ref',
  /**
   * 设备多选（MedPro）
   */
  DEVICE_REF_MULTI = 'device_ref_multi',
  /**
   * 产品家族
   */
  PRODUCT_FAMILY = 'product_family',
  /**
   * 单据编号
   */
  WAREHOUSE_RECEIPT_NO = 'warehouse_receipt_no',
  /**
   * 单据日期
   */
  WAREHOUSE_RECEIPT_DATE = 'warehouse_receipt_date',
  /**
   * 仓管员
   */
  WAREHOUSE_MANAGER = 'warehouse_manager',
  /**
   * 出入库明细
   */
  WAREHOUSE_IN_OUT = 'warehouse_in_out',
  /**
   * 仓库
   */
  WAREHOUSE = 'warehouse',
  /**
   * 库位
   */
  STORAGE_LOCATION = 'storage_location',
  /**
   * 需求数量
   */
  QTY_REQUIRED = 'qty_required',
  /**
   * 消耗数量
   */
  QTY_CONSUMED = 'qty_consumed',
  /**
   * 数量
   */
  QTY = 'qty',
}
export enum FIELD_TYPE_BASIC {
  /**
   * 短文本
   */
  TEXT = 'text',
  /**
   * 长文本
   */
  LONG_TEXT = 'long_text',
  /**
   * 整数
   */
  INTEGER = 'integer',
  /**
   * 长整数
   */
  LONG = 'long',
  /**
   * 小数
   */
  DOUBLE = 'double',
  /**
   * 精度小数
   */
  DECIMAL = 'decimal',

  /**
   * 布尔
   */
  BOOLEAN = 'boolean',
  /**
   * 日期
   */
  DATE = 'date',
  /**
   * 时间
   */
  TIME = 'time',
  /**
   * 日期时间
   */
  DATE_TIME = 'date_time',
}
export enum FIELD_TYPE_LOGIC {
  /**
   * 图片
   */
  IMAGE = 'image',
  /**
   * 附件
   */
  ATTACHMENT = 'attachment',
  /**
   * 序列号
   */
  SERIAL = 'serial_number',
  /**
   * 主从关联
   */
  MASTERSLAVE = 'master_slave',
  /**
   * 人员
   */
  USER = 'user',
  /**
   * 人员
   */
  USER_MULTI = 'user_multi',
  /**
   * 部门
   */
  ORG = 'org',
  /**
   * 部门
   */
  ORG_MULTI = 'org_multi',
  /**
   * 枚举关联
   */
  ENUM = 'enum',
  /**
   * 枚举多选
   */
  ENUM_MULTI = 'enum_multi',

  /**
   * 枚举单选
   */
  OPTION = 'option',
  /**
   * 枚举多选
   */
  OPTION_MULTI = 'option_multi',

  /**
   * 模型关联
   */
  REF = 'ref',
  /**
   * 模型多选
   */
  REF_MULTI = 'ref_multi',
  /**
   * rdo模型关联、版本模型关联
   */
  RDO_REF = 'rdo_ref',
  /**
   * 公式
   */
  EXPRESSION = 'expression',
  /**
   * 条件公式
   */
  EXPRESSION_CONDITION = 'expression_condition',
  /**
   * 汇总
   */
  AGG = 'agg',
  /**
   * E-SOP
   */
  ESOP = 'esop',
  /**
   * 动态表单关联
   */
  // DF_MASTERSLAVE = 'df_master_slave',
  /**
   * 事务、事务字段
   */
  TRANSACTION = 'transaction',
  /**
   * 标签设计
   */
  LABEL_TEMPLATE = 'label_template',
  /**
   * 标签模版
   */
  LABEL_TEMPLATE_REF = 'label_template_ref',
  /**
   * 单据模版
   */
  DOCUMENT_TEMPLATE = 'document_template',
  /**
   * 序列号规则
   */
  SERIALRULE = 'serial_number_rule',
  /**
   * 打印机
   */
  PRINTER = 'printer',
  /**
   * 消息模板
   */
  MESSAGE_TMPL = 'message_tmpl',
  /**
   * 范围人员
   */
  RANGE_USER = 'range_user',
  /**
   * 签名
   */
  SIGNATURE = 'electronic_signature',
  /**
   * 表单模板
   */
  ONLINE_FORM_TEMPLATE = 'online_form_tmpl',
  /**
   * eDHR模板
   */
  E_DHR_TEMPLATE = 'edhr_tmpl',
  /**
   * 在线表单
   */
  // ONLINE_FORM = 'online_form',
  /**
   * 业务流
   */
  Biz_Process = 'biz_process',
}

export enum FIELD_TYPE_TRACE {
  MATERIAL_NO = 'material_no',
  RELATED_LOT_NO = 'related_lot_no',
  PRODUCT = 'product',
  DEVICE = 'device',
  MFG_ORDER = 'mfg_order',
  RECORD_NO = 'record_no',
  TRACE_DATE = 'trace_date',
  ORDER_NO = 'order_no',
}

export enum FIELD_TYPE_BUSINESS {
  ROUTING_OPERATION = 'routing_operation',
  GOOD_QTY = 'good_qty',
  NOT_GOOD_QTY = 'not_good_qty',
  REPORT_START_TIME = 'report_start_time',
  REPORT_END_TIME = 'report_end_time',
  WORK_HOURS = 'work_hours',
  PRODUCTION_DATE = 'production_date',
  REPORTER = 'reporter',
  NOT_GOOD_REASON = 'not_good_reason',
  NOT_GOOD_GROUP = 'not_good_group',
  SCRAP_REASON = 'scrap_reason',
  SCRAP_GROUP = 'scrap_group',
  SCRAP_QTY = 'scrap_qty',
  SCRAP_MATERIAL = 'scrap_material',
  SCRAP_MATERIAL_NO = 'scrap_material_no',
  DESTRUCTIVE_TEST_QTY = 'destructive_test_qty',
  PRODUCT_CHECK_QTY = 'product_check_qty',
  MATERIAL_CHECK_QTY = 'material_check_qty',
}

export enum FIELD_TYPE_PRODUCE {
  DEVICE_REF = 'device_ref',
  DEVICE_REF_MULTI = 'device_ref_multi',
}

export enum FIELD_TYPE_MATERIAL {
  /**
   * 单据编号
   */
  WAREHOUSE_RECEIPT_NO = 'warehouse_receipt_no',
  /**
   * 单据日期
   */
  WAREHOUSE_RECEIPT_DATE = 'warehouse_receipt_date',
  /**
   * 仓管员
   */
  WAREHOUSE_MANAGER = 'warehouse_manager',
  /**
   * 出入库明细
   */
  WAREHOUSE_IN_OUT = 'warehouse_in_out',
}

export const FieldTypeToJs: Record<FIELD_TYPE, string> = {
  [FIELD_TYPE.ATTACHMENT]: 'string',
  [FIELD_TYPE.BOOLEAN]: 'boolean',
  [FIELD_TYPE.DATE]: 'string',
  [FIELD_TYPE.DATE_TIME]: 'string',
  [FIELD_TYPE.DECIMAL]: 'number',
  [FIELD_TYPE.DOUBLE]: 'number',
  [FIELD_TYPE.ENUM]: 'string',
  [FIELD_TYPE.ENUM_MULTI]: 'string',
  [FIELD_TYPE.IMAGE]: 'string',
  [FIELD_TYPE.INTEGER]: 'number',
  [FIELD_TYPE.LONG]: 'number',
  [FIELD_TYPE.LONG_TEXT]: 'string',
  [FIELD_TYPE.MASTERSLAVE]: 'string',
  [FIELD_TYPE.ORG]: 'string',
  [FIELD_TYPE.ORG_MULTI]: 'string',
  [FIELD_TYPE.RDO_REF]: 'string',
  [FIELD_TYPE.REF]: 'string',
  [FIELD_TYPE.REF_MULTI]: 'string',
  [FIELD_TYPE.SERIAL]: 'string',
  [FIELD_TYPE.TEXT]: 'string',
  [FIELD_TYPE.TIME]: 'string',
  [FIELD_TYPE.USER]: 'string',
  [FIELD_TYPE.USER_MULTI]: 'string',
  [FIELD_TYPE.EXPRESSION]: 'string',
  [FIELD_TYPE.EXPRESSION_CONDITION]: 'string',
  [FIELD_TYPE.AGG]: 'number',
  [FIELD_TYPE.ESOP]: 'string',
  [FIELD_TYPE.SERIALRULE]: 'string',
  [FIELD_TYPE.LABEL_TEMPLATE]: 'string',
  [FIELD_TYPE.LABEL_TEMPLATE_REF]: 'string',
  [FIELD_TYPE.DOCUMENT_TEMPLATE]: 'string',
  [FIELD_TYPE.TRANSACTION]: 'string',
  [FIELD_TYPE.PRINTER]: 'string',
  [FIELD_TYPE.MESSAGE_TMPL]: 'string',
  [FIELD_TYPE.RANGE_USER]: 'string',
  [FIELD_TYPE.PRIMARY_KEY]: 'string',
  [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY]: 'string',
  [FIELD_TYPE.READONLYCMP]: 'string',
  [FIELD_TYPE.MATERIAL_NO]: 'string',
  [FIELD_TYPE.RELATED_LOT_NO]: 'string',
  [FIELD_TYPE.PRODUCT]: 'string',
  [FIELD_TYPE.PRODUCT]: 'string',
  [FIELD_TYPE.DEVICE]: 'string',
  [FIELD_TYPE.MFG_ORDER]: 'string',
  [FIELD_TYPE.RECORD_NO]: 'string',
  [FIELD_TYPE.TRACE_DATE]: 'string',
  [FIELD_TYPE.ORDER_NO]: 'string',
  [FIELD_TYPE.ROUTING_OPERATION]: 'string',
  [FIELD_TYPE.GOOD_QTY]: 'number',
  [FIELD_TYPE.NOT_GOOD_QTY]: 'number',
  [FIELD_TYPE.REPORT_START_TIME]: 'string',
  [FIELD_TYPE.REPORT_END_TIME]: 'string',
  [FIELD_TYPE.WORK_HOURS]: 'number',
  [FIELD_TYPE.PRODUCTION_DATE]: 'string',
  [FIELD_TYPE.REPORTER]: 'string',
  [FIELD_TYPE.NOT_GOOD_REASON]: 'string',
  [FIELD_TYPE.NOT_GOOD_GROUP]: 'string',
  [FIELD_TYPE.SCRAP_REASON]: 'string',
  [FIELD_TYPE.SCRAP_GROUP]: 'string',
  [FIELD_TYPE.SCRAP_QTY]: 'number',
  [FIELD_TYPE.SCRAP_MATERIAL]: 'string',
  [FIELD_TYPE.SCRAP_MATERIAL_NO]: 'string',
  [FIELD_TYPE.DESTRUCTIVE_TEST_QTY]: 'number',
  [FIELD_TYPE.PRODUCT_CHECK_QTY]: 'number',
  [FIELD_TYPE.MATERIAL_CHECK_QTY]: 'number',
  [FIELD_TYPE.DEVICE_REF]: 'string',
  [FIELD_TYPE.DEVICE_REF_MULTI]: 'string',
  [FIELD_TYPE.WAREHOUSE_RECEIPT_NO]: 'string',
  [FIELD_TYPE.WAREHOUSE_RECEIPT_DATE]: 'string',
  [FIELD_TYPE.WAREHOUSE_MANAGER]: 'string',
  [FIELD_TYPE.WAREHOUSE]: 'string',
  [FIELD_TYPE.STORAGE_LOCATION]: 'string',
  [FIELD_TYPE.QTY_REQUIRED]: 'number',
  [FIELD_TYPE.QTY_CONSUMED]: 'number',
  [FIELD_TYPE.QTY]: 'number',
};

export enum CreateType {
  /** 系统字段 */
  SYSTEM = 'SYSTEM',
  /** 用户创建的自定义字段 */
  USER_DEFINED = 'USER_DEFINED',
  /** 内置字段 */
  BUILTIN = 'BUILTIN',
  /**自定义显示字段 */
  CUSTOM = 'CUSTOM',
  /** 流程字段*/
  PROCESS = 'PROCESS',
}

export enum MenuType {
  CATALOG = 'CATALOG',
  STANDARD = 'STANDARD',
  LINK = 'LINK',
}

export enum OpenMode {
  PRESENT = 'PRESENT',
  IFRAME = 'IFRAME',
  NEW = 'NEW',
}

export enum MaterialEnum {
  /** 表单字段 */
  MaterialFormField = 'formField',
  /** 列字段 */
  MaterialTableField = 'tableField',
  /**
   * 嵌套子表格字段
   */
  MaterialEmbedTableField = 'embedTableField',
  /** 子表单正常模式字段 */
  MaterialSubTableField = 'subTableField',
  /** 子表单模态框状态下表格字段 */
  MaterialSubTableModalField = 'subTableModalField',
  /** 卡片列表字段 */
  cardListFormField = 'cardList',
  /**列表选择器字段 */
  MaterialTableSelectField = 'tableSelectField',
  /**描述列表字段 */
  DescriptionsFormField = 'descriptions',
}

/** 字段类型关联 icon */
export const FieldIconMap = {
  [FIELD_TYPE.PRIMARY_KEY]: 'icon-id',
  [FIELD_TYPE.TEXT]: 'icon-wenben1',
  [FIELD_TYPE.LONG_TEXT]: 'icon-changwenben',
  [FIELD_TYPE.INTEGER]: 'icon-zhengshu',
  [FIELD_TYPE.LONG]: 'icon-changzhengshu',
  [FIELD_TYPE.DECIMAL]: 'icon-jingduxiaoshu1',
  [FIELD_TYPE.DOUBLE]: 'icon-xiaoshu',
  [FIELD_TYPE.BOOLEAN]: 'icon-buer',
  // [FIELD_TYPE.BINARY]:  'binary',
  [FIELD_TYPE.DATE]: 'icon-riqi1',
  [FIELD_TYPE.TIME]: 'icon-shijian1',
  [FIELD_TYPE.DATE_TIME]: 'icon-riqishijian',
  [FIELD_TYPE.USER]: 'icon-renyuanguanlian',
  [FIELD_TYPE.ORG]: 'icon-bumenguanlian',
  [FIELD_TYPE.USER_MULTI]: 'icon-renyuanduoxuan',
  [FIELD_TYPE.ORG_MULTI]: 'icon-bumenduoxuan',
  [FIELD_TYPE.IMAGE]: 'icon-tupian1',
  [FIELD_TYPE.ATTACHMENT]: 'icon-fujian1',
  [FIELD_TYPE.SERIAL]: 'icon-xuliehao',
  [FIELD_TYPE.MASTERSLAVE]: 'icon-zhuziguanlian',
  [FIELD_TYPE.ENUM]: 'icon-meijuguanlian',
  [FIELD_TYPE.REF]: 'icon-moxingguanlian',
  [FIELD_TYPE.RDO_REF]: 'icon-RDOmoxingguanlian',
  [FIELD_TYPE.ENUM_MULTI]: 'icon-meijuguanlianduoxuan',
  [FIELD_TYPE.OPTION]: 'icon-meijuguanlian',
  [FIELD_TYPE.OPTION_MULTI]: 'icon-meijuguanlianduoxuan',
  [FIELD_TYPE.REF_MULTI]: 'icon-moxingduoxuan',
  [FIELD_TYPE.EXPRESSION]: 'icon-gongshiziduan',
  [FIELD_TYPE.EXPRESSION_CONDITION]: 'icon-gongshiziduan',
  [FIELD_TYPE.AGG]: 'icon-huizong',
  [FIELD_TYPE.ESOP]: 'icon-E-SOP',
  [FIELD_TYPE.TRANSACTION]: 'icon-ziduan1',
  [FIELD_TYPE.SERIALRULE]: 'icon-ziduan1',
  [FIELD_TYPE.PRINTER]: 'icon-dayinanniu',
  [FIELD_TYPE.MESSAGE_TMPL]: 'icon-xiaoximoban',
  [FIELD_TYPE.RANGE_USER]: 'icon-fanweirenyuan',
  [FIELD_TYPE.LABEL_TEMPLATE_REF]: 'icon-biaoqianmoban',
  [FIELD_TYPE.DOCUMENT_TEMPLATE]: 'icon-danjumoban',
  [FIELD_TYPE.SIGNATURE]: 'icon-qianming1',
  [FIELD_TYPE.ONLINE_FORM_TEMPLATE]: 'icon-zaixianbiaodanmoban',
  [FIELD_TYPE.E_DHR_TEMPLATE]: 'icon-edhr',
  [FIELD_TYPE.ONLINE_FORM]: 'icon-zaixianbiaodan',
  [FIELD_TYPE.DATA_TABLE_FORMULA]: 'icon-gongshiziduan',
  [FIELD_TYPE.READONLYCMP]: 'icon-wenben1',
  ['tenant']: 'icon-id',
  [FIELD_TYPE.ASSOCIATED_PRIMARY_KEY]: 'icon-id',
  [FIELD_TYPE.MATERIAL_NO]: 'icon-field-material-no',
  [FIELD_TYPE.RELATED_LOT_NO]: 'icon-field-material-no',
  [FIELD_TYPE.PRODUCT]: 'icon-field-product',
  [FIELD_TYPE.DEVICE]: 'icon-field-device',
  [FIELD_TYPE.MFG_ORDER]: 'icon-a-danhao11',
  [FIELD_TYPE.RECORD_NO]: 'icon-jiludanhao1',
  [FIELD_TYPE.TRACE_DATE]: 'icon-zhuisuriqi',
  [FIELD_TYPE.ORDER_NO]: 'icon-dingdanhao',
  [FIELD_TYPE.Biz_Process]: 'icon-jichengzhongxin1',
  [FIELD_TYPE.ROUTING_OPERATION]: 'icon-icon_gongxu',
  [FIELD_TYPE.GOOD_QTY]: 'icon-icon_liangpinshuliang',
  [FIELD_TYPE.NOT_GOOD_QTY]: 'icon-icon_buliangpinshuliang',
  [FIELD_TYPE.REPORT_START_TIME]: 'icon-a-icon_baogongkaishijieshushijian',
  [FIELD_TYPE.REPORT_END_TIME]: 'icon-a-icon_baogongkaishijieshushijian',
  [FIELD_TYPE.WORK_HOURS]: 'icon-icon_gongshi',
  [FIELD_TYPE.PRODUCTION_DATE]: 'icon-icon_shengchanriqi',
  [FIELD_TYPE.REPORTER]: 'icon-icon_baogongren',
  [FIELD_TYPE.NOT_GOOD_REASON]: 'icon-icon_buliangyuanyin',
  [FIELD_TYPE.NOT_GOOD_GROUP]: 'icon-icon_buliangfenlei',
  [FIELD_TYPE.SCRAP_REASON]: 'icon-icon_baofeiyuanyin',
  [FIELD_TYPE.SCRAP_GROUP]: 'icon-icon_baofeifenlei',
  [FIELD_TYPE.SCRAP_QTY]: 'icon-icon_baofeishuliang',
  [FIELD_TYPE.SCRAP_MATERIAL]: 'icon-icon_baofeiwuliao',
  [FIELD_TYPE.SCRAP_MATERIAL_NO]: 'icon-icon_baofeiwuliaopici',
  [FIELD_TYPE.DESTRUCTIVE_TEST_QTY]: 'icon-pohuaixingshiyanshuliang',
  [FIELD_TYPE.PRODUCT_CHECK_QTY]: 'icon-icon_chanpinjianyanshuliang',
  [FIELD_TYPE.MATERIAL_CHECK_QTY]: 'icon-icon_cailiaojianyanshuliang',
  [FIELD_TYPE.DEVICE_REF]: 'icon-icon_shebeiguanlian',
  [FIELD_TYPE.DEVICE_REF_MULTI]: 'icon-icon_shebeiduoxuan',
  [FIELD_TYPE.FUNCTION]: 'icon-zidingyi',
  [FIELD_TYPE.WAREHOUSE_RECEIPT_DATE]: 'icon-riqi1',
  [FIELD_TYPE.WAREHOUSE_MANAGER]: 'icon-icon_baogongren',
  [FIELD_TYPE.WAREHOUSE_RECEIPT_NO]: 'icon-danjubianhao',
  [FIELD_TYPE.WAREHOUSE_IN_OUT]: 'icon-churukumingxi',
  [FIELD_TYPE.QTY_REQUIRED]: 'icon-xuqiushuliang',
  [FIELD_TYPE.QTY_CONSUMED]: 'icon-yixiaohaoshuliang',
  [FIELD_TYPE.QTY]: 'icon-shuliang',
};

export enum AggTypes {
  COUNT = 'COUNT',
  SUM = 'SUM',
  MAX = 'MAX',
  MIN = 'MIN',
  AVG = 'AVG',
}
export enum NodesConfigTypeEnum {
  SPEC = 'spec',
  SUB_WORKFLOW = 'sub_workflow',
}

export enum selectionTypeEnums {
  None = 'none',
  SingleChoice = 'gct_radio',
  MultipleChoice = 'checkbox',
}

/** 是否唯一配置参数类型 */
export const enum UniqueConstraintType {
  /** 无 */
  NONE = 'NONE',
  /** 全局唯一 */
  GLOBAL = 'GLOBAL',
  /** 同级唯一 */
  LEVEL = 'LEVEL',
  /** 逻辑唯一 */
  LOGIC = 'LOGIC',
}

export const enum MessageType {
  /**全部 */
  ALL = 'all',
  /**未读 */
  UNREAD = 'unread',
}

export const enum WorkbenchType {
  /**全部 */
  TEST = 'myTestApp',
  /**未读 */
  QUICK = 'quickAccess',
  MY = 'myApp',
}

export const enum PersonalCenterType {
  /**头像 */
  PROFILE = 'profile',
  /**性别 */
  GENDER = 'gender',
  /**企业 */
  ENTERPRISE = 'enterprise',
}

export const enum GENDER_TYPE {
  /**女 */
  FEMALE = 'female',
  /**男 */
  MALE = 'male',
  /**保密 */
  PRIVARY = 'privary',
}

export const enum TODO_TYPE {
  /**我的待办 */
  TODO = 'todo',
  /**我发起的 */
  APPLICATION = 'application',
  /**我的已办 */
  DONE = 'done',
  /**委托设置 */
  DELEGATE = 'delegate',
}

/**请求接口分类 审计日志用 */
export const enum HTTP_TYPE_ENUM {
  /**新增 */
  INSERT = 'INSERT',
  /**更新 */
  UPDATE = 'UPDATE',
  /**删除 */
  DELETE = 'DELETE',
}

/**卡片触发方式 */
export enum CARD_TRIGGER_ENUM {
  HOVER = 'hover',
  CLICK = 'click',
}

/**
 *  记录单号 字段 标识生成方式
 */
export enum RecordNoGenerateEnum {
  HANDLE = 'handle',
  SN_RULE = 'snRule',
}
