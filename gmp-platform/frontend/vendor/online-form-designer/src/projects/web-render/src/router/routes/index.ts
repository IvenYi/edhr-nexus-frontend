import type { RouteRecordRaw } from 'vue-router';

const LOCAL_DESIGNER_PATH = '/Online-form-designer/__local__';
type LocalRouteRecordRaw = RouteRecordRaw & {
  name: string;
  meta: Record<string, any>;
};

function redirectToLocalDesigner() {
  return { path: LOCAL_DESIGNER_PATH, query: { local: '1' } };
}

export const RootRoute: LocalRouteRecordRaw[] = [
  {
    path: '/',
    name: 'Root',
    beforeEnter: redirectToLocalDesigner,
    meta: {
      title: '',
      ignoreAuth: true,
    },
  },
  {
    path: '/home',
    name: 'Home',
    beforeEnter: redirectToLocalDesigner,
    meta: {
      title: '',
      ignoreAuth: true,
    },
  },
];

const OnlineFormDesignerRoute: LocalRouteRecordRaw = {
  path: '/Online-form-designer/:id',
  name: 'OnlineFormDesigner',
  component: () => import('/@app-designer/views/online-form/design.vue'),
  meta: {
    orderNo: 1,
    title: 'sys.pageDesigner.fieldCmp.online_form',
    hideTab: true,
    hideMenu: true,
    ignoreAuth: true,
  },
};

const OnlineFormPreviewRoute: LocalRouteRecordRaw = {
  path: '/render/render-mock-apaas',
  name: 'OnlineFormRenderMock',
  component: () => import('/@online-form/views/designer/modules/local-preview.vue'),
  meta: {
    orderNo: 2,
    title: 'sys.pageDesigner.fieldCmp.online_form',
    hideTab: true,
    hideMenu: true,
    ignoreAuth: true,
  },
};

export const basicRoutes = [
  ...RootRoute,
  OnlineFormDesignerRoute,
  OnlineFormPreviewRoute,
  {
    path: '/:path(.*)*',
    name: 'DesignerNotFound',
    beforeEnter: redirectToLocalDesigner,
    meta: {
      title: '',
      ignoreAuth: true,
    },
  },
];
