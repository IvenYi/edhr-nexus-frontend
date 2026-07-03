import type { ErrorMessageMode } from '/#/axios';
import { defineStore } from 'pinia';
import { store } from '/@/store';
import { RoleEnum } from '/@/enums/roleEnum';
import { PageEnum } from '/@/enums/pageEnum';
import {
  ROLES_KEY,
  TOKEN_KEY,
  USER_INFO_KEY,
  TENANT_KEY,
  PREV_TENANT_KEY,
} from '/@/enums/cacheEnum';
import { getAuthCache, setAuthCache } from '/@/utils/auth';
import { GetUserInfoModel, LoginParams } from '/@/api/sys/model/userModel';
import {
  doLogout,
  //  getUserInfo,
  loginApi,
} from '/@/api/sys/user';
import { useI18n } from '/@/hooks/web/useI18n';
import { useMessage } from '/@/hooks/web/useMessage';
// import { router } from '/@portal/router';
import { usePermissionStore } from '/@/store/modules/permission';
import { RouteRecordRaw } from 'vue-router';
import { PAGE_NOT_FOUND_ROUTE } from '/@/router/routes/basic';
import { h } from 'vue';
import { createLocalStorage, createSessionStorage } from '/@/utils/cache';
import { getCurrentRouter } from '/@/hooks/web/useRouter';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { getUserInfo, getUserLastResetPwd } from '/@/apis/gct-platform/UserController';
import {
  getTenantGetTenantIdByAppId,
  getTenantUserInfo,
} from '/@/apis/gct-platform/TenantController';
import type { UserLoginDto, UserOfTenantDTO } from '/@/apis/gct-platform/model';
import { useEnv } from '/@/hooks/develop/useEnv';
import { Modal } from 'ant-design-vue';
import { mitt as createMitt } from '/@/utils/mitt';
import { initMqtt, mqttSubscribe, mqttPublish } from '@mobile/utils/mqtt/web';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { useSecuritySetting } from '/@/hooks/platform/useSecuritySetting';
import { OnlineControl } from '/@/utils/onlineControl';
import { getLoginUserAppAuth } from '/@/apis/gct-platform/LoginController';
import { getBrowserFingerprint, getPageIdentification } from '/@/hooks/event/userBrowser';
import { setTenant, setToken } from '@gct-paas/core';
import {
  projectNameType,
  signLogRegister,
} from '/@/projects/backend-management/src/views/operation-log/login-log/components/loginLogHook';
import { MessageMqttType, TodoMqttType } from '@gct/runtime';
import { getLicenseGetUsers } from '/@/apis/gct-platform/LicenseController';
import { LoginTypeEnum } from '/@/hooks/platform/constants';
import { getLoginLogTenantLog } from '/@/apis/gct-platform/LoginLogController';

const ls = createLocalStorage();
const ss = createSessionStorage({
  hasEncrypt: false,
});
const selectTenant = ls.get(TENANT_KEY) || null;
const { isTestEnv, testTenantData, getEnv, isAppSingle, isAppRun, isSandbox, isAloneModule } =
  useEnv();
const mitt = createMitt();
const { createMessage } = useMessage();

async function openPasswordModal(userLastPwdInfo) {
  const { usePasswordModal } = await import('/@/views/sys/passwordModal/passwordModal');
  const { open } = usePasswordModal();
  return open(userLastPwdInfo);
}

interface UserState {
  userInfo: Nullable<UserLoginDto>;
  userPermissions: Record<string, boolean>;
  token?: string;
  roleList: RoleEnum[];
  sessionTimeout?: boolean;
  lastUpdateTime: number;
  tenantId: string;
  tenantUserInfo?: UserOfTenantDTO;
  tenantUserPermissions?: Record<string, boolean>;
  appUserPermissions?: {
    appSuperAdmin: 0 | 1;
    permissions: Record<string, boolean>;
  };
}

// mqtt 遗嘱消息会话延迟时间(单位: 秒)
const willDelayInterval = 20;

