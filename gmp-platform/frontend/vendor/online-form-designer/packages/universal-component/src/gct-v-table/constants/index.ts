import { FIELD_TYPE } from '@gct/runtime';

/**
 * 用来存储当前作用域下表格的唯一标识符
 */
export const GCT_V_TABLE_UUID_KEY = 'gct-v-table-uuid';

/**
 * 用来存储当前作用域下表格行编辑的唯一标识符
 */
export const GCT_V_TABLE_ROW_EDIT_UUID_KEY = 'gct-v-table-row-edit-uuid';

/**
 * 用来存储当前作用域下表格的 schema 配置
 */
export const GCT_TABLE_SCHEMA_KEY = 'gct-table-widget-schema';

/**
 * 用来存储当前作用域下表格行编辑行实例
 */
export const GCT_V_TABLE_ROW_EDITING_ROW_KEY = 'gct-v-table-row-editing-row-key';

/**
 * 用来存储当前作用域下表格行编辑列实例
 */
export const GCT_V_TABLE_ROW_EDITING_COL_KEY = 'gct-v-table-row-editing-col-key';

/**
 * 表格行编辑渲染组件 slot 前缀
 */
export const GCT_V_TABLE_ROW_EDIT_RENDER_PREFIX = 'gct_v_table_row_edit_render_';

/**
 * 当前作用域下列字段配置，主要用于行编辑的编辑器内获取字段配置
 */
export const GCT_FIELD_CONFIG = 'gct_field_config';

/**
 * 提供给子组件使用的 provide 的 key
 *
 * @export
 * @enum {number}
 */
export enum PROVIDE_KEY {
  /**
   * 飘窗钩子
   */
  POPOVER_HOOKS = 'popoverHooks',
}

export enum TABLE_EVENTS {
  /** 复选框选中状态变化 */
  CHECK_CHANGE = 'checkChange',
  /** 单选框选中状态变化 */
  SINGLE_CHECK_CHANGE = 'singleCheckChange',
  /** 行点击事件 */
  ROW_CLICK = 'rowClick',
  /** 行编辑数据变更 */
  DATA_CHANGE = 'dataChange',
  /** 排序变更 */
  SORT_CHANGE = 'sortChange',
}

/**
 * 预置插件类型
 */
export enum PresetPluginType {
  /** 表头列插件 */
  HEADER_TYPE_COLUMN = 'header-type-column',
  /** 属性列插件 */
  FIELD_TYPE_COLUMN = 'field-type-column',
  /** 操作列插件 */
  OPERATION_COLUMN = 'operation-column',
}

/**
 * 列绘制类型
 */
export const CellColumnType = {
  ...FIELD_TYPE,
  /** 默认 */
  DEFAULT: 'default',
  /** 字段默认呈现 */
  FIELD_DEFAULT: 'field-default',
} as const;
