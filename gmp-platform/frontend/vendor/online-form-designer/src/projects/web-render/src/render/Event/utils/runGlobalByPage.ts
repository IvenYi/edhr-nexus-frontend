import { getWebpageInfo } from '/@/apis/gct-apaas/WebpageController';
import { getMobilePageInfo } from '/@/apis/gct-apaas/MobilePageController';
import { getPadPageInfo } from '/@/apis/gct-apaas/PadPageController';
import {
  getAppGlobalSettingsList,
  getAppGlobalSettingsInfo,
} from '/@/apis/gct-apaas/AppGlobalSettingsController';
import { onBeforeUnmount, onMounted, nextTick, ref, toRef, onActivated, onUnmounted } from 'vue';
import { getPageDesignerLogInfo } from '/@/apis/gct-apaas/PageDesignerLogController';
import { getPermissionByKey } from '/@web-render/utils/UserappPermissions';
import { RuntimePageJson } from '/@page-designer/types/designer';
import { Router, RouteLocationNormalizedLoaded, useRoute, useRouter } from 'vue-router';
import { verificationData } from './verificationVar';
import { useCreateAppredis } from './appRedis';
import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';

const getPageApiByMap = {
  [PageTypeEnum.WEB]: {
    getPageInfo: getWebpageInfo,
  },
  [PageTypeEnum.MOBILE]: {
    getPageInfo: getMobilePageInfo,
  },
  [PageTypeEnum.PAD]: {
    getPageInfo: getPadPageInfo,
  },
};

//页面变量
export const pageGlobaVariables = ref<{ [key: string]: { value: any; type: string } }>({});
/**app全局变量 */
export const globalVarCaches = ref<{
  [key: string]: { value: string; type: string };
}>({});

export const formMap = ref<Record<string, object>>({});
/** 记录每个页面注册了哪些 formMap key */
const pageFormKeys: Record<string, Set<string>> = {};

