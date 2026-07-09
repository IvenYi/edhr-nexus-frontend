import {
  EditorType,
  IEditForm,
  IFormCollapse,
  IFormItem,
  IFormTab,
  IFormTabPane,
  IRadioEditor,
} from '@gct/runtime';
import { DesignEditorType, DesignNodeMode, DesignNodeType, MaterialGroup } from '../../constant';
import { IMaterialData, INodeProvider, IStyleSpacing } from '../../interface';
import { DesignSelectComponentNode } from './design-select-component.data';
import { NodeBaseProvider } from '../../provider';

enum SwitchStyle {
  SIMPLE = 'simple',
  STANDARD = 'standard',
}

const SwitchStyleMap = {
  [SwitchStyle.SIMPLE]: '简易',
  [SwitchStyle.STANDARD]: '标准',
};

/**
 * 选择组件
 *
 * @author zhanghanrui
 * @date 2024-07-16 17:07:36
 * @export
 * @class DesignSelectComponentProvider
 * @extends {NodeBaseProvider<DesignSelectComponentNode>}
 * @implements {INodeProvider<DesignSelectComponentNode>}
 */
export class DesignSelectComponentProvider
  extends NodeBaseProvider<DesignSelectComponentNode>
  implements INodeProvider<DesignSelectComponentNode>
{
  mode = DesignNodeMode.CONTAINER;

  type: string = DesignNodeType.SELECT_COMPONENT;

  component = 'DesignSelectComponentComponent';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.SYSTEM,
    label: '选择组件',
    type: DesignNodeType.SELECT_COMPONENT,
    icon: 'icon-cangkuqiehuanmoren',
    order: 0,
  };

  model: IEditForm = {
    type: 'edit',
    children: [
      {
        type: 'tab',
        name: 'tab',
        isContainer: true,
        layout: 'flex',
        navPosition: 'center',
        height: '100%',
        children: [
          {
            name: 'pane1',
            type: 'tab-pane',
            isContainer: true,
            title: window.$t('sys.designView.form.attribute'),
            layout: 'grid',
            children: [
              {
                name: 'collapse-property',
                type: 'collapse',
                isContainer: true,
                layout: 'flex',
                children: [
                  {
                    name: 'collapse-pane-config',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.appDesigner.designView.components.select.form.group'),
                    children: [
                      {
                        type: 'item',
                        name: 'title',
                        label: window.$t('sys.appDesigner.designView.components.select.form.label'),
                        labelPosition: 'top',
                        noColon: true,
                        editor: {
                          type: EditorType.I18N,
                          max: 32,
                          props: {},
                        },
                      } as IFormItem,
                      {
                        type: 'item',
                        name: 'switchStyle',
                        label: window.$t(
                          'sys.appDesigner.designView.components.select.form.label2',
                        ),
                        labelPosition: 'top',
                        noColon: true,
                        defaultValue: SwitchStyle.STANDARD,
                        dictionary: {
                          tag: 'switchStyle',
                          mode: 'static',
                          items: Object.keys(SwitchStyleMap).map((key) => {
                            return { value: key, label: SwitchStyleMap[key] };
                          }),
                        },
                        editor: {
                          type: EditorType.RADIO,
                          buttonMode: true,
                          props: {
                            size: 'small',
                          },
                        } as IRadioEditor,
                      },
                      {
                        type: 'hidden',
                        name: 'modelKey',
                      },
                      {
                        type: 'item',
                        name: 'valueField',
                        label: window.$t(
                          'sys.appDesigner.designView.components.select.form.label3',
                        ),
                        labelPosition: 'top',
                        noColon: true,
                        editor: {
                          type: 'model-field-select',
                          props: {},
                        },
                        rules: [
                          {
                            required: true,
                            message: window.$t(
                              'sys.appDesigner.designView.components.select.form.errorMsg.label3',
                            ),
                          },
                        ],
                      } as IFormItem,
                    ],
                  },
                ],
              },
            ],
          },
          {
            name: 'pane2',
            type: 'tab-pane',
            class: 'style-pane',
            title: window.$t('sys.designView.form.style'),
            isContainer: true,
            layout: 'grid',
            children: [
              {
                name: 'collapse-style',
                type: 'collapse',
                isContainer: true,
                layout: 'flex',
                children: [
                  {
                    name: 'collapse-pane-layout',
                    type: 'collapse-pane',
                    isContainer: true,
                    layout: 'grid',
                    title: window.$t('sys.designView.form.layout'),
                    children: [
                      {
                        type: 'item',
                        label: window.$t('sys.designView.form.position'),
                        name: 'position',
                        noColon: true,
                        labelAlign: 'left',
                        labelWidth: '34px',
                        editor: {
                          type: DesignEditorType.STYLE_POSITION,
                        },
                      },
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
                        name: 'padding',
                      },
                      {
                        type: 'item',
                        name: 'margin',
                        fields: ['margin', 'padding'],
                        editor: {
                          type: DesignEditorType.STYLE_SPACING,
                        } as IStyleSpacing,
                      } as IFormItem,
                    ] as IFormItem[],
                  },
                ],
              } as IFormCollapse,
            ],
          },
        ] as IFormTabPane[],
      } as IFormTab,
    ],
    loadRequest(_params) {
      return Promise.resolve({});
    },
    newRequest(_data) {
      return Promise.resolve({});
    },
    updateRequest(_params, _data) {
      return Promise.resolve({});
    },
  };

  create(data?: DesignSelectComponentNode): DesignSelectComponentNode {
    return new DesignSelectComponentNode(data as unknown as DesignSelectComponentNode);
  }
}
