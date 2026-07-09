import LAYOUT from '/@/layouts/platform/form-template-layout.vue';
import { getMenuConfigAvailableList } from '/@/apis/gct-apaas/MenuConfigController';
import type { MenuConfigResponse } from '/@/apis/gct-apaas/model';
import type { AppRouteRecordRaw, Menu } from '/@/router/types';
import { list_to_tree } from '/@/utils/helper/treeHelper';
import { cloneDeep } from 'lodash-es';

const FORM_TEMPLATE_LINK_PAGE = 'OnlineForm';

function getFormTemplateMenus(menuRes: MenuConfigResponse[]): MenuConfigResponse[] {
  const allowedMenuIds = new Set<string>();

  menuRes.forEach((menu) => {
    if (menu.linkPage === FORM_TEMPLATE_LINK_PAGE && menu.id) {
      allowedMenuIds.add(menu.id);
      menu.fullPath?.split('/').forEach((id) => id && allowedMenuIds.add(id));
    }
  });

  let changed = true;
  while (changed) {
    changed = false;
    menuRes.forEach((menu) => {
      if (
        menu.type === 'PERMISSION' &&
        menu.id &&
        menu.parentId &&
        allowedMenuIds.has(menu.parentId) &&
        !allowedMenuIds.has(menu.id)
      ) {
        allowedMenuIds.add(menu.id);
        changed = true;
      }
    });
  }

  return menuRes.filter((menu) => menu.id && allowedMenuIds.has(menu.id));
}

export async function getAsyncRouter() {
  const menuRes: MenuConfigResponse[] = getFormTemplateMenus(
    (await getMenuConfigAvailableList({ menuType: 'WEB' })) ?? [],
  );
  // 所有菜单依赖的目录id
  const menuResCatagoryIds = menuRes
    .filter(
      (m) =>
        ['STANDARD', 'LINK'].includes(m.type) || (m.type === 'CATALOG' && m.parentId !== 'ROOT'),
    )
    .reduce((total: string[], m) => {
      m.fullPath && total.push(...m.fullPath.split('/'));
      return total;
    }, []);
  const menuResCatagoryIdsValid = [...new Set(menuResCatagoryIds)];
  // 过滤空目录
  const asyncmenus: MenuConfigResponse[] = menuRes.filter((m) => {
    if (m.i18nConfig) {
      try {
        m.name = $t(JSON.parse(m.i18nConfig)?.name);
      } catch (error) {
        console.log(error, m);
      }
    }
    if (m.type === 'CATALOG') {
      return menuResCatagoryIdsValid.includes(m.id!);
    }
    return true;
  });
  const asyncmenusVisible = asyncmenus.filter((i) => i.visible === 1);
  const treeMenu: Menu[] = list_to_tree(asyncmenusVisible, (node) => {
    const {
      id,
      name: title,
      logo,
      linkPage,
      openMode,
      sortNum,
      children,
      parentId,
      type,
      url,
    } = node;
    const icon = logo;
    return {
      path: type === 'CATALOG' ? `/${id}` : `/${id}/${linkPage ?? 'iframe'}`,
      name: title,
      icon,
      orderNo: sortNum,
      children,
      parentId,
      openMode,
      linkPage: linkPage ?? 'iframe',
      type,
      url,
    };
  });

  const dataTransed = cloneDeep(asyncmenus);
  dataTransed.forEach((item) => {
    if (item.type === 'PERMISSION') {
      // 权限菜单转到标准菜单同级
      const p = dataTransed.find((i) => i.id === item.parentId);
      p && (item.parentId = p.parentId);
    }
  });

  let treeRouter: AppRouteRecordRaw[] = list_to_tree(dataTransed, (node) => {
    const { id, name: title, logo, sortNum, children, parentId, type, level } = node;
    const icon = logo;
    /**文件夹CATALOG */
    if (type === 'CATALOG') {
      return {
        path: '/' + id,
        name: '' + id,
        component: level === 1 ? LAYOUT : null,
        meta: { orderNo: sortNum, title, icon },
        children,
      };
    } else {
      return getRouterObj(node);
    }
  }).map((i) => {
    /**因为页面缓存的缘故 路由层级转成二级*/
    const children = (i.children || [])
      .map((i) => {
        if (!i.component) {
          return i.children;
        } else {
          return i;
        }
      })
      .flat();
    return { ...i, children };
  });

  treeRouter = [...treeRouter, ...module, ...singleRouter];
  return { treeMenu, treeRouter };
}

