/** 参数类型 */
export enum Config_Fields {
  /** 物料编码 */
  materialCode = 'materialCode',
  /** 批号 */
  lot = 'lot',
  /** 数量 */
  qty = 'qty',
  /** 有效期 */
  expiration = 'expiration',
  /** 设备编码 */
  deviceCode = 'deviceCode',
  /** 其他 */
  other = 'other',
}

export interface IRuleParseData {
  /** 物料编码 */
  materialCode?: string;
  /** 设备编码 */
  deviceCode?: string;
  /** 批号 */
  lot: string;
  /** 数量 */
  qty?: number;
  /** 有效期 */
  expiration?: Date;
  /** 其他字段 */
  [k: string]: any;
}

/**
 * 解析规则配置
 * @export
 * @interface IRuleConfig
 */
export interface IRuleConfig {
  /** 分隔符 */
  separator: string;
  /** 空值符 */
  nullSymbol?: string;
  /**
   * @deprecated
   * 字段列表（废弃，老数据的结构）
   * */
  list: Config_Fields[];
  /** 新的字段配置格式 */
  fieldList: Array<{
    /** 唯一标识 */
    key: string;
    /** 字段类型 */
    type: Config_Fields;
    /** 别名（其他用） */
    alias?: string;
    /** 格式化（有效期用） */
    format?: string;
  }>;
}
