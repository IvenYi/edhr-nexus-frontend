<template>
  <div class="js-toolkit-box">
    <div class="js-toolkit-code">
      <code-editor
        v-model:value="jsCode"
        language="typescript"
        ref="editorRef"
        @blur="getEditorValue"
        @focus="onFocus"
        @chat-bot-click="toggleChatVisibility"
        @editorMounted="onEditorMounted"
      />
    </div>
    <div class="js-resize-handle" ref="resizeHandleRef" v-show="isChatVisible"></div>
    <div class="js-toolkit-chat" ref="chatBoxRef" v-show="isChatVisible">
      <code-chat :id="scriptId" :backend="false" :pageInfo="pageInfo" :editorRef="editorRef" />
    </div>
  </div>
</template>

<script lang="ts" setup name="toolkit-js">
  import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue';
  import CodeEditor from '/@/components/code-editor/monaco-editor.vue';
  import { useMessage } from '/@/hooks/web/useMessage';
  import { useI18n } from '/@/hooks/web/useI18n';
  import { NewEvent } from '/@page-designer/types/toolkit';
  import { useMitt } from '/@page-designer/hooks/useMitt';
  import { useScope } from '/@page-designer/hooks/useScope';
  import { useToolkit } from '/@page-designer/hooks/useToolkit';
  import { ToolkitEnum, Platform } from '/@page-designer/enum';
  import { useDesigner } from '/@page-designer/hooks/useDesigner';
  import { platform } from '/@page-designer/hooks/usePage';
  import { getCodeTsList } from '/@/apis/gct-apaas/CodehintController';
  import { LowCodeWidget } from '@gct/runtime';
  import { ComponentTypeMap } from '../../interface';
  import { createUUID } from 'qx-util';
  import interact from 'interactjs';
  import { isEmpty, isNil } from 'lodash-es';

  const { t } = useI18n();
  const { createMessage } = useMessage();
  const { scopeJs, scopeId, scopeData } = useScope();
  const { toggleToolkit, fixedToolkit, toolkitFixed } = useToolkit();
  const { mitt } = useMitt();
  const { methodMap, pageJson } = useDesigner();

  // 聊天区域显示状态
  const isChatVisible = ref<boolean>(false);

  // 过滤后递给 AI 聊天的界面配置 JSON
  const pageInfo = ref<IObject>({});

  // 聊天区域宽度调整相关
  const chatBoxRef = ref<HTMLElement | null>(null);
  const resizeHandleRef = ref<HTMLElement | null>(null);
  const minWidth = 200; // 最小宽度
  const maxWidth = 600; // 最大宽度
  const defaultWidth = 400; // 默认宽度
  const localStorageKey = 'js-toolkit-chat-width';

  /**
   * 切换聊天区域显示状态
   */
  const toggleChatVisibility = (): void => {
    if (toolkitFixed.value !== true) {
      fixedToolkit();
    }
    isChatVisible.value = !isChatVisible.value;

    // 如果显示聊天区域，确保宽度正确设置
    if (isChatVisible.value) {
      initChatWidth();
    }

    onFocus();
  };

  // 初始化聊天区域宽度
  const initChatWidth = (): void => {
    if (!chatBoxRef.value) return;

    // 从本地存储获取宽度，如果没有则使用默认宽度
    const savedWidth = localStorage.getItem(localStorageKey);
    const width = savedWidth ? parseInt(savedWidth, 10) : defaultWidth;

    // 设置宽度
    chatBoxRef.value.style.width = `${width}px`;
  };

  // 保存聊天区域宽度到本地存储
  const saveChatWidth = (width: number): void => {
    localStorage.setItem(localStorageKey, width.toString());
  };

  // 初始化拖拽功能
  const initResizable = (): void => {
    if (!resizeHandleRef.value || !chatBoxRef.value) return;

    interact(resizeHandleRef.value as any).draggable({
      allowFrom: '.js-resize-handle',
      ignoreFrom: 'button',
      modifiers: [
        interact.modifiers.restrictRect({
          restriction: 'parent',
        }),
      ],
      listeners: {
        move(event) {
          if (!chatBoxRef.value) return;

          // 计算新宽度
          const currentWidth = parseFloat(getComputedStyle(chatBoxRef.value as any).width);
          let newWidth = currentWidth - event.dx;

          // 限制宽度范围
          newWidth = Math.min(Math.max(newWidth, minWidth), maxWidth);

          // 应用新宽度
          chatBoxRef.value.style.width = `${newWidth}px`;

          // 保存宽度
          saveChatWidth(newWidth);
        },
      },
    });
  };

  const scriptId = ref<string>(createUUID());

  const editorRef = ref();

  async function loadLocalDefs(uri): Promise<void> {
    const res = await fetch(uri);
    const data = await res.text();
    if (data) {
      window.monacoLoader.getMonaco().languages.typescript.typescriptDefaults.addExtraLib(data);
    }
  }

  async function loadLocalDefsBat() {
    let uris = [
      platform.value === Platform.MOBILE
        ? '/api-types/%E7%A7%BB%E5%8A%A8%E7%AB%AF%E6%96%87%E6%A1%A3.d.ts'
        : '/api-types/%E7%BD%91%E9%A1%B5%E7%AB%AF%E6%96%87%E6%A1%A3.d.ts',
    ];
    const getCode = async () => {
      const { data } = await getCodeTsList({
        isReturnNativeResponse: true,
        transferToConfig: { responseType: 'blob', timeout: 10 * 1000 },
      });
      if (data) {
        const text = await new Promise<string>((r) => {
          const reader = new FileReader();
          reader.onloadend = function () {
            // 当读取操作完成时，reader.result 中会包含结果
            r((reader.result as string) || '');
          };
          // 将Blob对象读取为文本
          reader.readAsText(data);
        });
        window.monacoLoader.getMonaco().languages.typescript.typescriptDefaults.addExtraLib(text);
      }
    };
    await Promise.all([
      uris.map((_) => {
        loadLocalDefs(_);
      }),
      getCode(),
    ]);
  }

  function deepModals(modals: LowCodeWidget.BasicSchema[]): LowCodeWidget.BasicSchema[] {
    return modals
      .map((_) => {
        const arr: LowCodeWidget.BasicSchema[] = [];
        if (_.children && _.children.length > 0) {
          const [body, bottomBtn] = _.children;
          if (body) {
            arr.push(...deepWidgets(body.children));
          }
          if (bottomBtn) {
            arr.push(...deepWidgets(bottomBtn.children));
          }
        }
        return arr;
      })
      .flat();
  }

  function deepWidgets(widgets: LowCodeWidget.BasicSchema[]): LowCodeWidget.BasicSchema[] {
    const arr: LowCodeWidget.BasicSchema[] = [];
    widgets.forEach((_) => {
      if (_.id) {
        arr.push(_);
      }
      if (_.children && _.children.length > 0) {
        const items = deepWidgets(_.children);
        arr.push(...items);
      }
    });
    return arr;
  }

  function setWidgetTypes(): void {
    const items = [deepWidgets(pageJson.widgets), deepModals(pageJson.modals)].flat();
    const content = `declare interface ComponentKeys {
              ${items
                .map((_) => {
                  if (ComponentTypeMap[_.type]) {
                    return `/**
                     * ${_.alias}
                     */
                    ${_.id}: ${ComponentTypeMap[_.type]};`;
                  }
                  return `${_.id}: any;`;
                })
                .join('\n')}
          }`;
    window.monacoLoader
      .getMonaco()
      .languages.typescript.typescriptDefaults.addExtraLib(content, 'component-map.ts');
  }

  function deepFilterWidgets(widgets: LowCodeWidget.BasicSchema[]): IObject[] {
    // 组件需要传递给 AI 的属性
    const widgetKeys = ['id', 'type', 'alias', 'events'];
    // props 中需要传递给 AI 的属性
    const propsKeys = ['model', 'modelKey', 'field', 'fieldType'];
    const _widgets: IObject[] = [];
    widgets.forEach((widget) => {
      const obj: IObject = {};
      const props: IObject = {};
      // 填充需要的 props
      if (widget.props) {
        propsKeys.forEach((key) => {
          if (!isNil(widget.props[key]) && !isEmpty(widget.props[key])) {
            props[key] = widget.props[key];
          }
        });
        if (!isEmpty(props)) {
          obj.props = props;
        }
      }
      // 填充需要的 widget 属性
      widgetKeys.forEach((key) => {
        if (!isNil(widget[key]) && !isEmpty(widget[key])) {
          obj[key] = widget[key];
        }
      });
      if (widget.children && widget.children.length > 0) {
        obj.children = deepFilterWidgets(widget.children);
      }
      _widgets.push(obj);
    });
    return _widgets;
  }

  function calcAIChatJSON(): void {
    const pageKeys = ['pageEvents', 'pageVars', 'globalEvents'];
    // 计算过滤后的页面 JSON
    pageInfo.value = {
      // 根据当前域传递组件清单，例如模态打开时，这里只有模态的组件
      widgets: deepFilterWidgets(scopeData.value),
    };
    pageKeys.forEach((key) => {
      if (!isNil(pageJson[key]) && !isEmpty(pageJson[key])) {
        pageInfo.value[key] = pageJson[key];
      }
    });
    console.log('AIApp Chat JSON:', pageInfo.value);
  }

  function onFocus(): void {
    setWidgetTypes();
    calcAIChatJSON();
  }

  function setEditorTheme(): void {
    editorRef.value.setEditorTheme();
  }

  function onEditorMounted(): void {
    setEditorTheme();
    if (scopeId.value) {
      editorRef.value.reload(jsCode.value);
    }
  }

  onMounted(async () => {
    await window.monacoLoader.loadMonaco();
    loadLocalDefsBat();
    initChatWidth();
    initResizable();
    mitt.on('focus-js', (methodName) => {
      toggleToolkit(ToolkitEnum.JS, true);
      if (editorRef.value) {
        const editor = editorRef.value.getMonacoEditor();
        const { range } = editor.getModel()!.findMatches(methodName)[0];
        editor.setPosition({ lineNumber: range.endLineNumber + 1, column: 4 });
        editor.revealLine(range.endLineNumber);
        //为了和失焦事件不冲突 所以做了个setTimeout
        setTimeout(() => {
          setWidgetTypes();
          editor.focus();
        }, 50);
      }
    });
    mitt.on('new-event', (eventInfo) => {
      const { methodName, params, content } = eventInfo as NewEvent;
      const methods = Object.keys(methodMap.value);
      if (methods.includes(methodName)) {
        return;
      }
      let js = scopeJs.value;
      js += ['', `export function ${methodName}(${params}){`, content ? content : '', '}'].join(
        '\n',
      );
      editorRef.value?.setEditorContent(js);
    });
  });
  onBeforeUnmount(() => {
    mitt.off('new-event');
    mitt.off('focus-js');

    // 清除交互实例
    if (resizeHandleRef.value) {
      interact(resizeHandleRef.value as any).unset();
    }
  });

  const getEditorValue = () => {
    editorRef.value.handleFormatCodeClick();
    const error = editorRef.value.getEditorMarkers().filter((i) => i.severity >= 8);
    if (error.length) {
      createMessage.warning(t('sys.pageDesigner.codeError'));
      return;
    } else {
      mitt.emit('get-schema-code');
    }
  };
  const jsCode = computed({
    set(val: string) {
      scopeJs.value = val;
    },
    get() {
      return scopeJs.value;
    },
  });
  watch(
    () => scopeId.value,
    () => {
      if (editorRef.value?.isMonacoReady === true) {
        editorRef.value.reload(jsCode.value);
      }
    },
  );
</script>

<style lang="less" scoped>
  .js-toolkit-box {
    display: flex;
    height: 100%;
    width: 100%;

    .js-panel-title {
      flex: none;
      padding: 0 8px 8px 14px;
      color: #333;
      font-size: 14px;
      font-weight: 700;
      line-height: 30px;
    }

    .js-toolkit-code {
      width: 100%;
      overflow: hidden;
    }

    .js-toolkit-chat {
      flex: none;
      width: 400px;
      overflow-y: hidden;
    }

    .js-resize-handle {
      width: 10px;
      cursor: ew-resize;
      background-color: transparent;
      touch-action: none;
    }
  }
</style>
