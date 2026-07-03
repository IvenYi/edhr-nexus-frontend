import { ref } from 'vue';
import { getAppBranchList } from '/@/apis/gct-apaas/AppBranchController';
import type { AppBranchResponse } from '/@/apis/gct-apaas/model';

import { createSessionStorage } from '/@/utils/cache';

const CACHE_NAME = 'Branch-Id';
const ss = createSessionStorage({
  hasEncrypt: false,
});

const branchIdFromPath = location.pathname
  .replace('/src/projects', '')
  .replace('/index.html', '')
  .split('/')[3];
const branchIdFromSession = ss.get(CACHE_NAME);
const branches = ref<AppBranchResponse[]>([]);
const branchId = ref<string | undefined>(branchIdFromPath ?? branchIdFromSession);

/**
 * branchId
 * 1.url path
 * 2.session
 * 3.branches head
 * @returns
 */
export function useBranch() {
  /**
   * 加载分支信息
   * 在app设计器中初始化分支列表用
   */
  async function loadBranchesForAppDesigner(config = {}) {
    const res = await getAppBranchList({
      transferToConfig: {
        skipBranchId: true,
        ...config,
      },
    });
    branches.value = res ?? [];
    if (!branchId.value) {
      branchId.value = branches.value.find((item) => item.head === 1)?.id;
      ss.set(CACHE_NAME, branchId.value);
    }
    gct.appSetting.branchId = branchId.value;
  }

  function setBranchSession(ver: string) {
    branchId.value = ver;
    gct.appSetting.branchId = branchId.value;
    ss.set(CACHE_NAME, ver);
    window.location.reload();
  }

  return {
    branches,
    branchId,
    loadBranchesForAppDesigner,
    setBranchSession,
  };
}
