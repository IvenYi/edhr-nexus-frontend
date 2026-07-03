/** bom明细对象 */
export interface IBomEntry {
  /** 明细id */
  id_: string;
  /** 排序字段 */
  sort_num_: number;
  /** 物料id */
  product_id_: string;
  /** 物料编码 */
  product_code_: string;
  /** 物料名称 */
  product_name_: string;
  /** 物料版本 */
  product_version_: string;
  /** 规格型号 */
  product_spec_: string;
  /** 单位用量 */
  qty_required_: number;
  /** 删除标记 */
  deleted_?: boolean;
  /** 上料方式 */
  type_: 'by_lot' | 'by_number' | 'view';

  /** 是否启用替代料 */
  substitute_material_enabled_: boolean;
  /** 替代策略 */
  substitute_policy_: 'only_one' | 'mixing';
  /** 替代料配置 */
  substitute_material_entries_: Array<{
    /** 物料标识 */
    product_id_: string;
    /** 物料编码 */
    product_code_: string;
    /** 单位用量  */
    qty_required_: number;
    /** 物料名称 */
    product_name_: string;
    /** 物料版本 */
    product_version_: string;
    /** 规格型号 */
    product_spec_: string;
  }>;

  /** 是否启用混批的校验 */
  lot_mixing_enabled_: boolean;
  /** 混批次数 */
  lot_mixing_times_: number;

  /** 是否启用数量校验 */
  qty_validation_enabled_: boolean;
  /** 数量校验规则 */
  qty_validation_rule_: 'eq' | 'gte' | 'lte';
  /** 顺序 */
  operation_sort_num_?: number;
}

/** 物料消耗表业务配置 */
export interface IFormTmplBom {
  /** 唯一标识 */
  id_?: string;
  /** 表单模板id */
  form_tmpl_id_?: string;
  /** 表单里物料消耗表的id */
  table_key_: string;
  /** 是否启用上下料模式 */
  material_loading_model_enabled_: boolean;
  /** 条码解析规则 */
  barcode_parsing_rules_id_?: string;
  /** 从BOM初始化 */
  bom_init_enabled_?: boolean;
  /** 人为指定物料 */
  personal_bom_enabled_?: boolean;
  /** 按顺序上料 */
  sequence_loading_enabled_?: boolean;
  /** bom明细 */
  entries_: IBomEntry[];
  /** 删除标记 */
  deleted_?: boolean;
}

/**
 * 物料消耗表子模型的数据结构
 * @export
 * @interface IMaterialConsumeData
 */
export interface IMaterialConsumeData {
  /** 物料 */
  product_id_?: string;
  /** 物料批次 */
  material_no_?: string;
  /** 已消耗数量 */
  qty_consumed_?: number;
  /** 数量 */
  qty_?: number;
  /** 需求数量 */
  qty_required_?: number;
  /** 工序 */
  routing_operation_id_?: string;
  /** 是否确认完毕 */
  is_confirmed_: boolean;
  /** 业务数据 */
  _MCTABLE?: {
    /** 属性的禁用控制机 */
    fieldDisabled?: Record<string, boolean>;
    /** 整行是否正在编辑 */
    rowEditing?: boolean;
  };
  /** 删除的数据，后台通过这个标识删除 */
  deleted_?: boolean;
  /** 后端需要的bom明细id */
  bom_entry_id_?: string;
}
