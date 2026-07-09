/**
 * 撤销重做功能hooks
 */

import { ref, unref, watch } from 'vue';
import { useUUid } from '@/hooks/web/useUUid';
import type { Ref } from 'vue';

interface IHistoryValue<T = any> {
  /** 过去 */
  pasts: T[];
  /** 将来 */
  futures: T[];
  /** 最大存储个数 */
  max: number;
}

interface InitProps {
  /** 唯一id */
  historyId: string;
  /** 最大数量 */
  max?: number;
}

const cacheHistoryMap = ref<Map<string, IHistoryValue>>(new Map());

export function useCacheHistory() {
  const historyKeys = [...unref(cacheHistoryMap).keys()];

  const { getUuidGenerate } = useUUid(ref([]), ref(''), {
    needPrefix: true,
    isString: false,
    prefix: 'h_',
  });

  const uuidGenerate = getUuidGenerate(historyKeys);

  class historyUtils {
    /**
     * 获取唯一id
     */
    static getUniqueHistoryId() {
      return uuidGenerate.next();
    }

    /** 初始化 */
    static init(props: InitProps) {
      if (this.isHistoryInfoExist(props.historyId)) {
        console.warn('唯一key重复了');
        return;
      }
      cacheHistoryMap.value.set(props.historyId, {
        pasts: [],
        futures: [],
        max: props.max ?? 30,
      });
    }

    /** 是否存在所属唯一id的历史记录信息 */
    static isHistoryInfoExist(historyId) {
      return unref(cacheHistoryMap).has(historyId);
    }

    /** 根据唯一id获取历史记录 */
    static getHistoryInfo(historyId: string) {
      return unref(cacheHistoryMap).get(historyId) as IHistoryValue;
    }

    /** 根据唯一id获取删除指定历史记录 */
    static deleteHistoryInfo(historyId: string) {
      cacheHistoryMap.value.delete(historyId);
    }

    /** 清空全部历史记录Map */
    static clearCacheHistory() {
      cacheHistoryMap.value.clear();
    }

    /** 清空全部历史记录Map */
    static resetHistoryById(id: string) {
      const history = historyUtils.getHistoryInfo(id);
      if (!history) return;
      history.futures.length = 0;
      history.pasts.length = 0;
    }

    static getCacheHistoryMap() {
      return cacheHistoryMap.value;
    }

    /** 新增一条历史记录到指定唯一id中 */
    static addHistory({
      historyId,
      replaceHistory,
      past,
    }: {
      /** 唯一id */
      historyId: string;
      /**替换最新的一条历史记录 */
      replaceHistory?: boolean;
      /** 新的一条历史记录 */
      past: string;
    }) {
      if (this.isHistoryInfoExist(historyId)) {
        const historyInfo: IHistoryValue = this.getHistoryInfo(historyId);
        // 存在更新，但不需要增加 history 的场景
        if (!replaceHistory && historyInfo?.pasts.length > historyInfo?.max + 1) {
          historyInfo?.pasts.shift();
        }
        if (replaceHistory) {
          historyInfo?.pasts.splice(-1, 1, past);
        } else {
          historyInfo?.pasts.push(past);
        }
        // 添加新记录的时候要把前进清空
        historyInfo!.futures.length = 0;
      } else {
        console.warn('不存在，插入历史记录失败');
      }
    }

    /** 撤销一条历史记录 */
    static undoHistory(historyId: string) {
      if (this.isHistoryInfoExist(historyId)) {
        const historyInfo: IHistoryValue = this.getHistoryInfo(historyId);
        const len = historyInfo.pasts.length;
        if (len > 1) {
          historyInfo.futures.push(historyInfo.pasts.pop());
          return historyInfo.pasts[historyInfo.pasts.length - 1];
        }
      } else {
        console.warn('不存在，撤销历史记录失败');
      }
      return null;
    }

    /** 重做一条历史记录 */
    static restoreHistory(historyId: string) {
      if (this.isHistoryInfoExist(historyId)) {
        const historyInfo: IHistoryValue = this.getHistoryInfo(historyId);
        const len = historyInfo.futures.length;
        if (len > 0) {
          const current = historyInfo.futures.pop();
          historyInfo.pasts.push(current);
          return current;
        }
      } else {
        console.warn('不存在，重做历史记录失败');
      }
      return null;
    }
  }

  return { historyUtils };
}

interface IPropsInner {
  /** 唯一id */
  historyIdRef: Ref<string>;
  /** 撤销和重做回调方法 */
  callback?: Function;
}

export function useCacheHistoryInner(props: IPropsInner) {
  const { historyUtils } = useCacheHistory();
  /** 撤销状态 */
  const undoDisabled = ref<boolean>(true);
  /** 重做状态 */
  const restoreDisabled = ref<boolean>(true);

  watch(
    () => historyUtils.getHistoryInfo(unref(props.historyIdRef))?.pasts,
    (value) => {
      undoDisabled.value = (unref(value) ?? []).length <= 1;
    },
    { deep: true, immediate: true },
  );

  watch(
    () => historyUtils.getHistoryInfo(unref(props.historyIdRef))?.futures,
    (value) => {
      restoreDisabled.value = !(unref(value) ?? []).length;
    },
    { deep: true, immediate: true },
  );

  /** 撤销 */
  function onUndo() {
    if (unref(undoDisabled)) {
      return;
    }
    const content = historyUtils.undoHistory(unref(props.historyIdRef));
    if (props.callback && typeof props.callback === 'function' && content !== null) {
      props.callback(content);
    }
    return content;
  }

  /** 重做 */
  function onRestore() {
    if (unref(restoreDisabled)) {
      return;
    }
    const content = historyUtils.restoreHistory(unref(props.historyIdRef));
    if (props.callback && typeof props.callback === 'function' && content !== null) {
      props.callback(content);
    }
    return content;
  }

  return {
    undoDisabled,
    restoreDisabled,
    onUndo,
    onRestore,
  };
}
