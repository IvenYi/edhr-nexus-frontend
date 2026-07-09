import { ref, Ref, computed, createVNode } from 'vue';
import {
  getWebpageInfo,
  postWebpageUnLockWebPage,
  postWebpageLockWebPage,
} from '/@/apis/gct-apaas/WebpageController';
import { PermissionResponse, WebpageResponse } from '/@/apis/gct-apaas/model';
import { useUserStore } from '/@/store/modules/user';
import { useQueryStore } from '/@/store/modules/query';
import { ExclamationCircleOutlined } from '@ant-design/icons-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import { useCacheHistory } from '/@/hooks/develop/useCacheHistory';
import { Modal } from 'ant-design-vue';
import { PanelEnum } from '/@page-designer/enum/panel';
import { isEmptyStr } from '/@/utils/is';
import { useDesigner } from './useDesigner';
import { Platform } from '../enum';
import { useToolkit } from '/@page-designer/hooks/useToolkit';
import { getMobilePageInfo } from '/@/apis/gct-apaas/MobilePageController';
import { getPadPageInfo } from '/@/apis/gct-apaas/PadPageController';
import { useUserOccupy } from '/@/components/UserOccupy/useUserOccupy';
import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { getPermissionList } from '/@/apis/gct-apaas/PermissionController';
import { createWidgetByType } from '/@page-designer/schema/utils';
import { FormComponents } from '/@page-designer/enum';
import { PluginPgkUtil } from '@gct-paas/core';
import { useAppInfoStore } from '/@/store/modules/app-info';

// 标识当前界面是新建状态
export const newKeyTag = '___new___';

export type PageInfo = WebpageResponse & { categoryId?: string };

export const pageInfo: Ref<PageInfo> = ref({});
/**设计器是WEB还是MOBILE的标识 */
export const platform = ref<Platform>(Platform.WEB);
export const pagePermissions = ref<PermissionResponse[]>([]);
const { setLockInfo, initOccupy, loadOccupyInfo } = useUserOccupy();

// 仅锁定人和管理员可以解锁
export const unlockAvailable = computed(() => {
  const userStore = useUserStore();
  const { userId, username } = userStore.getUserInfo;
  return pageInfo.value.lockUserId === userId || username === 'admin';
});

export const currentPanel: Ref<PanelEnum> = ref(PanelEnum.PAGE);
/**
 * 加载页面信息
 * @returns
 */
