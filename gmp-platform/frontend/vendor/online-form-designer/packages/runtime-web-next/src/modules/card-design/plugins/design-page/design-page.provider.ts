import {
  EditorType,
  IEditForm,
  IFormEditItemController,
  IInfoEditor,
  INumberEditor,
  IRadioEditor,
  ISelectEditor,
  Namespace,
  t,
} from '@gct/runtime';
import { DesignPageNode } from './design-page.data';
import {
  DesignEditorType,
  DesignNodeMode,
  DesignNodeType,
  IMaterialData,
  INodeProvider,
  IStyleSpacing,
  MaterialGroup,
  NodeBaseProvider,
} from '@gct/runtime-design';
import {
  GctFormCollapseModel,
  GctFormCollapsePaneModel,
  GctFormHiddenItemModel,
  GctFormItemModel,
  GctFormLineModel,
  GctFormTabModel,
  GctFormTabPaneModel,
} from '@gct/runtime-web';
import { CARD_LABEL_WIDTH_MODE, CARD_LABEL_WRAP_MODE, CARD_LAYOUT_MODE } from '../../enum';

const ns = new Namespace('design-page');

/**
 * 栅格容器
 *
 * @export
 * @class DesignPageProvider
 * @extends {NodeBaseProvider<DesignPageNode>}
 * @implements {INodeProvider<DesignPageNode>}
 */
