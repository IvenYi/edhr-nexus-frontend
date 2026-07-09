<template>
  <div class="back" @click="toSystem()"><LeftOutlined /> {{ t('sys.platform.backMoreLogin') }}</div>

  <div class="code-area">
    <div v-if="defProps.authType !== 'QIYEWEIXIN' || wxCodeFail" class="qrcode-title">
      <div :class="defProps.authType" class="mr-20px"></div>
      <div>{{ t('sys.platform.scanLogin') }}</div>
    </div>
    <div v-if="defProps.authType !== 'QIYEWEIXIN' || wxCodeFail" class="sub-title">
      {{
        t('sys.platform.pleaseScanQrcode', {
          authType: t(`sys.platform.${defProps.authType}`),
        })
      }}
    </div>

    <div id="qrcode" v-show="loginType === 'QIYEWEIXIN' || loginType === 'FEISHU'"></div>
    <div
      id="self_defined_element"
      class="self-defined-classname"
      v-show="loginType === 'DINGDING'"
    ></div>
  </div>
</template>
<script lang="ts" setup>
  import * as ww from '@wecom/jssdk';
  import { useUserStore } from '/@/store/modules/user';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { onMounted, reactive, ref, watch } from 'vue';
  import { useRootSetting } from '@/hooks/setting/useRootSetting';
  import { useEnv } from '/@/hooks/develop/useEnv';

  const defProps = defineProps<{
    authType: String;
  }>();
  const emit = defineEmits(['openSystemLogin']);

  const { notification } = useMessage();

  const { isAppSingle } = useEnv();

  const { getLoginIDOAuthConfigs } = useRootSetting();

  let currentInfo = reactive<{
    appId: String;
    appagentIdId: String;
    redirectURL: String;
  }>({
    appId: '',
    appagentIdId: '',
    redirectURL: '',
  });

  const loginType = ref<String>('');

  const { t } = useI18n();

  const userStore = useUserStore();

  const wwLogin = ref();

  const wxCodeFail = ref<boolean>(true);

  const toSystem = () => {
    emit('openSystemLogin');
  };

  /** 企业微信登录 */
  const initWeiXin = () => {
    return ww.createWWLoginPanel({
      el: '#ww_login',
      params: {
        login_type: 'CorpApp',
        appid: currentInfo.appId,
        agentid: currentInfo.agentId,
        redirect_uri: `${import.meta.env.DEV ? 'http://localhost:5174' : location.origin}`,
        state: `QIYEWEIXIN`,
        redirect_type: 'callback',
        width: '300',
        height: '300',
      },
      onCheckWeComLogin({ isWeComLogin }) {
        // console.log(isWeComLogin);
      },
      async onLoginSuccess({ code }) {
        login(code, 'QIYEWEIXIN');
      },
      onLoginFail(err) {
        // console.log(err);
        const errCode = [-31020, -31027, -31028, -31033, -31034, -31035, -31037, -31039, -31040];
        if (err && err.errCode && errCode.includes(err.errCode)) {
          document.getElementById('qrcode').removeChild(wwLogin.value.el);
          wxCodeFail.value = true;
        } else {
          wxCodeFail.value = false;
        }
      },
    });
  };

  /** 飞书登录 */
  const QRLoginObj = ref();
  const handleInitFeishu = async () => {
    const fsGoto = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${currentInfo.appId}&redirect_uri=${currentInfo.redirectURL}&response_type=code&state=FEISHU`;

    QRLoginObj.value = window.QRLogin({
      id: 'qrcode',
      goto: fsGoto,
      width: '300',
      height: '300',
      style: 'border:0',
    });
    if (typeof window.addEventListener != 'undefined') {
      window.addEventListener('message', handleMessage, false);
    } else if (typeof window.attachEvent != 'undefined') {
      window.attachEvent('onmessage', handleMessage);
    }
  };

  const handleMessage = async function (event) {
    if (QRLoginObj.value.matchOrigin(event.origin) && QRLoginObj.value.matchData(event.data)) {
      var loginTmpCode = event.data;
      window.location.href = `https://passport.feishu.cn/suite/passport/oauth/authorize?client_id=${currentInfo.appId}&redirect_uri=${currentInfo.redirectURL}&response_type=code&state=FEISHU&tmp_code=${loginTmpCode.tmp_code}`;
      //${ isAppSingle ? location.pathname : '' }
    }
  };

  /** 钉钉登录 */
  const handleInitDing = () => {
    const url = currentInfo.redirectURL;
    window.DTFrameLogin(
      {
        id: 'self_defined_element',
        width: 300,
        height: 300,
      },
      {
        redirect_uri: encodeURIComponent(url), // 登录成功后的回调地址
        client_id: currentInfo.appId, // 服务端给你
        scope: 'openid', // 这里一般是openid
        response_type: 'code',
        state: 'DINGDING',
        prompt: 'consent',
      },
      (loginResult) => {
        const { redirectUrl, authCode, state } = loginResult;
        login(authCode, 'DINGDING');
        // // 这里可以直接进行重定向
        // window.location.href = redirectUrl;
      },
      (errorMsg) => {
        // 这里一般需要展示登录失败的具体原因
        // console.log(`11111 ${errorMsg}`);
      },
    );
  };

  const login = async (code: string, authCode: string) => {
    try {
      const userInfo = await userStore.login({
        password: '-',
        username: '-',
        code: code,
        authCode,
      });
      if (userInfo) {
        notification.success({
          message: t('sys.loginSuccessTitle'),
          description: `${t('sys.loginSuccessDesc')}: ${userInfo.fullname}`,
          duration: 3,
        });
      }
    } catch (error) {}
  };

  watch(
    () => defProps.authType,
    (value) => {
      if (value) {
        loginType.value = value;
        currentInfo =
          getLoginIDOAuthConfigs.value?.filter((item) => item.authType === value)[0] || {};

        if (value === 'QIYEWEIXIN') {
          wwLogin.value = initWeiXin();
        }
      }
      setTimeout(() => {
        if (value === 'DINGDING') {
          handleInitDing();
          return;
        }
        if (value === 'FEISHU') {
          handleInitFeishu();
          return;
        }
        if (value === 'QIYEWEIXIN') {
          document.getElementById('qrcode').appendChild(wwLogin.value.el);
          return;
        }
      }, 500);
    },
    { immediate: true },
  );
</script>

<style lang="less" scoped>
  .code-area {
    padding-top: 80px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .qrcode-title {
    display: flex;
    vertical-align: top;
    line-height: 46px;
    color: #242424;
    font-size: 32px;
  }

  .sub-title {
    font-size: 16px;
    color: #666666;
    line-height: 22px;
    margin: 10px 0 20px 0;
  }

  .FEISHU {
    display: inline-block;
    width: 46px;
    height: 46px;
    background-image: url('/@/assets/svg/login-feishu.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }

  .DINGDING {
    display: inline-block;
    width: 46px;
    height: 46px;
    background-image: url('/@/assets/svg/login-dingding.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }

  .QIYEWEIXIN {
    display: inline-block;
    width: 46px;
    height: 46px;
    background-image: url('/@/assets/svg/login-weixin.svg');
    background-repeat: no-repeat;
    background-size: cover;
  }

  .back {
    position: absolute;
    top: -28px;
    left: 0;
    color: #3168ec;
    cursor: pointer;
  }

  .self-defined-classname {
    width: 300px;
    height: 300px;
  }
</style>
