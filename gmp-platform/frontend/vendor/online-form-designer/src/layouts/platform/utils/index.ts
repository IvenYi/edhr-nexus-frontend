import type { Menu } from '/@/router/types';
import { usePermissionStoreWithOut } from '/@/store/modules/permission';
import { ProjectName } from '/@/enums/appEnum';

export function menuClickHandler(menu: Menu, go: Function) {
  const { getCurrentProject } = usePermissionStoreWithOut();
  const { openMode, path, type, url } = menu;

  if (getCurrentProject === ProjectName.WEB_RENDER) {
    if (type === 'STANDARD' && openMode === 'PRESENT') {
      go(path);
    } else if (type === 'STANDARD' && openMode === 'NEW') {
      window.open(location.href.split('#')[0] + '#' + path);
    } else if (type === 'LINK' && openMode === 'IFRAME') {
      go(path);
    } else if (type === 'LINK' && openMode === 'NEW') {
      window.open(url);
    } else {
      go(path);
    }
  } else {
    go(path);
  }
}
