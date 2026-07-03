import { IDesignData } from '@gct/base';
import { CARD_MODE } from '../../enum';

/**
 * 卡片数据
 *
 * @export
 * @interface ICardData
 */
export interface ICardData extends IDesignData {
  /**
   * 卡片 ID
   *
   * @type {string}
   */
  id: string;
  /**
   * 卡片名称
   *
   * @type {string}
   */
  name: string;
  /**
   * 卡片模式
   *
   * @type {CARD_MODE}
   */
  mode: CARD_MODE;
  /**
   * 模型标识
   *
   * @type {string}
   */
  modelKey: string;
  /**
   * 模型名称
   *
   * @type {string}
   */
  modelName: string;
  /**
   * 模型大类
   *
   * @type {string}
   */
  category: string;
  /**
   * 模型选择大类
   *
   * @type {string}
   */
  categorySelect: string;
  /**
   * 描述信息
   *
   * @type {string}
   */
  description?: string;
}
