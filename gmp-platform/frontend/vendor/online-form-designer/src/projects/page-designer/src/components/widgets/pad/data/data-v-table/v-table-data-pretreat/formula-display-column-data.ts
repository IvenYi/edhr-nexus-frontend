import { calc } from '@/components/Expression/utils/expression';
import { IVTableDataItem } from '@gct/universal-component/gct-v-table';
import { ColumnDataPretreat } from './column-data-pretreat';

/**
 * 公式显示列数据预处理类
 * 处理公式字段的计算和显示逻辑，以及通用的样式规则
 */
export class FormulaDisplayColumnDataPretreat extends ColumnDataPretreat {
  /**
   * 实现特定逻辑：计算公式字段的值
   * @param item 行数据项
   */
  protected override async processSpecificLogic(item: IVTableDataItem): Promise<void> {
    await this.calcFormulaValue(item);
  }

  /**
   * 计算公式字段的值
   * @param item 行数据项
   */
  private async calcFormulaValue(item: IVTableDataItem): Promise<void> {
    const { preLocation } = this.widget;
    const { field, formula } = this.widget.props;

    if (!formula) {
      return;
    }

    try {
      const result = await calc(formula, { [preLocation!]: item });
      item[field] = result;
    } catch (error) {
      console.error('公式显示字段值计算出错：', error);
    }
  }
}