export const useUserStore = defineStore({
  id: 'app-user',
  state: (): UserState => {
    return {
      // user info
      userInfo: null,
      userPermissions: {},
      // token
      token: undefined,
      // roleList
      roleList: [],
      // Whether the login expired
      sessionTimeout: false,
      // Last fetch time
      lastUpdateTime: 0,
      //selected tenant Id
      tenantId: selectTenant,
      // 当前租户中的用户信息
      tenantUserInfo: {},
      tenantUserPermissions: {},

      //当前应用中用户的权限
      appUserPermissions: {
        appSuperAdmin: 0,
        permissions: {},
      },
    };
  },
  getters: {
    getUserInfo(state): UserLoginDto {
      return state.userInfo || getAuthCache<UserLoginDto>(USER_INFO_KEY) || {};
    },
    getUserPermissions(state) {
      return state.userPermissions;
    },
    getToken(state): string {
      return state.token || getAuthCache<string>(TOKEN_KEY);
    },
    getRoleList(state): RoleEnum[] {
      return state.roleList.length > 0 ? state.roleList : getAuthCache<RoleEnum[]>(ROLES_KEY);
    },
    getSessionTimeout(state): boolean {
      return !!state.sessionTimeout;
    },
    getLastUpdateTime(state): number {
      return state.lastUpdateTime;
    },
    getTenant(state) {
      if (window._gct && !_gct.store.tenantId) {
        _gct.store.setTenantId(selectTenant);
      }
      return state.tenantId;
    },
    getTenantList(state) {
      const userInfo = state.userInfo || getAuthCache<UserLoginDto>(USER_INFO_KEY) || {};
      return userInfo.tenantList || [];
    },
    getTenantUserInfo(state) {
      return state.tenantUserInfo;
    },
    getTenantUserPermissions(state) {
      return state.tenantUserPermissions;
    },
    getAppUserPermissions(state) {
      return state.appUserPermissions;
    },
  },
  actions: {
    setTenant(tenantId: string, reload = true) {
      this.tenantId = tenantId ? tenantId : '';
      ls.set(TENANT_KEY, tenantId);
      if (tenantId) {
        ls.set(PREV_TENANT_KEY, tenantId);
      }
      // cookie 设置一份
      setTenant(tenantId);
      if (window._gct) {
        _gct.store.setTenantId(tenantId);
      }
      if (reload) {
        window.location.reload();
      } else {
        this.getTenantUserInfoAction();
      }
    },
    setToken(info: string | undefined) {
      this.token = info ? info : ''; // for null or undefined value
      setToken(info);
      setAuthCache(TOKEN_KEY, info);
    },
    setRoleList(roleList: RoleEnum[]) {
      this.roleList = roleList;
      setAuthCache(ROLES_KEY, roleList);
    },
    setUserInfo(info: UserLoginDto | null) {
      if (!info) {
        this.userInfo = null;
        setAuthCache(USER_INFO_KEY, null);
        return;
      }
      this.userInfo = {
        ...info!,
        minioDomain: '/minio',
      };
      this.lastUpdateTime = new Date().getTime();
      setAuthCache(USER_INFO_KEY, info);
    },
    setSessionTimeout(flag: boolean) {
      this.sessionTimeout = flag;
    },
    resetState() {
      this.userInfo = null;
      this.token = '';
      this.roleList = [];
      this.sessionTimeout = false;
    },
    /**
     * 修改部分用户信息
     */
    setSomeUserInfo(data) {
      const info = { ...this.userInfo, ...data };
      this.setUserInfo(info);
    },
    /**
     * @description: login
     */
    async login(
      params: LoginParams & {
        goHome?: boolean;
        mode?: ErrorMessageMode;
      },
      cb?: () => void,
    ): Promise<GetUserInfoModel | null> {
      try {
        const { goHome = true, mode, authCode, ...loginParams } = params;

        if (authCode == LoginTypeEnum.MICROSOFT + '_LOGIN') {
          sessionStorage.setItem('signWay', authCode);
          const hashParams = new URLSearchParams(window.location.hash.split('?')[1]);
          const tokenUrl = hashParams.get('token');
          console.log('tokenUrl', tokenUrl);
          // 单应用登录单独走逻辑
          if (isAppSingle || isSandbox) {
            return this.afterLoginSingleApp(tokenUrl, true);
          }
          this.setToken(tokenUrl);
        } else {
          const data = await loginApi(loginParams, mode, authCode);
          // 刷卡登录成功后调用回调函数
          if (cb && typeof cb === 'function' && authCode === LoginTypeEnum.CARD) {
            cb();
          }
          const { token, signWay } = data;
          console.log('data-----', data);
          sessionStorage.setItem('signWay', signWay);
          // 单应用登录单独走逻辑
          if (isAppSingle || isSandbox) {
            return this.afterLoginSingleApp(token);
          }
          // save token
          this.setToken(token);
        }

        // 重置密码逻辑
        // const userLastPwdInfo = await getUserLastResetPwd();
        // if (userLastPwdInfo?.needChangePass) {
        //   open();
        // }
        return this.afterLoginAction(goHome);
      } catch (error) {
        return Promise.reject(error);
      }
    },
    async afterLoginSanbox() {
      const userInfo = await this.getUserInfoAction();
      const href = window.location.href.split('#')[0];
      const appId = href.split('/')[href.split('/').length - 1];
      getTenantGetTenantIdByAppId({ appId }).then((tenant) => {
        this.setTenant(tenant as string, false);
        window.location.href = href;
      });
      return userInfo;
    },
    async afterLoginSingleApp(token, flag?: false): Promise<GetUserInfoModel | null> {
      // get user info
      const userInfo = await this.getUserInfoAction(token);

      const userStore = useUserStore();
      const href = window.location.href.split('#')[0];
      const appId = href.split('/')[href.split('/').length - 1];
      const env = getEnv();
      const fingerprint = await getBrowserFingerprint();
      const clientId = `web.${userInfo?.userId}.${env}.${appId}.${
        userStore?.getUserInfo?.ip
      }.${fingerprint}.${new Date().getTime()}`;
      try {
        await getLoginUserAppAuth(
          {
            clientId,
            appId,
          },
          {
            transferToConfig: {
              headers: { Token: token, browser: fingerprint, pagetag: getPageIdentification() },
            },
          },
        );
      } catch (e) {
        if (flag) {
          console.log('e-------', e);
          // router.replace(PageEnum.BASE_LOGIN);
          location.href = `${location.origin}${location.pathname}#/login`;
          location.reload();
        }
        return null;
      }

      this.setToken(token);
      const appInfoStore = useAppInfoStore();
      const permissionStore = usePermissionStore();
      signLogRegister(
        projectNameType[permissionStore.currentProject],
        appInfoStore?.appInfo?.id,
        this.tenantId,
      );

      await getLicenseGetUsers({ appId, env, clientId });
      // 重置密码逻辑
      await getUserLastResetPwd().then((userLastPwdInfo) => {
        if (
          userLastPwdInfo?.needChangePass ||
          userLastPwdInfo?.needChangeSignPass ||
          userLastPwdInfo?.needSetSignPass
        ) {
          openPasswordModal(userLastPwdInfo);
        } else {
          // 通过appid拿到租户id
          getTenantGetTenantIdByAppId({ appId }).then((tenant) => {
            getLoginLogTenantLog({ tenantId: tenant as string });
            this.setTenant(tenant as string, false);
            window.location.href = href;
          });
        }
      });

      return userInfo;
    },
    async afterLoginAction(goHome?: boolean): Promise<GetUserInfoModel | null> {
      if (!this.getToken) return null;
      // get user info
      const userInfo = await this.getUserInfoAction();

      const sessionTimeout = this.sessionTimeout;
      if (sessionTimeout) {
        this.setSessionTimeout(false);
      } else {
        const permissionStore = usePermissionStore();
        const router = getCurrentRouter();
        window.console.log(router);
        if (!permissionStore.isDynamicAddedRoute) {
          const routes = await permissionStore.buildRoutesAction();
          routes.forEach((route) => {
            router.addRoute(route as unknown as RouteRecordRaw);
          });
          router.addRoute(PAGE_NOT_FOUND_ROUTE as unknown as RouteRecordRaw);
          permissionStore.setDynamicAddedRoute(true);
        }
        const hasTenantId = userInfo?.tenantList.find((item) => item.id === this.getTenant);
        if (isTestEnv.value) {
          // 测试环境指定域名对应的租户
          this.setTenant(testTenantData.id, false);
          const appInfoStore = useAppInfoStore();
          signLogRegister(
            projectNameType[permissionStore.currentProject],
            appInfoStore?.appInfo?.id,
            this.tenantId,
          );
          goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
        } else if (userInfo!.tenantList.length > 0 && !this.getTenant && !hasTenantId) {
          if (userInfo?.tenantList.length === 1) {
            this.setTenant(userInfo?.tenantList[0].id, false);
            getLoginLogTenantLog({ tenantId: userInfo?.tenantList[0].id });
            signLogRegister('WORKTABLE', '', userInfo?.tenantList[0].id);
            goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
          } else {
            const lastLoginTenant = userInfo.tenantList.find((item) => item.latestLogin === 1);
            if (lastLoginTenant) {
              this.setTenant(lastLoginTenant.id, false);
              signLogRegister('WORKTABLE', '', lastLoginTenant.id);
              goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
            } else {
              goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_TENANT));
            }
          }
        } else if (
          userInfo!.tenantList?.length === 0 &&
          (userInfo!.globalSuperAdmin || userInfo?.platformManager)
        ) {
          // goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
          location.href = `${location.origin}${import.meta.env.VITE_PATHNAME_BACKEND_MANAGEMENT}`;
        } else {
          goHome && (await router.replace(userInfo?.homePath || PageEnum.BASE_HOME));
        }
      }
      return userInfo;
    },

    async getUserInfoAction(token?): Promise<UserLoginDto | undefined | null> {
      if (!this.getToken && !token) return null;
      const userInfo = await getUserInfo(
        token ? { transferToConfig: { headers: { Token: token } } } : {},
      );
      // const { roles = [] } = userInfo;
      // if (isArray(roles)) {
      //   const roleList = roles.map((item) => item.value) as RoleEnum[];
      //   this.setRoleList(roleList);
      // } else {
      //   userInfo.roles = [];
      //   this.setRoleList([]);
      // }

      // todo 针对表达式iframe的特殊处理
      // todo 针对预览iframe的特殊处理

      const { securitySetting } = useSecuritySetting();

      // 如果用户无操作时连接保留时长部门不生效的人员范围，关闭定时器
      const notExistUserIds = securitySetting.inapplicablePerson
        ? securitySetting.inapplicablePerson
            .filter((e) => e.includes(`USER:`))
            .map((e) => e.replace(/USER:/, ''))
        : [];
      if (userInfo?.userId && notExistUserIds.includes(userInfo.userId)) {
        OnlineControl.closeControl();
      }

      const notExistOrgIds = securitySetting.inapplicablePerson
        ? securitySetting.inapplicablePerson
            .filter((e) => e.includes(`ORG:`))
            .map((e) => e.replace(/ORG:/, ''))
        : [];
      if (userInfo?.orgIds?.length) {
        userInfo.orgIds.some((i) => notExistOrgIds.includes(i)) && OnlineControl.closeControl();
      }

      if (
        location.hash !== '#/expression' &&
        location.hash !== '#/PagePreview' &&
        window.self === window.top &&
        !isAppSingle &&
        !isSandbox
      ) {
        const userLastPwdInfo = await getUserLastResetPwd();
        if (
          userLastPwdInfo?.needChangePass ||
          userLastPwdInfo?.needChangeSignPass ||
          userLastPwdInfo?.needSetSignPass
        ) {
          openPasswordModal(userLastPwdInfo);
        }
      }

      // todo 剔除无入口页面的权限点
      this.userPermissions = (userInfo?.platformManagerPermissions ?? []).reduce((map, item) => {
        map[item] = true;
        return map;
      }, {});

      this.setUserInfo(userInfo!);
      // 连接mqtt
      if (userInfo && userInfo.userId && userInfo.mqttProperties) {
        const appInfoStore = useAppInfoStore();
        const userStore = useUserStore();
        const permissionStore = usePermissionStore();
        if (this.getToken && !(isTestEnv.value && !this.tenantId)) {
          let appId = appInfoStore?.appInfo?.id;
          let currentProject = permissionStore.currentProject;
          if (permissionStore.currentProject === 'bi-designer') {
            const match = window.location.pathname.match(/\/bi-designer\/([^/]+)/);
            appId = match ? (getEnv() === 'dev' && match[1] === 'index.html' ? '' : match[1]) : '';
            // 如果pathname为/bi时直接跳转到bi看板
            if (isAloneModule) {
              appId = undefined;
              currentProject = 'developer-center';
            }
          }
          signLogRegister(projectNameType[currentProject], appId, this.tenantId);
        }

        const env = isTestEnv.value ? 'TEST' : isSandbox ? 'SBX' : 'PROD';
        /**踢出主题 */
        const KICK_OUT_TOPIC = `USER/${userInfo.userId}/KICK_OUT`;
        /**新建消息主题 */
        const INTERNAL_MESSAGE_TOPIC = `${env}/USER/${this.tenantId}/${userInfo.userId}/INTERNAL_MESSAGE`;
        /**我的代办数量主题 */
        const TASK_TODO_COUNT_TOPIC = `${env}/USER/${this.tenantId}/${userInfo.userId}/TASK_TODO_COUNT`;
        /** 强制刷新主题 */
        const CLEAN_CACHE = `CLEAN_CACHE`;
        const topic = 'users/control/msg';
        const logoutTopic = 'users/logout/msg';
        const props = {
          ...userInfo.mqttProperties,
          topics: [KICK_OUT_TOPIC, INTERNAL_MESSAGE_TOPIC, TASK_TODO_COUNT_TOPIC, CLEAN_CACHE],
        };
        const fingerprint = await getBrowserFingerprint();
        if (appInfoStore?.appInfo?.id) {
          const { id, name } = appInfoStore.appInfo;
          const env = getEnv();
          if (['test', 'prod', 'sbx'].includes(env) || isAppRun) {
            const onlineNumTopic = `${id}/${env}/ONLINE_COUNT`;

            const clientId = `web.${userStore?.getUserInfo?.userId}.${env}.${id}.${
              userStore?.getUserInfo?.ip
            }.${fingerprint}.${new Date().getTime()}`;

            const exitTopic = `web.${userStore?.getUserInfo?.userId}.${env}.${id}.${userStore?.getUserInfo?.ip}.${fingerprint}/EXIT`;
            const message = {
              clientId: clientId,
              msg: 'online',
            };

            initMqtt({
              ...props,
              opts: {
                clientId: clientId,
                will: {
                  topic,
                  payload: JSON.stringify({
                    clientId: clientId,
                    msg: 'exit',
                  }),
                },
              },
            });

            initMqtt({
              ...props,
              opts: {
                clientId: 'logout' + fingerprint + getPageIdentification(),
                protocolVersion: 5,
                clean: false,
                sessionExpiryInterval: willDelayInterval * 2,
                will: {
                  topic: logoutTopic,
                  payload: JSON.stringify({
                    appId: id,
                    ipAddress: userStore?.getUserInfo?.ip,
                    signLog: `${userStore?.getUserInfo?.userId}.${getEnv()}.${fingerprint}.${
                      projectNameType[permissionStore.currentProject]
                    }.web.${getPageIdentification()}`,
                    tenantId: this.tenantId,
                  }),
                  qos: 1,
                  retain: true,
                  willDelayInterval: willDelayInterval,
                  messageExpiryInterval: willDelayInterval * 10,
                  properties: {
                    willDelayInterval: willDelayInterval,
                    messageExpiryInterval: willDelayInterval * 10,
                  },
                },
                properties: {
                  sessionExpiryInterval: willDelayInterval * 2,
                },
              },
            });
            mqttSubscribe(onlineNumTopic);
            mqttSubscribe(exitTopic);

            mqttSubscribe(topic);
            /**发送在线消息*/
            mqttPublish(topic, JSON.stringify(message));

            mitt.off(`mqtt-${onlineNumTopic}`);
            mitt.off(`mqtt-${exitTopic}`);
            mitt.off('mqtt-app-exit');
            mitt.off('mqtt-app-online-exit');
            mitt.on('mqtt-app-online-exit', () => {
              mqttPublish(
                topic,
                JSON.stringify({
                  clientId: clientId,
                  msg: 'exit',
                }),
              );
            });
            mitt.on('mqtt-app-exit', () => {
              mqttPublish(
                logoutTopic,
                JSON.stringify({
                  appId: id,
                  ipAddress: userStore?.getUserInfo?.ip,
                  signLog: `${userStore?.getUserInfo?.userId}.${getEnv()}.${fingerprint}.${
                    projectNameType[permissionStore.currentProject]
                  }.web.${getPageIdentification()}`,
                  tenantId: this.tenantId,
                }),
              );
            });

            mitt.on(`mqtt-${exitTopic}`, () => {
              createMessage.error(`您已被移出应用【${name}】，请稍后再试。`);
              setTimeout(() => {
                if (isAppSingle || isSandbox) {
                  this.logout(true);
                } else {
                  window.location.href = `${location.origin}${
                    import.meta.env.VITE_PATHNAME_PROTAL
                  }#/home`;
                }
              }, 1000);
            });
            mitt.on(`mqtt-${onlineNumTopic}`, (msg: any) => {
              mitt.emit('update-online-count', msg?.count ?? 0);
              ss.set('suite-app-online-count', msg?.count ?? 0);
            });
          } else {
            initMqtt({
              ...props,
              opts: {
                clientId: 'logout' + fingerprint + getPageIdentification(),
                protocolVersion: 5,
                clean: false,
                sessionExpiryInterval: willDelayInterval * 2,
                will: {
                  topic: logoutTopic,
                  payload: JSON.stringify({
                    appId: id,
                    ipAddress: userStore?.getUserInfo?.ip,
                    signLog: `${userStore?.getUserInfo?.userId}.${getEnv()}.${fingerprint}.${
                      projectNameType[permissionStore.currentProject]
                    }.web.${getPageIdentification()}`,
                    tenantId: this.tenantId,
                  }),
                  qos: 1,
                  retain: true,
                  willDelayInterval: willDelayInterval,
                  messageExpiryInterval: willDelayInterval * 10,
                  properties: {
                    willDelayInterval: willDelayInterval,
                    messageExpiryInterval: willDelayInterval * 10,
                  },
                },
                properties: {
                  sessionExpiryInterval: willDelayInterval * 2,
                },
              },
            });
          }
        } else {
          initMqtt({
            ...props,
            opts: {
              clientId: 'logout' + fingerprint + getPageIdentification(),
              protocolVersion: 5,
              clean: false,
              sessionExpiryInterval: willDelayInterval * 2,
              will: {
                topic: logoutTopic,
                payload: JSON.stringify({
                  appId: '',
                  ipAddress: userStore?.getUserInfo?.ip,
                  signLog: `${userStore?.getUserInfo?.userId}.${getEnv()}.${fingerprint}.${
                    projectNameType[permissionStore.currentProject]
                  }.web.${getPageIdentification()}`,
                  tenantId: this.tenantId,
                }),
                qos: 1,
                retain: true,
                willDelayInterval: willDelayInterval,
                messageExpiryInterval: willDelayInterval * 10,
                properties: {
                  willDelayInterval: willDelayInterval,
                  messageExpiryInterval: willDelayInterval * 10,
                },
              },
              properties: {
                sessionExpiryInterval: willDelayInterval * 2,
              },
            },
          });
        }
        // 避免重复订阅，在新的订阅前先取消前序订阅
        mitt.off(`mqtt-${KICK_OUT_TOPIC}`);
        mitt.off(`mqtt-${INTERNAL_MESSAGE_TOPIC}`);
        mitt.off(`mqtt-${TASK_TODO_COUNT_TOPIC}`);
        mitt.off(`mqtt-${CLEAN_CACHE}`);

        // 订阅登出信息
        mitt.on(`mqtt-${KICK_OUT_TOPIC}`, (msg: any) => {
          const tokenId = msg.token;
          const token = this.getToken;
          if (token && token === tokenId) {
            if (appInfoStore?.appInfo?.id) {
              mitt.emit('mqtt-app-exit');
              mitt.emit('mqtt-app-online-exit');
            }

            // 退出登录
            Modal.warning({
              title: '登录警告',
              content: '当前账号已在其他设备登录',
              onOk: async () => {
                this.logout();
              },
            });
          }
        });
        const usePathQuery = usePathQueryStore();
        const appId = usePathQuery.getAid();
        // 订阅消息中心信息

        mitt.on(`mqtt-${INTERNAL_MESSAGE_TOPIC}`, (msg: MessageMqttType) => {
          console.log('INTERNAL_MESSAGE_TOPIC', msg);
          if (isAppRun && appId === msg.appMessageCount.appId) {
            mitt.emit('update-message-count', msg.appMessageCount.unreadCount);
          }
          if (!isAppRun) {
            mitt.emit('update-message-count', msg.totalUnreadCount);
          }
        });
        // 我的代办
        mitt.on(`mqtt-${TASK_TODO_COUNT_TOPIC}`, (msg: TodoMqttType) => {
          console.log('TASK_TODO_COUNT_TOPIC', msg);
          if (isAppRun && appId === msg.appMessageCount.appId) {
            mitt.emit('process-center-todo', msg.appMessageCount.count);
          }
          if (!isAppRun) {
            mitt.emit('process-center-todo', msg.Count);
          }
        });
        // 强制刷新
        mitt.on(`mqtt-${CLEAN_CACHE}`, (_msg: any) => {
          const currentUrl = window.location.href;
          if (currentUrl.includes('?')) {
            // 如果是reloadTime
            if (currentUrl.includes('reloadTime')) {
              const arr = currentUrl.split('reloadTime=');
              arr[1] = Date.now().toString();
              window.location.href = arr.join('reloadTime=');
            } else {
              window.location.href = currentUrl + '&reloadTime=' + Date.now();
            }
          } else {
            window.location.href = currentUrl + '?reloadTime=' + Date.now();
          }
          // location.reload(true);
        });
      }
      // 获取租户用户信息
      // await this.getTenantUserInfoAction();
      await this.getTenantUserInfoAction(token ? token : '');
      return userInfo;
    },
    async getTenantUserInfoAction(token?) {
      if (!this.tenantId) return;
      const res = await getTenantUserInfo(
        token ? { transferToConfig: { headers: { Token: token } } } : {},
      );
      const { securitySetting } = useSecuritySetting();
      this.tenantUserInfo = res;
      // 如果用户无操作时连接保留时长部门不生效的人员范围，关闭定时器
      const notExistUserIds = securitySetting.inapplicablePerson
        ? securitySetting.inapplicablePerson
            .filter((e) => e.includes(`ORG:`))
            .map((e) => e.replace(/ORG:/, ''))
        : [];
      if (res.masterOrgId && notExistUserIds.includes(res.masterOrgId)) {
        OnlineControl.closeControl();
        // console.log('closeControl');
      }

      // todo 剔除无入口页面的权限点
      this.tenantUserPermissions = (res?.tenantManagerPermissions ?? []).reduce((map, item) => {
        map[item] = true;
        return map;
      }, {});
    },

    /**
     * @description: logout
     */
    async logout(goLogin = false) {
      if (this.getToken) {
        try {
          await doLogout();
        } catch {
          console.log('注销Token失败');
        }
      }
      this.setToken(undefined);
      this.setSessionTimeout(false);
      this.setUserInfo(null);
      this.setTenant(null, false);
      sessionStorage.removeItem('currentPlatOrAppId');
      sessionStorage.removeItem('signWay');
      // goLogin && router.push(PageEnum.BASE_LOGIN);
      if (goLogin) {
        // router.push(PageEnum.BASE_LOGIN);
        if (isAppSingle || isSandbox) {
          location.href = `${location.origin}${location.pathname}#/login`;
          location.reload();
          return;
        }
        // 通过/bi登录bi看板后退出时的处理
        const ssModulePath = sessionStorage.getItem('ALONE_MODULE_PATH');
        if (ssModulePath) {
          sessionStorage.removeItem('ALONE_MODULE_PATH');
          location.href = `${location.origin}${ssModulePath}#/login`;
          return;
        }

        location.href = location.origin;
      }
    },

    /**
     * @description: Confirm before logging out
     */
    confirmLoginOut() {
      const { createConfirm } = useMessage();
      const { t } = useI18n();
      createConfirm({
        iconType: 'warning',
        title: () => h('span', t('sys.app.logoutTip')),
        content: () => h('span', t('sys.app.logoutMessage')),
        onOk: async () => {
          await this.logout(true);
        },
      });
    },
  },
});

// Need to be used outside the setup
export function useUserStoreWithOut() {
  return useUserStore(store);
}
