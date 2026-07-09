import { computed, ComputedRef, reactive, ref, inject } from 'vue';
import { cloneDeep, isArray, isEmpty, isNil } from 'lodash-es';
import {
  ExportMethod,
  PageJson,
  PagePlugin,
  RuntimeModal,
  RuntimePageJson,
} from '/@page-designer/types/designer';
import { useQueryStore } from '/@/store/modules/query';
import { putWebpageUpdateDesignerJsonById } from '/@/apis/gct-apaas/WebpageController';
import { traverseAndBuildTree, findNodeAll, findNode } from '/@/utils/helper/treeHelper';
import allWidgetInfo from '../schema';
import { LowCodeWidget } from '../types/widget-basic-types';
import { buildRunJs, initMethodMap } from '/@/utils/transform-js';
import { useMessage } from '/@/hooks/web/useMessage';
import { genUrl, openWindow } from '/@/utils';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { useI18n } from '/@/hooks/web/useI18n';
import { useSelectedWidget } from './useSelectedWidget';
import { useScope } from './useScope';
import { LowCodeModal } from '../types/modal-types';
import { widget as modal } from '../schema/modal/modal';
import { BuiltinType, FormComponents, Platform, SCOPE } from '../enum';
import { Mapping } from '/@page-designer/types/web/widget-types';
import { putMobilePageUpdateDesignerJsonById } from '/@/apis/gct-apaas/MobilePageController';
import { putPadPageUpdateDesignerJsonById } from '/@/apis/gct-apaas/PadPageController';
import {
  getPageDesignerLogPageList,
  getPageDesignerLogInfo,
  deletePageDesignerLog,
} from '/@/apis/gct-apaas/PageDesignerLogController';
import { platform } from './usePage';
import { useGlobal } from '/@page-designer/hooks/useGlobal';
import { getToken } from '/@/utils/auth';
import { AsyncGctComponents } from '/@page-designer/components/pcModule';
import { AsyncGctComponents as AsyncMobileGctComponents } from '/@page-designer/components/mobileModuleDesign';
import { AsyncGctComponents as AsyncPadGctComponents } from '/@page-designer/components/padModuleDesign';
import { useCacheHistory } from '/@/hooks/develop/useCacheHistory';
import { PageDesignerLogResponse } from '/@/apis/gct-apaas/model/index';
import { useUserOccupy } from '/@/components/UserOccupy/useUserOccupy';
import { useUserStore, useUserStoreWithOut } from '/@/store/modules/user';
import { useBranch } from '/@/hooks/develop/useBranch';
import { getCompPos } from '/@page-designer/schema/utils';
import { FIELD_TYPE } from '/@/enums/appEnum';
import { DesignerController } from '../designer/designer.controller';
import { message } from 'ant-design-vue';
import { useDebounceFn } from '@vueuse/core';
import { pageLayoutModeEnum, syncReactive } from '@gct/runtime';
import { getSandboxConfigList } from '/@/apis/gct-apaas/SandboxConfigController';
import { SearchComponents } from '/@page-designer/enum';

const { branchId } = useBranch();
const { t } = useI18n();
const { createMessage } = useMessage();
const { queryInfo } = useGlobal();
const { historyUtils } = useCacheHistory();
const { cancelOccupy, occupy } = useUserOccupy();
const userStore = useUserStore();

/**是否在设计弹框标识 */
const modalDesignState = ref(false);
const modalDesignId = ref('');
/** 子表弹框标识 */
const subTableModalState = ref(false);
const subTableModalId = ref('');

/**工作流节点 */
const wfNodesModalState = ref(false);
const wfNodesModalId = ref('');

/**节点配置模态框 */
const workflowModalState = ref(false);
const workflowModalId = ref('');
/**当前弹框的info */
const modalInfo = ref<LowCodeModal.Modal>(cloneDeep(modal));
const regRoot = /^root:/;

/**设计页面JSON */
const pageJson = reactive<PageJson>({
  id: '',
  keepAlive: false,
  pageEvents: {},
  pageVars: [],
  widgets: [],
  js: '',
  css: '',
  modals: [],
  template: [],
  globalEvents: {},
  los: {},
  permissions: {},
  plugins: [],
  style: {
    // paddingAll: '10',
    // paddingTop: '10',
    // paddingRight: '10',
    // paddingBottom: '10',
    // paddingLeft: '10',
  },
  pageConfig: {
    title: '',
    i18n: {},
    hasFooter: undefined,
  },
  pageLayoutMode: pageLayoutModeEnum.SHOW_ALL_DATA,
  newDesigner: true,
});

const pageNo = ref(1);
const noMore = ref(false);
const loading = ref(false);

/**
 * 保存或者校验前对数据做预处理
 *
 * @author chitanda
 * @date 2025-09-28 15:09:12
 * @param {PageJson} json
 * @param {boolean} [isClone=false] 是否深拷贝，默认为 false
 * @returns {*}  {PageJson}
 */
