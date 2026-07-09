import { ref, computed, createVNode } from 'vue';
import { PageOccupyResponse, PageLockRequest } from '/@/apis/gct-apaas/model';
import {
  getDesignerLockGetPageOccupyMsg,
  getDesignerLockGetPageOccupyMsgQueryInterface,
  postDesignerLockOccupyPage,
  postDesignerLockCancelOccupyPage,
  postDesignerLockLockPage,
  postDesignerLockUnLockPage,
} from '/@/apis/gct-apaas/DesignerLockController';
import { throttle } from 'lodash-es';
import { useUserStoreWithOut } from '/@/store/modules/user';
import { useMessage } from '/@/hooks/web/useMessage';
import { Modal } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { ScriptTypeEnum, PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { initMqtt } from '@mobile/utils/mqtt/web';
import { mitt } from '/@/utils/mitt';

const newKeyTag = '___new___';
const eventBus = mitt();

const i18nKeyMap = {
  [PageTypeEnum.WEB]: 'sys.page',
  [PageTypeEnum.MOBILE]: 'sys.page',
  [PageTypeEnum.PAD]: 'sys.page',
  [ScriptTypeEnum.DEFAULT]: 'sys.script',
  [ScriptTypeEnum.ORCHESTRATION]: 'sys.model.serviceOrchestration',
};

type Params = PageLockRequest | getDesignerLockGetPageOccupyMsgQueryInterface;
interface IUserLockInfo {
  id?: string;
  name?: string;
}
/** 参数 */
let params: Params = {};

/** 占用信息 */
const occupyInfo = ref<PageOccupyResponse>({});

/** 锁定信息 */
const lockInfo = ref<IUserLockInfo>({});

// 占用查询间隔
const timeout = computed(() => {
  return occupyInfo.value.querySpanNum! * 1000;
});

// 占用缓存间隔
const wait = computed(() => {
  return ((occupyInfo.value.cacheNum! - 10) / 2) * 1000;
});

function isLocalDesignerRuntime() {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hash.includes('/Online-form-designer/__local__') ||
    new URLSearchParams(window.location.hash.split('?')[1] || '').get('local') === '1'
  );
}

function getUserInfo() {
  return useUserStoreWithOut().getUserInfo || {};
}

// 仅锁定人和管理员可以解锁
const unlockAvailable = computed(() => {
  if (isLocalDesignerRuntime()) return true;
  const { userId, username } = getUserInfo();
  return lockInfo.value.id === userId || username === 'admin';
});

/** 仅当用户占用或者锁定人为当前用户时 */
// const saveAvailable = computed(() => {
//   const { userId } = userStore.getUserInfo;
//   return (
//     (!occupyInfo.value.id && !lockInfo.value.id) ||
//     occupyInfo.value.id === userId ||
//     lockInfo.value.id === userId
//   );
// });

/** 查询占用定时器 */
let occupyTimer: NodeJS.Timer | null = null;

async function _loadOccupyInfo() {
  if (isLocalDesignerRuntime()) return;
  if (!params.id || !params.type || params.id.startsWith(newKeyTag)) return;
  console.log('【获取占用】', parseInt(Date.now() / 1000));
  const res = await getDesignerLockGetPageOccupyMsg(
    params as getDesignerLockGetPageOccupyMsgQueryInterface,
  );
  const data = {
    ...res!,
  };
  if (!data.querySpanNum) data.querySpanNum = 120;
  if (!data.cacheNum) data.cacheNum = 500;
  occupyInfo.value = data;
  if (res?.occupyId) {
    destoryOccupyTimer();
  } else if (!occupyTimer) {
    occupyTimer = setInterval(() => {
      _loadOccupyInfo();
    }, timeout.value);
  }
}
function destoryOccupyTimer() {
  console.log('【销毁占用轮询】');
  if (!occupyTimer) return;
  console.log('【销毁占用轮询 清除定时器】');
  clearInterval(occupyTimer);
  occupyTimer = null;
}

