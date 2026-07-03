import { ref } from 'vue';
import { useBaseStore } from '../../design-view-base';
import { ICardData, ICardDesignStore } from '../interface';

/**
 * 卡片设计状态管理
 *
 * @export
 * @returns {*}  {ICardDesignStore}
 */
export function useCardDesignStore(): ICardDesignStore {
  const baseStore = useBaseStore();
  // 卡片设计数据
  const data = ref<IObject>({});
  // 卡片设计数据的 JSON 字符串
  const json = ref<ICardData>({} as ICardData);

  return {
    ...baseStore,
    data,
    json,
  };
}
