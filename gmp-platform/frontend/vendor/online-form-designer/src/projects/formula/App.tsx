import { defineComponent, onMounted, ref, watch } from 'vue';
import { useNamespace } from '@gct/runtime';
import { useExpression } from '/@/components/Expression/hooks/useExpression';
import { ExpressionEditor } from '/@/components/Expression/components';
import { WinMsgTypeEnum } from '/@/components/Expression/constant';
import './App.scss';

export const App = defineComponent({
  name: 'App',
  setup() {
    const ns = useNamespace('App');
    const { openIframe, updateOpts } = useExpression(false);

    const ready = ref<boolean>(false);
    const editorRef = ref();

    const win: any = window as any;

    watch(editorRef, (value) => {
      if (value && win.GCT_EXPRESSION_WINDOW) {
        Object.assign(win.GCT_EXPRESSION_WINDOW, {
          openIframe,
          updateOpts,
        });
        Object.assign(win.GCT_EXPRESSION_WINDOW, {
          insertBlock: value.insertBlock,
          insertFunction: value.insertFunction,
          insertText: value.insertText,
          getMarkers: value.getMarkers,
          activeMarker: value.activeMarker,
          dbActiveMarker: value.dbActiveMarker,
          getExpression: value.getExpression,
        });
      }
    });

    onMounted(() => {
      ready.value = true;
      if (win.GCT_EXPRESSION_WINDOW) {
        openIframe(win.GCT_EXPRESSION_WINDOW.options);
      } else {
        win.GCT_EXPRESSION_WINDOW = {
          openIframe,
          updateOpts,
        };
      }
    });

    window.addEventListener('message', (e) => {
      if (e.data && typeof e.data === 'string') {
        try {
          const data = JSON.parse(e.data);
          if (data && data.type === WinMsgTypeEnum.EXPRESSION) {
            if (win.GCT_EXPRESSION_WINDOW.expressionMessage) {
              win.GCT_EXPRESSION_WINDOW.expressionMessage(data);
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    });

    return { ns, ready, editorRef };
  },
  render() {
    if (!this.ready) {
      return null;
    }
    return <ExpressionEditor ref="editorRef" />;
  },
});
