export enum PanelEnum {
  PAGE = 'page',
  HISTORY = 'history',
  GLOBAL = 'global',
  WIDGET = 'widget',
  // 切换新旧版本设计器
  CHANGE_DESIGN = 'changeDesign',
}

export enum Postion {
  STATIC = 'static',
  RELATIVE = 'relative',
  ABSOLUTE = 'absolute',
  FIXED = 'fixed',
  STICKY = 'sticky',
}

export enum BorderStyle {
  NONE = 'none',
  SOLID = 'solid',
  DOTTED = 'dotted',
  DASHED = 'dashed',
  DOUBLE = 'double',
}

export enum TextAlign {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

export enum TextDecoration {
  LINETHROUGH = 'line-through',
  UNDERLINE = 'underline',
  NONE = 'none',
}

export enum EventCategory {
  INNER = 'inner',
  JS = 'js',
  LO = 'lo',
}

export enum PropGroup {
  /**基础属性 */
  BASIC = 'basic',
  /**高级属性 */
  ADVANCED = 'advance',
  /**显隐配置 */
  DISPLAY = 'display',
  /**标签 */
  LABEL = 'label',
  /**字段列表 */
  FIELD = 'field',
  /**数据相关 */
  DATA = 'data',
  /**其他属性 */
  OTHER = 'other',
  /**列表配置 */
  LIST = 'list',
  /**表格配置 */
  Table = 'table',
  /**提交配置 */
  SUBMIT_RULE = 'submitRule',
  /**列表数据 */
  LISTDATA = 'listdata',
  /**显示 */
  SHOW = 'show',
  /** 字段配置 */
  FIELD_CONFIG = 'fieldConfig',
  /** 表单配置 */
  FORM_CONFIG = 'formConfig',
  /** 字段布局 */
  FIELD_LAYOUT = 'FieldLayout',
  // 左右分栏
  LEFT_RIGHT_COLUMNS = 'leftRightColumns',
  /**选择器配置 */
  TABLESELECT_CONFIG = 'tableSelect',
  /**单选框配置 */
  GENRADIO = 'genRadio',
  /**复选框配置 */
  GENCHECKBOX = 'genCheckbox',
  /**开关配置 */
  GENSWITCH = 'genSwitch',
  /**选项卡配置 */
  OPTIONS = 'options',
  /**面板配置 */
  COLLAPSE = 'collapse',
  // 占位组件
  SPACE_OCCUPATION = 'spaceOccupation',
  // 分割线组件
  DIVIDER = 'divider',
  /**iframe配置 */
  IFRAME = 'iframe',
  /**文档集配置 */
  FILECOLLECT = 'fileCollect',
  /**卡片列表配置 */
  CARDLIST = 'cardList',
  /**按钮配置 */
  BUTTON = 'button',
  /**按钮 */
  Button = 'Button',
  /**按钮显示 */
  ButtonShow = 'ButtonShow',
  /**按钮显示 */
  ButtonStyle = 'ButtonStyle',
  /**列表按钮 */
  LISTBUTTON = 'listButton',
  /** 模态框配置 */
  MODAL = 'modal',
  /** 弹框宽度 */
  MODALWIDTH = 'modalWidth',
  /** 弹框高度 */
  MODALHEIGHT = 'modalHeight',
  /** 标题配置 */
  MODALTITLECONFIG = 'modalTitleConfig',
  /**搜索配置 */
  SEARCH = 'search',
  /** 查询配置 */
  QUERY = 'query',
  /** 输入配置 */
  INPUT_CONFIG = 'inputConfig',
  /** 数据联动 */
  DATALINKAGE = 'dataLinkage',
  /**权限配置 */
  PERMISSION = 'permission',
  /**数据源 */
  DATASOURCE = 'dataSource',
  /**验证规则 */
  VALIDATERULE = 'validaterule',
  /**文本配置 */
  TEXT = 'text',
  /**栅格容器配置 */
  GRID_CONFIG = 'gridConfig',
  COL_CONFIG = 'colConfig',
  /**组件依赖 */
  COMPONENTDEPENDENCY = 'componentDependency',
  /**图片配置 */
  GENIMAGE = 'genImage',
  /**数据范围 */
  DATARANGE = 'dataRange',
  /**算子配置 */
  OPERATOR_CONFIG = 'operatorConfig',
  /**业务配置 */
  BUSINESS_CONFIG = 'businessConfig',
  /**Vue3配置 */
  Vue3 = 'Vue3',
  /**树配置 */
  TREE_CONFIG = 'treeConfig',
  /**卡片显示 */
  CARDDISPLAY = 'cardDisplay',
}

export enum StyleGroup {
  /**布局 */
  LAYOUT = 'layout',
  /**样式 */
  STYLE = 'style',
  /**背景 */
  BACKGROUND = 'background',
  /**边距 */
  MARGIN = 'margin',
  /**边框 */
  BORDER = 'border',
  /**
   * 标题栏配置
   */
  HEADER = 'header',
  /**显示 */
  SHOW_PROP = 'showProp',
}

export enum tagEnum {
  TAG = 'tag',
  PROGRESS = 'progress',
}
export enum TagTypeEnum {
  RADIUS = 'radius',
  LINEAR_RADIUS = 'linear_radius',
  BIG_RADIUS = 'big_radius',
  LINEAR_BIG_RADIUS = 'linear_big_radius',
  DASHED_RADIUS = 'dashed_radius',
  STATUS = 'status',
}

/**
 * 标签展示类型（DisplayTagTypeEnum）
 *
 * 说明：
 * - 用于表格设计器“样式设置”的多字段显示配置中，定义标签的视觉形态；
 * - 将标签形态分为三大类：
 *   1）线面结合：同时具备边框与浅色背景，适合通用信息标识；
 *   2）面性：纯色背景，无边框，适合强调型/高对比度标签；
 *   3）线性：仅边框，无背景，适合轻量/弱强调标签；
 */
export enum DisplayTagTypeEnum {
  /**
   * 线面结合-圆角
   * 视觉：1px 实线边框 + 浅色背景，3px 圆角；
   */
  RADIUS = 'radius',
  /**
   * 线面结合-大圆角（胶囊）
   * 视觉：1px 实线边框 + 浅色背景，50px 大圆角；
   */
  BIG_RADIUS = 'big_radius',
  /**
   * 线面结合-状态
   * 视觉：1px 实线边框 + 浅色背景，混合圆角（11px/3px/3px）；
   */
  STATUS = 'status',
  /**
   * 面性-圆角
   * 视觉：纯色背景，3px 圆角，无边框；
   */
  SURFACE_RADIUS = 'surface_radius',
  /**
   * 面性-大圆角（胶囊）
   * 视觉：纯色背景，50px 大圆角，无边框；
   */
  SURFACE_BIG_RADIUS = 'surface_big_radius',
  /**
   * 面性-状态
   * 视觉：纯色背景，混合圆角（11px/3px/3px），无边框；
   */
  SURFACE_STATUS = 'surface_status',
  /**
   * 线性-圆角
   * 视觉：1px 实线边框，3px 圆角，无背景；
   */
  LINE_RADIUS = 'line_radius',
  /**
   * 线性-大圆角（胶囊）
   * 视觉：1px 实线边框，50px 大圆角，无背景；
   */
  LINE_BIG_RADIUS = 'line_big_radius',
  /**
   * 线性-虚线圆角
   * 视觉：1px 虚线边框，3px 圆角，无背景；
   */
  LINE_DASHED_RADIUS = 'line_dashed_radius',
  /**
   * 线性-状态
   * 视觉：1px 实线边框，混合圆角（11px/3px/3px），无背景；
   */
  LINE_STATUS = 'line_status',
}
export enum ProgressTypeEnum {
  /**圆形 */
  CIRCLE = 'circle',
  /**线条 */
  LINE = 'line',
}

export enum DisplayType {
  /** 显影控制-规则 */
  RULE = 'rule',
  /** 显影控制-配置 */
  CONFIG = 'config',
}

export enum GLOBAL_VAR_TYPE {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array',
  NULL = 'NULL',
  DATE = 'date',
  DATETIME = 'datetime',
  TIME = 'time',
}

export enum GLOBAL_TYPE {
  MODAL = 'modal',
  EVENT = 'event',
  VAR = 'var',
}

export enum COLUMNS_TYPE {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  TOP = 'top',
  BOTTOM = 'bottom',
}
/**内置事件类型 */
export enum INNER_EVENT {
  CLOSE_MODAL = '__CLOSEMODAL__',
  OPEN_MODAL = '__OPENMODAL__',
  REFRESH_TABLE = '__REFRESHTABLE__',
}

export enum SUB_TABLE_EDIT_MODE {
  /** 行内 */
  INLINE = 'inline',
  /** 模态框 */
  MODAL = 'modal',
}

export enum SUB_TABLE_OPE_EVENT_TYPE_INLINE {
  DELETE = 'delete',
  COPY = 'copy',
}
export enum SUB_TABLE_OPE_EVENT_TYPE {
  DELETE = 'delete',
  EDIT = 'edit',
  COPY = 'copy',
}

export enum VERIFICATIONCONDITIONS_TYPE {
  JS = 'js',
}

/**
 * 新值赋值策略
 */
export enum ASSIGNMENTSTRATEGY_ENUM {
  /**始终覆盖 */
  alwaysCover = 'alwaysCover',
  /**不覆盖已修改 */
  notCovered = 'notCovered',
}
/**组件依赖枚举 */
export enum Dependency_ENUM {
  /**隐藏 */
  HIDDEN = 'hidden',
  /**只读 */
  READONLY = 'readonly',
  /**禁用 */
  DISABLED = 'disabled',
  /**必填 */
  REQUIRED = 'required',
  /**赋值 */
  ASSIGNMENT = 'assignment',
}

/**
 * 表格单元格内容行高模式
 */
export enum TABLE_CELL_HEIGHT_MODE {
  // 显示一行
  ONE_ROW = 'one-row',
  // 显示全部，不限制行高
  ALL_ROW = 'all-row',
  // 根据配置显示行高，超过部分显示省略号
  CUSTOM_ROW = 'custom-row',
}
