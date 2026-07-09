import { defineStore } from 'pinia';
import { DESIGN_VIEW_STORE, useViewStore } from '../../design-view-base';
import { ICardDesignStore } from '../interface';
import { createUUID } from 'qx-util';
import { onUnmounted, provide } from 'vue';
import { useCardDesignStore } from './card-design-store';

/**
 * 初始化卡片设计界面的状态管理 store，每个界面只能在入口时调用一次，请勿在子组件中重复调用!!!
 *
 * @export
 * @returns {*}
 */
export function initCardDesignStore() {
  // 每个界面都需要一个独立的 store 实例，界面销毁时会自动销毁 store 实例
  const store = defineStore<string, ICardDesignStore>('card-design-view_' + createUUID(), () => {
    return useCardDesignStore();
  })();

  provide(DESIGN_VIEW_STORE, store);

  onUnmounted(() => {
    // 清理销毁 store 实例
    store.$dispose();
  });

  return store;
}

/**
 * 使用卡片设计视图的状态管理 store，用于在子组件中获取实例
 *
 * @export
 * @template T
 * @returns {*}  {T}
 */
export function useCardViewStore<T extends ICardDesignStore = ICardDesignStore>() {
  return useViewStore<T>();
}
