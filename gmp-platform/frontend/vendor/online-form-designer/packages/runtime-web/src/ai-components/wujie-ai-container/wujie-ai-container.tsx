import { computed, defineComponent, unref, watch } from 'vue';
import { getToken, useNamespace } from '@gct-paas/core';
import { useAppInfoStore } from '/@/store/modules/app-info';
import { useUserStore } from '/@/store/modules/user';
import WujieVue from "wujie-vue3";
import './wujie-ai-container.scss';

const { bus } = WujieVue;

export const WuJieAIContainer = defineComponent({
  name: 'WuJieAIContainer',
  props: {
    wuJieName: {
      type: String,
      required: true,
    },
    wuJieProps: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const ns = useNamespace('wujie-ai-container');

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
      console.log('beforeMount', win.System);
    }

    // 加载脚本失败
    function loadError(win: any) {
      console.log('loadError', win.System);
    }

    const { appInfo } = useAppInfoStore();
    const { userInfo } = useUserStore();

    const token = getToken();

    const _props = computed(() => {
      return {
        updatedAt: new Date().getTime(),
        appInfo: appInfo,
        userInfo: userInfo,
        env: gct.appSetting.env,
        branchId: gct.appSetting.branchId,
        token,
        ...(props.wuJieProps.props ?? {}),
      };
    });

    watch(_props, () => {
      bus.$emit('props_change', _props.value);
    })

    return () => {
      return (
        <wujieVue
          class={ns.b()}
          name={props.wuJieName}
          sync={true}
          beforeLoad={beforeLoad}
          beforeMount={beforeMount}
          loadError={loadError}
          {...props.wuJieProps}
          props={unref(_props.value)}
        />
      );
    };
  },
});
