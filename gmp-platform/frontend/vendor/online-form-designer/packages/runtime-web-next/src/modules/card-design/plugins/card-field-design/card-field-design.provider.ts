import {
  BindCmpStyleEnum,
  bindCmpStyleMap,
  BindCmpStyleTypeEnum,
  Ch_BindCmpStyleEnum,
  CURRENCY_ENUM,
  CURRENCY_LANG_ENUM,
  EditorType,
  FIELD_TYPE,
  ICheckSwitchEditor,
  IEditForm,
  II18nEditor,
  SYSTEM_FIELD_KEY,
  t,
  TIMETYPE_ENUM,
  TIMETYPE_LANG_ENUM,
} from '@gct/runtime';
import { CardFieldDesignNode } from './card-field-design.data';
import {
  DesignEditorType,
  DesignNodeMode,
  DesignNodeType,
  IMaterialData,
  INodeProvider,
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

function isSys(key: string) {
  // 预置系统字段：创建人、创建时间、修改人、修改时间、创建部门、修改部门。根据 key 判断，key 根据类型唯一
  switch (key) {
    case SYSTEM_FIELD_KEY.CREATE_AT:
    case SYSTEM_FIELD_KEY.CREATE_BY:
    case SYSTEM_FIELD_KEY.CREATE_DEPT:
    case SYSTEM_FIELD_KEY.UPDATE_AT:
    case SYSTEM_FIELD_KEY.UPDATE_BY:
    case SYSTEM_FIELD_KEY.UPDATE_DEPT:
      return true;
    default:
      return false;
  }
}

/**
 * 栅格容器
 *
 * @export
 * @class CardFieldDesignProvider
 * @extends {NodeBaseProvider<CardFieldDesignNode>}
 * @implements {INodeProvider<CardFieldDesignNode>}
 */
export class CardFieldDesignProvider
  extends NodeBaseProvider<CardFieldDesignNode>
  implements INodeProvider<CardFieldDesignNode>
{
  mode = DesignNodeMode.ITEM;

  type: string = DesignNodeType.FIELD;

  component = 'CardFieldDesign';

  static materialConfig: IMaterialData = {
    group: MaterialGroup.LAYOUT,
    label: '',
    type: DesignNodeType.FIELD,
    icon: 'icon-a-gudingbiaosvg',
    order: 0,
  };

  model = (_, node): IEditForm => {
    if (!node || !node.data) {
      return { type: 'edit', size: 'small', noColon: true, hiddenError: true, children: [] };
    }
    let fieldType = node.data.type || '';
    const mappingType = node.data.mapping_type || '';
    if (isSys(node.data.key)) {
      fieldType = mappingType;
    }

    let formatCfg: GctFormItemModel | null = null;
    if (fieldType === FIELD_TYPE.DATE_TIME || mappingType === FIELD_TYPE.DATE_TIME) {
      formatCfg = new GctFormItemModel(
        'date_time_format',
        t('sys.cardDesign.cfg_form.date_time_format'),
        {
          labelPosition: 'top',
          field: 'format',
          defaultValue: 'YYYY-MM-DD HH:mm:ss',
          hidden(form, item, data) {
            let type = data.type;
            if (isSys(data.key)) {
              type = data.mapping_type;
            }
            // 日期时间、汇总（返回值：日期时间）
            switch (type) {
              case FIELD_TYPE.DATE_TIME:
                return false;
              case FIELD_TYPE.AGG:
                return data.mapping_type !== FIELD_TYPE.DATE_TIME;
              default:
                return true;
            }
          },
        },
        {
          type: EditorType.DATE_FORMAT_SELECT,
        },
      );
    } else if (fieldType === FIELD_TYPE.DATE || mappingType === FIELD_TYPE.DATE) {
      formatCfg = new GctFormItemModel(
        'date_format',
        t('sys.cardDesign.cfg_form.date_type_format'),
        {
          field: 'format',
          labelPosition: 'top',
          defaultValue: 'YYYY-MM-DD',
          hidden(form, item, data) {
            let type = data.type;
            if (isSys(data.key)) {
              type = data.mapping_type;
            }
            // 日期、汇总（返回值：日期）
            switch (type) {
              case FIELD_TYPE.DATE:
                return false;
              case FIELD_TYPE.AGG:
                return data.mapping_type !== FIELD_TYPE.DATE;
              default:
                return true;
            }
          },
        },
        {
          type: EditorType.DATE_FORMAT_SELECT,
        },
      );
    } else if (fieldType === FIELD_TYPE.TIME || mappingType === FIELD_TYPE.TIME) {
      formatCfg = new GctFormItemModel(
        'time_format',
        t('sys.cardDesign.cfg_form.time_type'),
        {
          field: 'format',
          labelPosition: 'top',
          defaultValue: 'HH:mm:ss',
          hidden(form, item, data) {
            let type = data.type;
            if (isSys(data.key)) {
              type = data.mapping_type;
            }
            // 时间、汇总（返回值：时间）
            switch (type) {
              case FIELD_TYPE.TIME:
                return false;
              case FIELD_TYPE.AGG:
                return data.mapping_type !== FIELD_TYPE.TIME;
              default:
                return true;
            }
          },
          dictionary: {
            tag: 'time_format',
            mode: 'static',
            items: [
              { label: 'HH', value: 'HH' },
              { label: 'HH:mm', value: 'HH:mm' },
              { label: 'HH:mm:ss', value: 'HH:mm:ss' },
            ],
          },
        },
        {
          type: EditorType.SELECT,
        },
      );
    }
    const editorTypeConfigs: GctFormItemModel[] = [];
    let items: string[] = [];
    // 根据字段类型，生成编辑器类型配置
    switch (fieldType) {
      case FIELD_TYPE.INTEGER:
      case FIELD_TYPE.LONG:
      case FIELD_TYPE.DOUBLE:
      case FIELD_TYPE.DECIMAL:
      case FIELD_TYPE.EXPRESSION:
      case FIELD_TYPE.AGG:
        const type =
          fieldType === FIELD_TYPE.EXPRESSION || fieldType === FIELD_TYPE.AGG
            ? mappingType
            : fieldType;
        if (type === FIELD_TYPE.INTEGER || type === FIELD_TYPE.LONG) {
          items = bindCmpStyleMap[BindCmpStyleTypeEnum.BindNum];
        } else {
          items = bindCmpStyleMap[BindCmpStyleTypeEnum.BindDecimal];
        }
        editorTypeConfigs.push(
          new GctFormItemModel(
            'editor_type',
            t('sys.cardDesign.cfg_form.component_type'),
            {
              labelPosition: 'top',
              defaultValue: BindCmpStyleEnum.CMP_NUMBER,
              hidden(form, item, data) {
                if (isSys(data.key)) {
                  return false;
                }
                // 整数、长整数、小数、精度小数，公式（返回值：整数、长整数、精度小数）、汇总（返回值：整数、长整数、精度小数）
                switch (data.type) {
                  case FIELD_TYPE.INTEGER:
                  case FIELD_TYPE.LONG:
                  case FIELD_TYPE.DOUBLE:
                  case FIELD_TYPE.DECIMAL:
                    return false;
                  case FIELD_TYPE.EXPRESSION:
                  case FIELD_TYPE.AGG:
                    switch (data.mapping_type) {
                      case FIELD_TYPE.INTEGER:
                      case FIELD_TYPE.LONG:
                      case FIELD_TYPE.DECIMAL:
                        return false;
                      default:
                        return true;
                    }
                  default:
                    return true;
                }
              },
              dictionary: {
                tag: 'editor_type',
                mode: 'static',
                items: items.map((val) => {
                  return {
                    label: t(Ch_BindCmpStyleEnum[val]),
                    value: val,
                  };
                }),
              },
            },
            {
              type: EditorType.SELECT,
              placeholder: t('sys.chooseText'),
              props: {
                allowClear: false,
              },
            },
          ),
        );
        // 币种配置
        editorTypeConfigs.push(
          new GctFormItemModel(
            'currency',
            '',
            {
              defaultValue: CURRENCY_ENUM['￥'],
              hidden(form, item, data) {
                return data.editor_type !== BindCmpStyleEnum.CMP_CURRENCY;
              },
              dictionary: {
                tag: 'bindCmpStyleType',
                mode: 'static',
                items: Object.keys(CURRENCY_ENUM).map((key) => {
                  return {
                    label: t('sys.pageDesigner.' + CURRENCY_LANG_ENUM[key]),
                    value: CURRENCY_ENUM[key],
                  };
                }),
              },
            },
            {
              type: EditorType.SELECT,
              placeholder: t('sys.chooseText'),
              props: {
                allowClear: false,
              },
            },
          ),
        );
        // 时间类型
        editorTypeConfigs.push(
          new GctFormItemModel(
            'time_type',
            t('sys.pageDesigner.timeType'),
            {
              labelPosition: 'top',
              defaultValue: TIMETYPE_ENUM['d:h:m:s'],
              hidden(form, item, data) {
                return data.editor_type !== BindCmpStyleEnum.CMP_TIME;
              },
              dictionary: {
                tag: 'bindCmpStyleType',
                mode: 'static',
                items: Object.keys(TIMETYPE_ENUM).map((key) => {
                  return {
                    label: t('sys.component.time.' + TIMETYPE_LANG_ENUM[key]),
                    value: TIMETYPE_ENUM[key],
                  };
                }),
              },
            },
            {
              type: EditorType.SELECT,
              placeholder: t('sys.chooseText'),
              props: {
                allowClear: false,
              },
            },
          ),
        );
        break;
      default:
    }

    return {
      type: 'edit',
      size: 'small',
      noColon: true,
      hiddenError: true,
      children: [
        new GctFormTabModel('tab', {}, [
          new GctFormTabPaneModel('tab_pane', t('sys.cardDesign.cfg_form.attr'), {}, [
            new GctFormHiddenItemModel('id'),
            new GctFormCollapseModel('collapse', {}, [
              new GctFormCollapsePaneModel(
                'collapse_pane',
                t('sys.cardDesign.cfg_form.base_props'),
                {},
                [
                  new GctFormHiddenItemModel('key'),
                  new GctFormHiddenItemModel('type'),
                  new GctFormHiddenItemModel('mapping_type'),
                  new GctFormItemModel(
                    'field_info',
                    '',
                    { style: { 'margin-bottom': '0' } },
                    { type: EditorType.FIELD_INFO },
                  ),
                  new GctFormLineModel('line_3', { paddingTop: '16px', paddingBottom: '16px' }),
                  new GctFormItemModel(
                    'show_label',
                    t('sys.cardDesign.cfg_form.field_name'),
                    { style: { 'margin-bottom': '0' } },
                    {
                      type: EditorType.CHECK_SWITCH,
                      label: t('sys.cardDesign.cfg_form.show_title'),
                    } as ICheckSwitchEditor,
                  ),
                  new GctFormHiddenItemModel('i18nConfig'),
                  new GctFormItemModel(
                    'label',
                    '',
                    {
                      style: {
                        marginTop: '3px',
                      },
                    },
                    {
                      type: EditorType.I18N,
                      fieldKey: 'key',
                    } as II18nEditor,
                  ),
                ],
              ),
              new GctFormCollapsePaneModel(
                'collapse_pane2',
                t('sys.cardDesign.cfg_form.field_cfg'),
                {
                  hidden(_form, _item, data) {
                    let type = data.type;
                    if (isSys(data.key)) {
                      type = data.mapping_type;
                    }
                    // 日期时间、时间、日期、小数、整数、长整数、精度小数、公式（返回值：日期时间、时间、日期、精度小数、整数、长整数）、汇总（返回值：日期时间、时间、日期、精度小数、整数、长整数）
                    switch (type) {
                      case FIELD_TYPE.DOUBLE:
                      case FIELD_TYPE.INTEGER:
                      case FIELD_TYPE.LONG:
                      case FIELD_TYPE.DECIMAL:
                      case FIELD_TYPE.DATE:
                      case FIELD_TYPE.TIME:
                      case FIELD_TYPE.DATE_TIME:
                        return false;
                      case FIELD_TYPE.EXPRESSION:
                      case FIELD_TYPE.AGG:
                        switch (data.mapping_type) {
                          case FIELD_TYPE.DATE:
                          case FIELD_TYPE.TIME:
                          case FIELD_TYPE.DATE_TIME:
                          case FIELD_TYPE.DECIMAL:
                          case FIELD_TYPE.INTEGER:
                          case FIELD_TYPE.LONG:
                            return false;
                          default:
                            return true;
                        }
                      default:
                        return true;
                    }
                  },
                },
                [
                  ...editorTypeConfigs,
                  new GctFormHiddenItemModel('separator', { defaultValue: '-' }),
                  formatCfg,
                ].filter((item) => item !== null && item !== undefined),
              ),
            ]),
          ]),
          new GctFormTabPaneModel('tab_pane1', t('sys.cardDesign.cfg_form.style'), {}, [
            new GctFormCollapseModel('collapse1', {}, [
              new GctFormCollapsePaneModel(
                'collapse_pane3',
                t('sys.cardDesign.cfg_form.style'),
                {},
                [
                  new GctFormItemModel(
                    'label_font',
                    t('sys.cardDesign.cfg_form.name'),
                    {
                      labelPosition: 'top',
                    },
                    {
                      type: DesignEditorType.STYLE_FONT,
                    },
                  ),
                  new GctFormLineModel('line', {
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    hidden(form, item, data) {
                      // 如下类型隐藏：图片、附件、esop、签名
                      switch (data.type) {
                        case FIELD_TYPE.IMAGE:
                        case FIELD_TYPE.ATTACHMENT:
                        case FIELD_TYPE.ESOP:
                        case FIELD_TYPE.SIGNATURE:
                          return true;
                        default:
                          return false;
                      }
                    },
                  }),
                  new GctFormItemModel(
                    'content_font',
                    t('sys.cardDesign.cfg_form.content'),
                    {
                      labelPosition: 'top',
                      hidden(form, item, data) {
                        // 如下类型隐藏：图片、附件、esop、签名
                        switch (data.type) {
                          case FIELD_TYPE.IMAGE:
                          case FIELD_TYPE.ATTACHMENT:
                          case FIELD_TYPE.ESOP:
                          case FIELD_TYPE.SIGNATURE:
                            return true;
                          default:
                            return false;
                        }
                      },
                    },
                    {
                      type: DesignEditorType.STYLE_FONT,
                    },
                  ),
                  new GctFormLineModel('line_2', {
                    paddingTop: '16px',
                    paddingBottom: '16px',
                    hidden(form, item, data) {
                      // 如下类型隐藏：图片、附件、esop、签名、版本模型关联
                      switch (data.type) {
                        case FIELD_TYPE.IMAGE:
                        case FIELD_TYPE.ATTACHMENT:
                        case FIELD_TYPE.ESOP:
                        case FIELD_TYPE.SIGNATURE:
                        case FIELD_TYPE.RDO_REF:
                          return true;
                        default:
                          return false;
                      }
                    },
                  }),
                  new GctFormItemModel(
                    'tag_style',
                    '',
                    {
                      labelPosition: 'top',
                      hidden(form, item, data) {
                        // 如下类型隐藏：图片、附件、esop、签名、版本模型关联
                        switch (data.type) {
                          case FIELD_TYPE.IMAGE:
                          case FIELD_TYPE.ATTACHMENT:
                          case FIELD_TYPE.ESOP:
                          case FIELD_TYPE.SIGNATURE:
                          case FIELD_TYPE.RDO_REF:
                            return true;
                          default:
                            return false;
                        }
                      },
                    },
                    {
                      type: DesignEditorType.CONTENT_TAG_STYLE,
                    },
                  ),
                ],
              ),
            ]),
          ]),
        ]),
      ],
    };
  };

  create(data?: CardFieldDesignNode): CardFieldDesignNode {
    return new CardFieldDesignNode(data as unknown as CardFieldDesignNode);
  }
}
