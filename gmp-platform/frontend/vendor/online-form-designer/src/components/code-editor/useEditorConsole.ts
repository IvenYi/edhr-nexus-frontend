import { ref, nextTick, unref, watch, shallowRef } from 'vue';
import { useMessage } from '/@/hooks/web/useMessage';
import { cloneDeep, isEmpty } from 'lodash-es';

interface EditorConsoleState {
  /** 显隐 */
  visible?: boolean;
  /** 输入默认值 */
  defaultInput?: string;
  /** tab选项卡key */
  tabActiveKey?: string;
}

interface ConsoleValueState {
  output: string;
  error: string;
  logs: any[];
}

const instanceRef = shallowRef<Nullable<any>>(null);
const editorConsoleState = ref<EditorConsoleState>({
  visible: false,
  defaultInput: '',
  tabActiveKey: '',
});
const consoleValueState = ref<ConsoleValueState>({
  output: '',
  error: '',
  logs: [],
});

export function useEditorConsole(props?: EditorConsoleState) {
  watch(
    () => props,
    () => {
      if (props) {
        Object.keys(props).forEach((key) => {
          editorConsoleState.value[key] = unref(props[key]);
        });
      }
    },
    { immediate: true },
  );

  watch(
    () => unref(editorConsoleState).visible,
    async (visible) => {
      await nextTick();
      if (visible && !unref(instanceRef)) {
        const monaco = await window.monacoLoader.loadMonaco();
        instanceRef.value = monaco.editor.create(
          document.querySelector('.editor-console__input')!,
          {
            value: props?.defaultInput,
            language: 'json',
            automaticLayout: true,
            minimap: {
              enabled: false,
            },
          },
        );
      }
    },
  );

  function toggleVisible() {
    editorConsoleState.value.visible = !unref(editorConsoleState).visible;
  }

  function changeTabActiveKey(key) {
    editorConsoleState.value.tabActiveKey = key;
  }

  return {
    editorConsoleState,
    consoleValueState,
    toggleVisible,
    changeTabActiveKey,
  };
}

export function useEditorConsoleInner() {
  const { createMessage } = useMessage();

  /** 获取monaco实例 */
  const getInstance = () => {
    const instance = unref(instanceRef);
    if (!instance) {
      console.warn('useEditorConsoleInner instance is undefined!');
    }
    return instance;
  };

  /** 显示控制面板 */
  function showConsolePanel() {
    editorConsoleState.value.visible = true;
  }

  /** 关闭控制面板 */
  function hideConsolePanel() {
    editorConsoleState.value.visible = false;
  }

  /** 获取输入内容 */
  async function getInputValue({ showError = true, ignoreError = false } = {}) {
    const monaco = await window.monacoLoader.loadMonaco();
    const errs = monaco.editor.getModelMarkers({
      owner: 'json',
    });
    if (errs.length > 0) {
      showError && createMessage.error('参数语法错误');
      if (!ignoreError) {
        return Promise.reject();
      }
    }
    return getInstance()?.getValue() ?? unref(editorConsoleState).defaultInput;
  }

  /** 格式化json数据 */
  function formatJson2Notes(value, options?) {
    if (isEmpty(value)) {
      return value;
    }
    let cloneJson = cloneDeep(value);
    if (typeof value !== 'string') {
      try {
        cloneJson = decodeURIComponent(JSON.stringify(cloneJson));
      } catch (error) {
        cloneJson = JSON.stringify(cloneJson);
      }
    } else {
      //已经是一个字符串，所以解析和重新字符串化以删除额外的空白
      try {
        cloneJson = decodeURIComponent(cloneJson);
      } catch (error) {
        console.warn(error);
      }
      try {
        cloneJson = JSON.parse(cloneJson);
      } catch (err) {
        console.warn(err);
      }
      cloneJson = JSON.stringify(cloneJson);
    }

    const {
      /**  在 '{' or '[' follows ':'位置移除新行 */
      newline = false,
      /**  在冒号后面加空格 */
      spaceAfterColon = true,
    } = options || {};

    let regex;
    // 在花括号前后添加换行
    regex = /([\{\}])/g;
    cloneJson = cloneJson.replace(regex, '\r\n$1\r\n');
    // 在方括号前后添加新行
    regex = /([\[\]])/g;
    cloneJson = cloneJson.replace(regex, '\r\n$1\r\n');
    // 在逗号后添加新行
    regex = /(\,)/g;
    cloneJson = cloneJson.replace(regex, '$1\r\n');
    // 删除多个换行
    regex = /(\r\n\r\n)/g;
    cloneJson = cloneJson.replace(regex, '\r\n');
    // 删除逗号前的换行
    regex = /\r\n\,/g;
    cloneJson = cloneJson.replace(regex, ',');
    // 可选格式...
    if (!newline) {
      regex = /\:\r\n\{/g;
      cloneJson = cloneJson.replace(regex, ':{');
      regex = /\:\r\n\[/g;
      cloneJson = cloneJson.replace(regex, ':[');
    }
    if (spaceAfterColon) {
      regex = /\:/g;
      cloneJson = cloneJson.replace(regex, ': ');
    }

    let formatted = '',
      pad = 0;
    const PADDING = '  ';

    cloneJson.split('\r\n').forEach(function (node) {
      let i = 0,
        indent = 0,
        padding = '';
      if (node.match(/\{$/) || node.match(/\[$/)) {
        indent = 1;
      } else if (node.match(/\}/) || node.match(/\]/)) {
        if (pad !== 0) {
          pad -= 1;
        }
      } else {
        indent = 0;
      }
      for (i = 0; i < pad; i++) {
        padding += PADDING;
      }
      formatted += padding + node + '\r\n';
      pad += indent;
    });
    return formatted;
  }

  /** 设置输出、错误、日志内容 */
  function setConsoleResult(result) {
    const { code, message, data } = result;
    if (code === 200) {
      const { logs: jsLogs, data: jsOutput } = data;
      consoleValueState.value.output = formatJson2Notes(jsOutput);
      consoleValueState.value.logs = jsLogs;
      consoleValueState.value.error = '';
      editorConsoleState.value.tabActiveKey = '2';
    } else {
      consoleValueState.value.output = '';
      consoleValueState.value.logs = [];
      consoleValueState.value.error = message;
      editorConsoleState.value.tabActiveKey = '3';
    }
  }

  return {
    getInstance,
    showConsolePanel,
    hideConsolePanel,
    getInputValue,
    setConsoleResult,
    formatJson2Notes,
  };
}
