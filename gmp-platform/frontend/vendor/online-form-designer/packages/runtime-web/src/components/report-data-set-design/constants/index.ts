import { SourceModeEnum } from '../enums';

// 拖拽组的标识
export const DRAG_GROUP = 'data-set-design-drag-group';
// 节点类型标识
export const SHAPE_TYPE = {
  NODE: 'data-set-design-node',
  LINK: 'data-set-design-link',
  // 空节点用于连线使用
  EMPTY: 'data-set-design-empty',
  // 空节点的连线
  EMPTY_LINK: 'data-set-design-empty-link',
};
// 数据源模式图标映射
export const SourceModeIconEnum = {
  // 实体
  [SourceModeEnum.ENTITY]: 'icon-shitimoxing',
  // 视图
  [SourceModeEnum.VIEW]: 'icon-a-icon_shitumoxing16-copy',
  // 表单
  [SourceModeEnum.FORM]: 'icon-dongtaibiao',
  // 系统
  [SourceModeEnum.SYSTEM]: 'icon-shezhi1',
};
//  模型+属性， id 标识拼接符号唯一
export const MODEL_FIELD_CONNECTOR = '$';
// 数据预览拼接符号
export const DATA_PREVIEW_CONNECTOR = '___';
// 公式显示字段前缀
export const FORMULA_DISPLAY_FIELD_PREFIX = 'formula_';