const getRouterObj = (node) => {
  const {
    id,
    name: title,
    logo,
    linkPage,
    openMode,
    sortNum,
    sysBuiltin,
    currentActiveMenu,
    children,
    type,
    url,
  } = node;
  const icon = logo;
  if (sysBuiltin || (type === 'STANDARD' && !/^web_|^iweb_/.test(linkPage))) {
    return {
      path: '/' + id + '/:linkPage',
      name: linkPage,
      component: RouteStaticMap[linkPage],
      meta: {
        orderNo: sortNum,
        title,
        icon,
        ignoreKeepAlive: false,
        ignoreAuth: true,
        linkPage,
        openMode,
        currentActiveMenu,
      },
      children,
    };
  } else if (type === 'LINK') {
    return {
      path: '/' + id + '/:linkPage',
      name: '' + id + 'iframe',
      component: () =>
        import('/@web-render/render/iframe.vue').then((res) => ({
          ...res.default,
          name: `${id + 'iframe'}`,
        })),
      meta: {
        orderNo: sortNum,
        title,
        icon,
        ignoreKeepAlive: true,
        ignoreAuth: true,
        linkPage: 'iframe',
        openMode,
        frameSrc: url,
      },
      children,
    };
  } else {
    return {
      path: '/' + id + '/:linkPage',
      name: '' + id + linkPage,
      component: () =>
        import('/@web-render/render/index.vue').then((res) => ({
          ...res.default,
          name: `${id + linkPage}`,
        })),
      meta: {
        orderNo: sortNum,
        title,
        icon,
        ignoreKeepAlive: true,
        ignoreAuth: true,
        linkPage,
        openMode,
      },
      children,
    };
  }
};

const module = [
  {
    path: '/render/render-mock-apaas',
    name: 'OnlineFormRenderRenderMockApaasSi',
    component: () => import('/@online-form/views/integration/apaas_si/render/PaasMockReport.vue'),
    meta: {
      orderNo: 2,
      title: 'sys.pageDesigner.fieldCmp.online_form',
      icon: 'ant-design:appstore-outlined',
      hideTab: true,
      hideMenu: true,
      ignoreAuth: true,
    },
  },
  {
    path: '/render/word-render-mock',
    name: 'OnlineFormRenderWordRenderMock',
    component: () => import('/@online-form/word-render/components/word-mock-report.vue'),
    meta: {
      orderNo: 2,
      title: 'sys.pageDesigner.fieldCmp.online_form',
      icon: 'ant-design:appstore-outlined',
      hideTab: true,
      hideMenu: true,
      ignoreAuth: true,
    },
  },
  {
    path: '/render/online-form-publish-version-preview-view',
    name: 'OnlineFormPublishVersionPreviewView',
    component: () =>
      import('/@online-form/views/designer/modules/publish-version/publish-version-preview.vue'),
    meta: {
      orderNo: 2,
      title: '电子表单发布历史预览',
      icon: 'ant-design:appstore-outlined',
      hideTab: true,
      hideMenu: true,
      ignoreAuth: true,
    },
  },
  {
    path: '/render/online-form-diff-preview-view',
    name: 'OnlineFormDiffPreviewView',
    component: () =>
      import('/@online-form/views/web-render/form/version-diff/iframe/preview-router.vue'),
    meta: {
      orderNo: 2,
      title: '电子表单版本对比预览',
      icon: 'ant-design:appstore-outlined',
      hideTab: true,
      hideMenu: true,
      ignoreAuth: true,
    },
  },
];

const singleRouter = [
  {
    path: '/single-sign-on',
    name: 'SingleSignOn',
    component: () => import('/@/views/sys/login/single-sign-on.vue'),
    meta: {
      singleSign: true,
      title: '',
    },
  },
];

const RouteStaticMap = {
  OnlineForm: () => import('/@online-form/views/web-render/form/router-view.vue'),
};
