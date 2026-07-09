import { IDesignNodeData } from '@gct/base';
import {
  CARD_LABEL_WIDTH_MODE,
  CARD_LABEL_WRAP_MODE,
  CARD_LAYOUT_MODE,
  CARD_SIZE_TYPE,
} from '../../enum';

/**
 * 设计界面节点数据接口
 *
 * @author chitanda
 * @date 2025-06-17 14:06:20
 * @export
 * @interface ICardDesignPageNodeData
 * @extends {IDesignNodeData}
 */
export interface ICardDesignPageNodeData extends IDesignNodeData {
  /**
   * 卡片宽度模式
   *
   * @default CARD_SIZE_TYPE.AUTO
   * @description AUTO: 自适应, CUSTOM: 自定义
   * @author chitanda
   * @date 2025-06-17 14:06:52
   * @type {CARD_SIZE_TYPE}
   */
  size_mode: CARD_SIZE_TYPE;

  /**
   * 自定义时的卡片宽度
   *
   * @default 240
   * @description 单位为px
   * @author chitanda
   * @date 2025-06-17 14:06:29
   * @type {number}
   */
  width: number;

  /**
   * 卡片圆角大小
   *
   * @default 4
   * @description 单位为px
   * @author chitanda
   * @date 2025-06-17 14:06:01
   * @type {number}
   */
  border_radius: number;

  /**
   * 布局模式
   *
   * @default CARD_LAYOUT_MODE.VERTICAL
   * @author chitanda
   * @date 2025-06-17 14:06:26
   * @type {CARD_LAYOUT_MODE}
   */
  layout_mode: CARD_LAYOUT_MODE;

  /**
   * 是否使用宽度模式
   *
   * @default false
   * @author chitanda
   * @date 2025-06-17 14:06:48
   * @type {boolean}
   */
  custom_label_width: boolean;

  /**
   * 卡片标签宽度模式
   *
   * @author chitanda
   * @date 2025-06-17 14:06:18
   * @type {CARD_LABEL_WIDTH_MODE}
   */
  label_mode: CARD_LABEL_WIDTH_MODE;

  /**
   * “名称”标签的显示宽度
   *
   * @author chitanda
   * @date 2025-06-17 14:06:09
   * @type {number}
   */
  label_width: number;

  /**
   * 文本换行模式
   *
   * @author chitanda
   * @date 2025-06-17 14:06:32
   * @type {CARD_LABEL_WRAP_MODE}
   */
  wrap_mode: CARD_LABEL_WRAP_MODE;

  /**
   * 列表列数
   *
   * @default 24
   * @description 用于布局时的列数计算，和栅格的模式一致
   * @author chitanda
   * @date 2025-06-17 14:06:42
   * @type {number}
   */
  colspan: number;

  /**
   * 背景颜色
   *
   * @author chitanda
   * @date 2025-06-17 14:06:24
   * @type {string}
   */
  background?: string;

  /**
   * 边距
   *
   * @author chitanda
   * @date 2025-06-25 15:06:19
   * @type {[IObject, IObject]} [外边距, 内边距]
   */
  spacing?: [IObject, IObject];
}
