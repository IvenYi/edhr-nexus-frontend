import { ButtonTypeEnum } from '@gct/nocode-base';
import { OutlineType } from '/@/projects/online-form/src/views/designer/hooks/useEDHRWiki';
import {
  postDhrProcessApprove,
  postDhrProcessReassign,
  postDhrProcessReturn,
} from '/@/apis/gct-apaas/DhrProcessController';

export enum OutlineActionType {
  /**
   * 目录重命名
   */
  RENAME = 'rename',
  /**
   * 编辑表单
   */
  EDIT_DOC = 'edit-doc',
  /**
   * 设计表单
   */
  DESIGN_DOC = 'design-doc',
  /**
   * 删除
   */
  DELETE = 'delete',
  /**
   * 新增目录
   */
  NEW_OUTLINE = 'new-outline',
  /**
   * 新增表单
   */
  NEW_DOC = 'new-doc',
}

export const NodeAddMenus = [
  {
    text: $t('sys.newSth', { sth: $t('sys.edhr.catalog') }),
    icon: 'iconfont:icon-liebiao',
    event: OutlineActionType.NEW_OUTLINE,
  },
  // {
  //   text: '新建文档',
  //   icon: 'iconfont:icon-E-SOP',
  //   event: OutlineActionType.NEW_DOC,
  // },
];

export const NodeMoreMenus = [
  {
    text: $t('sys.component.dataConnection.rename'),
    icon: 'iconfont:icon-bianji',
    include: [OutlineType.DOC, OutlineType.OUTLINE],
    event: OutlineActionType.RENAME,
    divider: true,
  },
  {
    text: $t('sys.delete'),
    class: 'delete-icon',
    icon: 'iconfont:icon-shanchu',
    include: [OutlineType.OUTLINE],
    event: OutlineActionType.DELETE,
  },
];

const Appendix_Cols = [
  {
    title: $t('sys.onlineForm.remarkName'),
    key: 'form_inst_name_',
    ellipsis: true,
    dataIndex: 'form_inst_name_',
  },
  {
    title: $t('sys.onlineForm.formIdent'),
    key: 'serial_no_',
    dataIndex: 'serial_no_',
    ellipsis: true,
  },
  {
    title: $t('sys.onlineForm.formName'),
    key: 'form_tmpl_name_',
    dataIndex: 'form_tmpl_name_',
    ellipsis: true,
  },
  {
    title: $t('sys.webRender.onlineFormSourceCode'),
    key: 'materialNo',
    dataIndex: 'materialNo',
    ellipsis: true,
  },
  {
    title: $t('sys.edhr.formAttr'),
    key: 'formAttr',
    ellipsis: true,
    dataIndex: 'formAttr',
  },
  {
    title: $t('sys.edhr.formStatus'),
    key: 'instance_status_',
    ellipsis: true,
    dataIndex: 'instance_status_',
  },
];

const Txn_Cols = [
  {
    title: $t('sys.onlineForm.formIdent'),
    key: 'serial_no_',
    dataIndex: 'serial_no_',
    ellipsis: true,
  },
  {
    title: $t('sys.onlineForm.formName'),
    key: 'form_tmpl_name_',
    dataIndex: 'form_tmpl_name_',
    ellipsis: true,
  },
  {
    title: $t('sys.edhr.txnNo'),
    key: 'txnNo',
    dataIndex: 'txnNo',
    ellipsis: true,
  },
  {
    title: $t('sys.edhr.materialStatus.TXN'),
    key: 'txnName',
    dataIndex: 'txnName',
    ellipsis: true,
  },
  {
    title: $t('sys.workflow.operation'),
    key: 'operationName',
    dataIndex: 'operationName',
    ellipsis: true,
  },
  {
    title: $t('sys.edhr.formStatus'),
    key: 'instance_status_',
    ellipsis: true,
    dataIndex: 'instance_status_',
  },
];

