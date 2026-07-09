import { useNamespace } from '@gct/runtime';
import { defineComponent, ref, watch, onMounted, onBeforeUnmount } from 'vue';
import BlockIdentifier from '/@/components/Expression/utils/BlockIdentifier';
import { useExpression } from '/@/components/Expression/hooks/useExpression';
import {
  functionMap,
  ipaasBackFunctionMap,
  biBackFunctionMap,
} from '/@/components/Expression/constant/function';
import { ExpressionModeEnum, IdentifierAddon } from '/@/components/Expression/types';
import { installCustomTheme } from './custom-theme';
import { installCustomLanguage } from './custom-language';
import { CUSTOM_LANGUAGE, CUSTOM_THEME } from '../../constant/editor';
import { ExpressionLanguageService } from '../../service/expression-language.service';
import './expression-editor.scss';

export const ExpressionEditor = defineComponent({
  name: 'ExpressionEditor',
  setup() {
    const ns = useNamespace('expression-editor');

    const isInit = ref(false);

    const service = new ExpressionLanguageService();

    const elRef = ref<HTMLDivElement>();

    const { exprOptions, globalIdentifiersMapById } = useExpression(false);

    let monaco: any = null;
    let editor: any = null;
    let bi: BlockIdentifier | null = null;

    onMounted(async () => {
      // 加载 Monaco Editor
      monaco = await window.monacoLoader.loadMonaco();

      // 将 monaco 实例赋值给 service
      service.monaco = monaco;

      // 安装自定义语言和主题（必须在 monaco 加载后）
      installCustomLanguage(monaco, service);
      installCustomTheme(monaco);

      editor = monaco.editor.create(elRef.value!, {
        value: '',
        automaticLayout: true,
        language: CUSTOM_LANGUAGE,
        theme: CUSTOM_THEME,
        lineNumbers: 'on',
        wordWrap: 'on',
        fontSize: 16,
        minimap: {
          enabled: false,
        },
        // 'semanticHighlighting.enabled': true,
      });

      service.editor = editor;

      editor.updateOptions({
        unicodeHighlight: {
          invisibleCharacters: false, // 隐藏零宽字符特殊显示
          allowedCharacters: {
            '（': true,
            '）': true,
          },
        },
      });

      editor.onDidChangeModelContent(() => {
        const code = editor!.getValue();
        service.change(code);
      });

      if (isInit.value === false && exprOptions.value) {
        initialize(exprOptions.value);
      }
    });

    onBeforeUnmount(() => {
      editor && editor.dispose();
    });

    const initialize = (val) => {
      isInit.value = true;
      bi = new BlockIdentifier(service);
      if (val.expr) {
        const displayValue = bi.idToName(val.expr);
        editor!.setValue(displayValue);
      }
    };

    watch(exprOptions, (val) => {
      if (isInit.value === false && val) {
        initialize(val);
      } else {
        // 配置变更，强制重新计算状态
        const code = editor!.getValue();
        service.change(code, true);
      }
    });

    function setMarkerHigh(marker: any): void {
      if (!monaco) {
        console.warn('[ExpressionEditor] Monaco editor is not available');
        return;
      }
      if (marker && monaco) {
        service.setDecorations();
        const model = editor!.getModel()!;
        const lins: number[] = [];
        for (let i = marker.startLineNumber; i <= marker.endLineNumber; i++) {
          lins.push(i);
        }
        // 每行最大列
        const allMaxColumns: number[] = [];
        lins.forEach((line) => {
          allMaxColumns.push(model.getLineMaxColumn(line));
        });
        if (!monaco) return;
        lins.forEach((line, i) => {
          const range = new monaco!.Range(line, 1, line, allMaxColumns[i]);
          service.decorationsCollection!.append([
            {
              range,
              options: {
                inlineClassName: ns.e('error-line'),
              },
            },
          ]);
        });
      }
    }

    /**
     * 插入块变量
     */
    const insertBlock = (id) => {
      if (!monaco) {
        console.warn('[ExpressionEditor] Monaco editor is not available for insertBlock');
        return;
      }

      const identifier = globalIdentifiersMapById.value[id]._name_;
      const selection = editor!.getSelection()!;
      const range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn,
      );

      const leftDeco = bi!.findDecorationRangeOnLeft({
        lineNumber: selection.startLineNumber,
        column: selection.startColumn,
      });

      const rightDeco = bi!.findDecorationRangeOnRight({
        lineNumber: selection.endLineNumber,
        column: selection.endColumn,
      });

      const edit = {
        range,
        text:
          (leftDeco ? ' ' : '') +
          IdentifierAddon.Prefix +
          identifier +
          IdentifierAddon.Suffix +
          (rightDeco ? ' ' : ''),
        forceMoveMarkers: true,
      };
      editor!.executeEdits('', [edit]);
      editor!.focus();
    };

    /**
     * 插入函数
     * @param id
     */
    const insertFunction = (id) => {
      if (!monaco) {
        console.warn('[ExpressionEditor] Monaco editor is not available for insertFunction');
        return;
      }

      const fun =
        exprOptions.value?.mode === ExpressionModeEnum.IPAAS_BACK
          ? ipaasBackFunctionMap[id]
          : exprOptions.value?.mode === ExpressionModeEnum.BI_FORMULA
            ? biBackFunctionMap[id]
            : functionMap[id];
      const args = fun?._args_ || 0;
      const argstr =
        args === 0
          ? ''
          : Array(args - 1)
              .fill(', ')
              .join('');
      const selection = editor!.getSelection()!;
      const range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn,
      );

      const edit = {
        range,
        text: `${id}(${argstr})`,
        forceMoveMarkers: true, // 取消选中状态 好像没什么区别
      };
      editor!.executeEdits('', [edit]);
      setTimeout(() => {
        editor!.setPosition({
          lineNumber: selection.startLineNumber,
          column: selection.startColumn + id.length + 1,
        });
        editor!.focus();
      }, 100);
    };

    const insertText = (text: string) => {
      if (!monaco) {
        console.warn('[ExpressionEditor] Monaco editor is not available for insertText');
        return;
      }

      const selection = editor!.getSelection()!;
      const range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn,
      );
      const edit = {
        range,
        text,
        forceMoveMarkers: true, // 取消选中状态 好像没什么区别
      };
      editor!.executeEdits('', [edit]);
      setTimeout(() => {
        editor!.setPosition({
          lineNumber: selection.startLineNumber,
          column: selection.startColumn + text.length,
        });
        editor!.focus();
      }, 100);
    };

    // 获取所有异常信息
    const getMarkers = () => {
      return service.state.markers;
    };

    const activeMarker = (marker: any): void => {
      if (marker) {
        setMarkerHigh(marker);
        editor!.setSelection({
          selectionStartLineNumber: marker.startLineNumber,
          selectionStartColumn: marker.startColumn,
          positionLineNumber: marker.endLineNumber,
          positionColumn: marker.endColumn,
        });
        editor!.focus();
      }
    };

    const dbActiveMarker = (marker: any): void => {
      if (marker) {
        setMarkerHigh(marker);
        editor!.setSelection({
          selectionStartLineNumber: marker.endLineNumber,
          selectionStartColumn: marker.endColumn,
          positionLineNumber: marker.startLineNumber,
          positionColumn: marker.startColumn,
        });
        editor!.focus();
      }
    };

    const getExpression = () => {
      const code = editor!.getValue();
      return [bi?.nameToId(service.state.code), code];
    };

    return {
      ns,
      elRef,
      insertBlock,
      insertFunction,
      insertText,
      getMarkers,
      activeMarker,
      dbActiveMarker,
      getExpression,
    };
  },
  render() {
    return <div ref="elRef" class={this.ns.b()}></div>;
  },
});
