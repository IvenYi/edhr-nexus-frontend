import { defineComponent, PropType, toRefs } from 'vue';
import { EditorType, IDictionary, IForm, IFormItem, useNamespace } from '@gct/runtime';
import { useI18n } from 'vue-i18n';
import { getFieldMetaList } from '/@/apis/gct-apaas/FieldMetaController';
import './serial-modal-preview.scss';

const PatternEnum = {
  yyyyMMdd: 'sys.model.yyyyMMdd',
  yyyyMM: 'sys.model.yyyyMM',
  MMddyyyy: 'sys.model.MMddyyyy',
  ddMMyyyy: 'sys.model.ddMMyyyy',
  MMyyyy: 'sys.model.MMyyyy',
  yyyywk: 'sys.model.yyyywk',
  yyyyMMddHH: 'sys.model.yyyyMMddHH',
  yyyyMMddHHmm: 'sys.model.yyyyMMddHHmm',
  yyyyMMddHHmmss: 'sys.model.yyyyMMddHHmmss',
  CUSTOM: 'sys.customize',
};

enum TypeEnum {
  // 固定值
  FIXED = 'fixed',
  // 填充符
  PLACEHOLDER = 'placeholder',
  // 日期
  DATE = 'date',
  // 自增
  INCREASE = 'increase',
  // 字母
  LETTER = 'letter',
}

enum ResetConditionEnum {
  YEAR = 'year',
  WEEK = 'week',
  MONTH = 'month',
  DAY = 'day',
  HOUR = 'hour',
  NONE = 'none',
}

export const SerialModalPreview = defineComponent({
  name: 'SerialModalPreview',
  props: {
    modelKey: {
      type: String,
      default: '',
    },
    data: {
      type: Object as PropType<IData>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('serial-modal-preview');

    const { t } = useI18n();

    const { data } = toRefs(props);

    const typeDictionary: IDictionary = {
      mode: 'static',
      tag: 'serialType',
      items: [
        {
          label: t('sys.model.fixed'),
          value: TypeEnum.FIXED,
        },
        {
          label: t('sys.model.placeholder'),
          value: TypeEnum.PLACEHOLDER,
        },
        {
          label: t('sys.model.date'),
          value: TypeEnum.DATE,
        },
        {
          label: t('sys.model.letter'),
          value: TypeEnum.LETTER,
        },
        {
          label: t('sys.model.increase'),
          value: TypeEnum.INCREASE,
        },
      ],
    };

    const conditionDictionary: IDictionary = {
      mode: 'static',
      tag: 'serialType',
      items: [
        {
          label: t('sys.year'),
          value: ResetConditionEnum.YEAR,
        },
        {
          label: t('sys.month'),
          value: ResetConditionEnum.MONTH,
        },
        {
          label: t('sys.week'),
          value: ResetConditionEnum.WEEK,
        },
        {
          label: t('sys.day'),
          value: ResetConditionEnum.DAY,
        },
        {
          label: t('sys.hour'),
          value: ResetConditionEnum.HOUR,
        },
        {
          label: t('sys.none'),
          value: ResetConditionEnum.NONE,
        },
      ],
    };

    const items: IFormItem[] = [
      {
        name: 'type',
        type: 'item',
        label: t('sys.model.sectionType'),
        editor: {
          type: EditorType.SPAN,
          readonly: true,
        },
        dictionary: typeDictionary,
      },
    ];

    switch (data.value.type) {
      // 固定值
      case TypeEnum.FIXED:
        items.push({
          name: 'value',
          type: 'item',
          label: t('sys.model.fixed'),
          editor: {
            type: EditorType.SPAN,
            readonly: true,
          },
        });
        break;
      // 填充符
      case TypeEnum.PLACEHOLDER:
        // 属性标识
        items.push({
          name: 'modelKey',
          type: 'item',
          label: t('sys.model.modelFields'),
          editor: {
            type: EditorType.SPAN,
            readonly: true,
          },
          dictionary: {
            mode: 'async',
            tag: 'SerialModalPreviewFiledModelList',
            keys: ['name', 'key'],
            fetch: async () => {
              const data = await getFieldMetaList({ modelKey: props.modelKey });
              return data || [];
            },
          },
        });
        items.push({
          name: 'reset',
          type: 'item',
          label: t('sys.model.reset'),
          editor: {
            type: EditorType.CHECK_SWITCH,
            readonly: true,
          },
        });
        break;
      // 日期
      case TypeEnum.DATE:
        items.push({
          name: 'patternType',
          type: 'item',
          label: t('sys.model.argument'),
          editor: {
            type: EditorType.SPAN,
            format(data, _model, _c) {
              return t(PatternEnum[data.patternType]);
            },
            readonly: true,
          },
        });
        if (data.value.config.patternType === 'CUSTOM') {
          items.push({
            name: 'pattern',
            type: 'item',
            label: t('sys.customize'),
            editor: {
              type: EditorType.SPAN,
              readonly: true,
            },
          });
        }
        items.push({
          name: 'reset',
          type: 'item',
          label: t('sys.model.reset'),
          editor: {
            type: EditorType.CHECK_SWITCH,
            readonly: true,
          },
        });
        if (data.value.config.reset == true) {
          items.push({
            name: 'condition',
            type: 'item',
            label: t('sys.model.resetCondition'),
            editor: {
              type: EditorType.SPAN,
              readonly: true,
            },
            dictionary: conditionDictionary,
          });
        }
        break;
      // 自增
      case TypeEnum.INCREASE:
        items.push(
          ...([
            {
              name: 'minLength',
              type: 'item',
              label: t('sys.model.minimumLengthLimit'),
              editor: {
                type: EditorType.SPAN,
                readonly: true,
              },
            },
            {
              name: 'from',
              type: 'item',
              label: t('sys.model.startingSequenceNumber'),
              editor: {
                type: EditorType.SPAN,
                readonly: true,
              },
            },
            {
              name: 'padding',
              type: 'item',
              label: t('sys.model.placeholder'),
              editor: {
                type: EditorType.SPAN,
                readonly: true,
              },
            },
            {
              name: 'step',
              type: 'item',
              label: t('sys.model.step'),
              editor: {
                type: EditorType.SPAN,
                readonly: true,
              },
            },
          ] as IFormItem[]),
        );
        break;
      // 字母
      case TypeEnum.LETTER:
        items.push({
          name: 'upper',
          type: 'item',
          label: t('sys.model.format'),
          editor: {
            type: EditorType.SPAN,
            readonly: true,
          },
          dictionary: {
            mode: 'static',
            tag: 'xxx',
            items: [
              {
                label: t('sys.model.lowercase'),
                value: 0,
              },
              {
                label: t('sys.model.uppercase'),
                value: 1,
              },
            ],
          },
        });
        break;
      default:
    }

    const formModel: IForm = {
      type: 'edit',
      labelWidth: '150px',
      info: true,
      children: [
        {
          name: 'group',
          layout: 'grid',
          type: 'container',
          children: items,
        },
      ],
      loadRequest: async () => {
        return { ...data.value, ...data.value.config };
      },
    };

    return { ns, formModel };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <gct-edit-form context={{ id: '_' }} model={this.formModel} />
      </div>
    );
  },
});
