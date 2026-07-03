<template>
  <div class="main">
    <div class="text-26px font-bold text-[#1A1D23] mb60px">安装服务配置</div>
    <div>
      <div class="text-[#5A5F6B]">请输入服务地址</div>
      <van-field
        v-model="serverAddress"
        placeholder="http://xxx.com"
        @blur="handleAddressConfirm"
        @keyup.enter="handleAddressConfirm"
      >
        <template #right-icon>
          <span
            class="iconfont icon-saoyisao font-bold text-[#1A1D23]"
            @click="emit('canCode')"
          ></span>
        </template>
      </van-field>
    </div>
    <van-dialog
      v-model:show="show"
      :showConfirmButton="false"
      width="300px"
      closeOnClickOverlay
      @close="cancel"
    >
      <div class="confirm-box text-center">
        <div class="pt40px lh-none">
          <LogoView
            v-if="serverConfig.singleApp"
            :bgColor="serverConfig.logoBgColor"
            :src="serverConfig.logo"
            :logoType="serverConfig.logoType"
            :serverAddress="serverConfig.serverAddress"
            :logoColor="serverConfig.logoColor"
          />
          <img v-else src="@/image/pic_gztyy.svg" width="90" />
        </div>
        <div class="text-20px mt-24px pl24px pr24px">{{
          serverConfig.singleApp ? serverConfig.appName : '工作台'
        }}</div>
        <div class="text-[#434855] text-14px mt8px">
          {{ serverConfig.singleApp ? '即将安装此应用' : '即将安装' }}</div
        >
        <div class="pl24px pr24px mt32px">
          <van-button type="primary" block @click="submit">确认</van-button>
          <div class="h48px ks-row-center-middle" @click="show = false">取消</div>
        </div>
      </div>
    </van-dialog>
  </div>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { showToast } from 'vant';
  import { type ServeConfig, getApkGetActiveApp } from '@native/index';
  import LogoView from '../components/logoView.vue';

  const props = defineProps<{
    serverConfig: ServeConfig;
  }>();
  const serverAddress = ref('');
  const show = ref(false);

  const emit = defineEmits(['submit', 'canCode', 'clearServer']);

  const handleAddressConfirm = async () => {
    const addr = serverAddress.value;
    if (!addr) return;
    if (!/^http/.test(addr)) {
      showToast('请输入正确的地址');
      cancel();
      return;
    }

    try {
      await getApkGetActiveApp(addr, { errorMessageMode: 'none' });
      props.serverConfig.serverAddress = addr;
      show.value = true;
    } catch (error) {
      showToast('服务地址错误，请重新输入或扫码');
      cancel();
      return;
    }
  };

  function submit() {
    emit('submit');
  }

  function cancel() {
    serverAddress.value = '';
    emit('clearServer');
  }

  defineExpose({
    confirmApp(address) {
      show.value = true;
      serverAddress.value = address;
    },
  });
</script>
<style scoped lang="less">
  .main {
    box-sizing: border-box;
    height: 100vh;
    padding: 0 28px;
    padding-top: 100px;
    background: url('@/image/bg_azffpz_phone.svg') no-repeat center center;
    background-size: cover;
    color: #1a1d23;
  }

  :deep(.van-field__body) {
    padding: 8px;
    background-color: #f5f5f5;
  }

  .confirm-box {
    min-height: 360px;
    background: url('@/image/pic_popup_phone.png') no-repeat 0 0;
    background-size: 100%;
  }
</style>
