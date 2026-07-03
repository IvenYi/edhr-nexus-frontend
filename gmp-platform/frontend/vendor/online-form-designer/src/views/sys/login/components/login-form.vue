<template>
  <div class="login-form">
    <div class="flex items-center absolute right-13px top-10px">
      <AppLocalePicker
        :reload="true"
        class="text-white enter-x xl:text-gray-600"
        :show-text="false"
        v-if="!sessionTimeout && false"
      />
    </div>
    <div class="pl-48px pr-48px">
      <LoginFormTitle class="enter-x" v-if="currentOption === 'system'" />
      <Tabs v-model:activeKey="activeKey" v-if="currentOption === 'system'">
        <TabPane v-for="item of sysLogin" :key="item" :tab="tabOptions[item]?.tab">
          <component :is="tabOptions[item].comp" />
        </TabPane>
      </Tabs>
      <div
        class="others flex"
        v-if="idoAuthLogin && idoAuthLogin?.length > 0 && currentOption === 'system'"
      >
        <div class="enter-x text-16px pr-12px" style="margin: 0">{{ t('sys.otherSignIn') }}：</div>
        <div class="flex justify-evenly enter-x h-46px">
          <div
            v-for="item of idoAuthLogin"
            :key="item"
            :class="tabOptions[item].cls"
            class="mr-20px cursor-pointer third-icon"
            @click="openIdoLogin(item)"
          ></div>
        </div>
      </div>
      <div v-if="currentOption === 'ido'">
        <OtherModeForm :authType="authType" @openSystemLogin="openSystemLogin" />
      </div>
      <div class="login-form-footer">
        <div class="download mb-8px">
          <span>{{ t('sys.recommended') }}</span>
          <a class="browser" href="https://www.google.cn/chrome/">{{ t('sys.googleBrowser') }}</a>
        </div>
        <div class="version mb-8px">{{ t('sys.platformVersion') + getPlatfromVersion }}</div>
        <div class="copyright mb-16px" v-html="copyright"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, ref, onMounted, watch } from 'vue';
  import { Tabs, message } from 'ant-design-vue';
  import { LoginStateEnum, useLoginState } from '../useLogin';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { AppLocalePicker } from '/@/components/Application';
  import LoginFormTitle from './login-form-title.vue';
  import PasswordForm from './password-form.vue';
  import MobileForm from './mobile-form.vue';
  import AdForm from './AD-form.vue';
  import OtherModeForm from './other-mode-login-form.vue';
  import { useRootSetting } from '@/hooks/setting/useRootSetting';
  import { isEmpty } from 'lodash-es';
  import { useScript } from '/@/hooks/web/useScript';
  import CardForm from './card-form.vue';
  import { useEnv } from '/@/hooks/develop/useEnv';
  import { getBrowserFingerprint } from '/@/hooks/event/userBrowser';

  const TabPane = Tabs.TabPane;
  const { t } = useI18n();

  useScript({ src: '/lib/ddlogin.js' });
  useScript({ src: '/lib/fsLogin.js' });

  defineProps({
    sessionTimeout: {
      type: Boolean,
    },
  });

  const tabOptions = {
    ACCOUNT: {
      tab: t('sys.passwordSignInFormTitle'),
      comp: PasswordForm,
    },
    DOMAIN_ACCOUNT: {
      tab: t('sys.adLogin'),
      comp: AdForm,
    },
    MOBILE: {
      tab: t('sys.mobileSignInFormTitle'),
      comp: MobileForm,
    },
    CARD: {
      tab: t('sys.cardSignInFormTitle'),
      comp: CardForm,
    },
    FEISHU: {
      cls: 'feishu',
    },
    DINGDING: {
      cls: 'dingding',
    },
    QIYEWEIXIN: {
      cls: 'weixin',
    },
    MICROSOFT: {
      cls: 'MICROSOFT',
    },
  };

  const currentOption = ref('system');

  const authType = ref('');

  const { setLoginState } = useLoginState();

  const copyright = ref();

  // 平台设置相关
  const {
    getPlatfromVersion,
    getPlatformCopyright,
    getLoginIDOAuthConfigs,
    getLoginModeConfigs,
    getLoginSortJson,
    getDefaultAuthType,
  } = useRootSetting();

  const activeKey = ref(getDefaultAuthType.value);

  watch(
    () => getDefaultAuthType.value,
    (value) => {
      const urlParams = new URLSearchParams(window.location.search);
      const params = Object.fromEntries(urlParams.entries());
      if (['FEISHU', 'DINGDING'].includes(params.state)) {
        currentOption.value = 'ido';
        authType.value = params.state;
        return;
      }
      if (['DINGDING', 'FEISHU', 'QIYEWEIXIN'].includes(value)) {
        currentOption.value = 'ido';
        authType.value = value;
      }
      if (['MICROSOFT'].includes(value)) {
        authType.value = value;
      }
    },
    { immediate: true },
  );

  watch(
    getPlatformCopyright,
    (value) => {
      if (value && value.includes('<span class="ownInput">${当前年份}</span>')) {
        copyright.value = value.replaceAll(
          '<span class="ownInput">${当前年份}</span>',
          new Date().getFullYear(),
        );
      } else {
        copyright.value = value;
      }
    },
    { immediate: true },
  );

  watch(
    activeKey,
    (value) => {
      if (value === 'MOBILE') {
        setLoginState(LoginStateEnum[value]);
      } else if (value === 'DOMAIN_ACCOUNT') {
        setLoginState(LoginStateEnum[value]);
      } else if (value === 'CARD') {
        setLoginState(LoginStateEnum.CARD);
      } else {
        setLoginState(LoginStateEnum.LOGIN);
      }
    },
    { immediate: true },
  );

  const sysLogin = computed(() => {
    let show = getLoginModeConfigs.value?.filter((i) => i.enabled).map((item) => item.authType);
    show = isEmpty(show) ? ['ACCOUNT'] : show;
    return getLoginSortJson.value.SYSTEM.filter((item) => show?.includes(item));
  });

  const idoAuthLogin = computed(() => {
    const show = getLoginIDOAuthConfigs.value
      ?.filter((i) => i.enabled)
      .map((item) => item.authType);
    return getLoginSortJson.value.THIRD_PARTY.filter((item) => show?.includes(item));
  });

  const openIdoLogin = async (item) => {
    if (item == 'MICROSOFT') {
      console.log('getLoginIDOAuthConfigs', getLoginIDOAuthConfigs.value);
      const agentId = getLoginIDOAuthConfigs.value?.find((i) => i.authType == item).agentId;
      const appId = getLoginIDOAuthConfigs.value?.find((i) => i.authType == item).appId;
      console.log('agentId', agentId, appId);
      const { getEnv } = useEnv();
      const redirectUri = encodeURIComponent(
        getLoginIDOAuthConfigs.value?.find((i) => i.authType == item).redirectURL,
      );
      const userUri = encodeURIComponent(
        'openid email profile https://graph.microsoft.com/User.Read',
      );
      const url = window.location.href;

      const matchSingle = url.match(/\/web-single\/([^/#?]+)/);
      const matchSand = url.match(/\/web-sandbox\/([^/#?]+)/);
      const logTypeSingle = matchSingle ? matchSingle[1] : null;
      const logTypeSand = matchSand ? matchSand[1] : null;
      const env = getEnv();
      const fingerprint = await getBrowserFingerprint();

      let microsoftUrl = `https://login.microsoftonline.com/${agentId}/oauth2/v2.0/authorize?client_id=${appId}&response_type=code&redirect_uri=${redirectUri}&scope=${userUri}&state=MICROSOFT&response_mode=query`;
      console.log('logType', logTypeSand, logTypeSingle, env, fingerprint);

      if (logTypeSingle) {
        microsoftUrl = `https://login.microsoftonline.com/${agentId}/oauth2/v2.0/authorize?client_id=${appId}&response_type=code&redirect_uri=${redirectUri}&scope=${userUri}&state=MICROSOFT_${logTypeSingle}_single_${env}_${fingerprint}&response_mode=query`;
      } else if (logTypeSand) {
        microsoftUrl = `https://login.microsoftonline.com/${agentId}/oauth2/v2.0/authorize?client_id=${appId}&response_type=code&redirect_uri=${redirectUri}&scope=${userUri}&state=MICROSOFT_${logTypeSand}_sandbox_${env}_${fingerprint}&response_mode=query`;
      }
      console.log('microsoftUrl', microsoftUrl);
      window.location.href = microsoftUrl;
    } else {
      currentOption.value = 'ido';
      authType.value = item;
    }
  };
  const openSystemLogin = () => {
    currentOption.value = 'system';
    authType.value = '';
    activeKey.value = 'ACCOUNT';
  };

  // 解析 微软云重定向hash 路由中的错误参数
  const getErrorFromHash = () => {
    const hash = window.location.hash;
    const queryIndex = hash.indexOf('?');
    if (queryIndex === -1) return null;
    const queryString = hash.slice(queryIndex + 1);
    // 注意：这里 redirect 后面的值包含嵌套的 ? ，但 URLSearchParams 可以处理
    const params = new URLSearchParams(queryString);
    const subMessage = params.get('subMessage');
    console.log('subCode', subMessage);
    if (subMessage) {
      return { subMessage };
    }
    return null;
  };

  onMounted(() => {
    // 获取当前页面的 URL 查询参数
    console.log('getErrorFromHash()!.subMessage', getErrorFromHash());
    if (getErrorFromHash()) {
      message.error(getErrorFromHash()!.subMessage);
      return;
    }
  });
</script>

<style lang="less" scoped>
  @primary-theme-color: var(--ant-primary-color);

  .login-form {
    :deep(.ant-form-item) {
      margin-bottom: 30px;

      &.ant-form-item-has-error {
        margin-bottom: 6px;
      }
    }

    .login-form-footer {
      position: absolute;
      bottom: 0;
      width: calc(100% - 96px);
      // margin-top: 12px;
      text-align: center;

      .browser {
        color: @primary-theme-color;
      }
    }
  }
  /* 全局 message 强制居中（修复登录页不居中） */
  :global(.ant-message) {
    position: fixed !important;
    top: 8px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    z-index: 9999 !important;
  }
  :global(.ant-message-notice-content) {
    text-align: center !important;
  }
  :deep(.ant-tabs-nav) {
    &::before {
      display: none;
    }
  }

  .others {
    align-items: center;
  }

  .copyright {
    color: #666;
  }

  .feishu {
    width: 46px;
    background-image: url('/@/assets/svg/login-feishu.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }

  .dingding {
    width: 46px;
    background-image: url('/@/assets/svg/login-dingding.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }

  .weixin {
    width: 46px;
    background-image: url('/@/assets/svg/login-weixin.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }

  .MICROSOFT {
    width: 46px;
    background-image: url('/@/assets/svg/login-microsoft.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }
  .third-icon {
    transition: box-shadow 0.3s ease; /* 平滑过渡 */
    border-radius: 50%;
  }
  .third-icon:hover {
    /* 单位用 px，效果一致 */
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  }
</style>
