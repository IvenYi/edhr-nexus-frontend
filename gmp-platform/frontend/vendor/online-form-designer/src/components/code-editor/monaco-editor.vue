<template>
  <div class="hex-monaco-editor m-e w-full h-full overflow-hidden">
    <slot name="header"></slot>
    <div class="m-e-main">
      <a-row
        class="m-e-main_toolbar w-full flex"
        type="flex"
        justify="space-between"
        :style="
          isThemeLightOrBlack
            ? 'background-color: #fff; box-shadow: 0px 2px 5px #ddd;'
            : 'background-color: #1e1e1e; box-shadow: 0px 2px 5px #111;'
        "
      >
        <a-col
          class="m-e-main_toolbar_left flex-1"
          :style="isThemeLightOrBlack ? 'color: #000' : 'color: #fff'"
        >
          <span
            ><slot name="title">{{ title }}</slot></span
          >
        </a-col>

        <a-col class="m-e-main_toolbar_right" :style="getStyle">
          <!-- 搜索 -->
          <search-outlined class="icon" @click="findByKeyword" />
          <!-- 回到顶部 -->
          <up-circle-outlined class="icon" @click="scrollToTop" />
          <!-- 回到底部 -->
          <down-circle-outlined class="icon" @click="scrollToBottom" />
          <!-- 格式刷 -->
          <format-painter-outlined class="icon" @click="handleFormatCodeClick" />
          <!-- 是否截断换行 -->
          <!-- <menu-outlined class="icon" @click="setEditorWordWrap" /> -->
          <!-- 下载 -->
          <cloud-download-outlined class="icon" @click="handleDownloadLogClick" />
          <!-- 清空 -->
          <clear-outlined class="icon" @click="handleClearClick" />
          <!-- 聊天机器人 -->
          <robot-outlined
            v-if="isRagEnabled"
            title="聊天机器人"
            :class="['icon', { 'icon-active': isChatBotActive }]"
            @click="handleChatBotClick"
          />
        </a-col>
      </a-row>
      <div ref="Editor" class="m-e-main_container"></div>
    </div>
    <slot name="footer"></slot>
  </div>
</template>

