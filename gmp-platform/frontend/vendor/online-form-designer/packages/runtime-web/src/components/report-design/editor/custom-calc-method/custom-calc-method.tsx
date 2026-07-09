import { computed, defineComponent, PropType, toRef, toRefs } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IFormItem, FIELD_TYPE } from '@gct/runtime';
import { useReportViewController } from '../../hooks';
import { ITableReportField, ITableReportSchema } from '../../interface';
import { REPORT_TYPE } from '../../constants';
import { getCalculationMethodsByFieldType } from '../../dictionary';
import './custom-calc-method.scss';
import { getPolymerizationMethodByFieldType } from '../../utils';
import { SummaryCalculationMethod } from '../../schema';

/**
 * 自定义计算方式配置组件
 *
 * 根据不同模式配置计算方式：
 * - row 模式：可以配置行维度和指标的计算方式，保存在 row_function 字段
 * - column 模式：只能配置指标的计算方式，保存在 col_function 字段
 *
 * @example
 * <CustomCalcMethod model={{ mode: 'row' }} />
 * <CustomCalcMethod model={{ mode: 'column' }} />
 */
export const CustomCalcMethod = defineComponent({
  name: 'CustomCalcMethod',
  props: {
    /**
     * 表单项模型，包含模式配置
     *
     * @type {IFormItem & { mode: 'row' | 'column' }}
     */
    model: {
      type: Object as PropType<IFormItem & { mode: 'row' | 'column' }>,
      required: true,
    },
  },
  setup(props) {
    const ns = useNamespace('custom-calc-method');

    const reportView = useReportViewController();

    const schema = toRef<ITableReportSchema>(reportView.state.schema as ITableReportSchema);

    const { dataColumn, rowDimension } = toRefs(schema.value);

    /**
     * 计算当前模式下需要显示的字段列表
     *
     * @returns 字段数组
     */
    const items = computed<ITableReportField[]>(() => {
      let keys: string[] = [];
      if (schema.value.reportType === REPORT_TYPE.SCHEDULE_TABLE) {
        keys = dataColumn.value;
      } else if (schema.value.reportType === REPORT_TYPE.CROSS_TABLE) {
        if (props.model.mode === 'row') {
          // row 模式：只显示指标
          keys = schema.value.indicatorDimension;
        } else if (props.model.mode === 'column') {
          // column 模式：显示行维度和指标
          keys = [...rowDimension.value, ...schema.value.indicatorDimension];
        }
      }
      console.log('items:', reportView.state.count);
      const functionKey = getFieldFunctionKey();
      return keys
        .map((key) => {
          const item = schema.value.fieldMap[key] as any;
          if (item && item[functionKey] == null) {
            // 如果没有设置计算方式，默认设置为 'none'
            item[functionKey] = SummaryCalculationMethod.NONE;
          }
          return item;
        })
        .filter((item) => {
          return !!item;
        });
    });

    /**
     * 获取字段绑定的计算方式属性名
     *
     * @returns 属性名
     */
    const getFieldFunctionKey = (): keyof ITableReportField => {
      if (schema.value.reportType === REPORT_TYPE.SCHEDULE_TABLE) {
        return 'col_function';
      } else if (schema.value.reportType === REPORT_TYPE.CROSS_TABLE) {
        if (props.model.mode === 'row') {
          return 'row_function';
        } else if (props.model.mode === 'column') {
          return 'col_function';
        }
      }
      return 'function';
    };

    function onChange() {
      reportView.updateSchema();
    }

    /**
     * 根据字段类型获取可用的计算方式选项
     * @param field 字段信息
     * @returns 计算方式选项数组
     */
    const getFieldCalculationMethods = (field: ITableReportField) => {
      const options = getCalculationMethodsByFieldType(field.fieldType, field.mappingType as FIELD_TYPE);
      const types = getPolymerizationMethodByFieldType(field);
      return options.filter((option) => {
        return types.includes(option.value);
      });
    };

    return { ns, items, reportView, getFieldFunctionKey, onChange, getFieldCalculationMethods };
  },
  render() {
    const functionKey = this.getFieldFunctionKey();
    return (
      <div v-show={this.items.length > 0} class={this.ns.b()}>
        {this.items.map((item) => {
          const availableMethods = this.getFieldCalculationMethods(item);
          return (
            <div class={this.ns.e('item')} key={item.field}>
              <div class={this.ns.e('item-name')}>{item.fieldName}</div>
              <div class={this.ns.e('item-select')}>
                <a-select size="small" placeholder="请选择" v-model:value={item[functionKey]} onChange={this.onChange}>
                  {availableMethods.map((option) => {
                    return (
                      <a-select-option key={option.value} value={option.value}>
                        {option.label}
                      </a-select-option>
                    );
                  })}
                </a-select>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
});
