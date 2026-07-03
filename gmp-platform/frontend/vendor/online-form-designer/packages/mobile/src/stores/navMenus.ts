import { getNavMenuGetSelected } from '/@/apis/gct-platform/NavMenuController';
import { getInternalMessageUnreadCount } from '/@/apis/gct-platform/InternalMessageController';
import { ref } from 'vue';
import type { IMobileHomeMenuItem } from '@gct/base';
import { getPmTaskTodoPageList } from '/@/apis/gct-platform/PmTaskTodoController';
import { useAppStore } from '@mobile/stores/useAppStore';

const lock = ref(false);
const homePage = ref('/main/workbench');

const navMenus = ref<object[]>([]);

export function useWorkbenchHooks() {
  return {
    runNavMenuSelected,
    navMenus,
    homePage,
    updateMessageCount,
    reloadMessageCount,
    reloadToDoCount,
  };
}
async function runNavMenuSelected() {
  const appStore = useAppStore();
  if (appStore.getInApp) {
    navMenus.value = getSingleAppMens();
    lock.value = false;
    homePage.value = '/main/menuCenter';
    return;
  }
  try {
    if (lock.value) return;
    lock.value = true;
    navMenus.value = getInitializationMens();
    homePage.value = '/main/workbench';
    //ipad不走远程
    if (import.meta.env.VITE_APP_ENV === 'ipad') return;
    const data = await getNavMenuGetSelected();
    if (!data || !!data?.deleted) return;
    const { pageNode } = JSON.parse(data.designerJson);
    const menus = pageNode.data.menus.filter((i) => !i.isHidden);
    navMenus.value = transformTabsByApi(menus);
    await nextTick();
  } catch (error) {}
}
function transformTabsByApi(menus: IMobileHomeMenuItem[]) {
  return menus.map((item) => {
    const { menuMode, presetType, selectIcon, icon, label, isHome, customExpView } = item;
    const to = menuMode === 'system' ? sysRoute[presetType!] : '/main/custom/' + customExpView;
    if (menuMode === 'custom' && customExpView) {
      ___router.addRoute('main', generateRoute(customExpView));
    }
    if (isHome) {
      homePage.value = to;
    }
    return {
      icon: icon.icon,
      activeIcon: selectIcon.icon,
      to,
      title: label,
      isHome,
      count: 0,
    };
  });
}
/**更新消息 */
async function reloadMessageCount() {
  const getCount = navMenus.value.map((i) => i.to === '/main/message');
  if (getCount) {
    const res = await getInternalMessageUnreadCount();
    const count = res ? Number(res) : 0;
    navMenus.value.forEach((i) => {
      if (i.to === '/main/message') {
        i.count = count;
      }
    });
  }
}
/**更新代办消息 */
async function reloadToDoCount() {
  const getCount = navMenus.value.map((i) => i.to === '/main/todo');
  if (getCount) {
    const { totalCount } = await getPmTaskTodoPageList({
      pageNo: 1,
      pageSize: 1,
    });
    const count = totalCount ? Number(totalCount) : 0;
    navMenus.value.forEach((i) => {
      if (i.to === '/main/todo') {
        i.count = count;
      }
    });
  }
}

/**更新消息 */
function updateMessageCount(count: number, path = '') {
  navMenus.value.forEach((i) => {
    if (i.to === path) {
      i.count = count;
    }
  });
}
/**系統菜單頁面關係 */
const sysRoute = {
  message: '/main/message',
  workbench: '/main/workbench',
  personalCenter: '/main/user',
  todo: '/main/todo',
};

/**实时生成路由 */
function generateRoute(id: string) {
  return {
    path: `custom/${id}`,
    name: id,
    component: () => import('@mobile/views/main/custom/index.vue'),
  };
}

function getInitializationMens() {
  return [
    {
      icon: 'gct-iconfont icon-caidan-xiaoxi-rest',
      activeIcon: 'gct-iconfont icon-caidan-xiaoxi-selected',
      to: '/main/message',
      title: 'sys.developer.designView.message',
      count: 0,
    },
    {
      icon: 'gct-iconfont icon-caidan-shenpi-rest',
      activeIcon: 'gct-iconfont icon-caidan-shenpi-selected',
      to: '/main/todo',
      title: 'sys.developer.designView.todo',
      count: 0,
    },
    {
      icon: 'gct-iconfont icon-caidan-gongzuotai-rest',
      activeIcon: 'gct-iconfont icon-caidan-gongzuotai-selected',
      to: '/main/workbench',
      title: 'sys.developer.designView.workbench',
      count: 0,
    },
    {
      icon: 'gct-iconfont icon-caidan-wode-rest',
      activeIcon: 'gct-iconfont icon-caidan-wode-selected',
      to: '/main/user',
      title: 'sys.developer.designView.personalCenter',
      count: 0,
    },
  ];
}

function getSingleAppMens() {
  return [
    {
      icon: 'gct-iconfont icon-caidan-xiaoxi-rest',
      activeIcon: 'gct-iconfont icon-caidan-xiaoxi-selected',
      to: '/main/message',
      title: 'sys.developer.designView.message',
      count: 0,
    },
    {
      icon: 'gct-iconfont icon-caidan-shenpi-rest',
      activeIcon: 'gct-iconfont icon-caidan-shenpi-selected',
      to: '/main/todo',
      title: 'sys.developer.designView.todo',
      count: 0,
    },
    {
      icon: 'gct-iconfont icon-caidan-caidan-rest',
      activeIcon: 'gct-iconfont icon-caidan-caidan-selected',
      to: '/main/menuCenter',
      title: 'sys.developer.designView.menu',
      count: 0,
    },
    {
      icon: 'gct-iconfont icon-caidan-wode-rest',
      activeIcon: 'gct-iconfont icon-caidan-wode-selected',
      to: '/main/user',
      title: 'sys.developer.designView.personalCenter',
      count: 0,
    },
  ];
}
