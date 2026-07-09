import { computed, defineComponent, PropType, ref } from 'vue';
import { IModal, useNamespace } from '@gct/runtime';
import { getMobileHomepageInfo } from '/@/apis/gct-apaas/MobileHomepageController';
import { IDesignData } from '@gct/base';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import './custom-app-home-preview-view.scss';

export const CustomAppHomePreviewView = defineComponent({
  name: 'CustomAppHomePreviewView',
  props: {
    modal: {
      type: Object as PropType<IModal>,
      required: true,
    },
    context: {
      type: Object as PropType<IContext>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('custom-app-home-preview-view');

    const iframeRef = ref<HTMLIFrameElement>();

    const queryStore = usePathQueryStore();

    const iframeUrl = computed(() => {
      if (process.env.NODE_ENV === 'development') {
        return `/src/projects/app-designer/${queryStore.getAid()}/preview.html`;
      }
      return `/app-designer-mobile-preview/${queryStore.getAid()}`;
    });

    const loaded = ref<boolean>(false);

    function setModel(model: IDesignData): void {
      if (iframeRef.value) {
        const win = iframeRef.value.contentWindow as any;
        if (win) {
          win.previewInit = () => {
            win.setDesignModel(model, gct.appInfo.name);
          };
        }
      }
    }

    async function load(): Promise<void> {
      const data = await getMobileHomepageInfo({ id: props.context.id })!;
      if (data && data.designerJson) {
        const json = JSON.parse(data.designerJson);
        setModel(json as IDesignData);
      }
      loaded.value = true;
    }

    load();

    function onClose(): void {
      props.modal.dismiss();
    }

    return { ns, loaded, iframeRef, iframeUrl, onClose };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.b('header')}>
          <a-row>
            <a-col span={8}>
              <div class={this.ns.be('header', 'close')} onClick={this.onClose}>
                <span>
                  <i class="iconfont icon-a-Leftarrow" />
                </span>
                <span>{window.$t('sys.appDesigner.customAppHome.preview.back')}</span>
              </div>
            </a-col>
            <a-col span={8}>
              <div class={this.ns.be('header', 'title')}>
                {window.$t('sys.appDesigner.customAppHome.preview.title')}
              </div>
            </a-col>
            <a-col span={8}>
              <div class={this.ns.be('header', 'action')}></div>
            </a-col>
          </a-row>
        </div>
        <div class={[this.ns.b('content'), this.ns.bm('content', 'mobile')]}>
          <iframe ref="iframeRef" class={this.ns.e('iframe')} src={this.iframeUrl} />
        </div>
      </div>
    );
  },
});
