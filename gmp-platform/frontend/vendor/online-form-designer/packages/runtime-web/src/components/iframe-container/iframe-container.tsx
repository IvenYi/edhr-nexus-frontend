import { computed, defineComponent, onMounted, onUnmounted, PropType, ref, watch } from 'vue';
import { getToken, useNamespace } from '@gct-paas/core';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { useUserStore } from '/@/store/modules/user';
import './iframe-container.scss';

export const IFrameContainer = defineComponent({
  name: 'IFrameContainer',
  props: {
    iframeName: {
      type: String,
      required: true,
    },
    iframeProps: {
      type: Object as PropType<IObject>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('iframe-container');
    const iframeRef = ref<HTMLIFrameElement>();
    const isReady = ref(false);

    const { appInfo } = useAppInfoStore();
    const { userInfo } = useUserStore();

    const token = getToken();

    const _props = computed(() => {
      return {
        appInfo: appInfo,
        userInfo: userInfo,
        token,
        ...(props.iframeProps.props ?? {}),
      };
    });

    // 向 iframe 发送消息的方法
    const sendMessageToIframe = (type: string, data?: any) => {
      if (iframeRef.value?.contentWindow && isReady.value) {
        iframeRef.value.contentWindow.postMessage({ type, ...data }, '*');
      }
    };

    // 监听来自 iframe 的消息
    const handleMessage = (event: MessageEvent) => {
      // 只处理来自当前 iframe 的消息
      if (event.source !== iframeRef.value?.contentWindow) {
        return;
      }

      if (event.data?.type === 'IFRAME_READY') {
        isReady.value = true;
        // iframe 准备就绪后，发送 props
        sendMessageToIframe('IFRAME_PROPS', { props: _props.value });
      } else if (event.data?.type === 'IFRAME_CALLBACK') {
        // 处理来自 iframe 的回调
        const { method, args } = event.data;
        const callback = props.iframeProps.fn?.[method];
        if (typeof callback === 'function') {
          callback(...(args || []));
        }
      }
    };

    onMounted(() => {
      window.addEventListener('message', handleMessage);
    });

    onUnmounted(() => {
      window.removeEventListener('message', handleMessage);
    });

    // 监听 props 变化，实时发送给 iframe
    watch(_props, (newProps) => {
      if (isReady.value) {
        sendMessageToIframe('IFRAME_PROPS', { props: newProps });
      }
    }, { deep: true });

    return () => {
      return (
        <div class={ns.b()}>
          <iframe
            ref={iframeRef}
            src={props.iframeProps.url}
            class={ns.e('iframe')}
            onLoad={() => {
              // iframe 加载完成，等待其发送 READY 消息
            }}
          />
        </div>
      );
    };
  },
});
