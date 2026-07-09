import { ref, ComputedRef, onUnmounted, watch, nextTick } from 'vue';
import { GctMqttTopsEnum } from '@gct/runtime';
import { debounce } from 'lodash-es';
import { showConfirmDialog, showToast } from 'vant';
import { getOnlineFormInstanceHoldLockUser } from '/@/apis/gct-apaas/OnlineFormInstanceController';
import { useMitt } from '/@page-designer/hooks/useMitt';
import { mqttSubscribe } from '@mobile/utils/mqtt/android';
import { MqttSingleLinkInstance, UserData } from '@mobile/utils/mqtt/basics-mqtt';
/**
 * 发送遗嘱消息
 * @param selfIdRef 表单实例对象
 * @returns
 */
export function useWatchOnlineFormLockById(
  selfIdRef: ComputedRef<string>,
  { onLockChange, onReload },
) {
  const { mitt } = useMitt();
  const notifyMessage = ref('');
  const userInfo = UserData.value;
  /**mqtt 实例 */
  const onlineFormClient = new MqttSingleLinkInstance({
    ...userInfo.mqttProperties,
    topics: [],
    opts: {},
  });
  /**是否只读 */
  const isReadonly = ref(false);

  /**上一次的 oldFormInstanceId 同于 关闭mqtt 用*/
  const oldFormInstanceId = ref(selfIdRef.value);

  onUnmounted(() => {
    unsubscribe(selfIdRef.value);
    // console.log('onUnmounted');
  });
  watch(selfIdRef, async (newId, oldId) => {
    oldFormInstanceId.value = oldId;
  });

  /**
   * 更新表单锁定状态
   */
  async function updateLockStatus(formInstanceId: string, isViewPage: boolean) {
    isReadonly.value = false;
    notifyMessage.value = '';
    unsubscribe(oldFormInstanceId.value);
    /**只读的表单就不需要走逻辑 */
    if (isViewPage) return;
    await nextTick();
    debounce_by_lock_form_by_user(formInstanceId);
  }
  const debounce_by_lock_form_by_user = debounce(lock_form_by_user, 200);
  /**
   * 获取表单锁定信息
   */
  async function lock_form_by_user(formInstanceId: string) {
    if (!formInstanceId) return;
    const { loginUserId, loginUserName } =
      (await getOnlineFormInstanceHoldLockUser({
        formInstanceId,
      })) || {};

    isReadonly.value = userInfo.userId !== loginUserId;
    notifyMessage.value = isReadonly.value
      ? `用户【${loginUserName}】正在填报该表单，请稍后再尝试填报。`
      : '';
    onLockChange(isReadonly.value);
    connectMqtt(formInstanceId);
  }
  /**
   * 校验当前表单是否可以编辑
   */
  async function checkedEditFormByUser(formInstanceId: string) {
    if (!formInstanceId) return Promise.reject();
    const { loginUserId, loginUserName } =
      (await getOnlineFormInstanceHoldLockUser({
        formInstanceId,
      })) || {};
    const _isReadonly = userInfo.userId !== loginUserId;
    if (_isReadonly) {
      showToast(`用户【${loginUserName}】正在填报该表单，请稍后再尝试填报。`);
      return Promise.reject();
    }
  }

  async function connectMqtt(formInstanceId) {
    const clientId = 'EDHR_MQTT_CLIENT_' + formInstanceId;
    if (isReadonly.value) {
      /**用平台连接的Mqtt订阅主题 */
      await mqttSubscribe(GctMqttTopsEnum.EDHR_FORM_INST_MULTI_PERSON_EDIT_UNLOCK);
      /**被占用的时候  连接mqtt 并且监听一个主题消息*/
      mitt.on(`mqtt-${GctMqttTopsEnum.EDHR_FORM_INST_MULTI_PERSON_EDIT_UNLOCK}`, (msg: any) => {
        const { loginUserName, formInstanceId } = msg;
        if (formInstanceId !== selfIdRef.value) return;
        notifyMessage.value = '';
        showConfirmDialog({
          title: '提示',
          message: `用户【${loginUserName}】已退出编辑，是否立即刷新表单？`,
        }).then(() => {
          onReload();
        });
      });
    } else {
      /**编辑的时候 连接mqtt 并且注册遗嘱消息 延迟5秒 给 网络异常或刷新页面时间*/
      await onlineFormClient.connectMqtt({
        clientId,
        will: {
          topic: GctMqttTopsEnum.EDHR_FORM_INST_MULTI_PERSON_EDIT_BREAK,
          payload: JSON.stringify({
            formInstanceId,
            loginUserId: userInfo.userId,
            loginUserName: userInfo.username,
          }),
        },
      });
    }
    // console.log('重新连接', isReadonly.value);
  }

  /**
   * 发送主题消息
   * 断开连接
   */
  function unsubscribe(formInstanceId) {
    mitt.off(`mqtt-${GctMqttTopsEnum.EDHR_FORM_INST_MULTI_PERSON_EDIT_UNLOCK}`);
    if (!formInstanceId) return;
    onlineFormClient.unsubscribe();
    console.log('断开连接', formInstanceId);
  }
  return { notifyMessage, updateLockStatus, checkedEditFormByUser };
}
