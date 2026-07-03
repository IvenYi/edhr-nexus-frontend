import { useResizeObserver } from '@vueuse/core';
import { onBeforeUnmount, ref } from 'vue';

const parentHeight = ref();
const observeMap = ref({});

// 获取第一个出现滚动条的父盒子的高度
function getParentHeight(ele?) {
  const p1 = ele?.parentElement;
  const sH = p1?.scrollHeight;
  const pH = p1?.clientHeight;
  if (sH && pH && sH > pH) return p1.clientHeight;
  if (p1) return getParentHeight(p1);
  return 0;
}

onBeforeUnmount(() => {
  for (const k in observeMap.value) {
    observeMap.value[k]?.unobserve(k);
    observeMap.value[k]?.disconnect();
  }
});

/**
 * 监听最近一个出现滚动条的父盒子高度
 * html HTMLDivElement
 * callback 获取到高度后的回调
 */
export function parentObserver(html, callback) {
  observeMap.value[html.value] = useResizeObserver(html.value, (entries) => {
    const entry = entries[0];
    const height = entry.target.clientHeight;
    // 处理尺寸变化
    if (!height) return;
    // console.log('parent---', height);
    parentHeight.value = getParentHeight(html.value);
    if (callback && typeof callback === 'function') {
      const needSticky = height && parentHeight.value && height > parentHeight.value;
      callback(needSticky, parentHeight.value, height);
    }
  });
}

/**
 * 监听审批节点的高度
 * html HTMLDivElement
 * callback 获取到高度后的回调
 */
export function approvalObserver(html, callback) {
  observeMap.value[html.value] = useResizeObserver(html.value, (entries) => {
    const entry = entries[0];
    const height = entry.target.clientHeight;
    // 处理尺寸变化
    if (!height) return;
    // console.log('approval---', height);
    if (callback && typeof callback === 'function') {
      const needSticky = height && parentHeight.value && height > parentHeight.value;
      callback(needSticky, parentHeight.value, height);
    }
  });
}
