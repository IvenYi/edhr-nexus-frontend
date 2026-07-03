<template>
  <van-dialog
    :show="show"
    v-bind="dialogProps"
    title="签名"
    width="fit-content"
    :show-cancel-button="true"
    @cancel="onCancel"
    @confirm="onOk"
  >
    <div class="flex flex-col h-full w-580px sign-switcher-modal">
      <SignSwitcher
        ref="switcherRef"
        v-model:sign-mode="signMode"
        :class="'switcher'"
        :hidden-sign-mode="hiddenSignMode"
        :get-sign-img-by-account="getSignImgByAccount"
        :upload-sign-file="uploadSignFile"
        :disable-user-name="disableUserName"
      />
    </div>
  </van-dialog>
</template>

<script setup lang="ts" name="sign-switcher-modal">
  import SignSwitcher from './sign-switcher.vue';
  import type { GetSignImgByAccount, SignerInstance, UploadSignFile } from '../types';
  import { SignMode } from '../constant';
  import { ref } from 'vue';

  const show = ref(true);

  const props = withDefaults(
    defineProps<{
      dialogProps?: any; // 组件属性
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
    const info = await switcherRef.value!.submit();
    doClose(info);
  };
</script>

<style lang="scss" scoped>
  @include b(sign-switcher-modal) {
    width: 100%;
    padding: 32px 50px;
    @include e(switcher) {
      width: 100%;
    }
  }
</style>
