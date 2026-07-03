<template>
  <div class="p16px">
    <van-config-provider :theme-vars="themeVars">
      <van-nav-bar placeholder fixed left-arrow :border="false" @click-left="onClickLeft" />
      <div class="text-22px font-bold mb6px">选择你加入的组织</div>
      <div class="text-14px mb25px">以下是你已加入的组织</div>
      <van-cell
        @click="setTenant(i)"
        :border="false"
        :title="i.name"
        is-link
        v-for="i in tenantList"
        :key="i.id"
        class="mb12px"
      />
    </van-config-provider>
  </div>
</template>

<script setup lang="ts">
  import { UserData, CurrentTenant } from '@mobile/stores/loginHooks';
  import { signLogRegister } from '../../utils/signLog';
  import { getLoginLogTenantLog } from "@mobile/apis/gct-platform/LoginLogController";

  const router = useRouter();
  const tenantList = computed(() => UserData.value.tenantList);
  const themeVars = {
    'cell-background': '#F5F5F5FF',
    'nav-bar-icon-color': '#000',
  };
  async function setTenant(v: ArrayType<typeof tenantList.value>) {
    CurrentTenant.value = v;
    await getLoginLogTenantLog({ tenantId: CurrentTenant.value.id });
    router.replace('/');
    console.log('tenent', v);
    // signLogRegister('WORKTABLE', '', v.id);
  }
  function onClickLeft() {
    router.replace({ name: 'login' });
  }
</script>
<style scoped lang="less"></style>