function transformPageJson(json: PageJson, isClone: boolean = false): PageJson {
  const _json: PageJson = isClone ? cloneDeep(json) : json;
  if (!_json.pageConfig.hasFooter) {
    // 如果没有底部按钮，则校验数据中不需要包含内部按钮容器
    _json.widgets = _json.widgets.filter((n) => {
      return n.type !== 'bottom-button-container';
    });
  }
  return _json;
}

/** 页面数据快照，用于脏检查对比 */
const pageJsonSnapshot = ref<string>('');

/** 界面数据是否修改过，通过对比快照和当前数据判断 */
export const isModified = () => {
  if (!pageJsonSnapshot.value) {
    return false;
  }
  const currentPageJsonStr = JSON.stringify(pageJson);
  return currentPageJsonStr != pageJsonSnapshot.value;
};

// 是否为新版设计器
export const isNewDesigner = computed({
  get() {
    return pageJson.newDesigner;
  },
  set(val) {
    pageJson.newDesigner = val;
  },
});

/**后端传过来的页面历史记录 */
const pageDesignHistoryList = ref<PageDesignerLogResponse[]>([]);

/**ast解析过的所有Export JS函数的描述集合  */
const methodMap = ref<ExportMethod>({});

/** */
const _pluginConfigs = ref<IObject[]>([]);

