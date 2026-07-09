import { getNavMenuGetSelected } from '/@/apis/gct-platform/NavMenuController';
import { getInternalMessageUnreadCount } from '/@/apis/gct-platform/InternalMessageController';
import { ref } from 'vue';
import type { IMobileHomeMenuItem } from '@gct/base';

const load = ref(false);
const homePage = ref('/eDHR/workbench');
const navMenus = ref([
  {
    icon: 'icon-yidongduan-xiaoxi',
    activeIcon: 'icon-yidongduan-xiaoxi',
    to: '/eDHR/message',
    title: '消息',
    count: 0,
  },
  {
    icon: 'icon-yidongduan-gongzuotai',
    activeIcon: 'icon-yidongduan-gongzuotai',
    to: '/eDHR/workbench',
    title: '工作台',
    count: 0,
  },
  {
    icon: 'icon-yidongduan-wode',
    activeIcon: 'icon-yidongduan-wode',
    to: '/eDHR/user',
    title: '我的',
    count: 0,
  },
]);

export function useWorkbenchHooks() {
  return { runNavMenuSelected, navMenus, homePage, updateMessageCount, reloadMessageCount };
}
async function runNavMenuSelected() {
  try {
    if (load.value) return;
    load.value = true;
    const data = await getNavMenuGetSelected();
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
/**更新消息 */
function updateMessageCount(count: number) {
  navMenus.value.forEach((i) => {
    if (i.to === '/main/message') {
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
