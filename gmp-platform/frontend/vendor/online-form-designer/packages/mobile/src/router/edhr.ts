import { createRouter, createWebHashHistory } from 'vue-router';
import { AccessToken } from '@mobile/stores/loginHooks';
import { MATERIAL_STATUS_ENUM, TASK_TYPE__ENUM } from '@mobile/views/edhr/_utils_/interface';

const PAGE_HEADER_LAYOUT = () => import('@mobile/layouts/page-header-layout.vue');
const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@mobile/views/edhr/guide.vue'),
    },
    {
      path: '/login',
      name: 'login',
      meta: {},
      component: () => import('@mobile/views/login/index.vue'),
    },
    {
      path: '/tenant',
      name: 'tenant',
      meta: {},
      component: () => import('@mobile/views/login/tenant.vue'),
    },
    {
      path: '/edit-password',
      name: 'edit-password',
      meta: {},
      component: () => import('@mobile/views/login/edit-password.vue'),
    },
    {
      path: '/user',
      name: 'user',
      meta: {},
      component: () => import('@mobile/views/edhr/basic/user.vue'),
    },
    {
      path: '/message',
      name: 'message',
      meta: {},
      component: () => import('@mobile/views/edhr/basic/message.vue'),
    },
    {
      path: '/edhr',
      name: 'edhr',
      component: () => import('@mobile/views/edhr/index.vue'),
      children: [
        {
          path: 'loading',
          name: 'basic-loading',
          meta: {},
          component: () => import('@mobile/views/edhr/basic/loading.vue'),
        },
        // {
        //   path: 'filling',
        //   name: 'edhr-filling',
        //   meta: {},
        //   component: () => import('@mobile/views/edhr/biz/filling/index.vue'),
        // },
        {
          path: 'audit',
          name: 'edhr-audit',
          meta: {},
          component: () => import('@mobile/views/edhr/biz/audit/index.vue'),
        },
        {
          path: 'workbench',
          name: 'edhr-workbench',
          meta: {},
          component: () => import('@mobile/views/edhr/biz/workbench/index.vue'),
        },
      ],
    },
    {
      path: '/edhr-filling',
      name: 'edhr-filling',
      meta: {},
      component: () => import('@mobile/views/edhr/biz/edhrFilling/index.vue'),
    },
    {
      path: '/form-filling',
      name: 'form-filling',
      meta: {},
      component: () => import('@mobile/views/edhr/biz/formFilling/index.vue'),
    },
    {
      path: '/biz',
      component: () => import('@mobile/views/edhr/biz/layout.vue'),
      children: [
        {
          path: 'produce',
          name: 'edhr-produce',
          meta: {
            navTitle: '批次生产',
            material_status_: MATERIAL_STATUS_ENUM.LOT,
            task_type_: TASK_TYPE__ENUM.PRODUCTION,
            runName: 'edhr-produce-run',
          },
          component: () => import('@mobile/views/edhr/biz/padProduce/index.vue'),
        },
        {
          path: 'produce-sn',
          name: 'edhr-produce-sn',
          meta: {
            navTitle: 'SN生产',
            material_status_: MATERIAL_STATUS_ENUM.SN,
            task_type_: TASK_TYPE__ENUM.PRODUCTION,
            runName: 'edhr-produce-sn-run',
          },
          component: () => import('@mobile/views/edhr/biz/padProduce/index.vue'),
        },
        {
          path: 'produce-run',
          name: 'edhr-produce-run',
          meta: {
            navTitle: '批次生产',
            material_status_: MATERIAL_STATUS_ENUM.LOT,
            task_type_: TASK_TYPE__ENUM.PRODUCTION,
          },
          component: () => import('@mobile/views/edhr/biz/padProduce/run.vue'),
        },
        {
          path: 'produce-sn-run',
          name: 'edhr-produce-sn-run',
          meta: {
            navTitle: 'SN生产',
            material_status_: MATERIAL_STATUS_ENUM.SN,
            task_type_: TASK_TYPE__ENUM.PRODUCTION,
          },
          component: () => import('@mobile/views/edhr/biz/padProduce/run.vue'),
        },
        {
          path: 'rework',
          name: 'edhr-rework',
          meta: {
            navTitle: '批次返工',
            material_status_: MATERIAL_STATUS_ENUM.LOT,
            task_type_: TASK_TYPE__ENUM.REWORK,
            runName: 'edhr-rework-run',
          },
          component: () => import('@mobile/views/edhr/biz/padProduce/index.vue'),
        },
        {
          path: 'rework-run',
          name: 'edhr-rework-run',
          meta: {
            navTitle: '批次返工 ',
            material_status_: MATERIAL_STATUS_ENUM.LOT,
            task_type_: TASK_TYPE__ENUM.REWORK,
          },
          component: () => import('@mobile/views/edhr/biz/padProduce/rework-run.vue'),
        },
        {
          path: 'rework-sn',
          name: 'edhr-rework-sn',
          meta: {
            navTitle: 'SN返工',
            material_status_: MATERIAL_STATUS_ENUM.SN,
            task_type_: TASK_TYPE__ENUM.REWORK,
            runName: 'edhr-rework-sn-run',
          },
          component: () => import('@mobile/views/edhr/biz/padProduce/index.vue'),
        },
        {
          path: 'rework-sn-run',
          name: 'edhr-rework-sn-run',
          meta: {
            material_status_: MATERIAL_STATUS_ENUM.SN,
            task_type_: TASK_TYPE__ENUM.REWORK,
            navTitle: 'SN返工 ',
          },
          component: () => import('@mobile/views/edhr/biz/padProduce/rework-run.vue'),
        },
      ],
    },
    {
      path: '/other',
      component: PAGE_HEADER_LAYOUT,
      children: [
        {
          path: 'info',
          name: 'info',
          meta: {
            title: '基础信息',
          },
          component: () => import('@mobile/views/main/user/info.vue'),
        },
        {
          path: 'password',
          name: 'password',
          meta: {
            title: '修改密码',
          },
          component: () => import('@mobile/views/main/user/password.vue'),
        },
      ],
    },

    // 模拟填报-用于开发调试
    {
      path: '/mock-report',
      name: 'mock-report',
      component: () => import('@mobile/views/edhr/iframe/mock-report.vue'),
    },
  ],
});
router.beforeEach(async (to, from, next) => {
  if (from.name === 'login' && !AccessToken.value) {
    next(false);
    return;
  }
  next();
});

(window as any).___router = router;

export default router;
