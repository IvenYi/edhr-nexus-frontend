import type { AppRouteModule } from '/@/router/types';
import { PAAS_LAYOUT } from '/@/router/constant';
import PlatformMenuLayout from '/@/layouts/platform/platform-menu-layout.vue';

const module: AppRouteModule = {
  path: '/integration',
  name: 'IntegrationCenter',
  component: PlatformMenuLayout,
  redirect: '/integration/printer',
  meta: {
    orderNo: 3,
    title: 'sys.menu.integration',
    icon: 'iconfont:icon-jichengzhongxin',
  },
  children: [
    {
      path: 'printer',
      name: 'IntegrationPrinter',
      component: () => import('/@developer-center/views/integration/printer.vue'),
      meta: {
        title: 'sys.menu.printerManagement',
        standbyHomePage: true,
      },
    },
    {
      path: 'message',
      name: 'IntegrationMessage',
      component: () => import('/@developer-center/views/integration/message.vue'),
      meta: {
        title: 'sys.menu.messageTemplateManagement',
        standbyHomePage: true,
      },
    },
    {
      path: 'data-source',
      name: 'IntegrationDataSource',
      component: () => import('/@developer-center/views/integration/data-source.vue'),
      meta: {
        title: 'sys.menu.dataSourceManagement',
        standbyHomePage: true,
      },
    },
    {
      path: 'api-management',
      name: 'IntegrationApiManagement',
      component: () => import('/@developer-center/views/integration/api-management.vue'),
      meta: {
        title: 'sys.menu.apiManagement',
        standbyHomePage: true,
      },
    },
    {
      path: 'connection/flow',
      name: 'IntegrationConnectionFlow',
      component: () => import('/@ipaas/views/connection/flow.vue'),
      meta: {
        title: 'sys.menu.connectionFlow',
        standbyHomePage: true,
      },
    },
    {
      path: 'connection/connector',
      name: 'IntegrationConnectorSetting',
      component: () => import('/@ipaas/views/connection/connector.vue'),
      meta: {
        title: 'sys.menu.connectorSetting',
        standbyHomePage: true,
      },
    },
    {
      path: 'device-interconnection',
      name: 'DeviceInterconnection',
      component: () => import('/@developer-center/views/integration/device-interconnection.vue'),
      meta: {
        title: 'sys.menu.deviceInterconnection',
        standbyHomePage: true,
      },
    },
    // {
    //   path: 'knowledge/summary',
    //   name: 'IntegrationKnowledgeSummary',
    //   component: () => import('/@ipaas/views/knowledge/summary.vue'),
    //   meta: {
    //     title: 'sys.menu.knowledgeSummary',
    //   },
    // },
    // {
    //   path: 'knowledge/summary/docs/:id',
    //   name: 'IntegrationKnowledgeSummaryDocs',
    //   component: () => import('/@ipaas/views/knowledge/docs.vue'),
    //   meta: {
    //     title: 'sys.menu.knowledgeSummary',
    //     currentActiveMenu: '/integration/knowledge/summary',
    //     hideMenu: true,
    //     hideTab: true,
    //   },
    // },
    // {
    //   path: 'knowledge/management',
    //   name: 'IntegrationKnowledgeManagement',
    //   component: () => import('/@ipaas/views/knowledge/management.vue'),
    //   meta: {
    //     title: 'sys.menu.knowledgeManagement',
    //   },
    // },
    // {
    //   path: 'knowledge/management/docs/:id',
    //   name: 'IntegrationKnowledgeManagementDocs',
    //   component: () => import('/@ipaas/views/knowledge/docs.vue'),
    //   meta: {
    //     title: 'sys.menu.knowledgeManagement',
    //     currentActiveMenu: '/integration/knowledge/management',
    //     hideMenu: true,
    //     hideTab: true,
    //   },
    // },
  ],
};

export default module;