export function useDesigner() {
  /**设置设计器的pageJSON */
  function setPageJson(json: PageJson) {
    pageJson.pageConfig.hasFooter =
      platform.value === Platform.MOBILE || platform.value === Platform.PAD;
    Object.assign(pageJson, json);
    if (json.newDesigner !== true) {
      pageJson.newDesigner = false;
    }
    methodMap.value = initMethodMap(pageJson.js);
    emitCache(false);
    // 设置页面数据后保存快照
    // savePageJsonSnapshot();
  }

  /**
   * 保存页面数据快照，用于脏检查对比
   */
  function savePageJsonSnapshot(json?: PageJson): void {
    pageJsonSnapshot.value = JSON.stringify(json ?? pageJson);
  }

  function setPluginConfigs(configs: IObject[]) {
    _pluginConfigs.value = configs;
  }

  /**
   * 缓存步骤
   *
   * @author chitanda
   * @date 2025-08-05 13:08:42
   * @param {boolean} [modified=true] 是否算为修改过，默认为true，避免有些地方需要额外的存储单用户未操作
   */
  function emitCache(modified: boolean = true) {
    const queryStore = useQueryStore();
    // ! 组件拖入布局画板更新历史记录
    const id = queryStore.getPid() ?? '';
    historyUtils.addHistory({
      historyId: id,
      past: JSON.stringify(pageJson),
    });
    // 大于 1 是因为原有逻辑在 setPageJson 时会添加一条历史记录，这个不算变更
    // 注意：现在 isModified 是计算属性，不需要手动设置，它会根据快照自动判断
    occupy();
  }

  function undoOrRestore(content) {
    if (content) {
      const scope: SCOPE = inject('scope') || SCOPE.PAGE;
      const { resetSelectedWidget } = useSelectedWidget();
      Object.assign(pageJson, JSON.parse(content));
      resetSelectedWidget(scope);
      occupy();
    }
  }

  /** 获取历史版本列表 */
  async function loadPageDesignHistoryList() {
    if (loading.value || noMore.value) return; // 避免重复请求

    loading.value = true
    const queryStore = useQueryStore();
    try {
      const res = await getPageDesignerLogPageList({
        relationId: queryStore.getPid() ?? '',
        pageNo: pageNo.value ?? 1,
        pageSize: 50,
      });
      if (res) {
        if (pageNo.value === 1) {
          pageDesignHistoryList.value = res.data || [];
        } else {
          pageDesignHistoryList.value = [...pageDesignHistoryList.value, ...(res.data || [])];
        }
        // 判断是否有更多数据
        if (pageDesignHistoryList.value?.length >= res.totalCount || pageDesignHistoryList.value?.length >= 1000) {
          noMore.value = true
        } else {
          pageNo.value += 1; // 页码+1
        }
      }
    } catch(err) {
      console.error('数据加载失败：', err)
    }  finally {
      loading.value = false;
    }
  }

  /**
   * 获取历史版本信息
   * @param id
   * @returns
   */
  async function loadPageDesignHistoryInfo(id: string) {
    return getPageDesignerLogInfo({
      id,
    });
  }

  /** 恢复历史记录 */
  async function recover(hid: string) {
    const res = await loadPageDesignHistoryInfo(hid);
    if (res) {
      Object.assign(
        pageJson,
        res.designerJson
          ? { ...JSON.parse(res.designerJson ?? ''), key: Date.now() }
          : {
              id: '',
              keepAlive: false,
              pageEvents: {},
              pageVars: [],
              widgets: [],
              js: '',
              css: '',
              modals: [],
              template: [],
              globalEvents: {},
              los: {},
              permissions: {},
              key: Date.now(),
              style: {
                // paddingAll: '10',
                // paddingTop: '10',
                // paddingRight: '10',
                // paddingBottom: '10',
                // paddingLeft: '10',
              },
              pageConfig: {
                title: '',
                i18n: {},
                hasFooter: undefined,
              },
            },
      );
      save(false);
    }
  }

  /** 删除 */
  function deleteHistory(hid: string) {
    deletePageDesignerLog({ ids: hid }).then(() => {
      createMessage.success(t('sys.appDesigner.deleteSuccess'));
      noMore.value = false;
      pageNo.value = 1;
      loadPageDesignHistoryList();
    });
  }

  function basicPreview({ pid, webUrl, mobileUrl, padUrl }) {
    const usePathQuery = usePathQueryStore();
    const userStore = useUserStoreWithOut();
    if (platform.value === Platform.MOBILE) {
      const { hostname, origin } = location;
      const appOrigin = import.meta.env.DEV ? 'http://' + hostname : origin;
      console.log(appOrigin);
      const curWin = openWindow(
        genUrl(`${appOrigin}${mobileUrl}?_t=${Date.now()}`, {
          aid: usePathQuery.getAid(),
          pid: pid,
          bid: branchId.value,
          token: getToken(),
          'tenant-id': userStore.getTenant,
        }),
        {
          noopener: false,
          noreferrer: false,
          target: '_blank',
          optionStr: `width=414,height=896,top=200,left=${(window.screen.availWidth - 360) / 2}`,
        },
      );
      //兼容Chorme
      curWin?.resizeTo(414, 896);
    } else if (platform.value === Platform.PAD) {
      const { hostname, origin } = location;
      const appOrigin = import.meta.env.DEV ? 'http://' + hostname : origin;
      openWindow(
        genUrl(`${appOrigin}${padUrl}?_t=${Date.now()}`, {
          aid: usePathQuery.getAid(),
          pid: pid,
          bid: branchId.value,
          token: getToken(),
          'tenant-id': userStore.getTenant,
        }),
        {
          target: '_blank',
        },
      );
    } else {
      openWindow(
        genUrl(`${location.origin}${webUrl}?_t=${Date.now()}`, {
          aid: usePathQuery.getAid(),
          pid: pid,
          bid: branchId.value,
        }),
        {
          target: '_blank',
        },
      );
    }
  }

  /**
   * 预览（防抖）
   * 使用 @vueuse/core 的 useDebounceFn：连续点击只在最后一次点击 400ms 后执行
   * 若需要“首次立即 + 间隔限制”语义可改用 useThrottleFn。
   */
  const _doPreview = () => {
    const queryStore = useQueryStore();
    basicPreview({
      pid: queryStore.getPid(),
      webUrl: import.meta.env.VITE_PATHNAME_WEB_PAGE,
      mobileUrl: import.meta.env.VITE_PATHNAME_MOBILE_PAGE,
      padUrl: import.meta.env.VITE_PATHNAME_PAD_PAGE,
    });
  };
  const preview = useDebounceFn(_doPreview, 400);
  /**
   * 是否存在沙箱环境
   */
  const sandboxList = ref();
  const getDataList = async () => {
    const data = await getSandboxConfigList();
    if (!data.length) {
      return;
    }
    if (data && data.length && data[0].status !== 'INIT') {
      sandboxList.value = data.map((i) => {
        return {
          ...i,
          web: i.webRoutePath,
          mobile: i.pdaRoutePath,
          pad: i.padRoutePath,
        };
      });
    }
  };
  /**
   * 预览沙箱环境数据
   */
  const _doPreviewSandbox = () => {
    const queryStore = useQueryStore();
    basicPreview({
      pid: queryStore.getPid(),
      webUrl: import.meta.env.VITE_PATHNAME_WEB_PAGE.replace('web-render', 'web-sandbox'),
      mobileUrl: import.meta.env.VITE_PATHNAME_MOBILE_PAGE.replace(
        'mobile-render',
        'mobile-sandbox',
      ),
      padUrl: import.meta.env.VITE_PATHNAME_PAD_PAGE.replace('pad-render', 'pad-sandbox'),
    });
  };
  const previewSandbox = useDebounceFn(_doPreviewSandbox, 400);

  /** 历史预览 */
  function historyPreview(hid: string) {
    // basicPreview({
    //   pid: hid,
    //   webUrl: import.meta.env.VITE_PATHNAME_WEB_HISTORY_PAGE,
    //   mobileUrl: import.meta.env.VITE_PATHNAME_MOBILE_HISTORY_PAGE,
    // });
    const usePathQuery = usePathQueryStore();
    if (platform.value === Platform.MOBILE) {
      const url = genUrl(
        `http://${location.hostname}${
          import.meta.env.VITE_PATHNAME_MOBILE_HISTORY_PAGE
        }?_t=${Date.now()}`,
        {
          aid: usePathQuery.getAid(),
          pid: hid,
          bid: branchId.value,
          token: getToken(),
        },
      );
      return { url, platform: platform.value };
    } else if (platform.value === Platform.PAD) {
      const url = genUrl(
        `http://${location.hostname}${
          import.meta.env.VITE_PATHNAME_PAD_HISTORY_PAGE
        }?_t=${Date.now()}`,
        {
          aid: usePathQuery.getAid(),
          pid: hid,
          bid: branchId.value,
          token: getToken(),
        },
      );
      return { url, platform: platform.value };
    } else {
      const url = genUrl(
        `${location.origin}${import.meta.env.VITE_PATHNAME_WEB_HISTORY_PAGE}?_t=${Date.now()}`,
        {
          aid: usePathQuery.getAid(),
          pid: hid,
          bid: branchId.value,
        },
      );
      return { url, platform: platform.value };
    }
  }

  /**
   * 保存时对数据做校验
   *
   * @author zhanghanrui
   * @date 2024-05-11 11:05:14
   * @param {IData[]} widgets
   * @param {IData[]} [parents=[]]
   * @return {*}  {boolean}
   */
  function validateWidgets(widgets: IData[], parents: IData[] = []): boolean {
    const isMob = platform.value === Platform.MOBILE;
    const isPad = platform.value === Platform.PAD;
    for (let i = 0; i < widgets.length; i++) {
      const widget = widgets[i];
      const { type, props } = widget;
      // 当前部件类型所对应的属性模型
      let models: IData[] =
        (isMob
          ? allWidgetInfo.mobileWidgetPropEditors[type]
          : isPad
            ? allWidgetInfo.padWidgetPropEditors[type]
            : allWidgetInfo.webWidgetPropEditors[type]) || [];
      models = models && isArray(models) ? models : models(widgets, parents);
      for (let j = 0; j < models.length; j++) {
        const model = models[j];
        if (model?.required === true) {
          const { name } = model;
          let keys: string[] = [];
          const isObject = typeof name === 'object';
          if (typeof name === 'object') {
            keys = Object.keys(name).map((item) => {
              return name[item];
            });
          } else if (name?.startsWith('root:')) {
            const key = name.substring('5');
            const val = widget[key];
            if (isNil(val) || isEmpty(val)) {
              message.error(
                `【${widget.alias || widget.props.label || widget.props.fieldName || ''} ${
                  widget.id
                }】${t('sys.pageDesigner.widget')} -【${t('sys.pageDesigner.prop')} - ${t(
                  `sys.pageDesigner.${model.group}Prop`,
                )} ${model.label ? '-' + t(model.label) : ''}】${t('sys.model.required')}`,
              );
              return false;
            }
          } else {
            keys = name.replace(regRoot, '').split('.');
            // keys = [name];
          }
          let memo = props;
          for (let k = 0; k < keys.length; k++) {
            const key = keys[k];
            // const val = props[key];
            const val = isObject ? props[key] : memo[key];
            memo = val;
            // 如果有隐藏判断，判断当前配置为隐藏状态时不做必填效验
            if (model.hidden) {
              const hide = model.hidden(widget);
              if (hide === true) {
                continue;
              }
            }
            if (isNil(val) || isEmpty(val)) {
              message.error(
                `【${widget.alias || widget.props.label || widget.props.fieldName || ''} ${
                  widget.id
                }】${t('sys.pageDesigner.widget')} -【${t('sys.pageDesigner.prop')} - ${t(
                  `sys.pageDesigner.${model.group}Prop`,
                )} ${model.label ? '-' + t(model.label) : ''}】${t('sys.model.required')}`,
              );
              return false;
            }
          }
        }
        if (model.saveHook) {
          model.saveHook(widget);
        }
      }
      // 查询组件整数、长整数、小数、精度小数开启范围时默认值最大值小于最小值判断
      if (
        [SearchComponents.SearchNumberInput, SearchComponents.SearchStringNumberInput].includes(type!) 
          && props?.isRang 
          && props?.defaultValue 
          && Array.isArray(props?.defaultValue)
      ) {
        const start = props.defaultValue[0];
        const end = props.defaultValue[1];
        if ((start || start === 0) && (end || end === 0 ) && (start > end)) {
          message.error(
            `【${widget.alias || widget.props.label || widget.props.fieldName || ''} ${
                  widget.id
                }】${t('sys.pageDesigner.widget')} -【${t('sys.pageDesigner.prop')} - ${t('sys.pageDesigner.defaultValue')}】- ${t('sys.model.numMaxGTMin')}`
          );
          return false;
        }
      }

      // 如果有子数据，递归验证子数据
      if (widget.children) {
        parents.push(widget);
        const bol = validateWidgets(widget.children, parents);
        if (bol === false) {
          return bol;
        }
      }
    }
    return true;
  }

  /**
   * 保存完成解除占用
   */
  async function save(flag = true, showSuccess = true) {
    const queryStore = useQueryStore();
    const pageId = queryStore.getPid();

    const _pageJson = transformPageJson(pageJson);

    const bol = validateWidgets(_pageJson.widgets);
    if (bol === false) {
      return false;
    }
    if (_pageJson.widgets.some((n) => n.type === 'data-list')) {
      // 列表组件显示字段非表达式时，将表达式清空
      _pageJson.widgets.forEach((item) => {
        if (item.type === 'data-list' && !item.props.showFieldExp) {
          item.props.showFieldExpVal = '';
        }
      });
    }

    const bol2 = validateWidgets(_pageJson.modals);
    if (bol2 === false) {
      return false;
    }

    if (_pageJson.modals.length) {
      _pageJson.modals.forEach((item) => {
        if (!item.props.hasFooter) {
          item.children = item.children.filter((n) => {
            return n.type !== 'bottom-button-container';
          });
        }
        if (item.props.hasFooter && item.children.some((n) => n.type === 'modalFooter')) {
          item.children = item.children.filter((n) => {
            return n.type !== 'modalFooter';
          });
        }
      });
    }

    // 遍历所有部件，找出所有用到的 plugin 配置，并保存至 plugins 中
    const plugins: PagePlugin[] = [];
    function deepFindPlugins(widgets: LowCodeWidget.BasicSchema[]): PagePlugin[] {
      const items: PagePlugin[] = [];
      widgets.forEach((widget) => {
        if (widget._plugin) {
          items.push({
            key: widget._plugin.key,
            version: widget._plugin.version,
            url: widget._plugin.url,
          });
        }
        if (widget.children && widget.children.length > 0) {
          items.push(...deepFindPlugins(widget.children));
        }
      });
      return items;
    }
    // 计算出部件的所有插件
    plugins.push(...deepFindPlugins(_pageJson.widgets));
    if (_pageJson.modals) {
      // 遍历所有模态框，找出所有用到的 plugin 配置，并保存至 plugins 中
      _pageJson.modals.forEach((modal) => {
        if (modal.children) {
          modal.children.forEach((item) => {
            plugins.push(...deepFindPlugins(item.children));
          });
        }
      });
    }
    _pageJson.plugins = plugins;
    if (platform.value === Platform.MOBILE) {
      await putMobilePageUpdateDesignerJsonById(
        { id: pageId! },
        {
          designerJson: JSON.stringify(_pageJson),
          runtimeJson: JSON.stringify(buildRuntimeJson()),
          logId: (pageDesignHistoryList.value[0] ?? {}).id,
        },
      );
    } else if (platform.value === Platform.PAD) {
      await putPadPageUpdateDesignerJsonById(
        { id: pageId! },
        {
          designerJson: JSON.stringify(_pageJson),
          runtimeJson: JSON.stringify(buildRuntimeJson()),
          logId: (pageDesignHistoryList.value[0] ?? {}).id,
        },
      );
    } else {
      await putWebpageUpdateDesignerJsonById(
        { id: pageId! },
        {
          designerJson: JSON.stringify(_pageJson),
          runtimeJson: JSON.stringify(buildRuntimeJson()),
          logId: (pageDesignHistoryList.value[0] ?? {}).id,
        },
      );
    }
    // 保存成功后更新快照，这样 isModified 会自动变为 false
    savePageJsonSnapshot(_pageJson);
    if (showSuccess) {
      flag
        ? createMessage.success(t('sys.saveSuccess'))
        : createMessage.success(t('sys.recoverSuccess'));
    }
    cancelOccupy();
    // occupyPage(false);
    noMore.value = false;
    pageNo.value = 1;
    loadPageDesignHistoryList();
    return true;
  }

  const allComHooks = computed(() => {
    return platform.value === Platform.MOBILE
      ? allWidgetInfo.mobileWidgetHooks
      : platform.value === Platform.PAD
        ? allWidgetInfo.padWidgetHooks
        : allWidgetInfo.webWidgetHooks;
  });
  const allWhiteList = computed(() => {
    return platform.value === Platform.MOBILE
      ? allWidgetInfo.mobileWidgetWhiteList
      : platform.value === Platform.PAD
        ? allWidgetInfo.padWidgetWhiteList
        : allWidgetInfo.webWidgetWhiteList;
  });
  const allBlackList = computed(() => {
    return platform.value === Platform.MOBILE
      ? allWidgetInfo.mobileWidgetBlackList
      : platform.value === Platform.PAD
        ? allWidgetInfo.padWidgetBlackList
        : allWidgetInfo.webWidgetBlackList;
  });
  const pluginConfigs = computed(() => {
    return _pluginConfigs.value;
  });
  ///全局异步获取组件
  const asyncGctComp = computed(() => {
    if (platform.value === Platform.PAD) {
      return AsyncPadGctComponents;
    }
    if (platform.value === Platform.MOBILE) {
      return AsyncMobileGctComponents;
    }
    return AsyncGctComponents;
  });
  const getAsyncWidget = (widget: string | LowCodeWidget.BasicSchema) => {
    if (typeof widget === 'string') {
      return asyncGctComp.value.getComponentByType(widget);
    }
    if (widget._plugin) {
      return asyncGctComp.value.getComponentByPluginTag(widget._plugin.key);
    }
    return asyncGctComp.value.getComponentByType(widget.type);
  };
  const getWidgetHooks = (type) => {
    return allComHooks.value[type] ?? {};
  };
  const getWhiteList = (type) => {
    return allWhiteList.value[type] ?? [];
  };
  const getBlackList = (type) => {
    return allBlackList.value[type] ?? [];
  };
  const widgetEntry = computed(() => {
    if (platform.value === Platform.MOBILE) {
      return 'widget-mobile-entry';
    } else if (platform.value === Platform.PAD) {
      return 'widget-pad-entry';
    } else {
      return 'widget-entry';
    }
  });
  /////以下是拖拽相关
  /** 检查是否可以拖拽进入的方法  比如某些组件不能拖到某些组件内*/
  function checkWidgetMove(evt) {
    return true;
  }

  /** 拖拽组件放入布局画板回调 */
  function handleAddDrag(newIndex, childrenList, scope, formID = '') {
    const { setSelectedWidget, setFocusFormContainer } = useSelectedWidget();
    const widget = childrenList[newIndex];
    if (!widget) return;

    // 如果是初始化栅格容器
    const isInitGridComp = widget.type === FormComponents.Grid && !widget.children?.length;
    if (isInitGridComp) return;

    setSelectedWidget(childrenList[newIndex], scope);
    setFocusFormContainer(childrenList[newIndex].preLocation || formID);
    emitCache();
  }
  /////拖拽end////

  const allWidget: ComputedRef<Mapping[FormComponents.Form][]> = computed(() => {
    const { scopeData } = useScope();
    return findNodeAll(scopeData.value, (widget) => {
      return !!widget;
    });
  });

  /**在作用域中找到所有Form表单 注:如果是模态框状态下,则查找范围应该为modalBody+modalFooter 因为footer中的按钮需要关联到body中的表单*/
  const allFormWidget: ComputedRef<Mapping[FormComponents.Form][]> = computed(() => {
    const { scopeData } = useScope();
    return findNodeAll(scopeData.value, (widget) => {
      return [
        FormComponents.Form,
        FormComponents.RdoForm,
        FormComponents.MedProRdoForm,
        FormComponents.FormProcess,
      ].includes(widget.type);
    });
  });

  /** 排除子表 */
  const excludeSubTableFormWidget: ComputedRef<Mapping[FormComponents.Form][]> = computed(() => {
    const { scopeData } = useScope();
    return findNodeAll(scopeData.value, (widget) => {
      if (
        [FormComponents.RdoForm, FormComponents.MedProRdoForm, FormComponents.FormProcess].includes(
          widget.type,
        )
      ) {
        return true;
      }

      return (
        widget.type === FormComponents.Form &&
        !getCompPos(widget, FIELD_TYPE.MASTERSLAVE, FormComponents.Form)
      );
    });
  });

  const allSubTableWidget: ComputedRef<Mapping[FormComponents.SubTable][]> = computed(() => {
    const { scopeData } = useScope();
    return findNodeAll(scopeData.value, (widget) => {
      return widget.type === FormComponents.SubTable;
    });
  });

  /**所有列表包括rdo的 */
  const allListWidget: ComputedRef<Mapping[FormComponents.DataList][]> = computed(() => {
    const { scopeData } = useScope();
    return findNodeAll(scopeData.value, (widget) => {
      return widget.type === FormComponents.DataList || widget.type === FormComponents.RdoDataList;
    });
  });

  const allTableWidget: ComputedRef<Mapping[FormComponents.DataTable][]> = computed(() => {
    const { scopeData } = useScope();
    return findNodeAll(scopeData.value, (widget) => {
      return (
        widget.type === FormComponents.DataTable || widget.type === FormComponents.DataVTable || widget.type === FormComponents.RefDataTable
      );
    });
  });
  // Mapping
  /**在作用域中找到所需要的组件类型 */
  function getWidgetByScope<K extends keyof Mapping>(type: K): Mapping[K][] {
    const { scopeData } = useScope();
    return findNodeAll(scopeData.value, (widget) => {
      return widget.type === type;
    });
  }

  const allDeptWidget: ComputedRef<Mapping[FormComponents.Department][]> = computed(() => {
    const { scopeData } = useScope();
    return findNodeAll(scopeData.value, (widget) => {
      return widget.type === FormComponents.Department;
    });
  });

  const allRefSelectWidget: ComputedRef<Mapping[FormComponents.Select][]> = computed(() => {
    const { scopeData } = useScope();
    return findNodeAll(scopeData.value, (widget) => {
      return widget.type === FormComponents.Select && widget.props.fieldType === FIELD_TYPE.REF;
    });
  });

  ///////弹框相关/////////
  /**
   *
   * @param flag 打开模态框设置模式
   * @param modalId 编辑时的modalId
   * @param isGlobal 是否是全局模态框
   */
  async function setModalDesignState(flag, modalId = '', isGlobal = false) {
    if (flag) {
      await getModalInfo(modalId, isGlobal);
    } else {
      modalInfo.value = cloneDeep(modal);
    }
    modalDesignState.value = flag;
    modalDesignId.value = modalId;
  }
  /**
   *获取modal
   * @param modelId 编辑时传参,如果新建则没有则会返回新的一个modal,保存时在pageJSON里插入一个新的modal
   */
  async function getModalInfo(modelId?, isGlobal = false) {
    if (isGlobal) {
      //后端查询远程模态框数据
      const data = await queryInfo(modelId);
      if (data?.length! > 0) {
        modalInfo.value = JSON.parse(data![0].configJson!);
      }
    } else {
      modalInfo.value = pageJson.modals.find((d) => d.id === modelId)! as LowCodeModal.Modal;
    }
  }
  function setSubTableModalDesignState(flag, needId = '') {
    subTableModalState.value = flag;
    subTableModalId.value = needId;
  }
  function setWfNodesModalDesignState(flag, needId = '') {
    wfNodesModalState.value = flag;
    wfNodesModalId.value = needId;
    // if (!flag) {
    //   modalInfo.value = cloneDeep(modal);
    // }
  }
  function setWorkflowNodesModalDesignState(flag, needId = '') {
    workflowModalId.value = needId;
    workflowModalState.value = flag;
    // if (!flag) {
    //   modalInfo.value = cloneDeep(modal);
    // }
  }
  function setModalInfo(modal) {
    modalInfo.value = modal;
  }
  const modalBody = computed(() => {
    return modalInfo.value.children.find((d) => d.type === BuiltinType.MODAL_BODY)!;
  });
  const modalFooter = computed(() => {
    return modalInfo.value.children.find((d) => d.type === BuiltinType.MODAL_FOOTER)!;
  });
  const modalBottomBtn = computed(() => {
    return modalInfo.value.children.find((d) => d.type === BuiltinType.BottomButtonContainer)!;
  });

  /** 根据 subTableModalId获取子表信息 */
  const subTableInfo = computed(() => {
    const { scopeData } = useScope();
    return findNode(scopeData.value, (widget) => {
      return widget.id === subTableModalId.value;
    });
  });
  /** 根据 subTableModalId获取子表信息 */
  const wfNodesInfo = computed(() => {
    const { scopeData } = useScope();
    return findNode(scopeData.value, (widget) => {
      return widget.id === wfNodesModalId.value;
    })?.props.workflowModalInfo;
  });
  const wfNodesModalBody = computed(() => {
    return wfNodesInfo.value.children.find((d) => d.type === BuiltinType.MODAL_BODY)!;
  });
  /** 根据 subTableModalId获取子表信息 */
  const workflowInfo = computed(() => {
    const { scopeData } = useScope();
    return findNode(scopeData.value, (widget) => {
      return widget.id === workflowModalId.value;
    })?.props.specModalInfo;
  });
  const workflowModalBody = computed(() => {
    return workflowInfo.value.children.find((d) => d.type === BuiltinType.MODAL_BODY)!;
  });
  const isGlobalModal = computed(() => {
    // return modalInfo.value.id.startsWith('g_modal');
    return /^i?g_modal_/.test(modalInfo.value.id);
  });

  interface NewDataType {
    name?: string;
    title: string;
    runtimeJs?: string;
    bindTo?: string;
    parameter?: string[];
  }
  /**
   * 设置lo数据 时间存入时间戳（根据时区展示）
   * @param key
   * @param data
   */
  function setLo(key, newData: NewDataType) {
    const oldData = getLo(key);
    let bindTo = oldData?.bindTo ?? [];
    if (newData.bindTo && typeof newData.bindTo === 'string') {
      bindTo = [...new Set([...bindTo, newData.bindTo])];
    }
    const loNewData = {
      ...oldData,
      ...newData,
      bindTo,
      modifyBy: userStore.getUserInfo.fullname,
      modifyTime: Date.now(),
    };
    let groupJson = pageJson;
    if (modalInfo.value.id) {
      groupJson = pageJson.modals.find((item) => item.id === modalInfo.value.id) as any;
    }
    if (!groupJson.los) {
      groupJson.los = {};
    }
    if (!groupJson.los[key]) {
      // 新增
      Object.assign(loNewData, {
        createBy: userStore.getUserInfo.fullname,
        createTime: Date.now(),
      });
    }
    groupJson.los[key] = loNewData;
  }
  const groupLos = computed(() => {
    if (modalInfo.value.id) {
      return pageJson.modals.find((item) => item.id === modalInfo.value.id)?.los ?? {};
    } else {
      return pageJson.los ?? {};
    }
  });
  function getLo(key) {
    return groupLos.value[key];
  }
  function removeLo(key) {
    let groupJson = pageJson;
    if (modalInfo.value.id) {
      groupJson = pageJson.modals.find((item) => item.id === modalInfo.value.id) as any;
    }
    if (groupJson.los) {
      delete groupJson.los[key];
    }
  }
  /**
   * 组件和编排解绑
   * @param id
   */
  function unbindLoByWidgetId(id: string) {
    let los = {};
    if (modalInfo.value.id) {
      los = pageJson.modals.find((item) => item.id === modalInfo.value.id)?.los ?? {};
    } else {
      los = pageJson.los ?? {};
    }
    Object.keys(los).forEach((loId) => {
      const bindTo = los[loId].bindTo ?? [];
      if (bindTo.length === 1 && bindTo[0] === id) {
        removeLo(loId);
      } else if (bindTo.length > 1) {
        los[loId].bindTo = bindTo.filter((item) => item !== id);
      }
    });
  }

  return {
    pageJson,
    //拖拽相关
    checkWidgetMove,
    handleAddDrag,
    //page
    pageDesignHistoryList,
    loadPageDesignHistoryList,
    loadPageDesignHistoryInfo,
    historyPreview,
    recover,
    setPageJson,
    save,
    preview,
    previewSandbox,
    getDataList,
    sandboxList,
    methodMap,
    //操作历史缓存相关(前进后退)
    emitCache,
    undoOrRestore,
    //整个设计器的组件集合相关
    allWidget,
    allFormWidget,
    excludeSubTableFormWidget,
    allSubTableWidget,
    allListWidget,
    allTableWidget,
    allDeptWidget,
    allRefSelectWidget,
    getWidgetByScope,
    //弹框相关
    modalInfo,
    modalDesignState,
    modalDesignId,
    modalBody,
    modalFooter,
    modalBottomBtn,
    isGlobalModal,
    subTableInfo,
    wfNodesInfo,
    wfNodesModalBody,
    workflowInfo,
    workflowModalBody,
    setModalDesignState,
    setModalInfo,
    setSubTableModalDesignState,
    subTableModalState,
    subTableModalId,
    setWfNodesModalDesignState,
    wfNodesModalState,
    isNewDesigner,
    setWorkflowNodesModalDesignState,
    workflowModalState,
    // 全局获取异步组件
    getAsyncWidget,
    // 获取组件拖拽钩子
    getWidgetHooks,
    widgetEntry,
    groupLos,
    pluginConfigs,
    setLo,
    getLo,
    removeLo,
    unbindLoByWidgetId,
    deleteHistory,
    getWhiteList,
    getBlackList,
    setPluginConfigs,
    savePageJsonSnapshot,
    loading,
  };
}

