import { ref, watch, unref, nextTick, onUnmounted } from 'vue';
import { useWindowSizeFn } from '@vben/hooks';

interface IParams {
  pagination?: boolean; // 带分页
  triggerByWindowSize?: boolean; // 基于windowsize触发
}

const HEIGHT = 0;

export function useAntTableScrollHeight(
  el,
  { pagination = true, triggerByWindowSize = true }: IParams = {},
) {
  // y轴方向滚动高度
  const scrollHeight = ref<number | undefined>(HEIGHT);
  // 计算结果缓存
  let heightCache: Array<number | undefined> = [];
  // 重新计算的定时器
  let scrollHeightTimer: any = null;
  // ResizeObserver 实例
  let resizeObserver: ResizeObserver | null = null;

  /**
   * 计算table的滚动高度
   */
  const calcScrollHeight = () => {
    if (!el) return;

    scrollHeightTimer && clearTimeout(scrollHeightTimer);
    scrollHeightTimer = null;

    const dom = unref(el).$el ?? unref(el);

    const maxHeight = dom.getBoundingClientRect().height ?? 0;

    // 表头高度
    const tableHeaderHeight = Math.max(
      dom.querySelector('.ant-table-thead')?.getBoundingClientRect().height ?? 0,
      48,
    );
    // 分页高度
    const paginationHeight = pagination
      ? Math.max(
        dom.querySelector('.ant-table-pagination')?.getBoundingClientRect().height ?? 0,
        24,
      ) + 16
      : 0;

    // 计算结果
    scrollHeight.value = maxHeight - tableHeaderHeight - paginationHeight;

    heightCache.push(scrollHeight.value);

    if (
      heightCache.length >= 3 &&
      heightCache[heightCache.length - 3] === heightCache[heightCache.length - 1] &&
      heightCache[heightCache.length - 2] === heightCache[heightCache.length - 1]
    ) {
      // 最近三次计算结果一致
      heightCache = [];

      // 最后根据实际内容高度重置 scrollHeight 的值（内容高度小于滚动时 右侧会有滚动条的占位）
      // 表格内容高度
      // todo 如下计算有缺陷 by wangcheng
      // const tableContentHeight =
      //   dom.querySelector('.ant-table-content')?.getBoundingClientRect().height ?? 0;
      // if (scrollHeight.value >= tableContentHeight) {
      //   scrollHeight.value = undefined;
      //   setTimeout(() => {
      //     dom.querySelector('.ant-table-content').style.overflowY = 'auto';
      //   }, 100);
      // } else {
      //   dom.querySelector('.ant-table-content').style.overflowY = 'scroll';
      // }
    } else {
      scrollHeightTimer = setTimeout(() => {
        calcScrollHeight();
      }, 100);
    }
  };

  const listenResize = () => {
    // 清理之前的 ResizeObserver
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    // 监听元素高度变化
    const dom = unref(el).$el ?? unref(el);
    if (dom && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        // 防抖处理，避免频繁计算
        if (scrollHeightTimer) {
          clearTimeout(scrollHeightTimer);
        }
        scrollHeightTimer = setTimeout(() => {
          calcScrollHeight();
        }, 100);
      });

      resizeObserver.observe(dom);
    }
  }

  watch(
    el,
    async (value) => {
      await nextTick();
      if (!value) return;
      calcScrollHeight();
      triggerByWindowSize && useWindowSizeFn(calcScrollHeight);
      listenResize();
    },
    {
      immediate: true,
    },
  );

  // 监听 el 高度发生变化时重新计算 table 的滚动高度

  // 组件卸载时清理资源
  onUnmounted(() => {
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (scrollHeightTimer) {
      clearTimeout(scrollHeightTimer);
      scrollHeightTimer = null;
    }
  });

  return {
    scrollHeight,
    calcScrollHeight,
  };
}
