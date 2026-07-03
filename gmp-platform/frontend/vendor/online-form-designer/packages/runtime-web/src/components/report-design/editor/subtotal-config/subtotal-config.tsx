import { defineComponent, onMounted, onUnmounted } from 'vue';
import {
  IEditForm,
  IFormEditItem,
  IFormGroup,
  useGctFormValue,
  useNamespace,
} from '@gct-paas/core';
import { EditorType } from '@gct/runtime';
import { createUUID } from 'qx-util';
import { calculationMethodDictionary, subtotalCalculationMethodDictionary } from '../../dictionary';
import { useReportViewController } from '../../hooks';
import { ITableReportSchema } from '../../interface';
import { REPORT_TYPE } from '../../constants';
import { SummaryCalculationMethod } from '../../schema';
import './subtotal-config.scss';

/**
 * 小计配置
 */
export const SubtotalConfig = defineComponent({
  name: 'SubtotalConfig',
  props: {
    value: {
      type: Array<IObject>,
      default: () => [{ id: createUUID() }],
    },
    model: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('subtotal-config');

    const c = useReportViewController();

    const val = useGctFormValue<IObject[]>();

    function fieldChangeTap(_, field): void {
      const schema = c.state.schema as ITableReportSchema;
      const lastRow = schema.rowDimension[schema.rowDimension.length - 1];
      const lastColumn = schema.columnDimension[schema.columnDimension.length - 1];
      val.value.forEach((item, i) => {
        if (item.summaryFields) {
          item.summaryFields = item.summaryFields.filter((key) => {
            return key !== field?.id && key !== lastRow && key !== lastColumn;
          });
          item.summaryFields = item.summaryFields;
        }
        val.value[i] = item;
      });
      val.value = val.value;
    }

    c.hooks.field.delete.tap(fieldChangeTap);
    c.hooks.field.sort.tap(fieldChangeTap);

    const formModel: IEditForm = {
      type: 'edit',
      size: 'small',
      labelWidth: '48px',
      children: [
        {
          name: 'group1',
          layout: 'grid',
          type: 'container',
          container: true,
          children: [
            {
              type: 'hidden',
              name: 'open',
              defaultValue: true,
            },
            {
              name: 'totalAlias',
              type: 'item',
              label: '小计别名',
              labelPosition: 'top',
              defaultValue: '小计',
              rules: [
                {
                  validator: (rule, value, callback) => {
                    if (value && value.trim().length > 100) {
                      callback('最大100字');
                    } else {
                      callback();
                    }
                  },
                },
              ],
              editor: {
                type: EditorType.TEXT,
                placeholder: '请输入',
                props: {
                  size: 'small',
                },
              },
            },
            {
              name: 'summaryFields',
              type: 'item',
              label: '汇总字段',
              labelPosition: 'top',
              dictionary: {
                tag: 'summaryFields',
                mode: 'async',
                keys: ['fieldName', 'id'],
                fetch() {
                  if (c.state.schema) {
                    const {
                      reportType,
                      fieldMap,
                      dataColumn = [],
                      columnDimension = [],
                      rowDimension = [],
                    } = c.state.schema as ITableReportSchema;
                    let items: string[] = [];
                    if (reportType === REPORT_TYPE.SCHEDULE_TABLE) {
                      items = [...dataColumn];
                    } else if (reportType === REPORT_TYPE.CROSS_TABLE) {
                      if (props.model.props.mode === 'column') {
                        items = [...columnDimension];
                      } else {
                        items = [...rowDimension];
                      }
                    }
                    items.pop();
                    return items.map((key) => {
                      return fieldMap[key];
                    });
                  }
                  return [];
                },
              },
              editor: {
                type: EditorType.MULTIPLE_CHOICE,
                placeholder: '请选择',
                force: true,
                props: {
                  size: 'small',
                },
              },
            },
            {
              name: 'includeNull',
              type: 'item',
              label: '计算方式',
              labelTooltip:
                '这里为所有字段统一的总计聚合方式，可选择“自定义”对单个字段设置聚合方式',
              defaultValue: true,
              class: 'include-null',
              editor: {
                type: EditorType.CHECK_SWITCH,
                label: '空值参与计算',
                props: {
                  size: 'small',
                },
              },
            },
            {
              name: 'function',
              type: 'item',
              dictionary: subtotalCalculationMethodDictionary,
              defaultValue: SummaryCalculationMethod.SUM,
              editor: {
                type: EditorType.SELECT,
                placeholder: '请选择',
                props: {
                  size: 'small',
                  allowClear: false,
                },
              },
            },
          ] as IFormEditItem[],
        },
      ] as IFormGroup[],
    };

    function onChange(i: number, data: IObject): void {
      val.value[i] = data;
      val.value = val.value;
    }

    function renderItem(i: number, data: IObject) {
      return (
        <div key={data.id} class={ns.b('item')}>
          <div class={ns.be('item', 'header')}>
            <div class={ns.be('item', 'title')}>小计{i + 1}</div>
            <div
              class={[ns.be('item', 'delete'), ns.is('hidden', val.value.length <= 1)]}
              onClick={() => onDeleteItem(i)}
            >
              <i class="iconfont icon-shanchu" />
            </div>
          </div>
          <div class={ns.be('item', 'body')}>
            <gct-edit-form
              class={ns.be('item', 'form')}
              v-model:data={data}
              model={formModel}
              isDeepMerge={false}
              embed
              onChange={(d) => onChange(i, d)}
            />
          </div>
        </div>
      );
    }

    function onAddItem(): void {
      if (!val.value) {
        val.value = [{ id: createUUID() }];
      } else {
        val.value.push({ id: createUUID() });
      }
    }

    function onDeleteItem(index: number): void {
      val.value.splice(index, 1);
      val.value = val.value;
    }

    onMounted(() => {
      if (!val.value) {
        val.value = [{}];
      } else if (val.value.length === 0) {
        val.value.push({});
      }
    });

    onUnmounted(() => {
      c.hooks.field.delete.removeTap(fieldChangeTap);
    });

    return { ns, val, renderItem, onAddItem, onDeleteItem };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <div class={this.ns.e('list')}>
          {this.val?.map((item, i) => {
            return this.renderItem(i, item);
          })}
        </div>
        <div class={this.ns.e('add')}>
          <a-button type="link" onClick={this.onAddItem}>
            {{
              icon: () => {
                return <i class="iconfont icon-tianjia" />;
              },
              default: () => {
                return <span>添加小计</span>;
              },
            }}
          </a-button>
        </div>
      </div>
    );
  },
});
