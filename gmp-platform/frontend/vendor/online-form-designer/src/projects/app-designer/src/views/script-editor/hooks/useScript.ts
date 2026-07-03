import { ref, reactive, Ref, h, unref } from 'vue';
import { Modal } from 'ant-design-vue';
import { useRouter, useRoute } from 'vue-router';
import { getScriptInfo } from '/@/apis/gct-apaas/ScriptController';
import {
  postScriptVersion,
  getScriptVersionInfo,
  putScriptVersionById,
  getScriptVersionPageList,
} from '/@/apis/gct-apaas/ScriptVersionController';
import {
  getScriptVersionLogPageList,
  getScriptVersionLogInfo,
} from '/@/apis/gct-apaas/ScriptVersionLogController';
import { postJsEngineExecute } from '/@/apis/gct-apaas/JsEngineController';
import { ResponseEntityobject, ScriptVersionResponse } from '/@/apis/gct-apaas/model/index';
// import * as monaco from 'monaco-editor';
import { useMessage } from '/@/hooks/web/useMessage';

import { useEmitter } from './useEmitter';
import { randomUUID } from '/@/hooks/web/useUUid';
// import { mitt } from '/@/utils/mitt';
import { openWindow } from '/@/utils';
import CopyModuleKey from '/@/components/CopyModuleKey';
import { useGlobSetting } from '/@/hooks/setting';
import { useCopyToClipboard } from '/@/hooks/web/useCopyToClipboard';
import { useEditorConsoleInner } from '/@/components/code-editor/useEditorConsole';
import { useCacheHistory } from '/@/hooks/develop/useCacheHistory';
import { useUserOccupy } from '/@/components/UserOccupy/useUserOccupy';
import { ScriptTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { useI18n } from '/@/hooks/web/useI18n';
import { sampleScriptMap } from '../../logic-develop/constant/scriptInfo';

const DEFAULT_CONTENT = `function main() {\n    \n}`;

const { t } = useI18n();

const scriptId = ref();
const scriptInfo = ref({
  id: '',
  name: '--',
  categoryResponse: {
    name: '--',
  },
  scriptVersion: {},
});
const scriptVersion = ref({});
const scriptContent = ref();

const scriptHistoryList = ref<ScriptVersionResponse[]>([]);
const scriptVersionList = ref([]);
const pageNo = ref(1);
const noMore = ref(false);
const loading = ref(false);

const { cancelOccupy, setLockInfo, initOccupy, loadOccupyInfo } = useUserOccupy();

// function encodeScript()
// const emitter = mitt();

export function useScript() {
  const route = useRoute();
  scriptId.value = route.params.scriptId;

  const { getCode, setResult } = useEmitter();
  const { showConsolePanel, getInputValue } = useEditorConsoleInner();
  const { createMessage } = useMessage();
  const { historyUtils } = useCacheHistory();

  /**
   * 加载脚本信息
   */
  async function loadScript() {
    const data = await getScriptInfo({
      id: scriptId.value,
    });
    scriptInfo.value = data;
    scriptVersion.value = data?.scriptVersion;

    const content = data?.scriptVersion?.content || DEFAULT_CONTENT;
    scriptContent.value = content;

    await loadScriptVersionList();
    await loadScriptHistoryList();
    // ! 初始化的时候需要先插入生成一条历史记录
    historyUtils.addHistory({
      historyId: data?.scriptVersion?.id ?? '',
      past: content,
    });

    initOccupy({
      id: unref(scriptId),
      type: ScriptTypeEnum.DEFAULT,
    });
    loadOccupyInfo();
    setLockInfo({
      id: data?.lockUserId,
      name: data?.lockUserName,
    });
  }

  /**
   * 加载版本列表
   */
  async function loadScriptVersionList() {
    const { id, active, scriptKey, version } = scriptVersion.value;
    const res = await getScriptVersionPageList({
      scriptKey,
      pageNo: 1,
      pageSize: 9999,
    });
    scriptVersionList.value = res.data;
  }

  /**
   * 获取版本信息
   * @param id
   * @returns
   */
  async function loadScriptVersionInfo(id: string) {
    return getScriptVersionInfo({
      id,
    });
  }

  function beforeLoadScriptHistoryList() {
    noMore.value = false;
    pageNo.value = 1;
  };

  /**
   * 加载当前版本历史列表
   */
  async function loadScriptHistoryList(hasPrev = true) {
    if (hasPrev) {
      beforeLoadScriptHistoryList();
    }
    if (loading.value || noMore.value) return; // 避免重复请求
    // scriptHistoryList.value = [];
    loading.value = true;
    const { id, active, scriptKey, version } = scriptVersion.value;
    try {
      const res = await getScriptVersionLogPageList({
        scriptVersionId: id,
        pageNo: pageNo.value ?? 1,
        pageSize: 50,
      });
      if (res) {
        if (pageNo.value === 1) {
          scriptHistoryList.value = res.data || [];
        } else {
          scriptHistoryList.value = [...scriptHistoryList.value, ...(res.data || [])];
        }
        // 判断是否有更多数据
        if (scriptHistoryList.value?.length >= res.totalCount || scriptHistoryList.value?.length >= 1000) {
          noMore.value = true;
        } else {
          pageNo.value += 1; // 页码+1
        }
      }
      // scriptHistoryList.value = res.data;
    } catch(err) {
      console.error('数据加载失败：', err)
    } finally {
      loading.value = false;
    }
  }

  /**
   * 获取版本历史片段信息
   * @param id
   * @returns
   */
  async function loadScriptHistoryInfo(id: string) {
    return getScriptVersionLogInfo({
      id,
    });
  }

  /**
   * 保存
   * @param code {string} 最新代码
   */
  async function save(code: string, action = '') {
    // 如果是历史版本回退，直接拿传入的code
    const content = action === 'recover' ? code : code || (await getCode());
    const { id, active, scriptKey, version } = scriptVersion.value;
    await putScriptVersionById(
      {
        id,
      },
      {
        content,
        active,
        scriptKey,
        version,
        newLogId: (unref(scriptHistoryList)[0] ?? {}).id,
      },
    );
    createMessage.success(t('sys.saveSuccess'));
    cancelOccupy();
    loadScriptHistoryList();
  }

  /**
   * 保存并激活
   * @param code {string} 最新代码
   */
  async function saveAndActivate(code: string, saveAndActivate = true) {
    const content = code || (await getCode());
    const { id, active, scriptKey, version } = scriptVersion.value;
    await putScriptVersionById(
      {
        id,
      },
      {
        content,
        active: 1,
        scriptKey,
        version,
        newLogId: (unref(scriptHistoryList)[0] ?? {}).id,
      },
    );
    if (saveAndActivate) {
      createMessage.success(t('sys.editor.saveAndActivate') + t('sys.success'));
    }
    cancelOccupy();
    loadScriptHistoryList();
  }

  /**
   * 另存为新版本
   * @param {string} version 版本号
   */
  async function saveAs(version: string) {
    const { scriptKey } = scriptVersion.value;
    const content = await getCode();
    // changeVersion
    const vid = await postScriptVersion({
      active: 0,
      content,
      version,
      scriptKey,
    });
    changeVersion(vid!);
  }

  /**
   * 恢复历史版本
   * @param {string} hid 历史id
   */
  async function recover(hid: string) {
    const res = await loadScriptHistoryInfo(hid);
    scriptContent.value = res?.content;
    // await save(scriptContent.value, 'recover');
    // 如果是空，那么需要给编辑器设置默认值
    if (!scriptContent.value) {
      scriptContent.value = DEFAULT_CONTENT;
    }
  }

  /**
   * 切换版本
   * @param {string} vid 版本id
   */
  async function changeVersion(vid: string) {
    const version = scriptVersionList.value.find((item) => item.id === vid);
    if (!version) {
      await loadScriptVersionList();
    }

    const res = await loadScriptVersionInfo(vid);
    scriptVersion.value = res;

    let content = res?.content || DEFAULT_CONTENT;
    // ! 切换版本需要插入生成一条历史记录或者拿最新一条历史记录
    const historyInfo = historyUtils.getHistoryInfo(res?.id ?? '');
    if (historyInfo.pasts.length !== 0) {
      // 获取最新一条记录放到脚本内容中去
      content = historyInfo.pasts[historyInfo.pasts.length - 1];
    } else {
      // 插入一条历史记录
      historyUtils.addHistory({
        historyId: res?.id ?? '',
        past: content,
      });
    }
    scriptContent.value = content;

    // 切换版本以后需要更新版本历史列表
    await loadScriptHistoryList();
  }

  /**
   * 代码执行
   */
  async function execute(params, env) {
    const code = await getCode();
    const input = await getInputValue().catch(() => {
      showConsolePanel();
    });
    const values: object = JSON.parse(input);
    const res = (await postJsEngineExecute(
      {
        code,
        values,
        ...params,
      },
      {
        isTransformResponse: false,
        transferToConfig: {
          headers: { Env: env, method: 'debug' },
        },
      },
    )) as ResponseEntityobject;

    showConsolePanel();
    setResult(res);
  }

  /**
   * 代码调试
   */
  async function handleOpenDebugger(env) {
    const uuid = randomUUID([], {
      needPrefix: true,
      isString: false,
      prefix: 'debugger_',
      length: 10,
    });

    const { host = '' } = useGlobSetting();

    const hostUrl = host || location.origin;
    const debuggerUrl = `${
      location.origin
    }/devtools/front_end/devtools_app.html?ws=${hostUrl.replace(
      /(^\w+:|^)\/\//,
      '',
    )}/js/debug/${uuid}`;

    window.open(debuggerUrl);

    // Modal.confirm({
    //   title: t('sys.editor.copyDebuggerScript'),
    //   content: h(CopyModuleKey, { isTooltip: false, moduleKey: debuggerUrl, supportCopy: false }),
    //   icon: false,
    //   cancelText: t('sys.closeText'),
    //   okText: t('sys.editor.copyDebuggerOkText'),
    //   onOk: () => {
    //     useCopyToClipboard(debuggerUrl);
    //     openWindow('');
    //   },
    //   onCancel: () => {},
    // });
    execute({ uuid }, env);
  }

  /** 设置代码 */
  function setScriptContent(content) {
    scriptContent.value = content;
  }

  return {
    scriptId,
    loadScript,
    scriptInfo,
    scriptContent,
    scriptVersion,
    scriptVersionList,
    loading,
    loadScriptVersionInfo,
    scriptHistoryList,
    loadScriptHistoryInfo,
    save,
    saveAndActivate,
    saveAs,
    recover,
    // emitter,
    changeVersion,
    // getContent,
    execute,
    handleOpenDebugger,
    DEFAULT_CONTENT,
    setScriptContent,
    loadScriptHistoryList,
  };
}
