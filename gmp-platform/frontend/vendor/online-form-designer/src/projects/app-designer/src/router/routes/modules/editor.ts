import type { AppRouteModule } from '/@/router/types';

const module: AppRouteModule = {
  path: '/script-editor/:scriptId',
  name: 'ScriptEditor',
  component: () => import('/@app-designer/views/script-editor/editor.vue'),
  meta: {
    orderNo: 2,
    title: 'sys.editor.editorTitle',
    icon: 'ant-design:appstore-outlined',
    hideTab: true,
    hideMenu: true,
  },
};

export default module;
