/**平台操作时长在线控制 */
import { throttle } from 'lodash-es';
import { h } from 'vue';
import { Modal } from 'ant-design-vue';
import { useSecuritySetting } from '/@/hooks/platform/useSecuritySetting';
import { useUserStoreWithOut } from '/@/store/modules/user';
import contentRender from './content.vue';
const BROADCAST: string = 'gct-online';

/** 消息类型 */
export enum GCT_EVENT_TYPE {
  GCT_MOUSEMOVE = 'mousemove',
  GCT_SAVELOGIN = 'savelogin',
  GCT_LOGINOUT = 'loginout',
}

interface BroadcastConfig {
  type: GCT_EVENT_TYPE;
  data?: any;
}
export const onlineBroadcast = new BroadcastChannel(BROADCAST);
onlineBroadcast.onmessage = (msg: { data: BroadcastConfig }) => {
  if (msg.data.type === GCT_EVENT_TYPE.GCT_MOUSEMOVE) {
    /**监听到其他窗口在移动鼠标 */
    OnlineControl.startTimer();
  }
  if (msg.data.type === GCT_EVENT_TYPE.GCT_SAVELOGIN) {
    /**监听到其他窗口点击了保持登录*/
    ModelControl.closeModel();
    OnlineControl.addListener();
  }
  if (msg.data.type === GCT_EVENT_TYPE.GCT_LOGINOUT) {
    /**刷新到登录页面*/
    location.href = location.origin;
  }
};
/**在线踢人控制 */
export class OnlineControl {
  static startRunTime = 0;
  /**关闭倒计时 */
  static noOpRetain = 0;
  /**弹框后关闭倒计时 */
  static earlyAlarm = 0;
  static timer: any = null;
  /**初始化开始监听 */
  static runListener() {
    this.timer = null;
    const { securitySetting } = useSecuritySetting();
    const { noOpRetainHour, noOpRetainMinute, earlyAlarmMinute, earlyAlarmSecond } =
      securitySetting as any;
    this.earlyAlarm = earlyAlarmMinute * 60 + earlyAlarmSecond;
    this.noOpRetain = noOpRetainHour * 60 * 60 + noOpRetainMinute * 60;
    if (this.noOpRetain > 0) {
      onlineBroadcast.postMessage({ type: GCT_EVENT_TYPE.GCT_SAVELOGIN });
      this.addListener();
    }
  }
  static addListener() {
    throttleMoverEvent();
    document.addEventListener('mousemove', throttleMoverEvent);
    document.addEventListener('keydown', throttleMoverEvent);
  }
  static startTimer() {
    if (this.timer === 'stop' || !this.noOpRetain || window.self !== window.top) {
      /**个别页面不需要开启 */
      return;
    }
    this.startRunTime = new Date().getTime() + this.noOpRetain * 1000 - this.earlyAlarm * 1000;
    clearTimeout(this.timer);
    this.timer = setInterval(() => {
      const nowTime = new Date().getTime();
      if (this.startRunTime < nowTime) {
        this.emitMoverEvent();
        clearTimeout(this.timer);
      }
    }, 3000);
  }

  /**触发事件*/
  static emitMoverEvent() {
    this.removeListener();
    ModelControl.showModel();
  }

  /**取消监听 */
  static removeListener() {
    document.removeEventListener('mousemove', throttleMoverEvent);
    document.removeEventListener('keydown', throttleMoverEvent);
  }
  /**关闭控制器 */
  static closeControl() {
    clearTimeout(this.timer);
    this.removeListener();
    this.timer = 'stop';
  }
  /**退出登录 */
  static loginOutEvent() {
    if (!ModelControl.show) return;
    onlineBroadcast.postMessage({ type: GCT_EVENT_TYPE.GCT_LOGINOUT });
    const userStore = useUserStoreWithOut();
    userStore.logout(true);
  }
}

/**模态框控制器 */
export class ModelControl {
  static show = false;
  static modalVm: any = null;
  static showModel() {
    this.show = true;
    this.modalVm = Modal.warning({
      title: $t('sys.tip'),
      content: () =>
        h(contentRender, {
          startRunTime: OnlineControl.startRunTime + OnlineControl.earlyAlarm * 1000,
          loginOutEvent: OnlineControl.loginOutEvent,
        }),
      okText: $t('sys.app.maintainLoginStatus'),
      onOk() {
        onlineBroadcast.postMessage({ type: GCT_EVENT_TYPE.GCT_SAVELOGIN });
        OnlineControl.addListener();
      },
    });
  }
  static closeModel() {
    this.show = false;
    this.modalVm && this.modalVm.destroy();
  }
}
const throttleMoverEvent = throttle(() => {
  onlineBroadcast.postMessage({ type: GCT_EVENT_TYPE.GCT_MOUSEMOVE });
  setTimeout(() => {
    OnlineControl.startTimer();
  });
}, 4000);
