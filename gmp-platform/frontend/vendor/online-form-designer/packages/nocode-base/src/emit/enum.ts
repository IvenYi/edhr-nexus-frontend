/** provide, inject枚举 */
export enum NCB_PROVIDE {
  /** 后端pdf */
  IS_PDF = 'NCB_IsPdf',
  /** 渲染数据 */
  FROM_DATA = 'NCB_FromState',
  /** 字段默认值数据 */
  DEFAULT_FIELD_DATA = 'NCB_DefaultFieldData',
  /** 数据关联关系 */
  DATA_RELATION_SHIP = 'NCB_DataRelationShip',
  /** 修改分页信息 */
  PAGE_DATA_CALL_BACK = 'NCB_PageDataCallback',
  /** 移动端填报字段弹框 */
  MOBILE_FILL_FIELDS_POPUP = 'NCB_MobileFillFieldsPopup',
  /** 表单模板bom控制器映射 */
  TMPL_BOM_CONTROLLER_MAP = 'NCB_TmplBomControllerMap',
  /** 物料消耗表控制器 */
  MATERIAL_CONSUME_TABLE_CONTROLLER = 'NCB_MaterialConsumeTableController',
}
