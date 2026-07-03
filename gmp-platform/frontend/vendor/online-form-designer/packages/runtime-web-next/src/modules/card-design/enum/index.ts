/**
 * 卡片设计步骤枚举
 *
 * @export
 * @enum {number}
 */
export enum CARD_DESIGN_STEP {
  /**
   * 基础信息表单配置
   */
  INFO = 'info',
  /**
   * 卡片设计配置
   */
  CONFIG = 'config',
}

/**
 * 卡片设计模式枚举
 *
 * @export
 * @enum {number}
 */
export enum CARD_MODE {
  /**
   * 简易模式
   */
  SIMPLE = 'simple',
  /**
   * 高级模式
   */
  ADVANCED = 'advanced',
}

/**
 * 卡片设计节点类型枚举
 *
 * @export
 * @enum {number}
 */
export enum CARD_DESIGN_NODE_TYPE {
  /**
   * 简易卡片节点
   */
  SIMPLE = 'simple',
}

/**
 * 卡片设计尺寸枚举
 *
 * @export
 * @enum {number}
 */
export enum CARD_SIZE_TYPE {
  /**
   * 自适应
   */
  AUTO = 'auto',
  /**
   * 自定义
   */
  CUSTOM = 'custom',
}

/**
 * 卡片设计布局模式枚举
 *
 * @export
 * @enum {number}
 */
export enum CARD_LAYOUT_MODE {
  /**
   * 垂直布局
   */
  VERTICAL = 'vertical',
  /**
   * 水平布局
   */
  HORIZONTAL = 'horizontal',
}

/**
 * 卡片标签宽度模式枚举
 *
 * @author chitanda
 * @date 2025-06-17 14:06:53
 * @export
 * @enum {number}
 */
export enum CARD_LABEL_WIDTH_MODE {
  /**
   * 百分比宽度
   */
  PERCENT = 'percent',
  /**
   * 固定宽度
   */
  FIXED = 'fixed',
}

/**
 * 卡片标签换行模式枚举
 *
 * @author chitanda
 * @date 2025-06-17 14:06:25
 * @export
 * @enum {number}
 */
export enum CARD_LABEL_WRAP_MODE {
  /**
   * 点点点
   */
  DOT = 'dot',
  /**
   * 换行
   */
  WRAP = 'wrap',
}
