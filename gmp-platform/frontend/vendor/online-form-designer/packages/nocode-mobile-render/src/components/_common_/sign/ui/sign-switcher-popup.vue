<template>
  <BasicPopup
    v-model:show="show"
    :popup-props="popupProps"
    title="签名"
    :extraStyle="{
      width: '570px',
    }"
  >
    <div class="flex flex-col h-full w-full sign-switcher-popup">
      <SignSwitcher
        ref="switcherRef"
        v-model:sign-mode="signMode"
        :class="'switcher'"
        :hidden-sign-mode="hiddenSignMode"
        :get-sign-img-by-account="getSignImgByAccount"
        :upload-sign-file="uploadSignFile"
        :disable-user-name="disableUserName"
        :style="{ width: '100%' }"
      />
    </div>
    <template #footer>
      <div class="flex">
        <van-button class="w-80px important-mr-16px" type="default" @click="onCancel">
          取消
        </van-button>
        <van-button class="flex-1" type="primary" @click="onOk">确认</van-button>
      </div>
    </template>
  </BasicPopup>
</template>

<script setup lang="ts" name="sign-switcher-popup">
  import SignSwitcher from './sign-switcher.vue';
  import type { GetSignImgByAccount, SignerInstance, UploadSignFile } from '../types';
  import { SignMode } from '../constant';
  import { ref } from 'vue';
  import BasicPopup from '@mobile/views/edhr/_comps_/basic-popup/index.vue';
  import { showToast } from 'vant';

  const show = ref(true);

  const props = withDefaults(
    defineProps<{
      popupProps?: any; // 组件属性
      defaultSignMode?: SignMode;
      hiddenSignMode?: boolean;
      getSignImgByAccount?: GetSignImgByAccount;
      uploadSignFile?: UploadSignFile;
      disableUserName?: boolean;
      beforeClose: (info?: any) => boolean | undefined;
    }>(),
    {},
  );

  const switcherRef = ref<SignerInstance>();
  const signMode = ref(props.defaultSignMode);

  /** 执行关闭操作 */
  const doClose = (info?: any) => {
    const isClosed = props.beforeClose(info);
    if (isClosed !== false) {
      show.value = false;
    }
  };

  const onCancel = () => {
    doClose();
  };

  const onOk = async () => {
    try {
      const info = await switcherRef.value!.submit();
      doClose(info);
    } catch (error) {
      showToast(error.subMessage ?? error.message ?? error);
    }
  };
</script>

<style lang="less" scoped>
  .sign-switcher-popup {
  }
</style>
