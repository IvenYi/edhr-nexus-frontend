<template>
  <a-dropdown>
    <div class="tenant-box">
      <span class="iconfont icon-gongchang"></span>
      <span class="tenant-name">{{ selectTenant?.name }}</span>
    </div>
    <template #overlay>
      <a-menu @click="handleMenuClick">
        <a-menu-item :key="item.id" v-for="item in getUserTenantList">
          <span class="iconfont icon-gongchang"></span>
          <a href="javascript:;" style="margin-left: 5px;">{{ item.name }}</a>
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script lang="ts" setup>
  import { useUserStore } from '/@/store/modules/user';
  import { computed } from 'vue';

  const userStore = useUserStore();
  const getUserTenantList = computed(() => {
    const tenantList = userStore.getTenantList || [];
    return tenantList;
  });
  const selectTenant = computed(() => {
    return userStore.getTenantList.find((d) => d.id == userStore.getTenant) || null;
  });
  const handleMenuClick = (e) => {
    userStore.setTenant(e.key);
  };
</script>

<style lang="scss" scoped>
  .tenant-box {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    .tenant-name{
      margin-left: 5px;
    }
  }
</style>
