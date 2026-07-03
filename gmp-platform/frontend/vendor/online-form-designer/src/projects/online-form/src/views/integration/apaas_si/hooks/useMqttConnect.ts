import { GctMqttCenter } from '/@/utils/mqtt';
import { ref, ComputedRef, onUnmounted, watch, nextTick, type Ref } from 'vue';
import { GctMqttTopsEnum } from '@gct/runtime';
import { debounce } from 'lodash-es';
import { message, Modal } from 'ant-design-vue';
import { getOnlineFormInstanceHoldLockUser } from '/@/apis/gct-apaas/OnlineFormInstanceController';
import { useMitt } from '/@page-designer/hooks/useMitt';
import { mqttSubscribe } from '@mobile/utils/mqtt/web';

interface LockStatusOptions {
  onLockChange: (isReadonly: boolean) => void;
  onReload: () => void;
}

interface LockUserInfo {
  loginUserId: string;
  loginUserName: string;
}

/**
 * 发送遗嘱消息
 * @param selfIdRef 表单实例对象
 * @returns
 */
export function useWatchOnlineFormLockById(
  selfIdRef: ComputedRef<string>,
  { onLockChange, onReload }: LockStatusOptions,
) {
  const { mitt } = useMitt();
  const unTopicRef = ref<Function | undefined>();
  const notifyMessage = ref('');
  const onlineFormClient = ref<any>();
  const isReadonly = ref(false);
  const userInfo = GctMqttCenter.getUserInfo();
  const oldFormInstanceId = ref(selfIdRef.value);

  onUnmounted(() => {
    unsubscribe(oldFormInstanceId.value);
  });

  watch(selfIdRef, (newId, oldId) => {
    oldFormInstanceId.value = oldId;
  });

  /**
   * 更新表单锁定状态
   */
  async function updateLockStatus(formInstanceId: string, isViewPage: boolean): Promise<void> {
    isReadonly.value = false;
    notifyMessage.value = '';
    unsubscribe(oldFormInstanceId.value);
    if (isViewPage) return;
    await nextTick();
    debounceLockFormByUser(formInstanceId);
  }

  const debounceLockFormByUser = debounce(lockFormByUser, 200);

  /**
   * 获取表单锁定信息
   */
  async function lockFormByUser(formInstanceId: string): Promise<void> {
    if (!formInstanceId) return;
    const { loginUserId, loginUserName } = (await getOnlineFormInstanceHoldLockUser({
      formInstanceId,
    })) as LockUserInfo;

    isReadonly.value = userInfo.userId !== loginUserId;
    notifyMessage.value = isReadonly.value
      ? $t('sys.onlineForm.formBeingFilled', { username: loginUserName })
      : '';
    onLockChange(isReadonly.value);
    connectMqtt(formInstanceId);
  }

  /**
   * 校验当前表单是否可以编辑
   */
  async function checkedEditFormByUser(formInstanceId: string): Promise<void> {
    if (!formInstanceId) return Promise.reject();
    const { loginUserId, loginUserName } = (await getOnlineFormInstanceHoldLockUser({
      formInstanceId,
    })) as LockUserInfo;

    if (userInfo.userId !== loginUserId) {
      message.warning($t('sys.onlineForm.formBeingFilled', { username: loginUserName }));
      return Promise.reject();
    }
  }

  /**
   * 解锁
   */
  async function unlockFormByUser(formInstanceId: string): Promise<void> {
    if (!formInstanceId) return;
    // 解锁逻辑（如果有需要）
  }

  /**
   * 连接 MQTT
   */
  async function connectMqtt(formInstanceId: string): Promise<void> {
    const clientId = `EDHR_MQTT_CLIENT_${formInstanceId}`;
    if (isReadonly.value) {
      const { unTopic } = await mqttSubscribe(
        GctMqttTopsEnum.EDHR_FORM_INST_MULTI_PERSON_EDIT_UNLOCK,
      );
      unTopicRef.value = unTopic;

      mitt.on(`mqtt-${GctMqttTopsEnum.EDHR_FORM_INST_MULTI_PERSON_EDIT_UNLOCK}`, (msg: any) => {
        const { loginUserName, formInstanceId: msgFormInstanceId } = msg;
        if (msgFormInstanceId !== selfIdRef.value) return;
        notifyMessage.value = '';
        Modal.confirm({
          centered: true,
          title: $t('sys.onlineForm.formInstanceUnlock', { username: loginUserName }),
          onOk: onReload,
        });
      });
    } else {
      onlineFormClient.value = await GctMqttCenter.createMqttClientInstance(clientId, {
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
  }

  /**
   * 断开连接
   */
  function unsubscribe(formInstanceId: string): void {
    mitt.off(`mqtt-${GctMqttTopsEnum.EDHR_FORM_INST_MULTI_PERSON_EDIT_UNLOCK}`);
    unTopicRef.value?.();
    if (onlineFormClient.value && formInstanceId) {
      onlineFormClient.value.unsubscribe();
    }
  }

  return { notifyMessage, updateLockStatus, checkedEditFormByUser };
}
