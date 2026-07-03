<template>
  <div
    class="monaco-block-identifier"
    :class="{
      'monaco-block-identifier--border': false,
    }"
  ></div>
</template>

<script lang="ts" setup>
  import { watch, onMounted, onBeforeUnmount } from 'vue';
  import BlockIdentifier from '/@/components/Expression/utils/BlockIdentifier';
  // import { useIdentifier } from '/@/components/Expression/hooks/useIdentifier';
  import { useExpression } from '/@/components/Expression/hooks/useExpression';

  import {
    functionMap,
    ipaasBackFunctionMap,
    biBackFunctionMap,
  } from '/@/components/Expression/constant/function';
  import { useVariable } from '/@/components/Expression/hooks/useVariable';
  import { IdentifierAddon, ExpressionModeEnum } from '/@/components/Expression/types';

  const { exprOptions, globalIdentifiersMapById } = useExpression(false);

  let monaco: any = null;
  let editor: any = null;
  let bi: BlockIdentifier | null = null;

  // const { globalIdentifiersMapById } = useIdentifier();

  async function setupMonacoLanguage() {
    monaco = await window.monacoLoader.loadMonaco();

    monaco.languages.register({ id: 'MyExpressionLang' });

    monaco.languages.setMonarchTokensProvider('MyExpressionLang', {
      keywords: [],
      tokenizer: {
        root: [
          [/\$[A-Z0-9]*/, 'string'],
          [
            /[A-Z0-9][\w$]*/,
            {
              cases: {
                '@keywords': 'keyword',
                '@default': 'variable',
              },
            },
          ],
          [/".*?"/, 'string'],
          [/'.*?'/, 'string'],
          [/true/, 'string'],
          [/false/, 'string'],
        ],
      },
    });

    monaco.editor.defineTheme('MyExpressionTheme', {
      base: 'vs',
      inherit: false,
      rules: [
        { token: 'keyword', foreground: '#FF6600', fontStyle: 'bold' },
        { token: 'string', foreground: '#009966' },
        { token: 'variable', foreground: '#006699', fontStyle: 'bold' },
      ],
      colors: {
        'editor.foreground': '#000000',
      },
    });
  }

  onMounted(async () => {
    await setupMonacoLanguage();

    if (!monaco) return;

    editor = monaco.editor.create(document.querySelector('.monaco-block-identifier')!, {
      value: '',
      automaticLayout: true,
      language: 'MyExpressionLang',
      theme: 'MyExpressionTheme',
      lineNumbers: 'off',
      wordWrap: 'on',
      fontSize: 16,
      minimap: {
        enabled: false,
      },
    });

    editor.updateOptions({
      unicodeHighlight: {
        invisibleCharacters: false, // 隐藏零宽字符特殊显示
        allowedCharacters: {
          '（': true,
          '）': true,
        },
      },
    });

    // await getVarList();

    // initialize(exprOptions.value?.expr || '');
  });

  onBeforeUnmount(() => {
    console.log('edit onBeforeUnmount');
    editor && editor.dispose();
  });

  watch(exprOptions, (val) => {
    initialize(val?.expr || '');
  });

  const initialize = (value) => {
    bi = new BlockIdentifier(editor, monaco);
    const displayValue = bi?.idToName(value);
    console.log('displayValue', displayValue);
    editor.setValue(displayValue);
  };

  /**
   * 插入块变量
   */
  const insertBlock = (id) => {
    let identifier = globalIdentifiersMapById.value[id]._name_;
    let selection = editor.getSelection();
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

    let edit = {
      range,
      text:
        (leftDeco ? ' ' : '') +
        IdentifierAddon.Prefix +
        identifier +
        IdentifierAddon.Suffix +
        (rightDeco ? ' ' : ''),
      forceMoveMarkers: true,
    };
    editor.executeEdits('', [edit]);
    editor.focus();
  };

  /**
   * 插入函数
   * @param id
   */
  const insertFunction = (id) => {
    if (!monaco || !editor) return;

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
    let selection = editor.getSelection();
    const range = new monaco.Range(
      selection.startLineNumber,
      selection.startColumn,
      selection.endLineNumber,
      selection.endColumn,
    );

    let edit = {
      range,
      text: `${id}(${argstr})`,
      forceMoveMarkers: true, // 取消选中状态 好像没什么区别
    };
    editor.executeEdits('', [edit]);
    setTimeout(() => {
      editor.setPosition({
        lineNumber: selection.startLineNumber,
        column: selection.startColumn + id.length + 1,
      });
      editor.focus();
    }, 100);
  };

  const getExpression = () => {
    const code = editor.getValue();
    return [bi?.nameToId(code), code];
  };

  defineExpose({
    insertBlock,
    insertFunction,
    getExpression,
  });
</script>

<style lang="less">
  .monaco-block-identifier {
    width: 100%;
    height: 100%;
    min-height: 100px;

    &--border {
      overflow: hidden;
      border: 1px solid #ccc;
      border-radius: 5px;
    }

    .build-in__block--variable {
      border-radius: 3px;
      background: #6349b2;
      color: #fff !important;
      // margin-right: 1px;
      & + .build-in__block--variable {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      &:has(+ .build-in__block--variable) {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    .build-in__block--constant {
      border-radius: 3px;
      background: #6349b2;
      color: #fff !important;
      // margin-right: 1px;
    }
  }
</style>
