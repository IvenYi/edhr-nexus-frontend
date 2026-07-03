/** 组件分类枚举 */
export enum CategoryTypeEnum {
  /** 表单 */
  FORM = 'form',
  /** 布局 */
  LAYOUT = 'layout',
  /** 高级 */
  ADVANCED = 'advanced',
  /** 数据展示 */
  DATA = 'data',
  /** 按钮 */
  BUTTON = 'button',
  /** RDO 组件 */
  RDO = 'rdo',
  /** 插件清单 */
  KIT = 'kit',
  /** 高级 */
  PROCESS = 'process',
}

export enum Platform {
  WEB = 'web',
  MOBILE = 'mobile',
  PAD = 'pad',
}

export enum BuiltinType {
  MODAL = 'modal',
  MODAL_BODY = 'modalBody',
  MODAL_FOOTER = 'modalFooter',
  BottomButtonContainer = 'bottom-button-container',
}

export enum DateRangeEnums {
  /** 本周 */
  WEEK_NOW = 'sys.pageDesigner.dateRange.weekNow',
  /** 本月 */
  MONTH_NOW = 'sys.pageDesigner.dateRange.monthNow',
  /** 本季度 */
  QUARTER_NOW = 'sys.pageDesigner.dateRange.quarterNow',
  /** 本年 */
  YEAR_NOW = 'sys.pageDesigner.dateRange.yearNow',
  /** 上周 */
  WEEk_BEFORE = 'sys.pageDesigner.dateRange.weekBefore',
  /** 上月 */
  MONTH_BEFORE = 'sys.pageDesigner.dateRange.monthBefore',
  /** 上季度 */
  QUARTER_BEFORE = 'sys.pageDesigner.dateRange.quarterBefore',
  /** 上年 */
  YEAR_BEFORE = 'sys.pageDesigner.dateRange.yearBefore',
  /** 当日及以前 */
  DATE_BEFORE = 'sys.pageDesigner.dateRange.dateBefore',
  /** 当日及以后 */
  DATE_AFTER = 'sys.pageDesigner.dateRange.dateAfter',
}

export enum SelectPickerEnums {
  DROPDOWN_SELECTION = 'dropdownSelection',
  TREE_SELECTION = 'treeSelection',
  MODAL_BOX_SELECTION = 'modalBoxSelection',
}
// 币种
export enum CURRENCY_ENUM {
  '￥' = '￥',
  '$' = '$',
  'S$' = 'S$',
}

// 时间类型
export enum TIMETYPE_ENUM {
  'd' = 'd',
  'd:h' = 'd:h',
  'd:h:m' = 'd:h:m',
  'd:h:m:s' = 'd:h:m:s',
  'h' = 'h',
  'h:m' = 'h:m',
  'h:m:s' = 'h:m:s',
  'm' = 'm',
  'm:s' = 'm:s',
  's' = 's',
}

export enum TIMETYPE_LANG_ENUM {
  'd' = 'days',
  'd:h' = 'dayhour',
  'd:h:m' = 'dayhourminute',
  'd:h:m:s' = 'dayhourminutesecond',
  'h' = 'hour',
  'h:m' = 'hourminute',
  'h:m:s' = 'hourminutesecond',
  'm' = 'minute',
  'm:s' = 'minutesecond',
  's' = 'seconds',
}

export enum CURRENCY_LANG_ENUM {
  '￥' = 'chMoney',
  '$' = 'usMoney',
  'S$' = 'sgpMoney',
}

export enum RowSelectionTypeEnums {
  SingleChoice = 'radio',
  MultipleChoice = 'checkbox',
}
export enum StatisticalMethodEnums {
  Current = 'current',
  Whole = 'whole',
}
/**打印方式 */
export enum PrintModeEnums {
  /**本地打印 */
  Local = 'local',
  /**服务打印 */
  Server = 'server',
  /**预览打印 */
  PREVIEW_PRINT = 'PreviewPrint',
  /**直接打印 */
  DIRECT_PRINTING = 'DirectPrinting',
}
/**打开方式 */
export enum openWindowEnums {
  /**打开弹框 */
  OPEN = 'open',
  /**跳转审批页面 */
  APPROVE = 'linkApprove',
}
export enum KeyMode {
  // 系统
  SYSTEM = 'system',
  // 业务
  TRANSACTION = 'transaction',
}