export async function loadPageInfo(app) {
  const { initToolkitWidgets } = useToolkit();
  const {
    setPageJson,
    loadPageDesignHistoryList,
    emitCache,
    pageJson,
    setPluginConfigs,
    savePageJsonSnapshot,
  } = useDesigner();
  const queryStore = useQueryStore();
  const { historyUtils } = useCacheHistory();
  platform.value = ((queryStore.query as any).platform as Platform) || Platform.WEB;
  const pid = queryStore.getPid() || '';
  if (pid.startsWith(newKeyTag)) {
    const key = pid.replace(`${newKeyTag}:`, '');
    pageInfo.value = {
      id: newKeyTag,
      name: '',
      key: key,
      designerJson: '',
    };
  } else {
    const pageInfoRes =
      platform.value === Platform.WEB
        ? await getWebpageInfo({
            id: queryStore.getPid()!,
          })
        : platform.value === Platform.PAD
          ? await getPadPageInfo({
              id: queryStore.getPid()!,
            })
          : await getMobilePageInfo({
              id: queryStore.getPid()!,
            });
    pageInfo.value = pageInfoRes!;
  }

  const { appInfo } = useAppInfoStore();

  const [configs] = await PluginPgkUtil.loadDesignPlugin(
    app,
    platform.value,
    appInfo.suiteKey ? [appInfo.suiteKey] : undefined,
  );
  setPluginConfigs(configs);

  // ! 初始化撤销重做历史记录
  if (!historyUtils.isHistoryInfoExist(queryStore.getPid())) {
    historyUtils.init({ historyId: queryStore.getPid() ?? '' });
  }
  if (pageInfo.value.designerJson && !isEmptyStr(pageInfo.value.designerJson)) {
    const _json = JSON.parse(pageInfo.value.designerJson);
    if (_json && _json.plugins) {
      // 过滤出已经删除的未加载的插件，单独加载
      const items = _json.plugins.filter((item: IObject) => {
        return configs.findIndex((config: IObject) => config.key === item.key) === -1;
      });
      await PluginPgkUtil.loadDesignDeletedPlugins(platform.value, items);
    }
    // 兼容老数据，如果为老数据时，补充pageConfig，并将底部按钮配置为false
    if (!_json.pageConfig) {
      _json.pageConfig = {
        title: '',
        i18n: {},
        hasFooter: false,
      };
    }
    setPageJson({ ..._json, id: pageInfo.value.id });
  } else {
    // ! designerJson为空的时候也需要插入一条历史记录
    emitCache(false);
    if (platform.value === Platform.WEB) {
      setPageJson({
        newDesigner: true,
        style: {
          paddingAll: '',
          paddingTop: '',
          paddingRight: '16',
          paddingBottom: '16',
          paddingLeft: '16',
        },
      });
    } else if (platform.value === Platform.PAD) {
      setPageJson({
        newDesigner: true,
        style: {
          paddingAll: '0',
          paddingTop: '0',
          paddingRight: '0',
          paddingBottom: '0',
          paddingLeft: '0',
          backgroundColor: '#fff',
        },
      });
    } else {
      setPageJson({
        newDesigner: true,
        style: {
          paddingAll: '16',
          paddingTop: '16',
          paddingRight: '16',
          paddingBottom: '16',
          paddingLeft: '16',
          backgroundColor: '#fff',
        },
      });
    }
  }

  if (!pageJson.widgets.some((item) => item.type === FormComponents.BottomButtonContainer)) {
    const bottomBtnWidget = createWidgetByType(FormComponents.BottomButtonContainer);
    pageJson.widgets.push(bottomBtnWidget);
  }
  initToolkitWidgets();
  // 获取历史版本列表
  loadPageDesignHistoryList();
  //要init页面的权限
  pagePermissions.value = (await getPermissionList({ relationId: queryStore.getPid() })) || [];
  // 新建模式下刚进来不初始化锁定系统，在基本信息保存后再初始化
  if (!pid.startsWith(newKeyTag)) {
    initLockState();
  }
  savePageJsonSnapshot();
}

/**
 * 初始化界面占用信息
 */
function initLockState() {
  const queryStore = useQueryStore();
  const pid = queryStore.getPid() || '';

  // 占用信息
  initOccupy({
    id: pid,
    type: (platform.value === Platform.WEB
      ? PageTypeEnum.WEB
      : platform.value === Platform.PAD
        ? PageTypeEnum.PAD
        : PageTypeEnum.MOBILE
    ).toString(),
  });
  loadOccupyInfo();
  setLockInfo({
    id: pageInfo.value?.lockUserId,
    name: pageInfo.value?.lockUserName,
  });
}

const lockPageWithConfirm = (id) => {
  const { t } = useI18n();
  Modal.confirm({
    title: t('sys.sureToLock'),
    icon: createVNode(ExclamationCircleOutlined),
    okText: t('sys.ok'),
    cancelText: t('sys.cancel'),
    async onOk() {
      const userStore = useUserStore();
      await postWebpageLockWebPage({
        id,
      });
      pageInfo.value.lockUserId = userStore.getUserInfo.userId;
      pageInfo.value.lockUserName = userStore.getUserInfo.fullname;
    },
    onCancel() {},
  });
};

/**
 * 更新页面锁定状态
 * @param {boolean} value
 */
export async function lockPage(value: Boolean = true) {
  const queryStore = useQueryStore();
  const id = queryStore.getPid()!;
  if (value) {
    lockPageWithConfirm(id);
  } else {
    await postWebpageUnLockWebPage({
      id,
    });
    pageInfo.value.lockUserId = '';
    pageInfo.value.lockUserName = '';
  }
}

export function togglePanel(value: PanelEnum) {
  if (currentPanel.value === value) return;
  currentPanel.value = value;
}

export function usePage() {
  return {
    togglePanel,
    initLockState,
  };
}
