import { defineComponent, ref } from 'vue';
import { useNamespace } from '@gct/runtime';
import { DesignRenderViewPrefix } from '@gct/runtime-render';
import { usePathQueryStore } from '/@/store/modules/pathQuery';
import { useI18n } from 'vue-i18n';
import { IDesignData } from '@gct/base';
import { getPlatList } from '/@/apis/gct-platform/PlatformConfigController';
import { getBasicConfigDetail } from '/@/apis/gct-apaas/BasicConfigController';
import './preview-app.scss';

export const PreviewApp = defineComponent({
  name: 'PreviewApp',
  setup() {
    const ns = useNamespace('preview-app');

    const { t } = useI18n();

    window.$t = t;

    usePathQueryStore().initQuery();

    const themeColor = ref<string>();

    getPlatList().then((list) => {
      list.forEach((item) => {
        if (item.configEnum === 'THEME_CFG') {
          themeColor.value = JSON.parse(item.value).themeColor;
        }
      });
      getBasicConfigDetail({ configEnum: 'THEME_CFG' }).then((res) => {
        if (res) {
          themeColor.value = JSON.parse(res.value).themeColor;
        }
      });
    });

    const model = ref<IDesignData | null>(null);

    const title = ref<string>('');

    const win = window as any;
    win.setDesignModel = (data: any, titleTxt: string) => {
      model.value = data;
      title.value = titleTxt;
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        console.log(key);
      }
    };
    if (win.previewInit) {
      win.previewInit();
    }

    return { ns, model, title, themeColor };
  },
  render() {
    return (
      <mobile-container
        title={this.title}
        headerBgColor={this.model?.pageNode?.data.headerBgColor}
        class={this.ns.b()}
        style={{ '--ant-primary-color': this.themeColor }}
      >
        {this.model ? (
          <design-render preview prefix={DesignRenderViewPrefix.CUSTOM_HOME} model={this.model} />
        ) : null}
      </mobile-container>
    );
  },
});
