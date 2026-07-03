/**
 * 编辑器类型
 *
 * @author zhanghanrui
 * @date 2024-03-27 10:03:19
 * @export
 * @enum {number}
 */
export enum EditorType {
  /**
   * 带单位长度字符串编辑器
   */
  LENGTH_UNIT = 'length-unit',
  /**
   * 颜色选择编辑器
   */
  COLOR = 'color',
  /**
   * 纯文本展示编辑器
   */
  SPAN = 'span',
  /**
   * 文本编辑器
   */
  TEXT = 'text',
  /**
   * 数值编辑器
   */
  NUMBER = 'number',
  /**
   * 纯信息呈现
   */
  INFO = 'info',
  /**
   * 根据模型或者字段进行的纯信息展示
   */
  MSG = 'msg',
  /**
   * 下拉选择编辑器
   */
  SELECT = 'select',
  /**
   * 分组下拉选择编辑器
   */
  SELECT_GROUP = 'select-group',
  /**
   * 单选框编辑器
   */
  RADIO = 'radio',
  /**
   * 数据选择器编辑器
   */
  PICKER = 'picker',
  /**
   * 数据选择多选编辑器
   */
  MULTIPLE_CHOICE = 'multiple-choice',
  /**
   * 多语言选择编辑器
   */
  I18N = 'i18n',
  /**
   * 多行文本编辑器
   */
  TEXTAREA = 'textarea',
  /**
   * 日期时间范围选择编辑器
   */
  DATE_RANGE = 'date-range',
  /**
   * 开关组件
   */
  SWITCH = 'switch',
  /**
   * 选框类型开关
   */
  CHECK_SWITCH = 'check-switch',
  /**
   * 图标选择
   */
  ICON_SELECT = 'icon-select',
  /**
   * 复选框
   */
  CHECKBOX = 'checkbox',
  /**
   * 日期
   */
  DATE = 'date',
  /**
   * 平台模型选择
   */
  MODEL_SELECT = 'model-select',
  /**
   * 按钮行为
   */
  ACTION = 'action',
  /**
   * 表格编辑器
   */
  TABLE = 'table',
  /**
   * 表格选择编辑器
   */
  SELECT_TABLE = 'select-table',
  /**
   * 空显示
   */
  EMPTY = 'empty',
  /**
   * 表单模型字段选择编辑器
   */
  FORM_MODEL_FIELD_SELECT = 'form-model-field-select',
  /**
   * 像素模式配置
   */
  PIXEL_CONFIG = 'pixel-config',
  /**
   * 界面配置中，属性配置的基本信息
   */
  FIELD_INFO = 'field-info',
  /**
   * 日期与日期时间类型的格式化选择编辑器
   */
  DATE_FORMAT_SELECT = 'date-format-select',
  /**
   * 公式编辑器
   */
  FORMULA = 'formula',
}