const Rework_Cols = [
  {
    title: $t('sys.edhr.reworkTitle'),
    key: 'reworkName',
    dataIndex: 'reworkName',
    ellipsis: true,
  },
  {
    title: $t('sys.onlineForm.remarkName'),
    key: 'form_inst_name_',
    ellipsis: true,
    dataIndex: 'form_inst_name_',
  },
  {
    title: $t('sys.onlineForm.formIdent'),
    key: 'serial_no_',
    dataIndex: 'serial_no_',
    ellipsis: true,
  },
  {
    title: $t('sys.onlineForm.formName'),
    key: 'form_tmpl_name_',
    dataIndex: 'form_tmpl_name_',
    ellipsis: true,
  },
  {
    title: $t('sys.edhr.formStatus'),
    key: 'instance_status_',
    ellipsis: true,
    dataIndex: 'instance_status_',
  },
];

const Records_Cols = [
  {
    title: $t('sys.onlineForm.formIdent'),
    key: 'serial_no_',
    dataIndex: 'serial_no_',
    ellipsis: true,
  },
  {
    title: $t('sys.onlineForm.remarkName'),
    key: 'form_inst_name_',
    ellipsis: true,
    dataIndex: 'form_inst_name_',
  },
  {
    title: $t('sys.createTime'),
    key: 'form_create_time_',
    ellipsis: true,
    dataIndex: 'form_create_time_',
  },
  {
    title: $t('sys.updateTime'),
    key: 'form_modify_time_',
    ellipsis: true,
    dataIndex: 'form_modify_time_',
  },
  {
    title: $t('sys.updatePerson'),
    key: 'form_modify_user_name',
    ellipsis: true,
    dataIndex: 'form_modify_user_name',
  },
  {
    title: $t('sys.edhr.formStatus'),
    key: 'instance_status_',
    ellipsis: true,
    dataIndex: 'instance_status_',
  },
];

const Relate_Cols = [
  {
    title: $t('sys.edhr.relateMaterialNo'),
    key: 'materialNo',
    dataIndex: 'materialNo',
    width: 120,
    ellipsis: true,
    resizable: true,
  },
  {
    title: $t('sys.edhr.mfgOrderCode'),
    key: 'mfgOrderCode',
    dataIndex: 'mfgOrderCode',
    width: 120,
    ellipsis: true,
    resizable: true,
  },
  {
    title: $t('sys.edhr.productCode'),
    key: 'productCode',
    dataIndex: 'productCode',
    width: 100,
    ellipsis: true,
    resizable: true,
  },
  {
    title: $t('sys.edhr.productName'),
    key: 'productName',
    dataIndex: 'productName',
    width: 120,
    ellipsis: true,
    resizable: true,
  },
  {
    title: $t('sys.edhr.spec'),
    key: 'spec',
    dataIndex: 'spec',
    width: 90,
    ellipsis: true,
    resizable: true,
  },
  {
    title: $t('sys.edhr.name'),
    key: 'tmplName',
    dataIndex: 'tmplName',
    width: 120,
    ellipsis: true,
    resizable: true,
  },
  {
    title: $t('sys.statusOfSth', { sth: 'DHR' }),
    key: 'instanceStatus',
    dataIndex: 'instanceStatus',
    width: 90,
    ellipsis: true,
    resizable: true,
  },
];

