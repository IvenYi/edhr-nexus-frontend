import type { Router } from 'vue-router';
import { ref } from 'vue';
import { getLicenseModuleAuth } from '/@/apis/gct-platform/LicenseController';

const pathWhiteList = ['/bi-data-management/data-resource', '/bi-data-management/data-set', '/bi-data-analysis/data-screen']; 

export function createBiGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    if (pathWhiteList.includes(to.path)) {
      /** 获取BI是否有授权 */
      const hasBILicense = await getLicenseModuleAuth();
      if (!hasBILicense) {
        router.push({ path: '/bi-404' });
        return true;
      } else {
        next();
      }
    } else {
      next();
    }
  })
}
