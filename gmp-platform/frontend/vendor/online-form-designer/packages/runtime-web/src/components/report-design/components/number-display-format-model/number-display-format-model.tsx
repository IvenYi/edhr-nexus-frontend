import { defineComponent, PropType, ref, computed } from 'vue';
import { useNamespace } from '@gct-paas/core';
import {
  EditorType,
  FIELD_TYPE,
  ICheckSwitchEditor,
  IEditForm,
  IFormGroup,
  IFormItem,
  INumberEditor,
} from '@gct/runtime';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { NUMBER_FORMAT_TIME_TYPE_ENUM, NumberFormattingEnum } from '../../schema';
import { IReportField } from '../../interface';
import './number-display-format-model.scss';

export const NumberDisplayFormatModel = defineComponent({
  name: 'NumberDisplayFormatModel',
  props: {
    field: {
      type: Object as PropType<IReportField>,
      required: true,
    },
    data: {
      type: Object as PropType<IObject>,
      default: () => {
        return {
          type: NumberFormattingEnum.NUMERICAL_VALUE,
          thousand: true,
        };
      },
    },
  },
  setup(props) {
    const ns = useNamespace('number-display-format-model');

    const precision = ref(0);
    const isLoaded = ref(false);

    async function loadModelFields() {
      if (props.field.modelKey) {
        const res = await getModelMetaDetail({ modelKey: props.field.modelKey });
        if (res && res.fieldMetaList) {
          const fieldMeta = res.fieldMetaList.find((item) => item.key === props.field.field);
          if (fieldMeta) {
            precision.value = fieldMeta.specificConfig?.digits || 0;
          }
          isLoaded.value = true;
        }
      }
      /** 数据集自定义公式字段 */
      if (!props.field.modelKey && props.field.fieldType === FIELD_TYPE.FUNCTION) {
        isLoaded.value = true;
      }
    }

    loadModelFields();

    function getItems() {
      const items = [
        {
          label: '数值',
          value: NumberFormattingEnum.NUMERICAL_VALUE,
        },
        {
          label: '百分比',
          value: NumberFormattingEnum.PERCENTAGE,
        },
      ];
      switch (props.field.fieldType) {
        case FIELD_TYPE.INTEGER:
        case FIELD_TYPE.LONG:
        case FIELD_TYPE.AGG:
        case FIELD_TYPE.EXPRESSION:
          function isTrue() {
            if (
              FIELD_TYPE.AGG === props.field.fieldType ||
              FIELD_TYPE.EXPRESSION === props.field.fieldType
            ) {
              switch (props.field.mappingType) {
                case FIELD_TYPE.INTEGER:
                case FIELD_TYPE.LONG:
                  return true;
                default:
                  return false;
              }
            }
            return true;
          }
          if (isTrue()) {
            items.push({
              label: '时间',
              value: NumberFormattingEnum.TIME,
            });
          }
          break;
        default:
      }
      return items;
    }

    const formModel = computed((): IEditForm => {
      return {
        type: 'edit',
        children: [
          {
            type: 'container',
            layout: 'grid',
            name: 'group1',
            children: [
              {
                name: 'type',
                type: 'item',
                label: '显示格式',
                dictionary: {
                  mode: 'static',
                  tag: 'display_format_type',
                  items: getItems(),
                },
                editor: {
                  type: EditorType.RADIO,
                },
              },
              {
                name: 'precision',
                type: 'item',
                label: '小数位数',
                class: ns.e('form-item-precision'),
                defaultValue: precision.value.toString(),
                editor: {
                  type: EditorType.NUMBER,
                  placeholder: '请输入小数位数',
                  max: 8,
                  min: 0,
                } as INumberEditor,
                hidden(form, item, data) {
                  return data.type === NumberFormattingEnum.TIME;
                },
              },
              {
                name: 'timeType',
                type: 'item',
                label: '时间类型',
                defaultValue: NUMBER_FORMAT_TIME_TYPE_ENUM['天 : 时 : 分 : 秒'],
                dictionary: {
                  mode: 'static',
                  tag: 'time_type',
                  items: Object.keys(NUMBER_FORMAT_TIME_TYPE_ENUM).map((key) => {
                    const val = NUMBER_FORMAT_TIME_TYPE_ENUM[key];
                    return {
                      label: key,
                      value: val,
                    };
                  }),
                },
                editor: {
                  type: EditorType.SELECT,
                  isSelfContainer: false,
                },
                hidden(form, item, data) {
                  return data.type !== NumberFormattingEnum.TIME;
                },
              },
              {
                name: 'group2',
                layout: 'flex',
                type: 'container',
                children: [
                  {
                    name: 'prefix_xxx',
                    type: 'item',
                    label: '前缀/后缀',
                    defaultValue: ' ',
                    flexItem: {
                      flexShrink: 0,
                    },
                    editor: {
                      type: EditorType.SPAN,
                    },
                  },
                  {
                    name: 'prefix',
                    type: 'item',
                    flexItem: {
                      flexGrow: 1,
                    },
                    editor: {
                      type: EditorType.TEXT,
                      placeholder: '请输入前缀',
                    },
                    rules: [
                      {
                        validator(rule, value, callback) {
                          if (value != null && value.trim().length > 100) {
                            callback('最大100字');
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  },
                  {
                    name: 'separator',
                    type: 'item',
                    flexItem: {
                      flexShrink: 0,
                    },
                    defaultValue: '/',
                    class: ns.e('form-item-separator'),
                    editor: {
                      type: EditorType.SPAN,
                    },
                  },
                  {
                    name: 'suffix',
                    type: 'item',
                    flexItem: {
                      flexGrow: 1,
                    },
                    editor: {
                      type: EditorType.TEXT,
                      placeholder: '请输入后缀',
                    },
                    rules: [
                      {
                        validator(rule, value, callback) {
                          if (value != null && value.trim().length > 100) {
                            callback('最大100字');
                          } else {
                            callback();
                          }
                        },
                      },
                    ],
                  },
                ] as IFormItem[],
                hidden(form, item, data) {
                  return data.type !== NumberFormattingEnum.NUMERICAL_VALUE;
                },
              } as IFormGroup,
              {
                name: 'thousand',
                type: 'item',
                // label: '千位分隔符',
                class: ns.e('form-item-thousand'),
                defaultValue: true,
                editor: {
                  type: EditorType.CHECK_SWITCH,
                  label: '使用千位分隔符',
                } as ICheckSwitchEditor,
                hidden(form, item, data) {
                  return data.type !== NumberFormattingEnum.NUMERICAL_VALUE;
                },
              },
            ] as IFormItem[],
          },
        ] as IFormGroup[],
      };
    });

    return { ns, formModel, isLoaded };
  },
  render() {
    if (this.isLoaded !== true) {
      return <div class={this.ns.b()}></div>;
    }
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('header')}>
          <span class={this.ns.e('title')}>数值显示格式</span>
          <span class={this.ns.e('tag')}>{this.field.fieldName}</span>
        </div>
        <div class={this.ns.e('body')}>
          <gct-edit-form data={this.data} v-model:model={this.formModel} embed />
        </div>
      </div>
    );
  },
});
