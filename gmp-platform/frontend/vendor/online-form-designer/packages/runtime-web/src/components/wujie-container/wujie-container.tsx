import { computed, defineComponent, onUnmounted, PropType } from 'vue';
import { getToken, useNamespace } from '@gct-paas/core';
import WujieVue3 from 'wujie-vue3'
import { useAppInfoStore } from '/@/store/modules/app-info';
import { useUserStore } from '/@/store/modules/user';
import './wujie-container.scss';

const { destroyApp } = WujieVue3;

export const WuJieContainer = defineComponent({
  name: 'WuJieContainer',
  props: {
    wuJieName: {
      type: String,
      required: true,
    },
    wuJieProps: {
      type: Object as PropType<IObject>,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('wujie-container');

    // 加载脚本之前
    function beforeLoad(win: any) {
      Object.defineProperty(win, 'pSystem', {
        get: () => {
          return (window as any).System;
        },
      });
    }

    // 加载脚本之后
    function beforeMount(win: any) {
      console.debug('beforeMount', win.System);
    }

    // 加载脚本失败
    function loadError(win: any) {
      console.debug('loadError', win.System);
    }

    const { appInfo } = useAppInfoStore();
    const { userInfo } = useUserStore();

    const token = getToken();

    const _props = computed(() => {
      return {
        appInfo: appInfo,
        userInfo: userInfo,
        token,
        ...(props.wuJieProps.props ?? {}),
      };
    });

    onUnmounted(() => {
      // 如果是 alive 模式，则不销毁应用
      if (props.wuJieProps.alive === true) {
        return;
      }
      destroyApp(props.wuJieName);
    });

    return () => {
      return (
        <wujieVue
          class={ns.b()}
          name={props.wuJieName}
          // sync={true}
          // alive={true}
          // degrade={true}
          beforeLoad={beforeLoad}
          beforeMount={beforeMount}
          loadError={loadError}
          {...props.wuJieProps}
          props={_props.value}
        />
      );
    };
  },
});
