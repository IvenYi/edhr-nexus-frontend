import { PermissionConfig } from '@gct/flow/src/plugins/bpmn/types';
import { FieldPermissionConfig } from './field-permission/type';

export interface FormTmpPermissionConfig extends PermissionConfig {
  /** 自定义字段权限列表 */
  fieldPermission?: FieldPermissionConfig[];

  /** 是否正在编辑 */
  _isEditing?: boolean;
}
