<template>
  <div :class="ns.b()">
    <SignSwitcher
      ref="switcherRef"
      v-model:sign-mode="signMode"
      :class="ns.e('switcher')"
      :hidden-sign-mode="hiddenSignMode"
      :fix-sign-mode="fixSignMode"
      :get-sign-img-by-account="getSignImgByAccount"
      :upload-sign-file="uploadSignFile"
      :disable-user-name="disableUserName"
    />
  </div>
</template>

<script setup lang="ts" name="sign-switcher-modal">
  import { useModal, useNamespace } from '@gct/runtime';
  import SignSwitcher from './sign-switcher.vue';
  import { GetSignImgByAccount, SignerInstance, UploadSignFile } from '../types';
  import { SignMode } from '../constant';
  import { ref } from 'vue';

  const ns = useNamespace('sign-switcher-modal');

  const props = defineProps<{
    defaultSignMode?: SignMode;
    hiddenSignMode?: boolean;
    fixSignMode?: boolean;
    getSignImgByAccount?: GetSignImgByAccount;
    uploadSignFile?: UploadSignFile;
    disableUserName?: boolean;
  }>();

  const switcherRef = ref<SignerInstance>();
  const signMode = ref(props.defaultSignMode);

  useModal(async () => {
    const info = await switcherRef.value!.submit();
    return {
      // 修改过后返回ok,外面刷新数据
      ok: true,
      data: [info],
      params: info,
    };
  });
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
