import { computed, defineComponent, onMounted, ref, PropType, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { merge } from 'lodash-es';
import type { editor } from 'monaco-editor';
import './monaco-editor.scss';

export const MonacoEditor = defineComponent({
  name: 'MonacoEditor',
  props: {
    value: {
      type: String,
    },
    options: {
      type: Object as PropType<editor.IStandaloneEditorConstructionOptions>,
    },
  },
  emits: ['update:value'],
  setup(props, { emit }) {
    const ns = useNamespace('monaco-editor');

    const containerRef = ref<HTMLDivElement>();

    let editorInst: editor.IStandaloneCodeEditor | null = null;

    const inst = computed<editor.IStandaloneCodeEditor>(() => editorInst!);

    watch(
      () => props.value,
      (val) => {
        if (val !== inst.value.getValue()) {
          inst.value.setValue(val || '');
        }
      },
    );

    const val = computed({
      get() {
        return props.value ?? '';
      },
      set(val) {
        emit('update:value', val);
      },
    });

    let option: editor.IStandaloneEditorConstructionOptions = {
      value: val.value ?? '', // 编辑器内容
      language: 'json',
      automaticLayout: true, // 是否自动布局
      theme: 'props.theme',
      readOnly: false,
      wordWrap: 'on', // 当单行文本太长时截断换行，true 为换行，false 为不换行
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

    if (props.options) {
      option = merge(option, props.options);
    }

    async function initEditor(): Promise<void> {
      if (!containerRef.value) return;
      editorInst = await window.monacoLoader.createMonacoEditor(containerRef.value, option);
      const _ = inst.value;
      _.onDidChangeModelContent(() => {
        val.value = _.getValue();
        // const action = _.getAction('editor.action.formatDocument');
        // if (action) {
        //   action.run();
        // }
      });
    }

    onMounted(() => {
      initEditor();
    });

    return { ns, containerRef };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div ref="containerRef" class={this.ns.e('editor')}></div>
      </div>
    );
  },
});