const Deleted_Cols = [
  {
    title: $t('sys.onlineForm.remarkName'),
    key: 'form_inst_name_',
    ellipsis: true,
    dataIndex: 'form_inst_name_',
  },
  {
    title: $t('sys.onlineForm.formIdent'),
    key: 'serial_no_',
    dataIndex: 'serial_no_',
    ellipsis: true,
  },
  {
    title: $t('sys.onlineForm.formName'),
    key: 'form_tmpl_name_',
    dataIndex: 'form_tmpl_name_',
    ellipsis: true,
  },
  {
    title: $t('sys.createTime'),
    key: 'form_create_time_',
    ellipsis: true,
    dataIndex: 'form_create_time_',
  },
  {
    title: $t('sys.updateTime'),
    key: 'form_modify_time_',
    ellipsis: true,
    dataIndex: 'form_modify_time_',
  },
  {
    title: $t('sys.updatePerson'),
    key: 'form_modify_user_name',
    ellipsis: true,
    dataIndex: 'form_modify_user_name',
  },
  {
    title: $t('sys.edhr.formStatus'),
    key: 'instance_status_',
    ellipsis: true,
    dataIndex: 'instance_status_',
  },
];

export enum Fixed_Btns_Keys {
  'Appendix' = 'appendix',
  'Txn' = 'txn',
  'Records' = 'records',
  'Relate' = 'relate',
  'Deleted' = 'deleted',
  'Rework' = 'rework',
}

export const Fixed_Btns = [
  {
    icon: 'icon-fulu',
    name: $t('sys.edhr.appendix'),
    key: Fixed_Btns_Keys.Appendix,
    columns: Appendix_Cols,
  },
  {
    icon: 'icon-shiwubiaodan',
    name: $t('sys.edhr.materialStatus.TXN'),
    key: Fixed_Btns_Keys.Txn,
    columns: Txn_Cols,
  },
  {
    icon: 'icon-fangongbiaodan',
    name: $t('sys.edhr.materialStatus.REWORK'),
    key: Fixed_Btns_Keys.Rework,
    columns: Rework_Cols,
  },
  {
    icon: 'icon-jiluben',
    name: $t('sys.edhr.materialStatus.NOTEBOOK'),
    key: Fixed_Btns_Keys.Records,
    columns: Records_Cols,
  },
  {
    icon: 'icon-guanlianDHR',
    name: $t('sys.onlineForm.bindEdhrLabel2'),
    key: Fixed_Btns_Keys.Relate,
    columns: Relate_Cols,
  },
  {
    icon: 'icon-huishouzhan1',
    name: $t('sys.recycleBin'),
    key: Fixed_Btns_Keys.Deleted,
    columns: Deleted_Cols,
  },
];

export const processBtnGroup = [
  {
    type: ButtonTypeEnum.Return,
    title: $t('sys.bpmn.button.Return'),
    api: postDhrProcessReturn,
  },
  {
    type: ButtonTypeEnum.Reassign,
    title: $t('sys.bpmn.button.Reassign'),
    style: {
      type: 'primary',
    },
    api: postDhrProcessReassign,
  },
  {
    type: ButtonTypeEnum.Approve,
    title: $t('sys.bpmn.button.Approve'),
    style: {
      type: 'primary',
    },
    api: postDhrProcessApprove,
  },
];

export const DataStatistics = [
  {
    title: $t('sys.edhr.formTotalQty'),
    total: 0,
    icon: 'icon-biaodanzongshuliang',
    bgColor: '#6B75FF',
    type: 'TOTAL',
    list: [],
    expandedIds: [],
  },
  {
    title: $t('sys.edhr.abnormalFormQty'),
    total: 0,
    icon: 'icon-yichangbiaodanshuliang',
    bgColor: '#F84E92',
    type: 'EXCEPTION',
    list: [],
    expandedIds: [],
    tips: $t('sys.edhr.abnormalFormTips'),
  },
  {
    title: $t('sys.edhr.attachmentQty'),
    total: 0,
    icon: 'icon-fujianshuliang',
    bgColor: '#247BFF',
    type: 'ATTACHMENT',
    list: [],
    expandedIds: [],
  },
  {
    title: $t('sys.edhr.notebookFormQty'),
    total: 0,
    icon: 'icon-jilubenbiaodanshuliang',
    bgColor: '#45D192',
    type: 'NOTEBOOK',
    list: [],
    expandedIds: [],
  },
];