export class DesignPageProvider
  extends NodeBaseProvider<DesignPageNode>
  implements INodeProvider<DesignPageNode>
{
  mode = DesignNodeMode.PAGE_LOWER;

  type: string = DesignNodeType.PAGE_LOWER;

  component = 'SimpleCardDesign';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.LAYOUT,
    label: '',
    type: DesignNodeType.PAGE_LOWER,
    icon: 'icon-a-gudingbiaosvg',
    order: 0,
  };

  model: IEditForm = {
    type: 'edit',
    labelWidth: '50px',
    size: 'small',
    noColon: true,
    hiddenError: true,
    children: [
      new GctFormTabModel('tab', {}, [
        new GctFormTabPaneModel('tab_pane', t('sys.cardDesign.cfg_form.attr'), {}, [
          new GctFormCollapseModel('collapse', {}, [
            new GctFormCollapsePaneModel(
              'collapse_pane',
              t('sys.cardDesign.cfg_form.base_props'),
              {},
              [
                new GctFormHiddenItemModel('modelKey'),
                new GctFormItemModel(
                  'size_mode_info',
                  t('sys.cardDesign.cfg_form.size_mode'),
                  {
                    labelTooltip: '宽度：只对 Web 端生效，Mobile 宽度默认根据页面尺寸自适应。',
                    style: {},
                  },
                  {
                    type: EditorType.INFO,
                  } as IInfoEditor,
                ),
                new GctFormItemModel(
                  'width',
                  t('sys.cardDesign.cfg_form.width_text'),
                  {
                    labelWidth: '32px',
                    editorAlign: 'right',
                    defaultValue: 480,
                    class: ns.e('card_width'),
                    style: { 'margin-bottom': '16px' },
                  },
                  {
                    type: EditorType.NUMBER,
                    addonAfter: 'px',
                    min: 240,
                    max: 720,
                    style: { width: '100%' },
                  } as INumberEditor,
                ),
                // new GctFormLineModel('line1', { paddingBottom: '16px', paddingTop: '8px' }),
                new GctFormItemModel(
                  'border_radius',
                  t('sys.cardDesign.cfg_form.border_radius'),
                  {
                    labelWidth: '32px',
                    class: ns.b('border-radius'),
                    defaultValue: 4,
                    dictionary: {
                      tag: 'border_radius',
                      mode: 'static',
                      items: [0, 2, 4, 8, 16, 24].map((item) => {
                        return { label: item.toString(), value: item };
                      }),
                    },
                  },
                  {
                    type: EditorType.SELECT,
                    placeholder: t('sys.chooseText'),
                    style: { width: '100%' },
                    props: { suffixIcon: 'px', allowClear: false },
                  },
                ),
              ],
            ),
            new GctFormCollapsePaneModel(
              'collapse_pane1',
              t('sys.cardDesign.cfg_form.fields'),
              {},
              [
                new GctFormItemModel(
                  'fields',
                  '',
                  {},
                  { type: EditorType.FORM_MODEL_FIELD_SELECT },
                ),
              ],
            ),
            new GctFormCollapsePaneModel(
              'collapse_pane2',
              t('sys.cardDesign.cfg_form.layout_mode'),
              {},
              [
                new GctFormItemModel(
                  'layout_mode_info',
                  '',
                  {
                    editorAlign: 'right',
                    class: ns.b('layout_mode_info'),
                    style: { 'margin-bottom': '8px' },
                  },
                  {
                    type: EditorType.INFO,
                    content: t('sys.cardDesign.cfg_form.layout_mode_info'),
                  } as IInfoEditor,
                ),
                new GctFormItemModel(
                  'layout_mode',
                  '',
                  {
                    class: ns.b('layout-mode'),
                    defaultValue: CARD_LAYOUT_MODE.HORIZONTAL,
                    style: { 'margin-bottom': '0' },
                    dictionary: {
                      tag: 'layout_mode',
                      mode: 'static',
                      items: [
                        {
                          label: t('sys.cardDesign.cfg_form.vertical'),
                          value: CARD_LAYOUT_MODE.VERTICAL,
                          icon: '/assets/card-design/pic_chuizhi_rest.svg',
                        },
                        {
                          label: t('sys.cardDesign.cfg_form.horizontal'),
                          value: CARD_LAYOUT_MODE.HORIZONTAL,
                          icon: '/assets/card-design/pic_shuiping_rest.svg',
                        },
                      ],
                    },
                    change(form, _item) {
                      // 关闭自定义标签宽度
                      (form.item.custom_label_width as IFormEditItemController).editorValue = false;
                    },
                  },
                  {
                    type: EditorType.RADIO,
                    icon: { pos: 'top', width: '104px', height: '52px' },
                  } as IRadioEditor,
                ),
                new GctFormLineModel('line2', {
                  paddingTop: '16px',
                  paddingBottom: '11px',
                  hidden(form, item, data) {
                    return data.layout_mode === CARD_LAYOUT_MODE.VERTICAL;
                  },
                }),
                new GctFormItemModel(
                  'custom_label_width',
                  t('sys.cardDesign.cfg_form.custom_label_width'),
                  {
                    labelWidth: '180px',
                    hidden(form, item, data) {
                      return data.layout_mode === CARD_LAYOUT_MODE.VERTICAL;
                    },
                  },
                  { type: EditorType.SWITCH },
                ),
                new GctFormHiddenItemModel('label_mode', {
                  defaultValue: CARD_LABEL_WIDTH_MODE.PERCENT,
                }),
                new GctFormItemModel(
                  'label_width',
                  t('sys.cardDesign.cfg_form.label_width'),
                  {
                    class: ns.e('label-width'),
                    labelWidth: '180px',
                    labelPosition: 'top',
                    defaultValue: 30,
                    style: { 'margin-bottom': '0' },
                    hidden(form, item, data) {
                      return data.custom_label_width !== true;
                    },
                  },
                  { type: EditorType.PIXEL_CONFIG },
                ),
                new GctFormItemModel(
                  'wrap_mode',
                  '',
                  {
                    class: ns.e('label-wrap-mode'),
                    labelWidth: '180px',
                    defaultValue: CARD_LABEL_WRAP_MODE.WRAP,
                    style: { 'margin-bottom': '0' },
                    dictionary: {
                      tag: 'wrap_mode',
                      mode: 'static',
                      items: [
                        { label: '...', value: CARD_LABEL_WRAP_MODE.DOT },
                        { label: '换行', value: CARD_LABEL_WRAP_MODE.WRAP },
                      ],
                    },
                    hidden(form, item, data) {
                      return data.custom_label_width !== true;
                    },
                  },
                  {
                    type: EditorType.SELECT,
                    beforeText: '超出宽度后',
                    afterText: '显示',
                    props: {
                      allowClear: false,
                    },
                  } as ISelectEditor,
                ),
                new GctFormLineModel('line3', { paddingBottom: '16px' }),
                new GctFormItemModel(
                  'colspan',
                  t('sys.cardDesign.cfg_form.col_size'),
                  {
                    labelPosition: 'top',
                    labelTooltip: '表单中列的数量：只对 Web 端生效，Mobile 默认为单列展示。',
                    labelTipWidth: '216px',
                    defaultValue: 24,
                    dictionary: {
                      tag: 'colspan',
                      mode: 'static',
                      items: [
                        { label: '单列', value: 24 },
                        { label: '双列', value: 12 },
                        { label: '三列', value: 8 },
                        { label: '四列', value: 6 },
                      ],
                    },
                  },
                  {
                    type: EditorType.SELECT,
                    placeholder: t('sys.chooseText'),
                    props: { allowClear: false },
                  },
                ),
              ],
            ),
          ]),
        ]),
        new GctFormTabPaneModel('tab_pane1', t('sys.cardDesign.cfg_form.style'), {}, [
          new GctFormCollapseModel('collapse1', {}, [
            new GctFormCollapsePaneModel(
              'collapse_pane3',
              t('sys.cardDesign.cfg_form.background'),
              {},
              [
                new GctFormItemModel(
                  'background',
                  t('sys.cardDesign.cfg_form.bg_color'),
                  {
                    class: ns.b('bg-color'),
                    labelWidth: '100px',
                    editorAlign: 'right',
                  },
                  { type: EditorType.COLOR },
                ),
              ],
            ),
            new GctFormCollapsePaneModel(
              'collapse_pane4',
              t('sys.cardDesign.cfg_form.margin'),
              {},
              [
                new GctFormItemModel(
                  'spacing',
                  '',
                  {
                    class: ns.b('spacing'),
                    labelWidth: '100px',
                  },
                  { type: DesignEditorType.STYLE_SPACING, showArea: ['padding'] } as IStyleSpacing,
                ),
              ],
            ),
          ]),
        ]),
      ]),
    ],
  };

  create(data?: DesignPageNode): DesignPageNode {
    return new DesignPageNode(data as unknown as DesignPageNode);
  }
}
