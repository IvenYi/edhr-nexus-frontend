import { computed, defineComponent, onMounted, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IFrameContainer } from '@gct/runtime-web';
import { IModal, IPageDesignIFrameProps } from '@gct/runtime';
import { genUrl } from '/@/utils';
import { useBranch } from '/@/hooks/develop/useBranch';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { PageTypeEnum } from '/@/layouts/tree-sider-page-new/enum';
import { newKeyTag } from '/@/projects/page-designer/src/hooks/usePage';
// import { devMode, getEnv } from '/@/utils/env';
import { message } from 'ant-design-vue';
import { PageDesignViewRouteParams } from './page-design-view.interface';
import PagePreviewView from './page-preview-view';
import './page-design-view.scss';

export const PageDesignView = defineComponent({
  name: 'PageDesignView',
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
    const ns = useNamespace('page-design-view');
    const usePathQuery = usePathQueryStore();
    const { branchId } = useBranch();
    const params = props.params as PageDesignViewRouteParams;
    const viewKey = ref<string>(params.id || newKeyTag);
    const viewType = params.mode;

    const pid = viewKey.value;
    const url = computed(() => {
      import.meta.env.DEV;
      const origin = location.origin;
      // if (getEnv() === devMode) {
      //   if (origin.indexOf('//localhost') > -1) {
      //     origin = origin.replace('//localhost', '//127.0.0.1');
      //   } else if (origin.indexOf('//127.0.0.1') > -1) {
      //     origin = origin.replace('//127.0.0.1', '//localhost');
      //   }
      // }
      const url = genUrl(
        `${origin}${import.meta.env.VITE_PATHNAME_PAGE_DESIGNER}&platform=${
          viewType === PageTypeEnum.WEB
            ? 'web'
            : viewType === PageTypeEnum.MOBILE
              ? 'mobile'
              : 'pad'
        }&category=${params.category || ''}`,
        {
          aid: usePathQuery.getAid(),
          pid: pid,
          bid: branchId.value,
        },
      );
      return url;
    });

    async function openPreview(): Promise<void> {
      // 打开前给 url 添加参数，标识为已经打开预览界面，提供刷新时的打开标识
      const route = window._vue_router_instance.currentRoute.value;
      const query = route.query;
      window._vue_router_instance.replace({
        query: { id: query.id, mode: query.mode, preview: 'true' },
        path: route.path,
      });
      await gct.openUtil.fullScreen(PagePreviewView, { params: props.params });
      // 关闭后删除预览标识
      window._vue_router_instance.replace({
        query: { id: query.id, mode: query.mode },
        path: route.path,
      });
    }

    const iframeProps = computed<IPageDesignIFrameProps>(() => {
      return {
        params: {
          category: params.category,
        },
        fn: {
          close() {
            props.modal?.dismiss({ ok: true, data: [{ id: viewKey.value }] });
          },
          openPreview,
          replaceUrl(_replaceId: string, id: string) {
            viewKey.value = id;
            params.id = id;
            window._vue_router_instance.replace({
              query: { id, mode: params.mode },
              path: window._vue_router_instance.currentRoute.value.path,
            });
          },
          success(msg: string) {
            message.success(msg);
          },
        },
      };
    });

    onMounted(() => {
      // 如果是刷新打开，并且有预览标识，直接打开预览界面
      if (window._vue_router_instance.currentRoute.value.query.preview === 'true') {
        openPreview();
      }
    });

    return () => {
      return (
        <div class={ns.b()}>
          <IFrameContainer
            iframeName="page-design"
            iframeProps={{
              url: url.value,
              props: iframeProps.value.params,
              fn: iframeProps.value.fn,
            }}
          />
        </div>
      );
    };
  },
});

export default PageDesignView;