<script lang="ts" setup name="code-editor">
  import { onMounted, ref, onUnmounted, watch, computed } from 'vue';
  import {
    SearchOutlined,
    UpCircleOutlined,
    DownCircleOutlined,
    CloudDownloadOutlined,
    FormatPainterOutlined,
    ClearOutlined,
    RobotOutlined,
  } from '@ant-design/icons-vue';
  import { Theme } from './useMonacoEditor';
  import { format } from 'sql-formatter';
  import { getBasicConfigAiRagEnabled } from '/@/apis/gct-apaas/BasicConfigController';

  export interface Prop {
    value?: string | null;
    /** 标题 */
    title?: string;
    /** 语言 */
    language?: string;
    /** 官方自带三种主题：vs、hc-black、vs-dark */
    theme?: Theme;
    /** 是否只读 */
    readonly?: boolean;
    /** 阅读方向 */
    direction?: 'top' | 'bottom';
    gapVal?: number;
  }

  const props = withDefaults(defineProps<Prop>(), {
    title: '',
    language: 'typescript',
    theme: Theme.DARK,
    readonly: false,
    value: '',
    direction: 'bottom',
    gapVal: 20,
  });

  const isMonacoReady = ref(false);

  // Monaco 实例
  let monaco: any = null;

  watch(
    () => props.language,
    async (newVal) => {
      if (monacoEditor && monacoEditor.getModel() && monaco) {
        monaco.editor.setModelLanguage(monacoEditor.getModel()!, newVal);
      }
    },
  );

  const emit = defineEmits([
    'update:value',
    'change',
    'editor-mounted',
    'blur',
    'focus',
    'chat-bot-click',
  ]);
  // 编辑器实例
  const Editor = ref();

  let monacoEditor!: any;
  /** 是否启用截断功能 */
  const wordWrap = ref(true);
  /** 是否全屏状态 */
  const fullScreen = ref(false);
  /** 明亮或暗夜模式，true 为白天模式，false 为暗夜模式 */
  const isThemeLightOrBlack = ref(false);
  /** 聊天机器人是否处于激活状态 */
  const isChatBotActive = ref(false);
  // 是否启用 AI RAG 功能，默认不启用
  const isRagEnabled = ref(false);

  const getStyle = computed(() => {
    console.log('gapVal', props);
    return {
      color: isThemeLightOrBlack.value ? '#000' : '#fff',
      marginRight: props.gapVal + 'px',
    };
  });

  if (props.theme === Theme.VS) {
    isThemeLightOrBlack.value = true;
  }

  // 编辑器配置选项
  let option: any = {
    value: props.value ?? '', // 编辑器内容
    language: props.language,
    automaticLayout: true, // 是否自动布局
    theme: props.theme,
    readOnly: props.readonly,
    wordWrap: wordWrap.value ? 'on' : 'off', // 当单行文本太长时截断换行，true 为换行，false 为不换行
    scrollBeyondLastLine: false, // 滚动完最后一行后再滚动一屏幕
    // 是否开启小地图
    minimap: {
      enabled: true,
    },
    tabSize: 2, // tab缩进长度
    autoClosingBrackets: 'always', // 是否自动添加结束括号(包括中括号) "always" | "languageDefined" | "beforeWhitespace" | "never"
    autoClosingDelete: 'always', // 是否自动删除结束括号(包括中括号) "always" | "never" | "auto"
    autoClosingOvertype: 'always', // 是否关闭改写 即使用insert模式时是覆盖后面的文字还是不覆盖后面的文字 "always" | "never" | "auto"
    autoClosingQuotes: 'always', // 是否自动添加结束的单引号 双引号 "always" | "languageDefined" | "beforeWhitespace" | "never"
    comments: {
      ignoreEmptyLines: true, // 插入行注释时忽略空行。默认为真。
      insertSpace: true, // 在行注释标记之后和块注释标记内插入一个空格。默认为真。
    }, // 注释配置
    columnSelection: false, // 启用列编辑 按下shift键位然后按↑↓键位可以实现列选择 然后实现列编辑
    folding: true, // 是否启用代码折叠
    fixedOverflowWidgets: true, // 超出编辑器大小的使用fixed属性显示
    // 编辑器悬停配置
    hover: {
      sticky: true, // 悬停是否粘滞，可以点击并选择其内容
      above: false, // 悬停是否应该显示在直线上方
    },
  };

  async function init() {
    // 加载 Monaco Editor
    monaco = await window.monacoLoader.loadMonaco();
    dispose();
    initEditor();
    if (props.value) {
      handleFormatCodeClick();
    }
  }

  async function onInit(): Promise<void> {
    const bol = await getBasicConfigAiRagEnabled();
    if (bol == true) {
      isRagEnabled.value = true;
    } else {
      isRagEnabled.value = false;
    }
  }

  function initEditor() {
    if (!monaco) {
      console.warn('[MonacoEditor] Monaco editor is not available for initEditor');
      return;
    }

    monacoEditor = monaco.editor.create(Editor.value, option);

    if (props.direction === 'bottom') {
      scrollToBottom();
    } else if (props.direction === 'top') {
      scrollToTop();
    }

    monacoEditor.onDidChangeModelContent(() => {
      emit('change', getEditorContent());
      emit('update:value', getEditorContent());
    });

    monacoEditor.onDidBlurEditorText(() => {
      emit('blur', getEditorContent());
      emit('update:value', getEditorContent());
    });

    monacoEditor.onDidFocusEditorText(() => {
      emit('focus');
    });

    isMonacoReady.value = true;

    emit('editor-mounted', monacoEditor);
  }

  /**
   * 设置编辑器的内容且滚动到最底部
   */
  function setEditorContent(val: any) {
    monacoEditor.setValue(val);
    emit('change', getEditorContent());
    emit('update:value', getEditorContent());
  }

  /**
   * 获取编辑器的内容
   */
  function getEditorContent() {
    return monacoEditor.getValue();
  }

  /**
   * 获取编辑器报错内容
   */
  function getEditorMarkers() {
    if (!monaco) {
      console.warn('[MonacoEditor] Monaco editor is not available for getEditorMarkers');
      return [];
    }
    const model = monacoEditor.getModel();
    if (!model) {
      return [];
    }
    return monaco.editor.getModelMarkers({ resource: model.uri });
  }

  /**
   * 搜索
   */
  function findByKeyword() {
    if (!monaco) {
      console.warn('[MonacoEditor] Monaco editor is not available for findByKeyword');
      return;
    }
    try {
      // 先聚焦编辑器
      monacoEditor.focus();

      // 从模型中获取要查找的字符串范围 new Range(startLineNumber, startColumn, endLineNumber, endColumn)
      monacoEditor.setSelection(new monaco.Range(1, 9999, 1, 10000));

      // 触发查找操作
      // this.editor.getAction('actions.find').run() // 查找方式一
      monacoEditor.trigger('', 'actions.find', null); // 查找方式二
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 设置编辑器滚动到最顶部
   */
  function scrollToTop() {
    monacoEditor.setScrollPosition({ scrollTop: 0 });
  }

  /**
   * 设置编辑器滚动到最底部
   */
  function scrollToBottom() {
    monacoEditor.revealLine(monacoEditor.getModel()!.getLineCount());
  }

  /**
   * 是否截断换行
   */
  function setEditorWordWrap() {
    wordWrap.value = !wordWrap.value;
    if (wordWrap.value) {
      monacoEditor.updateOptions({ wordWrap: 'on' });
    } else {
      monacoEditor.updateOptions({ wordWrap: 'off' });
    }
  }

  /**
   * 切换白天或暗夜模式
   */
  function setEditorTheme() {
    isThemeLightOrBlack.value = !isThemeLightOrBlack.value;
    if (isThemeLightOrBlack.value) {
      monacoEditor.updateOptions({ theme: 'vs' });
    } else {
      monacoEditor.updateOptions({ theme: 'vs-dark' });
    }
  }

  /**
   * 全屏切换
   */
  function handleFullScreenClick() {
    if (!Editor.value.fullscreenElement) {
      Editor.value.requestFullscreen();
      fullScreen.value = true;
    } else {
      Editor.value.exitFullscreen();
      fullScreen.value = false;
    }
  }

  /**
   * 下载
   */
  function handleDownloadLogClick() {
    exportFile(props.title, monacoEditor.getValue());
  }

  /**
   * 下载日志
   */
  function exportFile(name: string, data: any) {
    const url = window.URL || window.webkitURL || window;
    const blob = new Blob([data]);
    const event = document.createEvent('MouseEvents');
    event.initMouseEvent(
      'click',
      true,
      false,
      window,
      0,
      0,
      0,
      0,
      0,
      false,
      false,
      false,
      false,
      0,
      null,
    );
    const link: any = document.createElementNS('http://www.w3.org/1999/xhtml', 'a');
    link.href = (url as any).createObjectURL(blob);
    link.download = name;
    link.dispatchEvent(event);
  }

  /**
   * 格式化代码
   */
  function handleFormatCodeClick() {
    if (props.language == 'sql') {
      const sqlContent = getEditorContent();
      // 使用sql-formatter进行格式化
      const formattedSql = format(sqlContent);
      monacoEditor.setValue(formattedSql);
    } else {
      monacoEditor.getAction('editor.action.formatDocument')!.run(); // 自动格式化代码
    }
    const newVal = getEditorContent();
    emit('change', newVal);
    emit('update:value', newVal);
  }

  /** 清空 */
  function handleClearClick() {
    setEditorContent('');
  }

  /**
   * 处理聊天机器人点击事件
   */
  function handleChatBotClick() {
    isChatBotActive.value = !isChatBotActive.value; // 切换激活状态
    emit('chat-bot-click');
  }

  function dispose() {
    if (monacoEditor) {
      // provider.value.dispose();
      monacoEditor.dispose();
    }
  }

  /**
   * 获取monacoEditor的实例
   */
  function getMonacoEditor() {
    return monacoEditor;
  }

  onMounted(() => {
    init();
  });

  onUnmounted(() => {
    dispose();
  });

  /**
   * 设置编辑器内容，替换所有现有内容
   * 支持编辑器的撤销/重做功能
   * @param code 要设置的代码内容
   */
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

    // 触发change事件
    emit('change', getEditorContent());
    emit('update:value', getEditorContent());
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
      const textBefore = monacoEditor.getModel()!.getValueInRange(textBeforeRange);
      // 获取选中内容之后的文本
      const textAfterRange = {
        startLineNumber: endLineNumber,
        startColumn: endColumn,
        endLineNumber: monacoEditor.getModel()!.getLineCount(),
        endColumn: monacoEditor
          .getModel()!
          .getLineMaxColumn(monacoEditor.getModel()!.getLineCount()),
      };
      const textAfter = monacoEditor.getModel()!.getValueInRange(textAfterRange);
      return {
        text,
        textBefore,
        textAfter,
      };
    }
    return {};
  }

  onInit();

  defineExpose({
    isMonacoReady,
    reload(newVal) {
      if (monacoEditor == null) {
        console.warn('[MonacoEditor] Monaco editor is not available for reload');
        return;
      }
      monacoEditor.setValue(newVal || '');
    },
    getMonacoEditor,
    setEditorContent,
    getEditorContent,
    scrollToTop,
    scrollToBottom,
    setEditorWordWrap,
    setEditorTheme,
    handleFullScreenClick,
    handleDownloadLogClick,
    getEditorMarkers,
    handleFormatCodeClick,
    getValue,
    setValue,
    getSelectCode,
    isChatBotActive,
    handleChatBotClick,
  });
