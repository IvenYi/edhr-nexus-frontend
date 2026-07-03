<template>
  <div class="flex h100% w100%">
    <div class="tenant-list">
      <div
        v-for="item in tenantList"
        :key="item.id"
        :title="item.name"
        class="ell name"
        :class="{ select: activeTenant === item.id }"
        @click="changeSelectTenant(item.id)"
      >
        {{ item.name }}
      </div>
    </div>
    <div class="table-area">
      <LoginLogList platform="TENANT" :tenantId="activeTenant" />
    </div>
  </div>
</template>
<script setup lang="ts">
  import { ref } from 'vue';
  import LoginLogList from './login-log-list.vue';
  import { getTenantList } from '/@/apis/gct-platform/TenantController';
  import { TenantResponse } from '/@/apis/gct-platform/model';

  const tenantList = ref<TenantResponse[]>([]);

  const activeTenant = ref('');

  async function getTenantListData() {
    const list = await getTenantList();
    tenantList.value = list ?? [];
    activeTenant.value = tenantList.value.length ? tenantList.value[0].id : '';
  }
  getTenantListData();

  const changeSelectTenant = (id) => {
    activeTenant.value = id;
  };
</script>
<style lang="less" scoped>
  .tenant-list {
    border-right: 1px solid #e0e3ea;
    padding: 12px;
    overflow-y: auto;
    min-width: 200px;
    .name {
      height: 32px;
      border-radius: 4px 4px 4px 4px;
      padding: 0 8px;
      line-height: 32px;
    }
    .select {
      background: #dfecfa;
      color: var(--ant-primary-color);
    }
  }
  .table-area {
    width: calc(100% - 200px);
  }
</style>
