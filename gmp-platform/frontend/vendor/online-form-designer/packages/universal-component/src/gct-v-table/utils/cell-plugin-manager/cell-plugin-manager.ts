import { PresetPluginType } from '../../constants';
import { IVTableColumn, IVTableColumnPlugin, IVTableDataItem } from '../../interface';

/**
 * 计算列绘制插件唯一标识键
 *
 * @param {IVTableColumn} column
 * @param {IVTableDataItem} row
 * @param {number} rowIndex
 * @return {*}  {string}
 */
export function calcFieldColumnKey(
  column: IVTableColumn,
  row: IVTableDataItem,
  rowIndex: number,
): string {
  return `${PresetPluginType.FIELD_TYPE_COLUMN}:${row.id_}:${column.name}:index_${rowIndex}`;
}

/**
 * 计算表头列插件唯一标识键
 *
 * @export
 * @param {IVTableColumn} column
 * @param {number} colIndex
 * @return {*}  {string}
 */
export function calcHeaderColumnKey(column: IVTableColumn, colIndex: number): string {
  return `${PresetPluginType.HEADER_TYPE_COLUMN}:${column.name}:index_${colIndex}`;
}

/**
 * 插件实例缓存管理，在表格销毁时或者重新加载数据后，释放所有插件实例
 *
 * @class VTableCellPluginInstCache
 */
export class VTableCellPluginInstCache {
  private map: Map<string, IVTableColumnPlugin> = new Map();

  set(type: string, instance: any) {
    this.map.set(type, instance);
  }

  get(type: string): IVTableColumnPlugin | undefined {
    return this.map.get(type);
  }

  getByRow(row: number): IVTableColumnPlugin[] {
    const plugins: IVTableColumnPlugin[] = [];
    this.map.forEach((plugin, key) => {
      if (key.endsWith(`index_${row}`)) {
        plugins.push(plugin);
      }
    });
    return plugins;
  }

  remove(type: string) {
    this.map.delete(type);
  }

  disposeAll() {
    this.map.forEach((plugin) => {
      if (plugin.dispose) {
        plugin.dispose();
      }
    });
    this.map.clear();
  }
}
