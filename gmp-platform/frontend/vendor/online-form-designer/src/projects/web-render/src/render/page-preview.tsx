import { computed, defineComponent, ref } from 'vue';
import { useNamespace, PluginPgkUtil } from '@gct-paas/core';
import { useRoute } from 'vue-router';
import PageRender from './page-render.vue';
import { RuntimePageJson } from '/@page-designer/types/designer';
import Globals from './Event/utils/runGlobalByPage';
import PreviewEmpty from '/@/components/Preview/src/preview-empty.vue';
import './page-preview.scss';

export const PagePreview = defineComponent({
  name: 'PagePreview',
  setup() {
    const ns = useNamespace('web-render-page-preview');

    const route = useRoute();
    const pageData = ref<RuntimePageJson>();
    const getPreviewAPi =
      route.name === 'PagePreview'
        ? Globals.initPageByid.bind(Globals)
        : Globals.initHistoryByid.bind(Globals);

    const notHeader = computed(() => {
      return route.query.header == 'false';
    });

    const pageName = ref<string>('');

    const hasPageData = computed(() => !!pageData.value && pageData.value.widgets.length);

    async function getRunPages() {
      const linkPage = route.params.linkPage as string;
      if (linkPage) {
        const { res, data, name } = await getPreviewAPi(linkPage);
        await PluginPgkUtil.loadWebPlugin(data.plugins);
        pageData.value = data;
        document.title = name!;
        pageName.value = name!;
        window.parent.postMessage(
          JSON.stringify({
            cmd: 'previewPageData',
            data: res,
          }),
          '*',
        );
      }
    }

    getRunPages();

    return () => {
      const content = hasPageData.value ? (
        <PageRender
          widgetlist={pageData.value.widgets}
          css={pageData.value.css}
          js={pageData.value.runJs}
          pageEvents={pageData.value.pageEvents}
          pageStyle={pageData.value.pageStyle}
          globalEvents={pageData.value.globalEvents}
          pageLayoutMode={pageData.value!.pageLayoutMode}
        />
      ) : (
        <PreviewEmpty />
      );
      if (notHeader.value) {
        return (
          <div class={[ns.b(), 'is-no-header', hasPageData.value ? undefined : 'is-empty-page']}>
            {content}
          </div>
        );
      }
      return (
        <div class={[ns.b(), hasPageData.value ? undefined : 'is-empty-page']}>
          <div class={ns.e('header')}>
            <span class={ns.e('title')}>{pageName.value}</span>
          </div>
          <div class={ns.e('content')}>{content}</div>
        </div>
      );
    };
  },
});

export default PagePreview;
