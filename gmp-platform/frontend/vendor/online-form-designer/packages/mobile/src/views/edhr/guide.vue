<template>
  <img src="../../assets/image/logo.svg " class="w200px loading" />
</template>

<script setup lang="ts">
  import { reloadUser, AccessToken, autoLoginCache } from '@mobile/stores/loginHooks';
  import { getUserLastResetPwd } from '/@/apis/gct-platform/UserController';
  import { useRouter } from 'vue-router';
  import { useInitMqtt } from './_hooks_/useMqtt';

  const router = useRouter();
  if ((autoLoginCache.value.auto && AccessToken.value) || AccessToken.value) {
    // debugger;
    reloadUser().then(async () => {
      // 判断是否要重置密码
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
      } else {
        router.replace({ name: 'edhr' });
      }
      const { upAndDownLines, signLog } = useInitMqtt();
      upAndDownLines();
      signLog();
    });
  } else {
    router.replace('/login');
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
