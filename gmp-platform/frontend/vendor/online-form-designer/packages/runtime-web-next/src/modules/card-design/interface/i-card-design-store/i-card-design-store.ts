import { Ref } from 'vue';
import { IBaseStore } from '../../../design-view-base';
import { ICardData } from '../i-card-data/i-card-data';

/**
 * 卡片设计状态管理接口
 *
 * @export
 * @interface ICardDesignStore
 * @extends {IBaseStore}
 */
export interface ICardDesignStore extends IBaseStore {
  /**
   * 卡片设计数据
   *
   * @type {Ref<IObject>}
   */
  data: Ref<IObject>;

  /**
   * 卡片设计数据的 JSON 字符串
   *
   * @type {Ref<ICardData>}
   */
  json: Ref<ICardData>;
}
