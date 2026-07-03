<template>
  <div class="start-page">
    <div
      v-if="backVisible"
      class="flex justify-center items-center fixed z-10 top-0 left-0 mt-2 ml-2 p-2 w-12 h-12 cursor-pointer"
      @click="handleGoBack"
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#000">
        <path
          d="M10.8284 12.0007L15.7782 16.9504L14.364 18.3646L8 12.0007L14.364 5.63672L15.7782 7.05093L10.8284 12.0007Z"
        />
      </svg>
    </div>
    <AsyncComp
      :serverConfig="serverConfig"
      @submit="onSubmit"
      @canCode="onClickCAMERAscanCode"
      @clearServer="clearServer"
      v-if="showPage"
      ref="asyncComp"
    />
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, reactive, defineAsyncComponent } from 'vue';
  import { showToast } from 'vant';
  import { ServeStart, GctNative, type ServeConfig, getApkGetActiveApp } from '@native/index';

  const asyncComp = ref(null);
  const isIpad = GctNative.APP.isTabletSync();
  const AsyncComp = defineAsyncComponent(() => {
    if (isIpad) {
      return import('./views/ipad.vue');
    } else {
      return import('./views/pda.vue');
    }
  });

  const route = useRoute();
  const showPage = ref(false);
  const backVisible = !!route.query.edit;

  const serverConfig = reactive<ServeConfig>({
    serverAddress: '',
  });

  onMounted(async () => {
    try {
      // await ServeStart.clearSql('base_config');
      route.query.edit && (await Promise.reject());
      await Promise.all([
        ServeStart.updateApk(),
        ServeStart.updateApp(() => ServeStart.unpadateHtml()),
      ]);
      GctNative.WEBVIEW.replace({ path: 'dist/index.html' });
      GctNative.NATIVE.toolbarController(true);
    } catch (error) {
      console.log('error', error);
      showPage.value = true;
    }
  });

  const handleGoBack = () => {
    GctNative.WEBVIEW.replace({ path: 'dist/index.html' });
  };

  async function onSubmit() {
    /**清空历史sql */
    await ServeStart.clearSql('base_config');
    /** 存入服务地址 */
    await ServeStart.insertServeConfig(serverConfig);
    /**升级apk */
    await ServeStart.updateApk();
    /**升级前端执行器 html*/
    await ServeStart.unpadateHtml();
    GctNative.WEBVIEW.replace({ path: 'dist/index.html' });
  }
  const onClickCAMERAscanCode = () => {
    GctNative.CAMERA.scanCode({
      sourceType: ['album', 'camera'],
      scanType: ['qrCode', 'barCode'],
      success: async (value) => {
        clearServer();
        try {
          Object.assign(serverConfig, {
            ...JSON.parse(value.result),
          });
        } catch (err) {
          Object.assign(serverConfig, {
            serverAddress: value.result,
          });
        }
        if (!/^http/.test(serverConfig.serverAddress)) {
          showToast('服务地址错误，请重新输入或扫码');
          clearServer();
          return;
        }
        try {
          await getApkGetActiveApp(serverConfig.serverAddress, { errorMessageMode: 'none' });
        } catch (error) {
          showToast('服务地址错误，请重新输入或扫码');
          clearServer();
          return;
        }
        asyncComp.value && asyncComp.value.confirmApp(serverConfig.serverAddress);
      },
    });
  };

  function clearServer() {
    Object.keys(serverConfig).forEach((k) => {
      serverConfig[k] = '';
    });
  }
</script>
<style scoped lang="less">
  .start-page {
    height: 100vh;
    background: url('/logo.svg') no-repeat center center;
    background-color: #fff;
    background-size: 200px;
  }
</style>
