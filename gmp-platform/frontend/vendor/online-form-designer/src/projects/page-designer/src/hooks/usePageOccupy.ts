import { ref, Ref, watch, computed } from 'vue';
import {
  postWebpageCancelOccupyWebPage,
  postWebpageOccupyWebPage,
  postWebpageGetWebPageOccupyMsg,
} from '/@/apis/gct-apaas/WebpageController';
import { WebPageOccupyResponse } from '/@/apis/gct-apaas/model';
import { useUserStore } from '/@/store/modules/user';
import { useQueryStore } from '/@/store/modules/query';
import { throttle } from 'lodash-es';

export const pageOccupyInfo: Ref<WebPageOccupyResponse> = ref({
  querySpanNum: 120, // 占用查询间隔
  cacheNum: 500, // 占用缓存间隔
});
const timeout = computed(() => {
  return pageOccupyInfo.value.querySpanNum! * 1000;
});
const wait = computed(() => {
  return ((pageOccupyInfo.value.cacheNum! - 10) / 2) * 1000;
});

/**
 * 页面占用轮询定时器
 */
let occupyTimer: number | null = null;
function initOccupyTimer() {
  destoryOccupyTimer();
  occupyTimer = window.setInterval(() => {
    window.console.log('【获取占用】');
    loadPageOccupyInfo();
  }, timeout.value);
}
export function destoryOccupyTimer() {
  if (!occupyTimer) return;
  window.console.log('【销毁占用轮询】');
  clearInterval(occupyTimer);
}

/**
 * 监听占用信息变更
 */
watch(
  () => pageOccupyInfo.value.occupyId,
  (value) => {
    if (value) {
      destoryOccupyTimer();
    } else {
      initOccupyTimer();
    }
  },
);

/**
 * 获取占用信息
 * @returns
 */
export async function loadPageOccupyInfo() {
  const queryStore = useQueryStore();
  const res = await postWebpageGetWebPageOccupyMsg({
    id: queryStore.getPid(),
  });
  pageOccupyInfo.value = res!;
}

async function occupyPageTrue(id) {
  window.console.log('【页面占用】【节流】', parseInt(Date.now() / 1000));
  const userStore = useUserStore();
  await postWebpageOccupyWebPage({
    id,
  });
  pageOccupyInfo.value.occupyId = userStore.getUserInfo.userId;
  pageOccupyInfo.value.occupyName = userStore.getUserInfo.fullname;
}
//创建页面占用的节流函数
const throttledOccupyPageTrue = throttle(occupyPageTrue, wait.value);

/**
 * 页面占用
 */
export async function occupyPage(value: Boolean = true) {
  const queryStore = useQueryStore();
  const id = queryStore.getPid()!;
  if (value) {
    window.console.log('【占用】');
    throttledOccupyPageTrue(id);
  } else {
    window.console.log('【取消占用】');
    await postWebpageCancelOccupyWebPage({
      id,
    });
    pageOccupyInfo.value.occupyId = '';
    pageOccupyInfo.value.occupyName = '';
  }
}
