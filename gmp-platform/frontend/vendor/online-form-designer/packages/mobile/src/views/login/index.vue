<template>
  <div class="login pt64px pl30px pr30px leading-none text-14px">
    <div class="flex items-center">
      <img src="../../assets/image/logo.svg " class="w140px" />
      <!-- 沙箱黄精标识 -->
      <div v-if="isSandbox" class="sandbox-symbol ml8px mt2px">
        <span class="sandbox-text">
          {{ t('sys.menu.sandbox') }}
        </span>
      </div>
    </div>

    <div class="text-[#333] font-bold text-22px">{{ $t('sys.signInFormTitle') }}</div>
    <!-- <div class="text-14px text-[#666] mt14px">请输入您的的登录信息</div> -->

    <van-form class="mt50px" label-align="top" ref="form" show-error>
      <van-field
        :class="{ 'van-field--error': !!errorMessage }"
        :error-message="errorMessage"
        clearable
        v-model="formData.username"
        name="username"
        :label="$t('sys.username')"
        :placeholder="$t(loginplaceholder)"
        :disabled="!isActivated"
        :rules="[{ required: true, message: $t(loginplaceholder) }]"
        @input="changeField"
      />
      <van-field
        v-no-copy-paste
        v-model="formData.password"
        type="password"
        name="password"
        :label="$t('sys.password')"
        :placeholder="$t('sys.passwordPlaceholder')"
        :disabled="!isActivated"
        :rules="[{ required: true, message: $t('sys.passwordPlaceholder') }]"
      />
      <van-field v-model="CurrentTenant.name" :label="$t('sys.affTenant')" v-if="isTestEnv" readonly />
    </van-form>
    <div class="ks-row-middle mb30px" v-if="!isSandbox">
      <div class="ks-col">
        <van-checkbox v-model="formData.auto" @change="changeAuto">{{ $t('sys.defaultAutoLogin') }}</van-checkbox>
      </div>
      <div class="primary-color" @click="setting">
        <van-icon name="setting-o" />
        {{ $t('sys.serviceConfig') }}
      </div>
    </div>
    <div class="pb40px">
      <van-button @click="onSubmit" block type="primary" native-type="submit" :disabled="disabled"
        >登 录</van-button
      >
    </div>
    <Lock ref="lockRef" v-if="open" :time="lockTime" @closeModalEvent="closeModalEvent" />
  </div>
</template>

<script setup lang="ts">
  import { appLogin, autoLoginCache, CurrentTenant } from '@mobile/stores/loginHooks';
  import { GctNative, ServeStart } from '@native/index';
  import { useEnv } from '@mobile/utils/useEnv';
  import { serverAddress } from '@mobile/stores/sessionHooks';
  import { getLicenseCheckLicense } from '/@/apis/gct-platform/LicenseController';
  import { showNotify } from 'vant';
  import { i18n } from '@mobile/locales/setupI18n';
  import { useplatSetting } from '../../utils/useplatSetting';
  import { getUserLastResetPwd } from '/@/apis/gct-platform/UserController';
  import { _isAndroid } from '@mobile/utils/const';
  import Lock from './lock.vue';
  import { getLoginLogTenantLog } from "@mobile/apis/gct-platform/LoginLogController";

  const { orgConfig } = useplatSetting();
  const { isTestEnv, isSandbox } = useEnv();
  const errorMessage = ref('');
  const form = ref();
  const open = ref(false);
  const lockRef = ref();
  const isActivated = ref(true);
  const router = useRouter();
  const { t } = i18n.global;
  const loginplaceholder = computed(() => {
    if (orgConfig.value.supportLoginFields?.includes('username_')) {
      return 'sys.accountPlaceholder';
    }
    if (orgConfig.value.supportLoginFields?.includes('mobile_')) {
      return 'sys.mobilePlaceholder';
    }
    if (orgConfig.value.supportLoginFields?.includes('emp_no_')) {
      return 'sys.empnoPlaceholder';
    }
    const filter = orgConfig.value.extFieldConfigs?.filter(
      (i) => i.relationField === orgConfig.value.supportLoginFields[0],
    );
    if (filter && filter.length) {
      return `请输入${filter[0].fieldName}`;
    }
    return 'sys.accountPlaceholder';
  });

  const lockTime = ref();

  const formData = reactive({
    username: '',
    password: '',
    auto: !!autoLoginCache.value.auto,
  });
  const disabled = computed(() => {
    let { username, password } = formData;
    return !username || !password || !isActivated.value;
  });
  const onSubmit = async () => {
    await form.value.validate();
    try {
      const { tenantList, appSingle } = await appLogin(formData, { errorMessageMode: 'none' });
      if (isSandbox.value) {
        router.replace('/main/menuCenter');
        return;
      }
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
        return;
      }
      if (isTestEnv.value || appSingle) {
        router.replace('/');
        return;
      }
      if (!tenantList) return;
      if (tenantList.length > 1) {
        const lastLoginTenant = tenantList.find((item) => item.latestLogin === 1);
        if (lastLoginTenant) {
          CurrentTenant.value = lastLoginTenant;
          await getLoginLogTenantLog({ tenantId: lastLoginTenant.id });
          router.replace('/');
        } else {
          router.replace({ name: 'tenant' });
        }
      } else {
        CurrentTenant.value = tenantList[0] || {};
        if (tenantList.length === 1) {
          await getLoginLogTenantLog({ tenantId: tenantList[0].id });
        }
        router.replace('/');
      }
    } catch (err) {
      // console.log('err', err);
      if (err.subCode === 'sys.plat.api.pass.failure.over.max_times') {
        lockTime.value = err.data;
        open.value = true;
        setTimeout(() => {
          lockRef.value.show = true;
        });
      } else if (err?.subMessage) {
        errorMessage.value = err.subMessage;
      }
    }
  };

  const closeModalEvent = () => {
    open.value = false;
  };
  function changeAuto(auto: boolean) {
    if (!auto) {
      autoLoginCache.value = {};
    }
  }
  function setting() {
    GctNative.WEBVIEW.relaunch({ replace: true, hash: '#/?edit=1' });
  }
  onMounted(() => {
    getLicenseStatus();
  });

  const getLicenseStatus = () => {
    getLicenseCheckLicense()
      .then((res) => {
        isActivated.value = res ?? true;
        if (!isActivated.value) {
          showNotify({ type: 'danger', message: `${t('sys.authorizeError')}` });
        }
      })
      .catch((err) => {
        isActivated.value = true;
        console.log(err);
      });
  };

  function changeField() {
    errorMessage.value = '';
  }
