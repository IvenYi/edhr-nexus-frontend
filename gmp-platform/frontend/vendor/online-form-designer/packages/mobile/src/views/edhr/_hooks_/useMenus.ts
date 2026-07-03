import { getMenuConfigAvailableList } from '/@/apis/gct-apaas/MenuConfigController';
import type { MenuConfigResponse } from '/@/apis/gct-apaas/model';

const remoteMenus = ref<MenuConfigResponse[]>([]);

async function loadMenus() {
  const res = await getMenuConfigAvailableList({
    menuType: 'PAD',
  });
  console.log(res);

  const menus = (res ?? []).filter(
    (item) =>
      item.type === 'STANDARD' && item.parentId === 'xDhdGpeEPgu10ZP6' && item.visible === 1,
  );
  remoteMenus.value = menus;
  return menus;
}

export function useMenus() {
  return {
    loadMenus,
    remoteMenus,
  };
}
