import { LowCodeWidget } from '@gct/runtime';
import { IVTableDataItem } from '@gct/universal-component/gct-v-table';
import { ColumnDataPretreatFactory } from './column-data-pretreat-factory';
import { TableObj } from './column-data-pretreat';

/**
 * 对表格列数据进行预处理
 * 根据每一列的字段类型，为其创建对应的预处理实例进行处理
 *
 * @param widgets 列配置数组
 * @param items 表格数据项数组
 * @param obj 表格对象
 */
export async function pretreatColumnsData(
  widgets: LowCodeWidget.BasicSchema[],
  items: IVTableDataItem[] = [],
  obj?: TableObj,
): Promise<void> {
  const all: Promise<void>[] = [];

  widgets.forEach((col) => {
    // 根据列配置和表格对象获取对应的预处理实例
    const pretreat = ColumnDataPretreatFactory.getInstance(col, obj);

    // 对每一行数据进行预处理
    items.forEach((item) => {
      const process = pretreat.preprocess(item);
      if (process) {
        all.push(process);
      }
    });
  });

  await Promise.all(all);
}

/**
 * 清除预处理实例缓存
 * 在列配置变更时可调用此方法清除缓存
 */
export function clearPretreatCache(): void {
  ColumnDataPretreatFactory.clearCache();
}

export { ColumnDataPretreatFactory } from './column-data-pretreat-factory';
export { ColumnDataPretreat } from './column-data-pretreat';
export type { TableObj } from './column-data-pretreat';
export { DefaultColumnDataPretreat } from './default-column-data';
export { FormulaDisplayColumnDataPretreat } from './formula-display-column-data';
