import { EditorType, IEditForm, IFormCollapse, IFormItem } from '@gct/runtime';
import {
  DesignEditorType,
  DesignNodeMode,
  DesignNodeType,
  DesignViewPrefix,
  MaterialGroup,
} from '../../constant';
import { IMaterialData, INodeProvider, IStyleSpacing } from '../../interface';
import { NodeBaseProvider } from '../../provider';
import { DesignPageNode } from './design-page.data';

/**
 *
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:32
 * @export
 * @class DesignPageProvider
 * @extends {NodeBaseProvider<DesignPageNode>}
 * @implements {INodeProvider<DesignPageNode>}
 */
export class DesignPageProvider
  extends NodeBaseProvider<DesignPageNode>
  implements INodeProvider<DesignPageNode>
{
  mode = DesignNodeMode.PAGE;

  type: string = DesignNodeType.PAGE;

  component = '';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.LAYOUT,
    label: '',
    type: DesignNodeType.PAGE,
    icon: 'icon-a-gudingbiaosvg',
    order: 0,
  };

  model: IEditForm = {
    type: 'edit',
    children: [
      {
        type: 'container',
        name: 'group',
        layout: 'grid',
        children: [
          {
            name: 'collapse-style',
            type: 'collapse',
            isContainer: true,
            layout: 'flex',
            children: [
              {
                name: 'collapse-pane-title-config',
                type: 'collapse-pane',
                isContainer: true,
                layout: 'grid',
                title: window.$t('sys.designView.form.titleConfig'),
                children: [
                  {
                    type: 'item',
                    label: window.$t('sys.designView.form.titleBgColor'),
                    name: 'headerBgColor',
                    noColon: true,
                    labelAlign: 'left',
                    editor: {
                      label: window.$t('sys.designView.form.codeInfo'),
                      type: EditorType.CHECK_SWITCH,
                    },
                  } as IFormItem,
                ] as IFormItem[],
                hidden(form) {
                  return form.context.designType === DesignViewPrefix.CUSTOM_EXP_VIEW;
                },
              },
              {
                name: 'collapse-pane-bg',
                type: 'collapse-pane',
                isContainer: true,
                layout: 'grid',
                title: window.$t('sys.designView.form.background'),
                children: [
                  {
                    type: 'item',
                    label: window.$t('sys.designView.form.backgroundColor'),
                    name: 'background',
                    noColon: true,
                    labelAlign: 'left',
                    labelWidth: '56px',
                    editor: {
                      type: EditorType.COLOR,
                    },
                  } as IFormItem,
                ] as IFormItem[],
              },
              {
                name: 'collapse-pane-spacing',
                type: 'collapse-pane',
                isContainer: true,
                layout: 'grid',
                title: window.$t('sys.designView.form.margin'),
                children: [
                  {
                    type: 'hidden',
                    name: 'margin',
                  },
                  {
                    type: 'item',
                    name: 'padding',
                    fields: ['margin', 'padding'],
                    editor: {
                      type: DesignEditorType.STYLE_SPACING,
                      showArea: ['padding'],
                    } as IStyleSpacing,
                  } as IFormItem,
                ] as IFormItem[],
              },
            ],
          } as IFormCollapse,
        ],
      },
    ],
  };

  create(data?: DesignPageNode): DesignPageNode {
    return new DesignPageNode(data as unknown as DesignPageNode);
  }
}
