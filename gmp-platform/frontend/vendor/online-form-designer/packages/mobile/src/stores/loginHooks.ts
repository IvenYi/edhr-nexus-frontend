import { useStorage } from '@vueuse/core';
import {
  postLoginSign,
  getLoginUserAppAuth,
  getLoginSignOut,
} from '@mobile/apis/gct-platform/LoginController';
import CryptoJS from 'crypto-js';
import { getUserInfo } from '@mobile/apis/gct-platform/UserController';
import type { UserTenantDTO, UserLoginResp } from '@mobile/apis/gct-platform/model';
import {
  getTenantUserInfo,
  getTenantGetTenantIdByAppId,
} from '@mobile/apis/gct-platform/TenantController';
import { initMqtt, mqttUnSubscribe, mqttPublish } from '@mobile/utils/mqtt/android';
import { useEnv } from '@mobile/utils/useEnv';
import { useMitt } from '/@page-designer/hooks/useMitt';
import { showDialog } from 'vant';
import { getASuiteKey, getAid, getAppName } from '@mobile/stores/sessionHooks';
import { getMobileBrowserFingerprint, getPageIdentification } from '@/hooks/event/userBrowser';
import { _isAndroid } from '@mobile/utils/const';
import { useSingleApp } from '@mobile/utils/useSingleApp';
import { setToken } from '@gct-paas/core';
import { signLogRegister } from '../utils/signLog';
import { useAppStore } from '@mobile/stores/useAppStore';
import { type Router } from 'vue-router';
import { SqlitePage } from '@mobile/utils/sqlite_page';

const { isTestEnv, getEnv, isSandbox } = useEnv();
const { isPreview, branchId: androidAppBranchId } = useSingleApp();
const { mitt } = useMitt();
// mqtt 遗嘱消息会话延迟时间(单位: 秒)
const willDelayInterval = 20;
type MTenant = ReturnPromiseType<typeof getTenantUserInfo>;
export interface AutoLogin {
  auto: boolean;
  username: string;
  password: string;
}
export const AccessToken = useStorage('APP_TOKEN', '');
/**用戶信息 */
export const UserData = useStorage<UserLoginResp>('USERData', {});
/**租戶列表信息 */
export const CurrentTenant = useStorage<ArrayType<UserTenantDTO>>(
  'CurrentTenant',
  {},
  {
    getItem(key) {
      const val = localStorage.getItem(key);
      return val;
    },
    setItem(key, value) {
      localStorage.setItem(key, value);
      if (window._gct) {
        _gct.store.setTenantId(CurrentTenant.value.id);
      }
    },
    removeItem(key) {
      localStorage.removeItem(key);
    },
  },
);
/**主部門信息 */
export const MasterTenant = useStorage<MTenant>('MasterTenant', {});
export const autoLoginCache = useStorage<Partial<AutoLogin>>('defaultLoginData', {});
export async function runAutoLogin() {
  const data = <AutoLogin>autoLoginCache.value;
  if (data.auto) {
    await appLogin(data);
    return true;
  } else {
    return false;
  }
}

