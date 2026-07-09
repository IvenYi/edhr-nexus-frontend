import { defineComponent, PropType, toRefs } from 'vue';
import { WuJieAIContainer } from '../wujie-ai-container/wujie-ai-container';

export const CodeChat = defineComponent({
  name: 'CodeChat',
  props: {
    id: {
      type: String,
      default: '',
    },
    backend: {
      type: Boolean,
      default: true,
    },
    // 当前编辑器内的代码
    editorRef: {
      type: Object,
    },
    // 提及功能适配器
    providers: {
      type: Array as PropType<{ tag: string; getMentions: () => Promise<any[]> }[]>,
      default: () => [],
    },
    // 设计界面 json 信息
    pageInfo: {
      type: Object,
    },
  },
  setup(_) {
    const { editorRef } = toRefs(_);

    function getCode() {
      const code = editorRef.value?.getCode();
      if (code) {
        return code;
      }
      return '';
    }

    function setCode(code: string) {
      editorRef.value?.setValue(code);
    }

    function getSelectCode() {
      return editorRef.value?.getSelectCode();
    }

    return () => {
      return (
        <WuJieAIContainer
          wuJieName="code-chat"
          wuJieProps={{
            url: window.location.origin + '/apps/ai/index.html#/code-chat-view',
            // url: 'http://localhost:4173/#/code-chat-view',
            // url: 'http://localhost:5174/#/code-chat-view',
            props: {
              params: {
                id: _.id,
                backend: _.backend,
                providers: _.providers,
                pageInfo: _.pageInfo,
              },
              fn: {
                getCode,
                setCode,
                getSelectCode,
              },
            },
          }}
        />
      );
    };
  },
});
