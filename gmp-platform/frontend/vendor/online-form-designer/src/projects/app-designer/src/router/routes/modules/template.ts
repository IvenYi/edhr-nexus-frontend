import type { AppRouteModule } from '/@/router/types';

const module: AppRouteModule = {
  path: '/data-template-designer/:modelKey/:tplId',
  name: 'DataTemplateDesigner',
  component: () =>
    import(
      '/@app-designer/views/model-desginer/entity/components/data-template/components/data-template-designer.vue'
    ),
  meta: {
    orderNo: 2,
    title: '数据模板',
    icon: 'ant-design:appstore-outlined',
    hideTab: true,
    hideMenu: true,
  },
};

export default module;
