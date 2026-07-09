<template>
  <div :class="[ns.b(), 'bg-[#FCFCFC] p12px']">
    <a-form
      ref="formRef"
      :model="formState"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      autocomplete="off"
    >
      <a-form-item :label="t('sys.userName')" name="username" :rules="[{ required: true }]">
        <a-input v-model:value="formState.username" type="text" :disabled="disableUserName" />
      </a-form-item>
      <a-form-item
        :label="t(`sys.platform.signWay.${getSignWay()}`)"
        name="password"
        :rules="[{ required: true }]"
      >
        <a-input
          ref="passwordInputRef"
          v-model:value="formState.password"
          :type="passwordInputType"
          autocomplete="off"
        />
      </a-form-item>
      <div class="text-[#384356] text-[14px] cursor-pointer primary-gct text-right">
        <span @click="reset">
          <redo-outlined />
          {{ t('sys.reset') }}
        </span>
      </div>
    </a-form>
  </div>
</template>
<script setup lang="ts" name="PasswordSigner">
  import { ref, computed, onMounted } from 'vue';
  import { useI18n } from '/@/hooks/web/useI18n';
  import CryptoJS from 'crypto-js';
  import { GetSignImgByAccount, SignerExpose } from '../types';
  import { getSignImgByAccount as defaultFn } from '../logic';
  import { useNamespace } from '@gct/runtime';
  import { useRootSetting } from '/@/hooks/setting/useRootSetting';
  import { useUserStore } from '/@/store/modules/user';

  const ns = useNamespace('password-signer');

  const { getSecurityConfig } = useRootSetting();
  const userStore = useUserStore();

  const props = withDefaults(
    defineProps<{
      getSignImgByAccount?: GetSignImgByAccount;
      disableUserName?: boolean;
    }>(),
    {
      getSignImgByAccount: defaultFn,
      disableUserName: true,
    },
  );

  const formRef = ref();
  const { t } = useI18n();
  const formState = ref({ password: '', username: '' });

  const passwordInputType = computed(() => {
    if (formState.value.password && formState.value.password.trim()) {
      return 'password';
    }
    return 'text';
  });
  const getSignWay = () => {
    switch (getSecurityConfig.value.enableSignPassword) {
      case 0:
        return 'LOGIN';
      case 1:
        return 'SIGN';
      case 2:
        return 'DOMAIN';
      default:
        return 'LOGIN';
    }
  };

  const reset = async () => {
    await formRef.value?.resetFields();
    formState.value = { password: '', username: userStore?.userInfo?.username };
  };

  onMounted(() => {
    if (props.disableUserName) {
      formState.value.username = userStore?.userInfo?.username;
    } else {
      formState.value.username = '';
    }
  });

  function sha256(password) {
    const hash = CryptoJS.SHA256(password);
    return hash.toString(CryptoJS.enc.Hex);
  }

  defineExpose<SignerExpose>({
    submit: async () => {
      await formRef.value?.validate();
      const type = getSignWay();
      try {
        const info = await props.getSignImgByAccount(
          formState.value.username,
          type === 'DOMAIN' ? formState.value.password : sha256(formState.value.password),
          type,
        );
        return info;
      } catch (error) {
        // 重新抛出错误使外部可以捕获
        throw new Error(error);
      }
    },
  });
</script>
<style lang="scss" scoped>
  @include b(password-signer) {
    width: 540px;
  }
</style>
