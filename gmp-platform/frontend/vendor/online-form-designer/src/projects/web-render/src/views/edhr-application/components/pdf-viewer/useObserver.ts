import { nextTick, ref } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';

const PDF_EMBED_ID = 'pdf-viewer-embed';

export { PDF_EMBED_ID };
export function useObserver() {
  const pdfRef = ref<InstanceType<typeof VuePdfEmbed> | null>(null);
  const pdfContainerRef = ref<HTMLDivElement | null>(null);
  const currentPage = ref(1);
  const pageCount = ref(1);
  const intersectionObserver = ref<IntersectionObserver | null>();
  const doIntersectionObserver = async () => {
    if (!pdfRef.value) return;

    // 维护所有页面的可见性状态
    const pageVisibilityMap = new Map<number, number>(); // pageNumber -> intersectionRatio
    await nextTick();
    intersectionObserver.value = new IntersectionObserver(
      (entries) => {
        // 更新所有变化页面的可见性状态
        entries.forEach((entry) => {
          const pageId = entry.target.id;
          if (pageId) {
            const pageNumberStr = pageId.replace(`${PDF_EMBED_ID}-`, '');
            const pageNumber = parseInt(pageNumberStr, 10);
            if (!isNaN(pageNumber)) {
              pageVisibilityMap.set(pageNumber, entry.intersectionRatio);
            }
          }
        });

        // 找出可见性最高的页面
        let maxRatio = 0;
        let mostVisiblePage = currentPage.value;

        pageVisibilityMap.forEach((ratio, pageNum) => {
          if (ratio > maxRatio) {
            maxRatio = ratio;
            mostVisiblePage = pageNum;
          }
        });

        // 只有在找到可见页面且与当前页不同才更新
        if (maxRatio > 0 && mostVisiblePage !== currentPage.value) {
          currentPage.value = mostVisiblePage;
        }
      },
      {
        root: pdfContainerRef.value,
        // threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
      },
    );

    const embedEl = pdfRef.value?.$el;
    if (embedEl) {
      for (let i = 1; i <= pageCount.value; i++) {
        // 初始化所有页面的可见性为0
        pageVisibilityMap.set(i, 0);

        setTimeout(async () => {
          await nextTick();
          const pageEl = embedEl.querySelector(`#${PDF_EMBED_ID}-${i}`);
          if (pageEl) {
            intersectionObserver.value!.observe(pageEl);
          }
        }, 0);
      }
    }
  };
  const doResizeObserver = (callback) => {
    const resizeObserver = new ResizeObserver((entries) => {
      // 当元素大小发生变化时执行的回调函数
      for (const entry of entries) {
        callback(entry);
      }
    });
    // 开始观察目标元素的大小变化
    resizeObserver.observe(pdfContainerRef.value!);
  };

  return {
    pdfRef,
    pdfContainerRef,
    currentPage,
    pageCount,
    intersectionObserver,
    doIntersectionObserver,
    doResizeObserver,
  };
}