//递归遍历tree并组装
function buildRuntimeJson(): RuntimePageJson {
  try {
    const runtimeWidgets = traverseAndBuildTree(
      cloneDeep(pageJson.widgets),
      (node: LowCodeWidget.BasicSchema) => findWidgetCallback(node),
    );
    /**经过babel转换过的所有函数集合包含未export ES5字符串
    来源于页面JS和逻辑编排*/
    const funcStr = buildRunJs(mergeJSandLos(pageJson));
    // 遍历modals
    const modals = pageJson.modals.map((modal): RuntimeModal => {
      const modalFuncStr = buildRunJs(mergeJSandLos(modal));
      const runtimeWidgets = traverseAndBuildTree(
        cloneDeep(modal.children),
        (node: LowCodeWidget.BasicSchema) => findWidgetCallback(node, modal),
      ) as [LowCodeModal.ModalBody, LowCodeModal.ModalBody];
      return {
        props: modal.props,
        css: modal.css,
        modalName: modal.modalName,
        id: modal.id,
        i18n: modal.i18n || {},
        events: modal.events,
        children: runtimeWidgets,
        runJs: modalFuncStr,
        style: modal.style,
      };
    });
    return {
      widgets: runtimeWidgets,
      runJs: funcStr,
      modals,
      css: pageJson.css,
      keepAlive: pageJson.keepAlive,
      globalEvents: pageJson.globalEvents,
      pageEvents: pageJson.pageEvents,
      permissions: pageJson.permissions,
      pageStyle: pageJson.style,
      pageConfig: pageJson.pageConfig,
      pageVars: pageJson.pageVars,
      plugins: pageJson.plugins,
      pageLayoutMode: pageJson.pageLayoutMode,
    };
  } catch (error) {
    message.warn(window.$t('sys.pageDesigner.codeError'));
    throw new Error(error.message);
  }
}

function findWidgetCallback(node: LowCodeWidget.BasicSchema, modal) {
  const widgetCallback =
    platform.value === Platform.MOBILE
      ? allWidgetInfo.mobileWidgetCallback
      : platform.value === Platform.PAD
        ? allWidgetInfo.padWidgetCallback
        : allWidgetInfo.webWidgetCallback;
  return widgetCallback[node.type]?.(node, modal);
}

function mergeJSandLos(scope) {
  let newJS = scope.js;
  if (scope.los) {
    for (const key in scope.los) {
      const lObj = scope.los[key];
      if (lObj.runtimeJs) {
        newJS = [newJS, `export ${lObj.runtimeJs}`].join('\n');
      }
    }
  }
  return newJS;
}

export function useDesignerController(): DesignerController {
  const c = inject('designer') as DesignerController;
  return c;
}
