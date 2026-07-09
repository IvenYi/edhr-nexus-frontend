<template>
  <div :class="['password-signer']">
    <van-form ref="formRef">
      <van-field
        :label="t('sys.userName')"
        name="username"
        required
        :disabled="disableUserName"
        :rules="[{ required: true, message: '请输入账号' }]"
        v-model="formState.username"
      />
      <van-field
        :label="t(`sys.platform.signWay.${getSignWay()}`)"
        type="password"
        name="password"
        required
        :rules="[{ required: true, message: `请输入${t(`sys.platform.signWay.${getSignWay()}`)}` }]"
        v-model="formState.password"
      />
      <!-- <div class="btn-wrap">
        <van-button plain @click="reset">{{ t('sys.reset') }}</van-button>
      </div> -->
    </van-form>
  </div>
</template>
<script setup lang="ts" name="PasswordSigner">
  import { ref, onMounted } from 'vue';
  import { i18n } from '@mobile/locales/setupI18n';
  import CryptoJS from 'crypto-js';
  import type { GetSignImgByAccount, SignerExpose } from '../types';
  import { completeSignInfo, getSignImgByAccount as defaultFn } from '../logic';
  import { PlatformSettingEnum } from '@mobile/type';
  import { getPlatInfo } from '/@/apis/gct-platform/PlatformConfigController';
  import { UserData } from '@mobile/stores/loginHooks';

  /** 获取系统配置 */
  const enableSignPassword = ref(0);
  const getSecurityConfig = async () => {
    const config = await getPlatInfo({ configEnum: PlatformSettingEnum.SECURITY });
    if (config && config.value) {
      enableSignPassword.value = JSON.parse(config.value).enableSignPassword || 0;
    }
  };
  getSecurityConfig();

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

  const getSignWay = () => {
    switch (enableSignPassword.value) {
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

  const formRef = ref();
  const { t } = i18n.global;
  const formState = ref({ password: '', username: '' });

  const reset = async () => {
    await formRef.value?.resetFields();
    formState.value = { password: '', username: UserData?.value?.username };
  };

  onMounted(() => {
    if (props.disableUserName) {
      formState.value.username = UserData?.value?.username;
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
        // if (!info.url) {
        //   throw new Error('没有配置签名图片！');
        // }
        return info;
      } catch (error) {
        // 重新抛出错误使外部可以捕获
        return Promise.reject(error);
      }
    },
  });
</script>
<style lang="less" scoped>
  .password-signer {
    width: 540px;
  }
</style>
