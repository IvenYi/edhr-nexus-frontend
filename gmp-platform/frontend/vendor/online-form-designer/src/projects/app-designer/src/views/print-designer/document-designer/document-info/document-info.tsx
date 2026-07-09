import { defineComponent, PropType } from 'vue';
import { IForm, IFormHiddenItem, IFormItem, ISpanEditor, useNamespace } from '@gct/runtime';
import { getDocumentInfo } from '/@/apis/gct-apaas/DocumentController';
import { useI18n } from 'vue-i18n';
import { pagerSizeMap } from '../constants';
import './document-info.scss';

export const DocumentInfo = defineComponent({
  name: 'DocumentInfo',
  props: {
    context: {
      type: Object as PropType<{ id: string }>,
      required: true,
    },
  },
  setup() {
    const { t } = useI18n();

    const ns = useNamespace('document-info');

    // 表单呈现数据项映射，有顺序要求
    const map = {
      name: t('sys.appDesigner.printDesign.form.name'),
      key: t('sys.appDesigner.printDesign.form.key'),
      modelKey: t('sys.appDesigner.printDesign.form.modelKey'),
      paperSize: t('sys.appDesigner.printDesign.form.paperSize'),
      height: 'hidden',
      width: 'hidden',
      description: t('sys.appDesigner.printDesign.form.desc'),
      createUserName: t('sys.appDesigner.printDesign.form.createUserName'),
      createTime: t('sys.appDesigner.printDesign.form.createTime'),
      modifyUserName: t('sys.appDesigner.printDesign.form.modifyUserName'),
      modifyTime: t('sys.appDesigner.printDesign.form.modifyTime'),
    };
    const keys = Object.keys(map);
    const model: IForm = {
      type: 'edit',
      layout: 'vertical',
      info: true,
      children: [
        {
          name: 'group',
          type: 'container',
          layout: 'grid',
          children: keys.map((key) => {
            const val = map[key];
            // 隐藏项特殊拦截生成
            if (val === 'hidden') {
              return {
                name: key,
                type: 'hidden',
              } as IFormHiddenItem;
            }
            // 生成默认项
            const config: IFormItem = {
              name: key,
              type: 'item',
              label: `${val} :`,
              gridItem: { span: 24 },
              editor: {
                type: 'span',
                readonly: true,
              },
            };
            // 单据KEY支持复制
            if (key === 'key') {
              (config.editor as ISpanEditor).copy = true;
            }
            // 纸张大小呈现格式化
            if (key === 'paperSize') {
              config.editor.format = (data, _model, c) => {
                return `${pagerSizeMap[c.value]}(${data.width}mm x ${data.height}mm)`;
              };
            }
            return config;
          }),
        },
      ],
      loadRequest: (params: { id: string }): Promise<IData> => {
        return getDocumentInfo(params) as Promise<IData>;
      },
    };

    return { ns, model };
  },
  render() {
    return (
      <view-container class={this.ns.b()}>
        {{
          header: () => <gct-view-header title="基础信息" />,
          default: () => <gct-edit-form context={this.context} model={this.model} />,
        }}
      </view-container>
    );
  },
});
