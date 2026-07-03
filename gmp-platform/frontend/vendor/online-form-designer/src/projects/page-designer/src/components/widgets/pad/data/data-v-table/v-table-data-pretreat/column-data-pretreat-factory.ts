import { FIELD_TYPE, LowCodeWidget } from '@gct/runtime';
import { DefaultColumnDataPretreat } from './default-column-data';
import { FormulaDisplayColumnDataPretreat } from './formula-display-column-data';
import { ColumnDataPretreat, TableObj } from './column-data-pretreat';

/**
 * 列数据预处理工厂类
 * 负责根据字段类型创建对应的预处理实例，并管理实例缓存以提高性能
 */
export class ColumnDataPretreatFactory {
  /**
   * 实例缓存池，key 为列的唯一标识，value 为预处理实例
   */
  private static readonly _cache = new Map<string, ColumnDataPretreat>();

  /**
   * 根据列配置获取或创建预处理实例
   * 如果实例已缓存，则直接返回；否则创建新实例并缓存
   *
   * @param col 列配置
   * @param obj 表格对象
   * @returns 对应的预处理实例
   */
  static getInstance(col: LowCodeWidget.BasicSchema, obj?: TableObj): ColumnDataPretreat {
    const cacheKey = this._generateCacheKey(col);

    // 从缓存中获取实例
    let instance = this._cache.get(cacheKey);
    if (instance) {
      return instance;
    }

    // 根据字段类型创建新实例
    instance = this._createInstance(col, obj);

    // 缓存实例
    this._cache.set(cacheKey, instance);

    return instance;
  }

  /**
   * 清除所有缓存的实例
   * 在某些情况下（如列配置变更）可能需要清除缓存
   */
  static clearCache(): void {
    this._cache.clear();
  }

  /**
   * 生成缓存键
   * 使用列的唯一标识和字段类型作为缓存键
   *
   * @param col 列配置
   * @returns 缓存键
   */
  private static _generateCacheKey(col: LowCodeWidget.BasicSchema): string {
    const { fieldType } = col.props;
    const widgetId = col.id || col.props.field;
    return `${widgetId}:${fieldType}`;
  }

  /**
   * 根据字段类型创建预处理实例
   *
   * @param col 列配置
   * @param obj 表格对象
   * @returns 对应的预处理实例
   */
  private static _createInstance(col: LowCodeWidget.BasicSchema, obj?: TableObj): ColumnDataPretreat {
    const { fieldType } = col.props;

    // 公式显示字段
    if (fieldType === FIELD_TYPE.DATA_TABLE_FORMULA) {
      return new FormulaDisplayColumnDataPretreat(col, obj);
    }
    
    // 默认处理
    return new DefaultColumnDataPretreat(col, obj);
  }
}
