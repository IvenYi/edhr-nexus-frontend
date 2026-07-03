import { DisplayEnums, IDesignerProvider, LowCodeWidget, Platform, PropGroup } from '@gct/runtime';
import { BaseButton } from '/@page-designer/types/web';
import { baseBtnProp } from '/@page-designer/schema/common-config/base-button-config';
import { useDesigner } from '/@page-designer/hooks/useDesigner';
import { displayEditor } from '/@page-designer/schema/common-config/display-editor-config';
import { buttonEditor } from '/@page-designer/schema/common-config/button-editor-config';
import { permissionEditor } from '/@page-designer/schema/common-config/permission-editor-config';
import { Component, defineAsyncComponent } from 'vue';
import { KitType } from '../../enums';

interface ITestButton extends BaseButton {
  isFirst: boolean;
}

export class PluginConfig implements IDesignerProvider {
  kit: string[] = ['MEDPROOLD'];

  component: Component = defineAsyncComponent(() => import('./test-button.designer'));

  schema: ITestButton = {
    id: '',
    platform: Platform.WEB,
    name: 'sys.pageDesigner.testButton',
    alias: '',
    type: KitType.TEST_BUTTON,
    display: DisplayEnums.INLINE_BLOCK,
    displayName: '测试按钮',
    icon: 'icon-a-yinyongshuju2',
    props: {
      ...baseBtnProp,
    },
    style: {},
    events: {},
    isFirst: false,
    formItem: false,
  };

  propEditors: LowCodeWidget.PropEditor[] = [
    {
      component: 'text-editor',
      name: 'title',
      label: 'sys.pageDesigner.title',
      group: PropGroup.BUTTON,
      _config: {
        i18n: true,
        maxlength: 10,
        showCount: true,
      },
    },
    {
      component: 'ref-form-editor',
      name: 'refForm',
      label: 'sys.pageDesigner.refForm',
      group: PropGroup.BUTTON,
      required: true,
      onMounted(widget: BaseButton) {
        if (!widget.props.refForm) return;
        const { excludeSubTableFormWidget } = useDesigner();
        const formWidget = excludeSubTableFormWidget.value.find(
          (item) => item.id === widget.props.refForm,
        );
        if (!formWidget) {
          widget.props.refForm = undefined;
        }
      },
    },
    {
      component: 'select-editor',
      name: 'refList',
      label: 'sys.pageDesigner.refList',
      group: PropGroup.BUTTON,
      _config: {
        options: () => {
          const { allListWidget } = useDesigner();
          return allListWidget.value.map((i) => {
            return { label: `【${i.id}】`, value: i.id };
          });
        },
      },
      hidden(widget: BaseButton) {
        return !widget.props.refForm;
      },
    },
    ...(displayEditor as any),
    ...(buttonEditor as any),
    ...(permissionEditor as any),
  ];
}