export function setFormData(key: string, formData: object) {
  formMap.value[key] = formData;
  const pageID = Globals.pageID;
  if (!pageFormKeys[pageID]) {
    pageFormKeys[pageID] = new Set();
  }
  pageFormKeys[pageID].add(key);
}
/**页面信息 */
export const pageDataforJson = ref<{
  pageStyle?: RuntimePageJson['pageStyle'];
  pageConfig?: RuntimePageJson['pageConfig'];
  pageName?: string;
}>({
  pageStyle: {},
  pageConfig: {},
  pageName: '',
});
/**页面信息 */
export const getPageTitle = toRef(() => {
  const { title, i18n } = pageDataforJson.value.pageConfig || {};
  return title;
});
/**页面全局事件 */
export default class Globals {
  static router: Router;
  static route: RouteLocationNormalizedLoaded;
  /**模态框缓存 */
  static modalsCache: { [key: string]: RuntimePageJson['modals'][number] } = {};
  /**
   * 上下文缓存
   */
  static pageID = '';
  static permissions = {};
  // static
  static ContextCache = {};
  /**常量刷新锁 */
  static startRuning = false;
  /**全局钩子 */
  static globalHookCaches: {
    pageMounted: Function[];
    pageActivated: Function[];
    pageDestroyed: Function[];
  } = {
    pageMounted: [],
    pageActivated: [],
    pageDestroyed: [],
  };
  /**
   * 设置模态框
   * @param list
   */
  static setModals(list?: RuntimePageJson['modals']) {
    this.modalsCache = {};
    list?.forEach((i) => {
      this.modalsCache[i.id!] = i;
    });
  }
  /**获取模态框信息 */
  static async getModalById(key) {
    if (!key) return Promise.reject();
    if (/^i?g_modal_/.test(key) && !this.modalsCache[key]) {
      //蒋异步组件存入缓存
      const [res] = (await getAppGlobalSettingsInfo({ keys: key, fullInfo: true })) || [];
      if (res?.configJson) {
        const modal = JSON.parse(res.configJson);
        this.modalsCache[key] = modal;
      }
    }
    const data = this.modalsCache[key];
    if (!data) {
      console.error(`模态框${key}不存在`);
      return Promise.reject();
    }

    return data;
  }
  /**
   *  角色权限
   * @param id 组件标识
   * @param isGetPerByKey permissions[id]不存在时，是否继续用getPermissionByKey获取权限配置
   */
  static getPremission(id?: string, isGetPerByKey = false) {
    if (!id) return true;
    let key = this.permissions[id];
    if (!isGetPerByKey && !key) return true;
    if (isGetPerByKey) key = id;
    return getPermissionByKey(this.pageID, key);
  }
  /**
   *设置组件权限
   * @param key 权限标识
   * @param id 组件标识
   */
  static setPremission(key: string, id: string) {
    this.permissions[id] = key;
  }
  static setContextByKey(context, key?: string) {
    if (key) {
      this.ContextCache[key] = context;
    } else {
      this.ContextCache = {
        page: context,
      };
    }
  }
  static getContextByKey(key) {
    return this.ContextCache[key || 'page'];
  }
  /**
   *获取页面变量
   */
  static async initvars() {
    const data = (await getAppGlobalSettingsList({ type: 'var', fullInfo: true })) || [];
    data.forEach((i) => {
      if (!i.configJson) return;
      try {
        const datavalue = JSON.parse(i.configJson);
        globalVarCaches.value[datavalue.key] = useCreateAppredis({
          value: datavalue.defaultValue,
          appredis: datavalue.appredis,
          key: datavalue.key,
          type: datavalue.type,
        });
      } catch (error) {
        console.error('initvars', error);
      }
    });
  }
  /**
   * 获取APP全局钩子
   */
  static async inithooks() {
    const data = (await getAppGlobalSettingsList({ type: 'event', fullInfo: true })) || [];
    data.forEach((i) => {
      if (!i.configJson) return;
      try {
        const fun = new Function(JSON.parse(i.configJson).runJs);
        this.globalHookCaches[i.key!].push(fun);
      } catch (error) {
        console.error('inithooks', error);
      }
    });
  }
  static async initPermission(permissions) {
    this.permissions = permissions || {};
  }
  static async initGlobalS(data: any) {
    this.router = useRouter();
    this.route = useRoute();
    this.setModals(data.modals);
    /**初始化页面变量 */
    data.pageVars?.forEach((i) => {
      pageGlobaVariables.value[i.key] = {
        value: i.varInfo?.defaultValue,
        type: i.varInfo.type,
      };
    });
    if (this.startRuning) return;
    this.startRuning = true;
    try {
      await Promise.all([this.initvars(), this.inithooks()]);
    } catch (error) {
      console.log(error);
    }
  }
  static getGlobalVar(id: string): any {
    const data = globalVarCaches.value[id];
    if (!data) return console.warn('变量key不存在');
    return data.value;
  }
  static async setGlobalVar(id: string, value): any {
    const data = globalVarCaches.value[id];
    if (!data) return console.warn('变量key不存在');
    await verificationData(value, data.type);
    data.value = value;
  }
  /**
   * 获取页面变量
   * @param key
   * @returns
   */
  static getPageVar(key: string) {
    const data = pageGlobaVariables.value[key];
    if (!data) return console.warn('变量key不存在');
    return data.value;
  }
  /**
   *设置页面变量
   * @param key
   * @param value
   */
  static async setPageVar(key: string, value: any) {
    const data = pageGlobaVariables.value[key];
    if (!data) return console.warn('变量key不存在');
    await verificationData(value, data.type);
    pageGlobaVariables.value[key].value = value;
  }
  /**
   * 获取页面全局变量老版本兼容问题暂时不删除 后续不维护
   * @param key
   * @returns
   */
  static getPageGlobalVar(key: string) {
    return pageGlobaVariables.value[key].value;
  }
  /**设置页面变量老版本 兼容问题暂时不删除 后续不维护*/
  static setPageGlobalVar(key: string, value: any) {
    if (pageGlobaVariables.value[key]) {
      pageGlobaVariables.value[key].value = value;
    } else {
      pageGlobaVariables.value[key] = { value, type: 'string' };
    }
  }
  static async initPageByid(id: string, pageType: PageTypeEnum = PageTypeEnum.WEB) {
    this.pageID = id;
    const getJSon = getPageApiByMap[pageType].getPageInfo;
    const res = await getJSon(
      { id },
      // location.href.includes('PagePreview')
      //   ? { transferToConfig: { headers: { Env: 'dev' } } }
      //   : {},
    );
    const { runtimeJson, name } = res || {};
    pageDataforJson.value.pageName = name;
    if (!runtimeJson) return Promise.reject();
    const data = JSON.parse(runtimeJson);
    if (!data.widgets.filter((item) => item.type !== 'bottom-button-container').length)
      return Promise.reject();
    await this.initGlobalS(data);
    pageDataforJson.value.pageConfig = data.pageConfig || {};
    pageDataforJson.value.pageStyle = data.pageStyle || {};
    return { res, data, name };
  }
  static async initHistoryByid(id: string) {
    this.pageID = id;
    const res = await getPageDesignerLogInfo({ id });
    const { runtimeJson, name } = res || {};
    if (!runtimeJson) return Promise.reject();
    pageDataforJson.value.pageName = name;
    const data = JSON.parse(runtimeJson);
    await this.initGlobalS(data);
    pageDataforJson.value.pageConfig = data.pageConfig || {};
    pageDataforJson.value.pageStyle = data.pageStyle || {};
    return { res, data, name };
  }
  /**注册钩子 */
  static usePageHooks(
    Event,
    pageEvents: RuntimePageJson['pageEvents'],
    globalEvents: RuntimePageJson['globalEvents'],
    pageCallback,
  ) {
    /**页面加载 */
    const pageload = ref(false);
    const pageID = this.pageID;
    onMounted(async () => {
      await nextTick();
      const pageBeforeMountData = pageEvents?.pageBeforeMount || {};
      if (pageBeforeMountData.name) {
        /**页面钩子 */
        /**异步执行保存内部组件初始化 */
        await Event.runExportByName(pageBeforeMountData.name, pageBeforeMountData.extraParams);
      }
      /**自定义初始化回调 */
      pageCallback && (await pageCallback(Event));
      pageload.value = true;
      /**全局钩子 */
      if (globalEvents.pageMounted) {
        for (const fun of this.globalHookCaches.pageMounted) {
          await fun();
        }
      }
      const { extraParams, name } = pageEvents?.pageMounted || {};
      if (name) {
        /**页面钩子 */
        /**异步执行保存内部组件初始化 */
        Event.runAsyncExportByName(name, extraParams);
      }
    });
    onBeforeUnmount(async () => {
      /**清空页面data */
      pageDataforJson.value = {};
      const { extraParams, name } = pageEvents?.pageDestroyed || {};
      if (name) {
        /**页面钩子 */
        /**页面销毁时候的钩子函数 */
        Event.runExportByName(name, extraParams);
      }
      /**全局钩子 */
      if (globalEvents.pageDestroyed) {
        for (const fun of this.globalHookCaches.pageDestroyed) {
          await fun();
        }
      }
    });
    onActivated(async () => {
      this.pageID = pageID;
      //跳转回缓存页面后重新复位上下文
      Globals.setContextByKey(Event.context);
      /**全局钩子 */
      if (globalEvents.pageActivated) {
        for (const fun of this.globalHookCaches.pageActivated) {
          await fun();
        }
      }
      const { extraParams, name } = pageEvents?.pageActivated || {};
      if (name) {
        /**页面钩子 */
        /**异步执行保存内部组件初始化 */
        Event.runAsyncExportByName(name, extraParams);
      }
    });
    onUnmounted(() => {
      const keys = pageFormKeys[pageID];
      if (keys) {
        keys.forEach((k) => {
          delete formMap.value[k];
        });
        delete pageFormKeys[pageID];
      }
    });
    return { pageload };
  }
}

export const getPremission = Globals.getPremission.bind(Globals);
