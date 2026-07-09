// axios配置  可自行根据项目进行更改，只需更改该文件即可，其他文件可以不动
// The axios configuration can be changed according to the project, just change the file, other files can be left unchanged

import type { AxiosResponse } from 'axios';
import { clone } from 'lodash-es';
import type { RequestOptions, Result } from '/#/axios';
import type { AxiosTransform, CreateAxiosOptions } from './axiosTransform';
import { VAxios } from './Axios';
import { checkStatus } from './checkStatus';
import { useGlobSetting } from '/@/hooks/setting';
import { useMessage } from '/@/hooks/web/useMessage';
import { RequestEnum, ResultEnum, ContentTypeEnum } from '/@/enums/httpEnum';
import { isString, isUnDef, isNull, isEmpty } from '/@/utils/is';
import { getAuthCache, getToken } from '/@/utils/auth';
import { setObjToUrlParams, deepMerge } from '/@/utils';
import { useErrorLogStoreWithOut } from '/@/store/modules/errorLog';
import { useI18n } from '/@/hooks/web/useI18n';
import { joinTimestamp, formatRequestDate } from './helper';
import axios, { AxiosHeaders } from 'axios';
import { useBranch } from '/@/hooks/develop/useBranch';
import { useEnv } from '/@/hooks/develop/useEnv';
import { accountNumberLock } from '../accountNumberLock';
import { LOCALE_KEY, TENANT_KEY, TIMEZONE_KEY, USER_INFO_KEY } from '/@/enums/cacheEnum';

const ProjectName = {
  TENANT_CENTER: 'tenant-center',
  APP_DESIGNER: 'app-designer',
  WEB_RENDER: 'web-render',
  BACKEND_MANAGEMENT: 'backend-management',
  DEVELOPER_CENTER: 'developer-center',
} as const;
type ProjectNameValue = (typeof ProjectName)[keyof typeof ProjectName];

const globSetting = useGlobSetting();
const urlPrefix = globSetting.urlPrefix;
const { createMessage, createErrorModal, createSuccessModal } = useMessage();
const { branchId } = useBranch();
const { getEnv, isTestEnv, isAppSingle, isSandbox } = useEnv();

const ErrorMsgObj = {};

async function getUserStoreWithOutLazy() {
  const { useUserStoreWithOut } = await import('/@/store/modules/user');
  return useUserStoreWithOut();
}

async function redirectToTenantLazy() {
  const { getCurrentRouter } = await import('/@/hooks/web/useRouter');
  getCurrentRouter().push({ name: 'Tenant' });
}