</script>

<style lang="less" scoped>
  .m-e {
    width: 100%;
    height: 100%;

    .m-e-main {
      display: flex;
      flex-direction: column;
      width: calc(100% - 2px);
      height: calc(100% - 2px);

      .m-e-main_toolbar {
        position: relative;
        z-index: 10;
        height: 40px;
        box-shadow: 0 2px 5px #000;

        .m-e-main_toolbar_left {
          span {
            padding-left: 10px;
            font-size: 15px;
            line-height: 40px;
            user-select: none;
          }
        }

        .m-e-main_toolbar_right {
          display: flex;
          align-items: center;

          .icon {
            display: inline-block;
            margin-left: 10px;
            transition: ease all 0.3s;
            //   padding: 4px;
            //   font-size: 16px;
            border-radius: 2px;
            text-align: center;
            cursor: pointer;

            &:hover {
              background-color: rgb(255 255 255 / 10%);
            }

            &.icon-active {
              color: #1890ff;
              background-color: rgba(24, 144, 255, 0.1);
              box-shadow: 0 0 4px rgba(24, 144, 255, 0.5);
              transform: scale(1.1);
            }
          }
        }
      }

      .m-e-main_container {
        flex: 1;
        width: 100%;
        height: 100%;
        min-height: 400px;
      }
    }
  }
</style>
