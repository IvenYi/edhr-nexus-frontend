import { defineStore } from 'pinia';
import { store } from '/@/store';
import {
  deleteTenentApiReq,
  getTenantPageListApiRes,
  tenantChangeApiReq,
  ResponseType,
  userFilterApiReq,
  tenantPageListReq,
} from '/@backend-management/views/tenant/types/tenant';
import {
  getTenantPageListApi,
  deleteTenantApi,
  saveTenantApi,
  tenantChangeApi,
  getTenantInfoApi,
  getUserListApi,
  getOrgListApi,
} from '/@backend-management/views/tenant/api/tenant';
import { getTenantGetTencentByDomain } from '/@/apis/gct-platform/TenantController';
import type { Tenant } from '/@/apis/gct-platform/model';

interface TenantState {
  selectedTenant: string | null;
  selectedTenantInfo?: Tenant;
}

export const useTenantStore = defineStore({
  id: 'tenant',
  state: (): TenantState => {
    return {
      selectedTenant: null,
      selectedTenantInfo: {},
    };
  },
  getters: {
    getCurrentTenant(state) {
      return state.selectedTenant;
    },
    getSelectedTenantInfo(state) {
      return state.selectedTenantInfo;
    },
  },
  actions: {
    setCurrentTenant(tenant) {
      this.selectedTenant = tenant;
    },
    // 获取分页数据
    async getTenantPageList(params?: Partial<tenantPageListReq>): Promise<getTenantPageListApiRes> {
      try {
        const data = await getTenantPageListApi(params);
        return data;
      } catch (err) {
        return Promise.reject(err);
      }
    },

    // 新增租户
    async saveTenant(params) {
      await saveTenantApi(params);
    },

    // 删除租户
    async deleteTenant(params: deleteTenentApiReq): Promise<ResponseType> {
      const data = await deleteTenantApi(params);
      return data;
    },

    //修改租户
    async tenantChange(params: tenantChangeApiReq, id: string): Promise<any> {
      await tenantChangeApi(params, id);
    },

    // 租户信息
    async getTenantInfo(params) {
      const data = await getTenantInfoApi(params);
      return data;
    },

    // 管理员列表
    async getUserList(params: userFilterApiReq) {
      const data = await getUserListApi(params);
      return data;
    },

    // 组织架构树
    async getOrgList() {
      const data = await getOrgListApi();
      return data;
    },
  },
});

export function useTenantStoreWithOut() {
  return useTenantStore(store);
}