export async function initUser() {
  const info = (await getUserInfo()) || {};
  UserData.value = info;
  return info;
}
/**平台mqtt 初始化 */
export async function initMqttApaas() {
  const info = UserData.value;
  const envTops = isTestEnv.value ? 'TEST' : 'PROD';
  const fingerprint = await getMobileBrowserFingerprint();
  const appStore = useAppStore();
  // 单应用模式下直接进入应用
  signLogRegister(
    appStore.appSingle ? 'APPFRONT' : 'WORKTABLE',
    appStore.appSingle ? getAid.value : '',
    CurrentTenant.value.id,
  );
  const env = getEnv();
  /**踢出主题 */
  const KICK_OUT_TOPIC = `USER/${info.userId}/KICK_OUT`;
  /**新建消息主题 */
  const INTERNAL_MESSAGE_TOPIC = `${envTops}/USER/${CurrentTenant.value.id}/${info.userId}/INTERNAL_MESSAGE`;
  /**我的代办数量主题 */
  const TASK_TODO_COUNT_TOPIC = `${envTops}/USER/${CurrentTenant.value.id}/${info.userId}/TASK_TODO_COUNT`;
  const props = {
    ...info.mqttProperties,
    topics: [KICK_OUT_TOPIC, INTERNAL_MESSAGE_TOPIC, TASK_TODO_COUNT_TOPIC],
  };
  const logoutTopic = 'users/logout/msg';
  /**新模式连接之前先断开 */
  mqttUnSubscribe();
  initMqtt({
    ...props,
    opts: {
      clientId: 'logout' + fingerprint + getPageIdentification(),
      // protocolVersion: 5,
      // clean: false,
      // sessionExpiryInterval: willDelayInterval * 2,
      will: {
        topic: logoutTopic,
        payload: JSON.stringify({
          ipAddress: info?.ip,
          signLog: `${
            info?.userId
          }.${env}.${fingerprint}.WORKTABLE.mobile.${getPageIdentification()}`,
          tenantId: CurrentTenant.value.id,
        }),
        // qos: 1,
        // retain: true,
        // willDelayInterval: willDelayInterval,
        // messageExpiryInterval: willDelayInterval * 10,
        // properties: {
        //   willDelayInterval: willDelayInterval,
        //   messageExpiryInterval: willDelayInterval * 10,
        // },
      },
      // properties: {
      //   sessionExpiryInterval: willDelayInterval * 2,
      // },
    },
  });
  // 避免重复订阅，在新的订阅前先取消前序订阅
  mitt.off(`mqtt-${KICK_OUT_TOPIC}`);
  mitt.off(`mqtt-${INTERNAL_MESSAGE_TOPIC}`);
  mitt.off(`mqtt-${TASK_TODO_COUNT_TOPIC}`);
  // 订阅登出信息
  mitt.on(`mqtt-${KICK_OUT_TOPIC}`, (msg: any) => {
    const tokenId = msg.token;
    const token = AccessToken.value;
    if (token && token === tokenId) {
      setToken(token);
      // 退出登录
      showDialog({
        title: '登录警告',
        message: '当前账号已在其他设备登录',
      }).then(() => {
        appLoginOut();
      });
    }
  });
  // 订阅消息中心信息
  mitt.on(`mqtt-${INTERNAL_MESSAGE_TOPIC}`, ({ totalUnreadCount, appMessageCount }) => {
    const { getInApp } = useAppStore();
    if (getInApp && appMessageCount.appId === getAid.value) {
      mitt.emit('update-message-count', appMessageCount.unreadCount);
    }
    if (!getInApp) {
      mitt.emit('update-message-count', totalUnreadCount);
    }
    mitt.emit('update-message-list');
  });
  // 订阅消息中心信息
  mitt.on(`mqtt-${TASK_TODO_COUNT_TOPIC}`, ({ Count, appMessageCount }: any) => {
    console.log(
      '================== 代办消息 ==================',
      Count,
      appMessageCount,
      getAid.value,
    );
    const { getInApp } = useAppStore();
    if (getInApp && appMessageCount.appId === getAid.value) {
      mitt.emit('process-center-todo', appMessageCount.count);
    }
    if (!getInApp) {
      mitt.emit('process-center-todo', Count);
    }
  });
}
/**应用内部mqtt 初始化 */
export async function initMqttApp() {
  if (['test', 'prod', 'sbx'].includes(getEnv())) {
    const info = UserData.value;
    const appStore = useAppStore();
    const envTops = isTestEnv.value ? 'TEST' : isSandbox.value ? 'SBX' : 'PROD';
    const props = {
      ...info.mqttProperties,
      topics: [
        `USER/${info.userId}/KICK_OUT`,
        `${envTops}/USER/${CurrentTenant.value.id}/${info.userId}/INTERNAL_MESSAGE`,
      ],
    };
    const fingerprint = await getMobileBrowserFingerprint();
    signLogRegister('APPFRONT', getAid.value, CurrentTenant.value.id);
    const topic = 'users/control/msg';
    const logoutTopic = 'users/logout/msg';
    const env = getEnv();
    const clientId = `mobile.${info?.userId}.${env}.${getAid.value}.${
      info?.ip
    }.${fingerprint}.${new Date().getTime()}`;
    const exitTopic = `mobile.${info?.userId}.${env}.${getAid.value}.${info?.ip}.${fingerprint}/EXIT`;
    const message = {
      clientId,
      msg: 'online',
    };
    props.topics = props.topics.concat([exitTopic]);
    /**新模式连接之前先断开 */
    mqttUnSubscribe();
    /**统计在线用户 */
    initMqtt({
      ...props,
      opts: {
        clientId,
        will: {
          topic,
          payload: JSON.stringify({
            clientId,
            msg: 'exit',
          }),
        },
      },
    }).then(() => {
      mqttPublish(topic, JSON.stringify(message));
    });
    /**app 登录登出 */
    initMqtt({
      ...info.mqttProperties,
      opts: {
        clientId: 'logout' + fingerprint + getPageIdentification(),
        // protocolVersion: 5,
        // clean: false,
        // sessionExpiryInterval: willDelayInterval * 2,
        will: {
          topic: logoutTopic,
          payload: JSON.stringify({
            appId: getAid.value,
            ipAddress: info?.ip,
            signLog: `${
              info?.userId
            }.${env}.${fingerprint}.APPFRONT.mobile.${getPageIdentification()}`,
            tenantId: CurrentTenant.value.id,
          }),
          // qos: 1,
          // retain: true,
          // willDelayInterval: willDelayInterval,
          // messageExpiryInterval: willDelayInterval * 10,
          // properties: {
          //   willDelayInterval: willDelayInterval,
          //   messageExpiryInterval: willDelayInterval * 10,
          // },
        },
        // properties: {
        //   sessionExpiryInterval: willDelayInterval * 2,
        // },
      },
    });
    mitt.off('mqtt-app-exit');
    mitt.on('mqtt-app-exit', () => {
      console.log('================== app exit ==================');
      mqttPublish(
        topic,
        JSON.stringify({
          clientId,
          msg: 'exit',
        }),
      );
    });
    mitt.off(`mqtt-${exitTopic}`);
    mitt.on(`mqtt-${exitTopic}`, () => {
      showDialog({
        title: '移出警告',
        message: `您已被移出应用【${getAppName.value || appStore.getAppName}】，请稍后再试。`,
      }).then(() => {
        // router.replace({ name: 'main' });

        if (appStore.appSingle) {
          submitLoginOut();
        } else {
          window.___router?.replace({ name: 'workbench' });
        }
      });
    });
  }
}
export async function appLogin(form: AutoLogin, config = {}) {
  const { username, password, auto } = form;
  const { token, signWay, userId, ip } =
    (await postLoginSign(
      { username, password: CryptoJS.SHA256(password).toString(CryptoJS.enc.Hex) },
      { headers: { 'Auth-Code': 'ACCOUNT' }, ...config },
    )) || {};
  const appStore = useAppStore();
  AccessToken.value = token;
  if (appStore.appSingle || isSandbox.value) {
    await afterLoginSingleApp({ token, userId, ip }, config);
  }
  if (isSandbox.value) {
    const href = window.location.href.split('#')[0];
    const appId = href.split('/')[href.split('/').length - 2];

    await appStore.pushApp(appId);
    const res = await getTenantGetTenantIdByAppId({ appId });

    appStore.setSingleApp(appId, appStore.getAppName, res, appStore.getLogoInfo);
  }

  sessionStorage.setItem('signWay', signWay);
  setToken(token!);
  autoLoginCache.value = auto ? form : {};
  await initUser();
  if (appStore.appSingle || isSandbox.value) {
    //单应用模式下自动选中租户
    CurrentTenant.value = UserData.value.tenantList?.find((i) => i.id === appStore.getTenantId);
  }
  return { ...UserData.value, appSingle: appStore.appSingle };
}
/**单应用登录校验逻辑 */
export async function afterLoginSingleApp({ token, userId, ip } = {}, config = {}) {
  const env = getEnv();
  const href = window.location.href.split('#')[0];
  const appId = getAid.value || href.split('/')[href.split('/').length - 2];
  await SqlitePage.updateAppDB(appId, config);
  const fingerprint = await getMobileBrowserFingerprint();
  await getLoginUserAppAuth(
    {
      clientId: `mobile.${userId}.${env}.${appId}.${ip}.${fingerprint}.${new Date().getTime()}`,
      appId,
    },
    {
      headers: { Token: token, browser: fingerprint, pagetag: getPageIdentification() },
      ...config,
    },
  );
}

