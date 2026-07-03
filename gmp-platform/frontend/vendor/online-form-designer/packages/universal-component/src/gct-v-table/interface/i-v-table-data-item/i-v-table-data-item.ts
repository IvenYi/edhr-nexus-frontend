import { LowCodeWidget } from '@gct/runtime';

/**
 * 行选中状态
 *
 * @export
 * @interface ICheckState
 */
export interface ICheckState {
  /**
   * 选中状态文本
   *
   * @type {string}
   */
  text?: string;
  /**
   * 是否选中
   *
   * @type {boolean}
   */
  checked: boolean;
  /**
   * 是否禁用
   *
   * @type {boolean}
   */
  disable?: boolean;
}

/**
 * 列自定义标签
 *
 * @export
 * @interface ICustomTag
 */
export interface ICustomTag {
  /**
   * 显示的文本
   *
   * @type {string}
   */
  text: string;
  /**
   * 标签类型
   *
   * @type {string}
   */
  type: string;
  /**
   * 标签颜色（未指定默认主题色）
   *
   * @type {string}
   */
  color?: string;
}

/**
 * 表格数据项
 *
 * @export
 * @interface IVTableDataItem
 */
export interface IVTableDataItem extends IObject {
  /**
   * 前端控制新建时，唯一标识。避免批量提交和修改混合时，后端无法区分新建和修改的数据行
   *
   * @type {string}
   */
  _id?: string;
  /**
   * 默认行数据唯一标识（可根据表格配置项调整）
   *
   * @type {string}
   */
  id_: string;
  /**
   * 是否被标记为删除的行
   *
   * @description 用于前端标记删除状态的行，实际删除操作需要调用保存接口进行处理
   * @type {boolean}
   */
  deleted_?: boolean;
  /**
   * 给行数据的选择框状态，用于控制默认的呈现
   *
   * @type {ICheckState}
   */
  check?: ICheckState;
  /**
   * 动态计算的，当前行最大行高，主要用于缓存避免重复计算
   *
   * @type {number}
   */
  _MAX_ROW_HEIGHT?: number;
  /**
   * 后端给的数据映射
   *
   * @type {IObject}
   */
  _DICT?: IObject;
  /**
   * 外键字段数据
   *
   * @type {IObject}
   */
  __FOREIGN__?: IObject;
  /**
   * 计算的有权限的操作列按钮项
   *
   * @type {string[]}
   */
  _ACTIONS?: string[];
  /**
   * 样式配置，根据数据动态计算的，行内的每一列独特的样式
   *
   * @type {Record<string, Partial<LowCodeWidget.BasicStyle>>}
   */
  _STYLE?: Record<string, Partial<LowCodeWidget.BasicStyle>>;
  /**
   * 当前行数据，具体列是否禁用状态
   *
   * @type {Record<string, boolean>} Record<列表字段名称, 是否禁用>
   */
  _DISABLED?: Record<string, boolean>;
  /**
   * 当前行数据，具体列是否只读状态
   *
   * @type {Record<string, boolean>} Record<列表字段名称, 是否只读>
   */
  _READONLY?: Record<string, boolean>;
  /**
   * 根据配置，动态生成的自定义标签数据
   *
   * @type {Record<string, ICustomTag[]>}
   */
  _CUSTOM_TAGS?: Record<string, ICustomTag[]>;
  /**
   *
   * @deprecated 外键字段数据，使用原始的 __FOREIGN__ 字段，此字段不使用
   * @type {IObject}
   */
  _OPCT?: IObject;
}
