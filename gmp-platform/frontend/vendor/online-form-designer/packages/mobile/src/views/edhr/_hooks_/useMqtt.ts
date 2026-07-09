import { useEnv } from '@mobile/utils/useEnv';
import { UserData, CurrentTenant, AccessToken, appLoginOut } from '@mobile/stores/loginHooks';
import { getAid } from '@mobile/stores/sessionHooks';
import { getMobileBrowserFingerprint, getPageIdentification } from '@/hooks/event/userBrowser';
import { initMqtt, mqttUnSubscribe, mqttPublish } from '@mobile/utils/mqtt/android';
import { ref, computed, onMounted } from 'vue';
import { useMitt } from '/@page-designer/hooks/useMitt';
import { setToken } from '@gct-paas/core';
import { showDialog } from 'vant';
import { signLogRegister } from '@mobile/utils/signLog';

const { mitt } = useMitt();
const { getEnv } = useEnv();
/**
 * mqtt初始化
 */
export function useInitMqtt() {
  const env = getEnv();
  const info = UserData.value;
  const fingerprint = ref();

  /**
   * clientId
   * signLog 登录登出的
   * upAndDownLine 上下线的
   */
  const clientIdMap = computed(() => {
    return {
      signLog: 'logout' + fingerprint.value + getPageIdentification(),
      upAndDownLine: `mobile.${info?.userId}.${env}.${getAid.value}.${info?.ip}.${
        fingerprint.value
      }.${new Date().getTime()}`,
    };
  });
  /**
   * 上下线  上线发消息 下线发遗嘱消息
   */
  async function upAndDownLines() {
    if (env === 'dev') return;
    fingerprint.value = await getMobileBrowserFingerprint();
    /**踢出主题 */
    const KICK_OUT_TOPIC = `USER/${info.userId}/KICK_OUT`;
    const clientId = clientIdMap.value.upAndDownLine;
    const topic = 'users/control/msg';
    const message = { clientId, msg: 'online' };
    /**统计在线用户 */
    await initMqtt({
      ...info.mqttProperties,
      topics: [KICK_OUT_TOPIC],
      opts: {
        clientId,
        will: {
          topic,
          payload: JSON.stringify({
            clientId,
            msg: 'exit',
          }),
        },
      },
    });
    mqttPublish(topic, JSON.stringify(message));
    mitt.off(`mqtt-${KICK_OUT_TOPIC}`);
    // 订阅登出信息
    mitt.on(`mqtt-${KICK_OUT_TOPIC}`, (msg: any) => {
      const tokenId = msg.token;
      const token = AccessToken.value;
      if (token && token === tokenId) {
        setToken(token);
        // 退出登录
        showDialog({
          title: '登录警告',
          message: '当前账号已在其他设备登录',
        }).then(() => {
          appLoginOut();
        });
      }
    });
  }

  /**
   * 登录消息 调接口
   */
  async function signLog() {
    if (env === 'dev') return;
    await signLogRegister('APPFRONT', getAid.value, CurrentTenant.value.id);
    initUnSignLog();
  }

  /**
   * 登出消息 注册mqtt  遗嘱消息触发
   */
  async function initUnSignLog() {
    fingerprint.value = await getMobileBrowserFingerprint();
    /**移除应用 */
    const EXIT_TOPIC = `mobile.${info?.userId}.${env}.${getAid.value}.${info?.ip}.${fingerprint.value}/EXIT`;
    const logoutTopic = 'users/logout/msg';
    const clientId = clientIdMap.value.signLog;
    initMqtt({
      ...info.mqttProperties,
      topics: [EXIT_TOPIC],
      opts: {
        clientId,
        will: {
          topic: logoutTopic,
          payload: JSON.stringify({
            appId: getAid.value,
            ipAddress: info?.ip,
            signLog: `${info?.userId}.${env}.${
              fingerprint.value
            }.APPFRONT.mobile.${getPageIdentification()}`,
            tenantId: CurrentTenant.value.id,
          }),
        },
      },
    });
  }

  return { upAndDownLines, signLog };
}
