<template>
  <div class="main">
    <div class="w480px m-auto">
      <div class="text-26px font-bold text-[#1A1D23] mb60px text-center">安装服务配置</div>
      <div ref="inputContainerRef">
        <div class="text-[#5A5F6B] text-18px">请输入服务地址</div>
        <van-field
          v-model="serverAddress"
          placeholder="http://xxx.com"
          @focus="handleFocus"
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
    </div>
    <van-dialog
      v-model:show="show"
      :showConfirmButton="false"
      width="480px"
      closeOnClickOverlay
      @close="cancel"
    >
      <div class="confirm-box text-center">
        <div class="pt48px lh-none">
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
        <div class="text-24px mt-24px pl60px pr60px">{{
          serverConfig.singleApp ? serverConfig.appName : '工作台'
        }}</div>
        <div class="text-[#434855] text-16px mt8px">
          <!-- {{ serverConfig.singleApp ? '即将安装此应用' : '即将安装' }} -->
          即将安装此应用
        </div>
        <div class="pl60px pr60px mt32px mb24px">
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

  const inputContainerRef = ref();
  const serverAddress = ref('');
  const show = ref(false);

  const emit = defineEmits(['submit', 'canCode', 'clearServer']);

  const handleFocus = () => {
    setTimeout(() => {
      inputContainerRef.value?.scrollIntoView(false);
    }, 300);
  };

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
    width: 100%;
    height: 100%;
    padding: 120px 0;
    background: url('@/image/bg_azffpz_pad.svg') no-repeat center top;
    background-size: cover;
    overflow-y: auto;
  }

  :deep(.van-field__body) {
    padding: 14px;
    background-color: #f5f5f5;
    font-size: 16px;
  }

  .confirm-box {
    min-height: 400px;
    background: url('@/image/pic_popup_pad.png') no-repeat 0 0;
    background-size: 100%;
  }
</style>