export function applyRequestHeaders(config: any, options?: any) {
  const token = getToken();
  const cachedUserInfo = getAuthCache<any>(USER_INFO_KEY) || {};
  const cachedTenant = getAuthCache<any>(TENANT_KEY);
  const cachedTenantId = cachedTenant?.id || cachedTenant?.tenantId || cachedTenant;
  const cachedLocale = getAuthCache<any>(LOCALE_KEY);
  const currentProject = location.pathname.includes('/web-render/')
    ? ProjectName.WEB_RENDER
    : ProjectName.APP_DESIGNER;
  const pathParts = location.pathname.replace('/src/projects', '').split('/');
  const aid = pathParts[2];

  if (!config.headers) {
    config.headers = new AxiosHeaders();
  }

  /** Token */
  if (token && config?.requestOptions?.withToken !== false) {
    config.headers['Token'] = options?.authenticationScheme
      ? `${options.authenticationScheme} ${token}`
      : token;
  }

  /** timezone */
  config.headers.timezone = getAuthCache<string>(TIMEZONE_KEY) || 'UTC+08:00';

  /** Env */
  if (!config.headers['Env']) {
    if (getEnv() === 'sbx') {
      /**应用前台标识 */
      config.headers['Is-Preview'] = true;
      config.headers['Env'] = getEnv();
    } else if (isTestEnv.value) {
      config.headers['Env'] = 'test';
    } else if (currentProject === ProjectName.WEB_RENDER) {
      /**应用前台标识 */
      config.headers['Is-Preview'] = true;
      config.headers['Env'] = getEnv();
    } else if (config.url?.includes('gct-apaas')) {
      config.headers['Env'] = 'dev';
      // 判断是否匹配到 "env" 参数
      const match = location.hash.match(/[?&]env=([^&#]*)/);
      if (match) {
        config.headers['Env'] = decodeURIComponent(match[1]);
      }
    }
  } else if (config.headers['Env'] === 'undefined') {
    // 接口调用出控制删除 "Env" 头
    config.headers['Env'] = undefined;
  }

  /** App user api mapping */
  const AppUserApiPathMap: Record<string, string> = {
    '/gct-platform/api/tenant/management/org': '/gct-apaas/api/app-org',
    '/gct-platform/api/tenant/management/user': '/gct-apaas/api/app-user',
    '/gct-platform/api/app-granted-user': '/gct-apaas/api/app-granted-user',
    '/gct-platform/api/user/tenant/tmpl': '/gct-platform/api/user/tenant/tmpl4App',
    '/gct-platform/api/user/tenant/import': '/gct-platform/api/user/tenant/import4App',
    '/gct-platform/api/user/org/tenant/tmpl': '/gct-platform/api/user/org/tenant/tmpl4App',
    '/gct-platform/api/user/org/tenant/import': '/gct-platform/api/user/org/tenant/import4App',
  };

  const curAppUserApiPath = Object.keys(AppUserApiPathMap).find((item) =>
    config.url?.includes(item),
  );

  /** App-Tag */
  if (!config.headers['App-Tag']) {
    if (config.url?.includes('gct-apaas')) {
      config.headers['App-Tag'] = aid;
    } else if (currentProject === ProjectName.WEB_RENDER && curAppUserApiPath) {
      // 应用中，用户组织相关接口通过替换成应用内部的相关接口
      // platSeat suiteSeat 强制 false
      if (config.data && 'platSeat' in config.data) config.data.platSeat = false;
      if (config.data && 'suiteSeat' in config.data) config.data.suiteSeat = false;

      config.url = config.url?.replace(curAppUserApiPath, AppUserApiPathMap[curAppUserApiPath]);

      config.headers['App-Tag'] = aid;
    } else if (config.url?.includes('gct-ipaas') && currentProject === ProjectName.WEB_RENDER) {
      // 应用中的ipaas接口给appid否则是__platform__
      config.headers['App-Tag'] = aid;
    } else {
      config.headers['App-Tag'] = '__platform__';
    }
  }

  /** Branch */
  if (
    !config.headers['Branch-Id'] &&
    !config.skipBranchId &&
    branchId.value &&
    config.headers['Env'] === 'dev'
  ) {
    config.headers['Branch-Id'] = branchId.value;
  }

  /** 根据接口 自动携带Tenant-Id请求头 如果手动指定过则跳过 */
  if (config.headers.tenantId) {
    config.headers['Tenant-Id'] = config.headers.tenantId;
  } else if (cachedTenantId) {
    config.headers['Tenant-Id'] = cachedTenantId;
  }

  /** Module 添加模块信息 */
  if (
    [ProjectName.TENANT_CENTER, ProjectName.APP_DESIGNER, ProjectName.WEB_RENDER].includes(
      currentProject as ProjectNameValue,
    )
  ) {
    config.headers['Module'] = 'TENANT_CENTER';
  } else if (currentProject === ProjectName.BACKEND_MANAGEMENT) {
    config.headers['Module'] = 'BACKEND_MANAGEMENT';
  } else if (currentProject === ProjectName.DEVELOPER_CENTER) {
    config.headers['Module'] = 'DEVELOPER_CENTER';
  }

  /** 根据接口 自动携带source请求头 如果手动指定过则跳过 */
  if (!config.headers.source) {
    config.headers['Source'] = 501;
  }

  /** Lang */
  config.headers['Lang'] = cachedLocale?.locale || 'zh-CN';

  /** join user header 请求头携带用户信息 */
  if (config.requestOptions?.joinUserToHeader) {
    cachedUserInfo.userId && (config.headers['User-Id'] = cachedUserInfo.userId);

    cachedUserInfo.fullname &&
      (config.headers['Username'] = encodeURIComponent(cachedUserInfo.fullname));
  }

  /** custom header 如果存在自定义请求头，则添加到请求头中 */
  const customHeader = sessionStorage.getItem('customRequestHeader');

  if (customHeader) {
    config.headers = { ...config.headers, ...JSON.parse(customHeader) };
  }

  return config;
}

/**
 * @description: 数据处理，方便区分多种处理方式
 */
const transform: AxiosTransform = {
  /**
   * @description: 处理响应数据。如果数据不是预期格式，可直接抛出错误
   */
  transformResponseHook: (res: AxiosResponse<Result>, options: RequestOptions) => {
    const { t } = useI18n();
    const { isTransformResponse, isReturnNativeResponse, displayError } = options;
    // 是否返回原生响应头 比如：需要获取响应头时使用该属性
    if (isReturnNativeResponse) {
      return res;
    }
    // 不进行任何处理，直接返回
    // 用于页面代码可能需要直接获取 code，data，message 这些信息时开启
    if (!isTransformResponse) {
      return res.data;
    }

    // 错误的时候返回

    const { data } = res;
    if (!data) {
      // return '[HTTP] Request has no return value';
      throw new Error(t('sys.apiRequestFailed'));
    }
    //  这里 code，result，message为 后台统一的字段，需要在 types.ts内修改为项目自己的接口返回格式
    const { code, message, subMessage, subCode } = data;

    // 这里逻辑可以根据项目进行修改
    const hasSuccess = data && Reflect.has(data, 'code') && code === ResultEnum.SUCCESS;
    if (hasSuccess) {
      let successMsg = message;

      if (isNull(successMsg) || isUnDef(successMsg) || isEmpty(successMsg)) {
        successMsg = t(`sys.operationSuccess`);
      }

      if (options.successMessageMode === 'modal') {
        createSuccessModal({ title: t('sys.successTip'), content: successMsg });
      } else if (options.successMessageMode === 'message') {
        createMessage.success(successMsg);
      }
      return data.data;
    }
    // 在此处根据自己项目的实际情况对不同的code执行不同的操作
    // 如果不希望中断当前请求，请return数据，否则直接抛出异常即可
    let timeoutMsg = '';
    switch (code) {
      case ResultEnum.TIMEOUT:
        timeoutMsg = t('sys.timeoutMessage');
        getUserStoreWithOutLazy().then((userStore) => {
          userStore.setToken(undefined);
          userStore.logout(true);
        });
        break;
      case 402:
        setTimeout(() => {
          if (isAppSingle || isSandbox) {
            getUserStoreWithOutLazy().then((userStore) => userStore.logout(true));
          } else {
            window.location.href = `${location.origin}${
              import.meta.env.VITE_PATHNAME_PROTAL
            }#/home`;
          }
        }, 3000);
        break;
      default:
        if (message) {
          timeoutMsg = message;
        }
        if (subCode === 'sys.global.tenantId.required') {
          /**未选择租户 */
          redirectToTenantLazy();
        }
        // 账号锁定特殊处理
        if (subCode === 'sys.plat.api.pass.failure.over.max_times') {
          accountNumberLock(data.data);
        }
    }

    const errorMsg = subMessage || timeoutMsg;

    // errorMessageMode='modal'的时候会显示modal错误弹窗，而不是消息提示，用于一些比较重要的错误
    if (options.errorMessageMode === 'modal') {
      // 账号锁定特殊处理
      if (subCode !== 'sys.plat.api.pass.failure.over.max_times') {
        createErrorModal({ title: t('sys.errorTip'), content: errorMsg });
      }
    } else if (options.errorMessageMode === 'none') {
      // 不弹消息
    } else {
      if (!ErrorMsgObj[errorMsg]) {
        ErrorMsgObj[errorMsg] = createMessage.error(errorMsg);
        ErrorMsgObj[errorMsg].then(() => {
          delete ErrorMsgObj[errorMsg];
        });
      }
    }

    // throw new Error(errorMsg || t('sys.apiRequestFailed'));
    return Promise.reject(displayError ? data : errorMsg || t('sys.apiRequestFailed'));
  },

  // 请求之前处理config
  beforeRequestHook: (config, options) => {
    const {
      apiUrl,
      joinPrefix,
      joinParamsToUrl,
      formatDate,
      joinTime = true,
      urlPrefix,
      joinApiUrl,
      transferToConfig,
      ignoreParamsToData = false,
      onUploadProgress,
      signal,
    } = options;

    if (onUploadProgress) {
      config.onUploadProgress = onUploadProgress;
    }

    if (signal) {
      config.signal = signal;
    }

    if (transferToConfig) {
      Object.assign(config, transferToConfig);
    }
    //此处为了兼容之前已经对接过的接口 后续需要把||的删除
    if (joinPrefix || (!config.url?.startsWith('/gct-') && !config.url?.endsWith('__.json'))) {
      config.url = `${urlPrefix}${config.url}`;
    }

    if (apiUrl && isString(apiUrl) && joinApiUrl) {
      config.url = `${apiUrl}${config.url}`;
    }
    const params = config.params || {};
    const data = config.data || false;
    if (config.method?.toUpperCase() === RequestEnum.GET) {
      if (!isString(params)) {
        // 给 get 请求加上时间戳参数，避免从缓存中拿数据。
        config.params = Object.assign(params || {});
      } else {
        // 兼容restful风格
        config.url = config.url + params + `${joinTimestamp(joinTime, true)}`;
        config.params = undefined;
      }
    } else {
      if (!isString(params)) {
        formatDate && formatRequestDate(params);
        if (
          Reflect.has(config, 'data') &&
          config.data &&
          (Object.keys(config.data).length > 0 ||
            config.data instanceof FormData ||
            config.data instanceof Array)
        ) {
          config.data = data;
          config.params = params;
        } else if (!ignoreParamsToData) {
          // 非GET请求如果没有提供data，则将params视为data
          config.data = params;
          config.params = undefined;
        }
        if (joinParamsToUrl) {
          config.url = setObjToUrlParams(
            config.url as string,
            Object.assign({}, config.params, config.data),
          );
        }
      } else {
        // 兼容restful风格
        config.url = config.url + params;
        config.params = undefined;
      }
    }
    return config;
  },

  /**
   * @description: 请求拦截器处理
   */
  requestInterceptors: (config, options) => {
    return applyRequestHeaders(config, options);
  },

  /**
   * @description: 响应拦截器处理
   */
  responseInterceptors: (res: AxiosResponse<any>) => {
    return res;
  },

  /**
   * @description: 响应错误处理
   */
  responseInterceptorsCatch: (axiosInstance: AxiosResponse, error: any) => {
    const { t } = useI18n();
    console.debug('error', error);

    const errorLogStore = useErrorLogStoreWithOut();
    errorLogStore.addAjaxErrorInfo(error);
    const { response, code, message, config } = error || {};
    const errorMessageMode = config?.requestOptions?.errorMessageMode || 'none';
    const msg: string = response?.data?.error?.message ?? '';
    const err: string = error?.toString?.() ?? '';
    let errMessage = '';

    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    try {
      if (code === 'ECONNABORTED' && message.indexOf('timeout') !== -1) {
        errMessage = t('sys.apiTimeoutMessage');
      }
      if (err?.includes('Network Error')) {
        errMessage = t('sys.networkExceptionMsg');
      }

      if (errMessage) {
        if (errorMessageMode === 'modal') {
          createErrorModal({ title: t('sys.errorTip'), content: errMessage });
        } else if (errorMessageMode === 'message') {
          createMessage.error(errMessage);
        }
        return Promise.reject(error);
      }
    } catch (error) {
      throw new Error(error as unknown as string);
    }

    checkStatus(error?.response?.status, msg, errorMessageMode);

    // 添加自动重试机制 保险起见 只针对GET请求
    // const retryRequest = new AxiosRetry();
    // const { isOpenRetry } = config.requestOptions.retryRequest;
    // config.method?.toUpperCase() === RequestEnum.GET &&
    //   isOpenRetry &&
    //   // @ts-ignore
    //   retryRequest.retry(axiosInstance, error);
    return Promise.reject(error);
  },
};

function createAxios(opt?: Partial<CreateAxiosOptions>) {
  return new VAxios(
    // 深度合并
    deepMerge(
      {
        // See https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication#authentication_schemes
        // authentication schemes，e.g: Bearer
        // authenticationScheme: 'Bearer',
        authenticationScheme: '',
        timeout: 2 * 60 * 1000 * 1000,
        // 基础接口地址
        // baseURL: globSetting.apiUrl,

        headers: {
          'Content-Type': ContentTypeEnum.JSON,
        },
        // 如果是form-data格式
        // headers: { 'Content-Type': ContentTypeEnum.FORM_URLENCODED },
        // 数据处理方式
        transform: clone(transform),
        // 配置项，下面的选项都可以在独立的接口请求中覆盖
        requestOptions: {
          // 默认将prefix 添加到url
          joinPrefix: false,
          // 默认将apiUrl地址拼到路径
          joinApiUrl: true,
          // 是否返回原生响应头 比如：需要获取响应头时使用该属性
          isReturnNativeResponse: false,
          // 需要对返回数据进行处理
          isTransformResponse: true,
          // post请求的时候添加参数到url
          joinParamsToUrl: false,
          // 格式化提交参数时间
          formatDate: true,
          // 消息提示类型
          errorMessageMode: 'message',
          // 接口地址
          apiUrl: globSetting.apiUrl,
          // 接口拼接地址
          urlPrefix: urlPrefix,
          //  是否加入时间戳
          joinTime: true,
          // 忽略重复请求
          ignoreCancelToken: true,
          // 是否携带token
          withToken: true,
          retryRequest: {
            isOpenRetry: true,
            count: 3,
            waitTime: 500,
          },
        },
      },
      opt || {},
    ),
  );
}
export const defHttp = createAxios();

// other api url
// export const otherHttp = createAxios({
//   requestOptions: {
//     apiUrl: 'xxx',
//     urlPrefix: 'xxx',
//   },
// });
