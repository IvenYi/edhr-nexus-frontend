import { ref, computed } from 'vue';

// 缓存数量
const cacheMax = ref<number>(30);
// 缓存列表
const cacheList = ref<Array<{ data: any; timestamp: number }>>([]);
// 缓存索引
const cacheIndex = ref<number>(-1);
// 是否可后退
const cacheBackwardAvaiable = computed(() => cacheIndex.value > 0);
// 是否可前进
const cacheForwardAvaiable = computed(() => cacheIndex.value < cacheList.value.length - 1);

export function useCache() {
  class CacheUtil {
    /**
     * 缓存数量
     * @param {number} max
     */
    static init(max = 30) {
      cacheMax.value = max;
      cacheList.value = [];
      cacheIndex.value = -1;
    }

    /**
     * 增加缓存
     * @param {any} data
     */
    static push(data: any) {
      if (cacheIndex.value === cacheList.value.length - 1) {
        // 索引在最后
        cacheList.value.push({
          data,
          timestamp: Date.now(),
        });
        while (cacheList.value.length > cacheMax.value) {
          cacheList.value.shift();
        }
      } else {
        // 索引不在最后，需要丢弃部分缓存数据
        // [0, 1, 2, 3, 4, 5]
        while (cacheList.value.length > cacheIndex.value + 1) {
          cacheList.value.pop();
        }
        cacheList.value.push({
          data,
          timestamp: Date.now(),
        });
      }
      cacheIndex.value = cacheList.value.length - 1;
    }

    /**
     * 后退
     * @returns 返回缓存数据
     */
    static backward() {
      if (!cacheBackwardAvaiable.value) return;
      cacheIndex.value--;
      return cacheList.value[cacheIndex.value].data;
    }

    /**
     * 前进
     * @returns 返回缓存数据
     */
    static forward() {
      if (!cacheForwardAvaiable.value) return;
      cacheIndex.value++;
      return cacheList.value[cacheIndex.value].data;
    }
  }
  return {
    cacheForwardAvaiable,
    cacheBackwardAvaiable,
    CacheUtil,
  };
}
