import type { Router, RouteLocationNormalized } from 'vue-router';
import { useAppStoreWithOut } from '/@/store/modules/app';
import { useUserStoreWithOut, useUserStore } from '/@/store/modules/user';
import { useTransitionSetting } from '/@/hooks/setting/useTransitionSetting';
import { AxiosCanceler } from '/@/utils/http/axios/axiosCancel';
import { Modal, notification } from 'ant-design-vue';
import { warn } from '/@/utils/log';
import { unref } from 'vue';
import { setRouteChange } from '/@/logics/mitt/routeChange';
import { createPermissionGuard } from './permissionGuard';
import { createStateGuard } from './stateGuard';
import nProgress from 'nprogress';
import projectSetting from '/@/settings/projectSetting';
import { createParamMenuGuard } from './paramMenuGuard';
import { createBiGuard } from './biPermGuard';
import { useI18n } from '/@/hooks/web/useI18n';
import { LoginTypeEnum } from '/@/hooks/platform/constants';

const userStore = useUserStore();

const userInfo = useUserStoreWithOut();

const { t } = useI18n();

// Don't change the order of creation
export function setupRouterGuard(router: Router) {
  createPageGuard(router);
  createPageLoadingGuard(router);
  createHttpGuard(router);
  createScrollGuard(router);
  createMessageGuard(router);
  createProgressGuard(router);
  createPermissionGuard(router);
  createParamMenuGuard(router); // must after createPermissionGuard (menu has been built.)
  createStateGuard(router);
  otherLogin(router);
  createBiGuard(router);
}

/**
 * Hooks for handling page state
 */
function createPageGuard(router: Router) {
  const loadedPageMap = new Map<string, boolean>();

  router.beforeEach(async (to) => {
    to.meta.loaded = !!loadedPageMap.get(to.path);
    setRouteChange(to);
    return true;
  });

  router.afterEach((to) => {
    loadedPageMap.set(to.path, true);
  });
}

const getSignWay = () => {
  // 先尝试从标准查询参数中获取
  let signWay = new URLSearchParams(window.location.search).get('signWay');
  if (signWay) return signWay;

  // 如果没找到，再从 hash 中解析
  const hash = window.location.hash;
  const queryIndex = hash.indexOf('?');
  if (queryIndex !== -1) {
    const hashParams = new URLSearchParams(hash.slice(queryIndex + 1));
    signWay = hashParams.get('signWay');
  }
  return signWay;
};

// Used to handle page loading status
function createPageLoadingGuard(router: Router) {
  const userStore = useUserStoreWithOut();
  const appStore = useAppStoreWithOut();
  const { getOpenPageLoading } = useTransitionSetting();
  router.beforeEach(async (to) => {
    if (!userStore.getToken) {
      return true;
    }
    if (to.meta.loaded) {
      return true;
    }

    if (unref(getOpenPageLoading)) {
      appStore.setPageLoadingAction(true);
      return true;
    }

    return true;
  });
  router.afterEach(async () => {
    // if (unref(getOpenPageLoading)) {
    //   // TODO Looking for a better way
    //   // The timer simulates the loading time to prevent flashing too fast,
    //   setTimeout(() => {
    //     appStore.setPageLoading(false);
    //   }, 220);
    // }
    // beforeEach中开启loading 这里需要强制关闭 无需判断是否开启
    setTimeout(() => {
      appStore.setPageLoading(false);
    }, 220);
    return true;
  });
}

/**
 * The interface used to close the current page to complete the request when the route is switched
 * @param router
 */
function createHttpGuard(router: Router) {
  const { removeAllHttpPending } = projectSetting;
  let axiosCanceler: Nullable<AxiosCanceler>;
  if (removeAllHttpPending) {
    axiosCanceler = new AxiosCanceler();
  }
  router.beforeEach(async () => {
    // Switching the route will delete the previous request
    axiosCanceler?.removeAllPending();
    return true;
  });
}

// Routing switch back to the top
function createScrollGuard(router: Router) {
  const isHash = (href: string) => {
    return /^#/.test(href);
  };

  const body = document.body;

  router.afterEach(async (to) => {
    // scroll top
    isHash((to as RouteLocationNormalized & { href: string })?.href) && body.scrollTo(0, 0);
    return true;
  });
}

/**
 * Used to close the message instance when the route is switched
 * @param router
 */
export function createMessageGuard(router: Router) {
  const { closeMessageOnSwitch } = projectSetting;

  router.beforeEach(async () => {
    try {
      if (closeMessageOnSwitch) {
        Modal.destroyAll();
        notification.destroy();
      }
    } catch (error) {
      warn('message guard error:' + error);
    }
    return true;
  });
}

export function otherLogin(router: Router) {
  router.beforeEach(async (to, from) => {
    const { userId } = userInfo.getUserInfo;
    const urlParams = new URLSearchParams(window.location.search);
    const params = Object.fromEntries(urlParams.entries());
    const signWay = getSignWay();
    console.log('hash', signWay);
    console.log('topath222', to.path);

    if (!userId && params.code && params.state.includes('FEISHU') && to.path === '/login') {
      try {
        const userInfo = await userStore.login({
          password: '-',
          username: '-',
          code: params.code,
          authCode: 'FEISHU',
        });
        if (userInfo) {
          notification.success({
            message: t('sys.loginSuccessTitle'),
            description: `${t('sys.loginSuccessDesc')}: ${userInfo.fullname}`,
            duration: 3,
          });
        }
      } catch (error) {
      } finally {
        // const { pathname, origin, hash } = location;
        // window.history.replaceState({}, '', origin + pathname + hash);
      }
    } else if (signWay && signWay == LoginTypeEnum.MICROSOFT + '_LOGIN' && to.path === '/login') {
      console.log('topath', to.path);
      sessionStorage.setItem('signWay', signWay);
      //signLogRegister('WORKTABLE', '', tenantId);
      await userStore.login({
        username: '-',
        password: '-',
        authCode: signWay,
      });
    }
  });
}

export function createProgressGuard(router: Router) {
  const { getOpenNProgress } = useTransitionSetting();
  router.beforeEach(async (to) => {
    if (to.meta.loaded) {
      return true;
    }
    unref(getOpenNProgress) && nProgress.start();
    return true;
  });

  router.afterEach(async () => {
    unref(getOpenNProgress) && nProgress.done();
    return true;
  });
}
