import { reactive, ref, unref, computed } from 'vue';
import type { Tenant } from '/@/apis/gct-platform/model';
import { useDeploySetting, DeployModeEnum } from '/@/hooks/platform/useDeploySetting.ts';
import { getTenantInfoByPortOrDomain } from '/@/apis/gct-platform/TenantController';

const IP_REG = /^http:\/\/\d{1,3}(\.\d{1,3}){3}:(\d{1,5})$/;
const HOST_REG = /^https?:\/\/([a-z0-9]+)-test\./;

/** 测试环境 */
const testEnv = ref<boolean>(false);
/** 测试环境租户 */
const testTenantData: Tenant = reactive({});
/** 平台地址 */
const platformOrigin =
  process.env.NODE_ENV === 'development' ? import.meta.env.VITE_GLOBAL_HOST : location.origin;
/** 域名访问模式 */
const isHostMode = ref<boolean>(HOST_REG.test(platformOrigin));

const { deploySetting } = useDeploySetting();

export function useEnv() {
  /**单应用登录 */
  const isAppSingle =
    /\/web-single\/|dev-single\/|test-single\//.test(location.pathname) ||
    deploySetting.deployMode === DeployModeEnum.INDEPENDENT_APP;
  /** 沙箱环境 */
  const isSandbox = /\/web-sandbox\/|\/mobile-sandbox\/|\/pad-sandbox\//.test(location.pathname);
  /**应用前端运行时 */
  const isAppRun =
    /\/web-render|\/web\/|web-single\/|dev-single\/|test-single\/|web-sandbox\//.test(
      location.pathname,
    );
  /**应用前端运行时生产环境包含测试环境 */
  const isAppProd = /\/web\/|\/web-single\//.test(location.pathname);
  /**应用前端运行时预览环境 */
  const isAppPreview = /\/web-render\//.test(location.pathname);
  /** dev环境单应用 */
  const isDevSingleEnv = /\/dev-single\//.test(location.pathname);
  /** 模块独立登录(bi) */
  const isAloneModule = /\/gct-bi/.test(location.pathname);

  /**
   * 检测是否为测试环境
   * @param loadTenant 是否加载租户信息
   */
  async function checkIsTestEnv(loadTenant = true) {
    let matches: RegExpMatchArray | null = null;
    if (isHostMode.value) {
      // 域名
      matches = platformOrigin.match(HOST_REG);
      testEnv.value = !!(matches && matches[1]);
      if (unref(testEnv) && loadTenant) {
        const res = await getTenantInfoByPortOrDomain({
          domain: matches![1],
        });
        Object.assign(testTenantData, res);
      }
    } else {
      // ip
      matches = platformOrigin.match(IP_REG);
      const port = matches && matches[2];
      if (port) {
        const res = await getTenantInfoByPortOrDomain({
          port,
        });
        Object.assign(testTenantData, res);
        testEnv.value = res?.testEnvPort === port;
      }
    }
  }
  const isTestEnv = computed(() => {
    return /\/test-single\//.test(location.pathname) || testEnv.value;
  });

  function getEnv() {
    if (isTestEnv.value) {
      return 'test';
    } else if (isAppProd) {
      return 'prod';
    } else if (isSandbox) {
      return 'sbx';
    } else {
      return 'dev';
    }
  }
  return {
    isAppSingle,
    isSandbox,
    isAppRun,
    isAppProd,
    isAppPreview,
    isAloneModule,
    platformOrigin,
    isHostMode,
    getEnv,
    isTestEnv,
    isDevSingleEnv,
    checkIsTestEnv,
    testTenantData,
  };
}
