import { computed, defineComponent, onUnmounted, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IModal, PageDesignModeEnum, t } from '@gct/runtime';
// import { WuJieContainer } from '@gct/runtime-web';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { useUserStoreWithOut } from '/@/store/modules/user';
import { PageTypeEnum } from '/@/layouts/tree-sider-page/enum';
import { genUrl } from '/@/utils';
import { useBranch } from '/@/hooks/develop/useBranch';
import { getToken } from '/@/utils/auth';
import { PageDesignViewRouteParams } from './page-design-view.interface';
import './page-preview-view.scss';

export const PagePreviewView = defineComponent({
  name: 'PagePreviewView',
  props: {
    params: {
      type: Object as PropType<IObject>,
      default: () => ({}),
    },
    modal: {
      type: Object as PropType<IModal>,
      required: false,
    },
  },
  setup(props) {
    const ns = useNamespace('page-preview-view');

    const isLoaded = ref<boolean>(false);

    const iframeRef = ref<HTMLIFrameElement | null>(null);

    const { branchId } = useBranch();

    const params = props.params as PageDesignViewRouteParams;
    const viewKey = params.id;
    const viewType = params.mode;

    const usePathQuery = usePathQueryStore();
    const userStore = useUserStoreWithOut();

    const pageName = ref<string>('');
    const isMobile = computed(() => viewType === PageTypeEnum.MOBILE);
    const mobMode = ref<string>('');
    const defaultMobMode = ref<string>('');

    const url = computed<string>(() => {
      if (isMobile.value) {
        const { hostname, origin } = location;
        const appOrigin = import.meta.env.DEV ? 'http://' + hostname : origin;
        return genUrl(
          `${appOrigin}${
            import.meta.env.VITE_PATHNAME_MOBILE_PAGE
          }?_t=${Date.now()}&designPreview=true`,
          {
            aid: usePathQuery.getAid(),
            pid: viewKey,
            bid: branchId.value,
            token: getToken(),
            'tenant-id': userStore.getTenant,
          },
        );
      }
      const origin = location.origin;
      const _url = genUrl(
        `${origin}${import.meta.env.VITE_PATHNAME_WEB_PAGE}?_t=${Date.now()}&designPreview=true`,
        {
          aid: usePathQuery.getAid(),
          pid: viewKey,
          bid: branchId.value,
        },
      );
      return _url;
    });

    function onClose(e: MouseEvent): void {
      e.stopPropagation();
      props.modal?.dismiss();
    }

    function onMessage(event: MessageEvent): void {
      if (event.data && typeof event.data === 'string') {
        try {
          const data = JSON.parse(event.data);
          if (data && data.cmd === 'previewPageData') {
            mobMode.value = data.data.terminal || PageDesignModeEnum.PDA;
            pageName.value = data.data.name;
            defaultMobMode.value = mobMode.value;
            isLoaded.value = true;
          }
        } catch (error) {
          console.error('Error parsing message data:', error);
        }
        return;
      }
    }

    function changeMobMode(mode: string): void {
      mobMode.value = mode;
    }

    window.addEventListener('message', onMessage);
    onUnmounted(() => {
      window.removeEventListener('message', onMessage);
    });

    return () => {
      const iframe = <iframe ref={iframeRef} src={url.value} />;
      return (
        <div class={ns.b()}>
          {/* <WuJieContainer
            wuJieName="page-preview"
            wuJieProps={{
              url: url.value,
              // alive: true,
              degrade: true,
              props: {},
            }}
          /> */}
          <div class={ns.e('header')}>
            <span
              class={ns.e('close')}
              title={t('sys.appDesigner.customAppHome.preview.back')}
              onClick={onClose}
            >
              <i class="gct-iconfont icon-icon_tuichuyulan" />
            </span>
            <span class={ns.e('title')}>{pageName.value}</span>
            {isMobile.value && pageName.value ? (
              <div
                class={[
                  ns.e('mobile-mode'),
                  ns.is('reverse', defaultMobMode.value === PageDesignModeEnum.PAD),
                ]}
              >
                <div
                  class={[
                    ns.e('mobile-mode-item'),
                    ns.is('active', mobMode.value === PageDesignModeEnum.PDA),
                  ]}
                  onClick={() => changeMobMode(PageDesignModeEnum.PDA)}
                >
                  <i class="gct-iconfont icon-icon_PDA_big" />
                </div>
                <div
                  class={[
                    ns.e('mobile-mode-item'),
                    ns.is('active', mobMode.value === PageDesignModeEnum.PAD),
                  ]}
                  onClick={() => changeMobMode(PageDesignModeEnum.PAD)}
                >
                  <i class="gct-iconfont icon-icon_Pad_big" />
                </div>
              </div>
            ) : null}
          </div>
          <div
            class={[
              ns.e('body'),
              ns.is('opacity_hidden', !mobMode.value),
              ns.is('web', !isMobile.value),
              ns.is('pda', isMobile.value && mobMode.value === PageDesignModeEnum.PDA),
              ns.is('pad', isMobile.value && mobMode.value === PageDesignModeEnum.PAD),
            ]}
          >
            {isLoaded.value !== true ? <a-spin class={ns.e('spin')} /> : null}
            <div class={[ns.e('iframe-wrapper')]}>{iframe}</div>
          </div>
        </div>
      );
    };
  },
});

export default PagePreviewView;
