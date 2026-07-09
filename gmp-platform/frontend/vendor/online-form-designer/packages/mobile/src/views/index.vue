<template>
  <img src="../assets/image/logo.svg " class="w200px loading" />
</template>

<script setup lang="ts">
  import {
    reloadUser,
    AccessToken,
    autoLoginCache,
    CurrentTenant,
    // initMqttApp,
  } from '@mobile/stores/loginHooks';
  import { useWorkbenchHooks } from '@mobile/stores/navMenus';
  import { getUserLastResetPwd } from '/@/apis/gct-platform/UserController';
  import { getTenant } from '@gct-paas/core';

  const router = useRouter();
  const { runNavMenuSelected } = useWorkbenchHooks();
  if ((autoLoginCache.value.auto && AccessToken.value) || AccessToken.value) {
    reloadUser().then(async () => {
      await Promise.all([runNavMenuSelected(), getPwdInfo()]);
      const tenantId = CurrentTenant.value?.id || getTenant();
      if (!tenantId) {
        router.replace('/tenant');
        return;
      }
      router.replace({ name: 'main' });
    });
  } else {
    router.replace('/login');
  }

  // 判断是否要重置密码
  async function getPwdInfo() {
    const userLastPwdInfo = await getUserLastResetPwd();
    if (
      userLastPwdInfo?.needChangePass ||
      userLastPwdInfo?.needChangeSignPass ||
      userLastPwdInfo?.needSetSignPass
    ) {
      router.replace({
        name: 'edit-password',
        query: {
          needChangePass: userLastPwdInfo?.needChangePass ? 1 : 0,
          needChangeSignPass: userLastPwdInfo?.needChangeSignPass ? 1 : 0,
          needSetSignPass: userLastPwdInfo?.needSetSignPass ? 1 : 0,
        },
      });
      return Promise.reject();
    }
  }
</script>

<style scoped lang="less">
  .loading {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
</style>