export async function reloadUser() {
  await initUser();
  const data = await getTenantUserInfo();
  MasterTenant.value = data;

  return UserData.value;
}

/**用户手动退出登录 */
export async function submitLoginOut(pageRouter?: Router) {
  mqttUnSubscribe();
  const fingerprint = await getMobileBrowserFingerprint();
  const pageIdentification = getPageIdentification();
  await getLoginSignOut(
    {
      platform: 'WORKTABLE',
    },
    { headers: { browser: fingerprint, pagetag: pageIdentification } },
  );
  await appLoginOut(pageRouter);
  sessionStorage.removeItem('currentPlatOrAppId');
  sessionStorage.removeItem('signWay');
}
export async function appLoginOut(pageRouter?: Router): Promise<void> {
  try {
    AccessToken.value = '';
    setToken('');
    UserData.value = {};
    if (window.location.hash.startsWith('#/PagePreview')) {
      // 如果 token 过期，则跳转到 PC 端重新登录
      // 清空所有存储
      clearAllStorage();
      // 开发环境下跳转到 Vite 端口
      if (import.meta.env.DEV) {
        // 开发环境暂时不做跳转处理，方便调试
        // window.location.replace(`${window.location.protocol}//${window.location.hostname}:5173`);
      } else {
        // 生产环境下跳转到根路径，域名会被网关重定向到登录页
        window.location.replace(location.origin);
      }
    } else {
      await (pageRouter || window.___router).replace('/login');
    }
  } catch (error) {
    console.log(error);
  }
}

/**
 * 清空所有存储（cookie、localStorage、sessionStorage）
 */
function clearAllStorage(): void {
  // 清空 localStorage
  localStorage.clear();
  // 清空 sessionStorage
  sessionStorage.clear();
  // 清空所有 cookie
  clearAllCookies();
}

/**
 * 清空当前域下的所有 cookie
 */
function clearAllCookies(): void {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const eqPos = cookie.indexOf('=');
    const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
    // 设置过期时间为过去时间来删除 cookie
    document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
  }
}

export function getBranchId() {
  if (androidAppBranchId.value) return androidAppBranchId.value;
  const branchId = location.pathname
    .replace('/src/projects', '')
    .replace('/index.html', '')
    .split('/')[3];
  return branchId;
}

export function getIsMobileRender() {
  if (isPreview.value) return isPreview.value;
  return /\/mobile-render\/|\/pad-render\//.test(location.pathname) ? true : false;
}

export function getAidForLocale(): string {
  if (getAid.value) return getAid.value;
  const m = location.pathname.match(
    /\/(?:pad-render|pad-sandbox|mobile-render|mobile-sandbox)\/([^/]+)/,
  );
  return m?.[1] ?? '';
}