</script>

<style scoped lang="less">
  .login {
    height: 100vh;
    background: linear-gradient(180deg, rgb(13 170 156 / 14%) 0%, rgb(13 170 156 / 0%) 50%);
  }

  .van-form {
    --van-cell-background: transparent;
    --van-cell-group-background: transparent;
    --van-cell-horizontal-padding: 0;
    --van-cell-border-color: transparent;
    --van-field-input-text-color: #333;
  }

  .van-checkbox {
    --van-checkbox-size: 16px;
  }

  :deep(.van-field__body) {
    padding: 8px;
    // background-color: #f5f5f5;
    border-bottom: 1px solid rgb(0 0 0 / 20%);
  }

  :deep(.van-field--error) {
    .van-field__body {
      border-bottom: 1px solid var(--van-field-error-message-color);
    }

    .van-field__control--error::placeholder {
      color: var(--van-field-placeholder-text-color);
    }

    .van-field__control--error {
      color: var(--van-field-input-text-color);
    }

    .van-field__error-message {
      margin-bottom: -16px;
      padding-top: 4px;
      font-size: 12px;
      line-height: 1;
    }
  }

  :deep(.van-form) {
    .van-cell {
      padding: 0;
      padding-bottom: 20px;
    }
  }

  .sandbox-symbol {
    display: flex;
    position: relative;
    align-items: center;
    justify-content: center;
    width: 80px;
    height: 26px;
    border: 1px solid transparent;
    border-radius: 13px 13px 13px 0;
    background: transparent;
    // border-image: linear-gradient(90deg, rgb(250 119 63 / 100%), rgb(255 172 56 / 100%)) 1 1;
    // background:
    //   linear-gradient(white, white) padding-box,
    //   linear-gradient(90deg, rgb(250 119 63 / 100%), rgb(255 172 56 / 100%)) border-box;
  }

  .sandbox-symbol::before {
    content: '';
    position: absolute;
    z-index: -1;
    // width: 80px;
    // height: 26px;
    padding: 1px; /* 边框宽度 */
    border-radius: 13px 13px 13px 0;
    background: linear-gradient(90deg, rgb(250 119 63 / 100%), rgb(255 172 56 / 100%));
    inset: 0;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: xor;
    mask-composite: exclude;
  }

  .sandbox-text {
    background: linear-gradient(360deg, #fa773f 0%, #ffac38 100%);
    background-clip: text;
    color: transparent;
    font-weight: 500;
    -webkit-text-fill-color: transparent;
  }
</style>
