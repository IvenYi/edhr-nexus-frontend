<template>
  <div class="editor-core__container"></div>
</template>

<script lang="ts" setup>
  import { onMounted, watch, unref } from 'vue';
  import { debounce, concat } from 'lodash-es';
  import { useScript } from '../../hooks/useScript';
  import { useEmitter } from '/@app-designer/views/script-editor/hooks/useEmitter';
  import { EmitterEnum } from '/@app-designer/views/script-editor/types/enum';
  import { useCacheHistory } from '/@/hooks/develop/useCacheHistory';
  import { useUserOccupy } from '/@/components/UserOccupy/useUserOccupy';
  import { getCodeTsList } from '/@/apis/gct-apaas/CodehintController';
  import { useAppInfoStore } from '/@/store/modules/app-info';
  import { sampleScriptMap } from '../../../logic-develop/constant/scriptInfo';

  let monaco: any = null;
  let monacoEditor: any = null;

  let content = '';
  let tmp = 0;

  const { appInfo } = useAppInfoStore();

  const { scriptVersion, scriptContent } = useScript();
  const { emitter } = useEmitter();
  const { occupy } = useUserOccupy();

  const { historyUtils } = useCacheHistory();

  emitter.on(EmitterEnum.GET_CODE, (callback) => {
    (callback as Function)(monacoEditor!.getValue());
  });

  watch(scriptContent, (value) => {
    content = value;
    if (monacoEditor) {
      monacoEditor.setValue(value);
    }
  });

  async function loadRemoteDefs(): Promise<void> {
    // todo 加载后端提供的当前系统业务模型和服务接口定义
  }

  /**
   * 加载本地
   *
   * @param uri
   */
  async function loadLocalDefs(uri): Promise<void> {
    if (!monaco) {
      console.warn('[EditorCore] Monaco editor is not available for loadLocalDefs');
      return;
    }
    const res = await fetch(uri);
    const data = await res.text();
    if (data) {
      monaco.languages.typescript.typescriptDefaults.addExtraLib(data);
    }
  }

  async function loadLocalDefsBat() {
    if (!monaco) {
      console.warn('[EditorCore] Monaco editor is not available for loadLocalDefsBat');
      return;
    }
    let uris = ['/api-types/%E6%9C%8D%E5%8A%A1%E7%AB%AF%E6%96%87%E6%A1%A3.d.ts'];
    if (appInfo.suiteKey === 'MEDPRO') {
      uris.push('/api-types/MedPro文档.d.ts');
    }
    const getCode = async () => {
      const { data } = await getCodeTsList({
        isReturnNativeResponse: true,
        transferToConfig: { responseType: 'blob', timeout: 10 * 1000 },
      });
      if (data && monaco) {
        const text = await new Promise<string>((r) => {
          const reader = new FileReader();
          reader.onloadend = function () {
            // 当读取操作完成时，reader.result 中会包含结果
            r((reader.result as string) || '');
          };
          // 将Blob对象读取为文本
          reader.readAsText(data);
        });
        monaco.languages.typescript.typescriptDefaults.addExtraLib(text);
      }
    };
    await Promise.all([
      ...uris.map((_) => {
        return loadLocalDefs(_);
      }),
      getCode(),
    ]);
  }

  onMounted(async () => {
    monaco = await window.monacoLoader.loadMonaco();
    loadRemoteDefs();
    await loadLocalDefsBat();
    initEditor();
  });

  function createDependencyProposals(range) {
    if (!monaco) return [];
    let jsapiPartNew = [
      'modelManager',
      'rdoModelManager',
      'jsEngine',
      'eventPublisher',
      'systemVar',
      'msgManager',
      'GCT_MODEL_INVOKE',
      'GCT_INVOKE',
    ].map((item) => {
      return {
        label: `import { ${item} } from 'jsapi'`,
        kind: monaco.languages.CompletionItemKind.Module,
        documentation: item,
        insertText: `import { ${item} } from "jsapi";`,
        range: range,
      };
    });

    // jsapi代码提示
    let jsapiPart = [
      'modelManager',
      'rdoModelManager',
      'jsEngine',
      'eventPublisher',
      'systemVar',
      'msgManager',
      'GCT_MODEL_INVOKE',
      'GCT_INVOKE',
    ].map((item) => {
      return {
        label: `import ${item}`,
        kind: monaco.languages.CompletionItemKind.Module,
        documentation: item,
        insertText: `import { ${item} } from "jsapi";`,
        range: range,
      };
    });

    // lodash代码提示
    let lodashLib = ['_', 'lo', 'lodash'].map((item) => {
      return {
        label: `import ${item}`,
        kind: monaco.languages.CompletionItemKind.Module,
        documentation: item,
        insertText: `import ${item} from "lodash";`,
        range: range,
      };
    });

    // dayjs
    let dayjsLib = ['dayjs', 'day', 'time', 'moment'].map((item) => {
      return {
        label: `import ${item}`,
        kind: monaco.languages.CompletionItemKind.Module,
        documentation: item,
        insertText: `import ${item} from "dayjs";`,
        range: range,
      };
    });

    // uuid
    let uuidLib = ['uuid', 'id', 'v4'].map((item) => {
      return {
        label: `import ${item}`,
        kind: monaco.languages.CompletionItemKind.Module,
        documentation: item,
        insertText: `import ${item} from "uuid";`,
        range: range,
      };
    });

    // underscore
    let underLib = ['underscore', 'us'].map((item) => {
      return {
        label: `import ${item}`,
        kind: monaco.languages.CompletionItemKind.Module,
        documentation: item,
        insertText: `import ${item} from "underscore";`,
        range: range,
      };
    });

    // 合并结果
    return concat(jsapiPartNew, jsapiPart, lodashLib, dayjsLib, uuidLib, underLib);
  }

  function initEditor() {
    if (!monaco) return;
    monaco.languages.registerCompletionItemProvider('typescript', {
      provideCompletionItems: function (model, position) {
        if (!monaco) return { suggestions: [] };
        var word = model.getWordUntilPosition(position);
        var range = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        return {
          suggestions: createDependencyProposals(range),
        };
      },
    });

    // monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    //   noSemanticValidation: true,
    //   noSyntaxValidation: false,
    // });

    // monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    //   target: monaco.languages.typescript.ScriptTarget.ES2015,
    //   allowNonTsExtensions: true,
    // });

    monacoEditor = monaco.editor.create(document.querySelector('.editor-core__container')!, {
      value: content,
      language: 'typescript',
      automaticLayout: true,
    });

    monacoEditor.onDidChangeModelContent((event) => {
      debounceChangeCallback(event);
      tmp && occupy();
      tmp++;
    });
  }

  const changeCallback = (event) => {
    const content = monacoEditor.getValue();
    // ! isFlush 如果更改是由于调用了Model.setValue而导致的，则为true，否则为false
    // ! 这里只记录手动输入
    if (event && !event.isFlush) {
      historyUtils.addHistory({ historyId: unref(scriptVersion).id, past: content });
    }
  };
  const debounceChangeCallback = debounce(changeCallback, 1000);

  const insertSample = (type) => {
    if (!monaco) return;
    const value = sampleScriptMap[type];
    const range = new monaco.Range(0, 999, 0, 999);
    let edit = {
      range,
      text: value,
      forceMoveMarkers: false,
    };
    monacoEditor!.executeEdits('', [edit]);
  };

  function setValue(code: string) {
    const model = monacoEditor.getModel();
    if (!model) return;

    // 获取整个文档的范围
    const fullRange = model.getFullModelRange();

    // 使用executeEdits来支持撤销/重做功能
    monacoEditor.executeEdits('setValue', [
      {
        range: fullRange,
        text: code,
        forceMoveMarkers: false,
      },
    ]);
  }

  function getValue() {
    return monacoEditor.getValue();
  }

  function getSelectCode() {
    const selection = monacoEditor.getSelection();
    if (selection) {
      const text = monacoEditor.getModel()?.getValueInRange(selection);
      // 选中内容位置信息
      const startLineNumber = selection.startLineNumber;
      const startColumn = selection.startColumn;
      const endLineNumber = selection.endLineNumber;
      const endColumn = selection.endColumn;
      // 获取选中内容之前的文本
      const textBeforeRange = {
        startLineNumber: 1,
        startColumn: 1,
        endLineNumber: startLineNumber,
        endColumn: startColumn,
      };
      const textBefore = monacoEditor.getModel().getValueInRange(textBeforeRange);
      // 获取选中内容之后的文本
      const textAfterRange = {
        startLineNumber: endLineNumber,
        startColumn: endColumn,
        endLineNumber: monacoEditor.getModel().getLineCount(),
        endColumn: monacoEditor.getModel().getLineMaxColumn(monacoEditor.getModel().getLineCount()),
      };
      const textAfter = monacoEditor.getModel().getValueInRange(textAfterRange);
      return {
        text,
        textBefore,
        textAfter,
      };
    }
    return {};
  }

  defineExpose({ insertSample, setValue, getValue, getSelectCode });
</script>

<style lang="less" scoped>
  .editor-core {
    &__container {
      height: 100%;
    }
  }
</style>