export function useUserOccupy() {
  function initMqttOccupy(data) {
    if (isLocalDesignerRuntime()) return;
    let appTag = '';
    let branchId = '';
    const pathname = window.location.pathname;
    if (pathname.includes('/page-designer/')) {
      appTag = pathname.split('/page-designer/')[1].split('/')[0];
      branchId = pathname.split('/page-designer/')[1].split('/')[1];
    }
    if (pathname.includes('/app-designer/')) {
      appTag = pathname.split('/app-designer/')[1].split('/')[0];
      branchId = pathname.split('/app-designer/')[1].split('/')[1];
    }
    /** 设计器编辑占用 */
    const OCCPUY_TOPIC = `CANCELOCCUPY/${appTag}/${branchId}`;
    /** 强制刷新主题 */
    const CLEAN_CACHE = `CLEAN_CACHE`;
    const userInfo = getUserInfo();
    initMqtt({
      topics: [OCCPUY_TOPIC, CLEAN_CACHE],
      ...userInfo.mqttProperties,
      opts: {
        will: {
          topic: OCCPUY_TOPIC,
          payload: JSON.stringify({
            ...data,
            userId: userInfo.userId,
          }),
        },
      },
    });
    eventBus.off(`mqtt-${CLEAN_CACHE}`);
    // 强制刷新
    eventBus.on(`mqtt-${CLEAN_CACHE}`, (_msg: any) => {
      const currentUrl = window.location.href;
      if (currentUrl.includes('?')) {
        // 如果是reloadTime
        if (currentUrl.includes('reloadTime')) {
          const arr = currentUrl.split('reloadTime=');
          arr[1] = Date.now().toString();
          window.location.href = arr.join('reloadTime=');
        } else {
          window.location.href = currentUrl + '&reloadTime=' + Date.now();
        }
      } else {
        window.location.href = currentUrl + '?reloadTime=' + Date.now();
      }
      location.reload(true);
    });
  }

  function initOccupy(data: Params) {
    params = data;
    initMqttOccupy(params);
  }

  async function loadOccupyInfo() {
    await _loadOccupyInfo();
  }

  async function _occupy() {
    if (isLocalDesignerRuntime()) return;
    if (!params.id || !params.type) return;
    if (lockInfo.value.id) return;
    const userInfo = getUserInfo();
    if (userInfo.userId !== occupyInfo.value.occupyId && occupyInfo.value.occupyId) return;
    window.console.log('【页面占用 节流】', parseInt(Date.now() / 1000));
    try {
      await postDesignerLockOccupyPage(params);
    } catch (err) {
      console.warn('【占用异常】');
    } finally {
      await _loadOccupyInfo();
    }
  }

  /**
   * 占用
   */
  const occupy = throttle(_occupy, wait.value, { trailing: false });

  /**
   * 取消占用
   */
  async function cancelOccupy() {
    if (isLocalDesignerRuntime()) return;
    if (!params.id || !params.type) return;
    if (lockInfo.value.id) return;
    // 取消占用的时候移除节流
    occupy.cancel();
    window.console.log('【取消占用】', parseInt(Date.now() / 1000));
    await postDesignerLockCancelOccupyPage(params);
    await _loadOccupyInfo();
  }

  function setLockInfo(data: IUserLockInfo) {
    lockInfo.value = data;
  }

  /**
   * 锁定
   */
  async function lock() {
    if (isLocalDesignerRuntime()) return;
    if (occupyInfo.value.occupyId) return;
    if (lockInfo.value.id) return;
    const { createMessage } = useMessage();
    const { t } = useI18n();

    Modal.confirm({
      title: t('sys.sureToLockSth', { sth: t(i18nKeyMap[params.type!]) }),
      icon: createVNode(ExclamationCircleOutlined),
      okText: t('sys.ok'),
      cancelText: t('sys.cancel'),
      async onOk() {
        const userStore = useUserStoreWithOut();
        await postDesignerLockLockPage(params);
        createMessage.success(t('sys.operationSuccess'));
        lockInfo.value = {
          id: userStore.getUserInfo.userId,
          name: userStore.getUserInfo.fullname,
        };
      },
      onCancel() {},
    });
  }
  /**
   * 解锁
   */
  async function unlock() {
    if (isLocalDesignerRuntime()) return;
    const { createMessage } = useMessage();
    const { t } = useI18n();
    await postDesignerLockUnLockPage(params);
    createMessage.success(t('sys.operationSuccess'));
    lockInfo.value = {
      id: '',
      name: '',
    };
  }

  return {
    initOccupy,

    loadOccupyInfo,
    occupyInfo,
    occupy,
    cancelOccupy,

    setLockInfo,
    lockInfo,
    unlockAvailable,
    lock,
    unlock,

    // saveAvailable,
  };
}
