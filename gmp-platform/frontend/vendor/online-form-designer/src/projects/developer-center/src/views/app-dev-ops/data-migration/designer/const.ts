export enum StateEnum {
  Tab1 = 'tab1',
  Tab2 = 'tab2',
}

/**迁移模块 */
export enum DataTabEnum {
  /**系统模块 */
  SYS_MODULAR = 'system',
  /**应用模型 */
  APP_MODULAR = 'model',
}

/**
 * 系统模块页面
 */
export enum SysPageEnum {
  /**用户组 */
  USER_GROUP = 'user_group',
  /**角色管理 */
  ROLE_MANAGE = 'role_manage',
  /**消息模板 */
  MSG_TEMPLATE = 'msg_template',
  /**标签打印 */
  LABEL_PRINT = 'label_print',
  /**单据打印 */
  DOC_PRINT = 'doc_print',
  /**表单设计 */
  FORM_DESIGN = 'form_design',
  /**eDHR设计 */
  EDHR_DESIGN = 'edhr_design',
  /**rdo模型 */
  rdo_model = 'rdo_model',
  /**ndo模型 */
  ndo_model = 'ndo_model',
  /**基础模型 */
  basic_model = 'basic_model',
}

/**已经被选中的数据结构 */
export class CheckedData {
  /**是否全部选中  false 表示全部选中*/
  indeterminate: boolean = false;
  /**是否被选中 */
  checked: boolean = false;
  /** 组标题 */
  title: string;
  /**组标识 */
  key: string;
  /**大模块 */
  type: DataTabEnum;
  /** 具体数据的ids */
  moveDataIds: string[] = [];
  /** rdo子版本ids */
  rdoDataIds: string[] = [];
  /** true:包含；false:排除 */
  in: boolean = true;
  /**模块的标识 */
  name: SysPageEnum;
  fieldMetaList?: any[];
  /**模型key */
  modelKey?: string;
  /**模型name */
  modelName?: string;
  constructor({ title, key, type, name, fieldMetaList, modelKey, modelName }) {
    this.title = title;
    this.key = key;
    this.type = type;
    this.name = name;
    this.fieldMetaList = fieldMetaList;
    this.modelKey = modelKey;
    this.modelName = modelName;
  }
  /**包含或者排除模式下维护ids 逻辑 */
  changeNode(checked: boolean, ids: string[], total: number, versionIds: string[]) {
    //排除模式下逻辑取反
    if (!this.in) checked = !checked;
    if (checked) {
      ids.forEach((id) => {
        this.moveDataIds.includes(id) || this.moveDataIds.push(id);
      });
      versionIds.forEach((id) => {
        this.rdoDataIds.includes(id) || this.rdoDataIds.push(id);
      });
    } else {
      this.moveDataIds = this.moveDataIds.filter((i) => !ids.includes(i));
      this.rdoDataIds = this.rdoDataIds.filter((i) => !versionIds.includes(i));
    }
    if (this.in) {
      /**正选逻辑 */
      this.checked = !!this.moveDataIds.length;
      this.indeterminate = this.moveDataIds.length !== total;
    } else {
      /**排除逻辑 */
      this.indeterminate = !!this.moveDataIds.length;
      this.checked = this.moveDataIds.length !== total;
    }
  }
  /**模块复选框选中或者取消选中逻辑 类似重置*/
  checkedNode(checked) {
    if (this.checked === checked) return;
    this.checked = checked;
    this.indeterminate = false;
    this.in = !checked;
    this.moveDataIds = [];
    this.rdoDataIds = [];
  }
}
