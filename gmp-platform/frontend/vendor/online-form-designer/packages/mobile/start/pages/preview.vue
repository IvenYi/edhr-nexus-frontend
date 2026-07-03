<template>
  <div class="pl40px pr40px pt80px">
    <div class="text-22px font-bold">页面预览</div>

    <div>
      <van-field v-model="serveAddress" placeholder="请输入预览地址">
        <template #right-icon>
          <span
            class="iconfont icon-saoyisao qrcode font-bold"
            @click="onClickCAMERAscanCode"
          ></span>
        </template>
      </van-field>
    </div>
    <div class="pt40px">
      <van-button
        @click="onSubmit"
        block
        type="primary"
        native-type="submit"
        :disabled="!serveAddress"
      >
        预览
      </van-button>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { GctNative } from '@native/index';
  import { ref } from 'vue';

  const serveAddress = ref('');
  function onSubmit() {
    GctNative.WEBVIEW.open({ path: serveAddress.value });
  }
  const onClickCAMERAscanCode = () => {
    GctNative.CAMERA.scanCode({
      sourceType: ['album', 'camera'],
      scanType: ['qrCode', 'barCode'],
      success: async (value) => {
        let result = value.result;
        serveAddress.value = result;
      },
    });
  };
</script>
<style scoped lang="less">
  :deep(.van-field__body) {
    padding: 8px;
    background-color: #f5f5f5;
  }
</style>