export enum TransactionMode {
  // 当前模型
  CURRENT = 'current',
  // 引用其他模型
  REFERENCE = 'reference',
}
export enum DisplayEnums {
  BLOCK = 'block',
  INLINE_BLOCK = 'inline-block',
}
export enum ButtonColorType {
  DEFAULT = 'default',
  LINK = 'link',
}
export enum ButtonColorTheme {
  DEFAULT = 'default',
  PRIMARY = 'primary',
  ERROR = 'error',
  WARNING = 'warning',
  SUCCESS = 'success',
}
export enum ButtonStyle {
  /**普通 */
  ORDINARY = 'ordinary',
  /**方形 */
  SQUARE = 'square',
}
export enum ButtonSize {
  /**小 */
  SMALL = 'small',
  /**中 */
  DEFAULT = 'middle',
  /**大 */
  LARGE = 'large',
}
/**按钮类型分组 */
export enum ButtonTypeGroup {
  TEXT = 'TEXT',
  ICON_TEXT = 'ICON_TEXT',
  ICON = 'ICON',
}
/**按钮类型分组 */
export enum ButtonType {
  PRIMARY = 'primary',
  DEFAULT = 'default',
  DASHED = 'dashed',
  LINK = 'link',
}
export enum ButtonType_vant {
  PRIMARY = 'primary',
  DANGER = 'danger',
  DEFAULT = 'default',
}
/**按钮类型分组 */
export const ButtonGroupType = {
  TEXT: [
    {
      type: 'primary',
      label: 'sys.pageDesigner.button_primary',
      hasText: true,
    },
    {
      type: 'default',
      label: 'sys.pageDesigner.button_default',
      hasText: true,
    },
    {
      type: 'primary',
      danger: true,
      label: 'sys.pageDesigner.button_primary_danger',
      hasText: true,
    },
    {
      type: 'default',
      danger: true,
      label: 'sys.pageDesigner.button_danger',
      hasText: true,
    },
    {
      type: 'dashed',
      label: 'sys.pageDesigner.button_dashed',
      hasText: true,
    },
    {
      type: 'link',
      label: 'sys.pageDesigner.button_text',
      hasText: true,
    },
  ],
  ICON_TEXT: [
    {
      type: 'primary',
      label: 'sys.pageDesigner.button_primary',
      hasText: true,
      hasIcon: true,
    },
    {
      type: 'default',
      label: 'sys.pageDesigner.button_default',
      hasText: true,
      hasIcon: true,
    },
    {
      type: 'primary',
      danger: true,
      label: 'sys.pageDesigner.button_primary_danger',
      hasText: true,
      hasIcon: true,
    },
    {
      type: 'default',
      danger: true,
      label: 'sys.pageDesigner.button_danger',
      hasText: true,
      hasIcon: true,
    },
    {
      type: 'dashed',
      label: 'sys.pageDesigner.button_dashed',
      hasText: true,
      hasIcon: true,
    },
    {
      type: 'link',
      label: 'sys.pageDesigner.button_text',
      hasText: true,
      hasIcon: true,
    },
  ],
  ICON: [
    {
      type: 'primary',
      hasIcon: true,
    },
    {
      type: 'default',
      hasIcon: true,
    },
    {
      type: 'primary',
      danger: true,
      hasIcon: true,
    },
    {
      type: 'default',
      danger: true,
      hasIcon: true,
    },
    {
      type: 'dashed',
      hasIcon: true,
    },
    {
      type: 'link',
      hasIcon: true,
    },
  ],
};
/**
 * 表格操作系统按钮
 */
export enum operateSysEnums {
  /**删除 */
  COLUMNDELETE = 'columnDelete',
  /**链接 */
  COLUMNLINK = 'columnLink',
  /**复制 */
  COPY = 'copy',
  /**版本复制 */
  VERSION_COPY = 'version_copy',
  /**版本创建 */
  VERSION_CREATE = 'version_create',
  /**详情*/
  DETAILS = 'details',
  /**编辑*/
  EDIT = 'edit',
  /**使用信息*/
  USAGEINFORMATION = 'usageInformation',
  /**建模追溯*/
  MODELINGTRACEABILITY = 'modelingTraceability',
  /**导入*/
  IMPORT = 'import',
  /**导出*/
  EXPORT = 'export',
  /**批量删除*/
  BATCHDELETE = 'batchDelete',
  /**提交 */
  SUBMIT = 'submit',
  /**重置 */
  RESET = 'reset',
  /**执行 */
  EXCUTE = 'excute',
  // 标签打印
  LABEL_PRINT = 'label_print',
  // 单据打印
  DOCUMENT_PRINT = 'document_print',
  // 审批
  EXAMINE_AND_APPROVE = 'examineAndApprove',
}

/**
 * 表格搜索类型
 */
export enum TableSearchTypeEnum {
  NONE = 'none',
  /**内嵌 */
  EMBEDDED = 'embedded',
  /**外部 */
  EXTERNAL = 'external',
}

/**
 * 表格类型
 */
export enum TableTypeEnum {
  // 标准
  DEFAULT = 'default',
  // 嵌套
  EMBED = 'embed',
  // 子表格
  SUB = 'sub',
}

/**
 * 表格编辑方式
 */
export enum TableEditingMethodEnum {
  /**默认编辑 */
  DEFAULTEDITING = 'defaultEditing',
  /**点击编辑*/
  CLICKTOENTEREDITING = 'clickToEnterEditing',
}

export enum WidgetInScopeEnum {
  /**page */
  GCT = 'gct',
  /**modal */
  GCT_MODAL = 'gct-modal',
  /**子表modal */
  GCT_SUB_TABLE_MODAL = 'gct-sub-table-modal',
}

export enum ListTreeSearchTypeEnum {
  /**查询全部 */
  ALL = 'ALL',
  /**搜索树 */
  SEARCH = 'SEARCH',
  /**搜索树且完全展开树 */
  SEARCHALL = 'SEARCHALL',
  /** 返回指定层级的树结构*/
  LEVEL = 'LEVEL',
  /**根据父节点查询子节点 */
  CHILDREN = 'CHILDREN',
}

/**
 * 数据源类型
 */
export enum DatasourceTypeEnum {
  /**实时数据源 */
  REALTIMEDATASOURCE = 'realTimeDataSource',
  /**服务数据源 */
  SERVICEDATASOURCE = 'serviceDataSource',
}

/**
 * 签名格式
 */
export enum SignatureTypeEnum {
  SIGNATURE_ONLY = 'signature_only',
  SIGNATURE_DATE = 'signature_date',
  SIGNATURE_DATETIME = 'signature_datetime',
}

/** 签名显示样式 */
export enum SignatureStyleEnum {
  VERTICAL = 'vertical',
  HORIZONTAL = 'horizontal',
}

/**重置规则 */
export enum ResetRuleType {
  /**清空数据 */
  WIPE_DATA = 'wipe_data',
  /**刷新数据 */
  REFRESHDATA = 'refresh_data',
}
