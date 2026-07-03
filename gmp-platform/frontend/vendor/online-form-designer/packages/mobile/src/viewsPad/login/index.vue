<template>
  <div class="login ks-row">
    <div class="login-bg" :style="{ height: initHeight + 'px' }">
      <div class="p-60px"><img src="../../assets/ipad/logo2.png" alt="" /></div>
    </div>
    <div class="ks-col">
      <div class="login-form">
        <div class="text-32px lh-40px login-form-title pt100px">
          <div> 欢迎登录 </div>
          <div class="flex items-center">
            <div class="mt8px"> 冠骋云PaaS平台 </div>
            <!-- 沙箱黄精标识 -->
            <div v-if="isSandbox" class="sandbox-symbol ml8px mt2px">
              <span class="sandbox-text">
                {{ t('sys.menu.sandbox') }}
              </span>
            </div>
          </div>
        </div>
        <van-form class="mt50px" ref="form" show-error>
          <van-field
            :class="{ 'van-field--error': !!errorMessage }"
            :error-message="errorMessage"
            clearable
            v-model="formData.username"
            name="username"
            :placeholder="$t(loginplaceholder, ' ')"
            :disabled="!isActivated"
            :rules="[{ required: true, message: $t(loginplaceholder, ' ') }]"
            @input="changeField"
          >
            <template #left-icon>
              <span class="gct-iconfont icon-icon_zhanghao text-22px mr12px"></span>
            </template>
          </van-field>
          <van-field
            v-no-copy-paste
            v-model="formData.password"
            type="password"
            name="password"
            :placeholder="$t('sys.passwordPlaceholder', ' ')"
            :disabled="!isActivated"
            :rules="[{ required: true, message: $t('sys.passwordPlaceholder', ' ') }]"
          >
            <template #left-icon>
              <span class="gct-iconfont icon-icon_mima text-22px mr12px"></span>
            </template>
          </van-field>
          <van-field v-model="CurrentTenant.name" label="所属租户" v-if="isTestEnv" readonly />
        </van-form>
        <div class="ks-row-middle mb30px" v-if="!isSandbox">
          <div class="ks-col">
            <van-checkbox v-model="formData.auto" @change="changeAuto">默认自动登录</van-checkbox>
          </div>
          <div class="primary-color" @click="setting">
            <span class="gct-iconfont icon-icon_quanjushezhi"></span>
            服务配置
          </div>
        </div>
        <div class="pb40px">
          <van-button
            @click="onSubmit"
            block
            type="primary"
            native-type="submit"
            :disabled="disabled"
            >登 录</van-button
          >
        </div>
      </div>
    </div>
    <Lock ref="lockRef" v-if="open" :time="lockTime" @closeModalEvent="closeModalEvent" />
  </div>
</template>

<script setup lang="ts">
  import { appLogin, autoLoginCache, CurrentTenant, AccessToken } from '@mobile/stores/loginHooks';
  import { GctNative, ServeStart } from '@native/index';
  import { useEnv } from '@mobile/utils/useEnv';
  import { serverAddress } from '@mobile/stores/sessionHooks';
  import { getLicenseCheckLicense } from '/@/apis/gct-platform/LicenseController';
  import { showNotify } from 'vant';
  import { i18n } from '@mobile/locales/setupI18n';
  import { useplatSetting } from '../../utils/useplatSetting';
  import { getUserLastResetPwd } from '/@/apis/gct-platform/UserController';
  import { _isAndroid } from '@mobile/utils/const';
  import Lock from '../../views/login/lock.vue';
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
  const initHeight = window.innerHeight;

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
      AccessToken.value = '';
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

    &-bg {
      width: 60%;
      background-image: url('../../assets/ipad/pic_login_pad.png');
      background-position: center;
      background-size: cover;

      img {
        width: 148px;
      }
    }

    &-form {
      width: 360px;
      margin: auto;

      &-title {
        color: #1a1d23;
        font-weight: bold;
      }
    }
  }

  // .van-form {
  //   --van-cell-background: transparent;
  //   --van-cell-group-background: transparent;
  //   --van-cell-horizontal-padding: 0;
  //   --van-cell-border-color: transparent;
  //   --van-field-input-text-color: #333;
  // }

  // .van-checkbox {
  //   --van-checkbox-size: 16px;
  // }

  :deep(.van-cell) {
    // margin-top: 30px;
    padding: 0;

    &::after {
      display: none;
    }
  }

  :deep(.van-field__body) {
    margin-bottom: 24px;
    padding-bottom: 16px;

    &::after {
      content: '';
      position: absolute;
      right: 0;
      bottom: 24px;
      left: -34px;
      margin-top: 8px; // 间距，可根据需求调整
      border-bottom: 1px solid rgb(0 0 0 / 20%);
    }
  }

  :deep(.van-field--error) {
    .van-field__body {
      &::after {
        content: '';
        position: absolute;
        right: 0;
        bottom: 24px;
        left: -34px;
        margin-top: 8px; // 间距，可根据需求调整
        border-bottom: 1px solid var(--van-field-error-message-color);
      }
    }

    .van-field__control--error::placeholder {
      color: var(--van-field-placeholder-text-color);
    }

    .van-field__control--error {
      color: var(--van-field-input-text-color);
    }

    .van-field__error-message {
      margin-top: -24px;
      margin-left: -34px;
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
    font-size: 14px;
    font-weight: 500;
    -webkit-text-fill-color: transparent;
  }
</style>
