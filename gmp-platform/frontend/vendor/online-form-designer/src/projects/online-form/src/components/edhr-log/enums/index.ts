export enum LogType {
  CREATE = 'CREATE', // 创建
  FILL_FORM = 'FILL_FORM', // 表单填报
  SUMMARY_SAVE = 'SUMMARY_SAVE', // 汇总保存
  SUMMARY_SUBMIT = 'SUMMARY_SUBMIT', // 汇总提交
  APPROVE = 'APPROVE', // 审核
  RETURN = 'RETURN', // 回退
  REASSIGN = 'REASSIGN', // 转办
  ABANDON = 'ABANDON', // 作废
  BIND = 'BIND', // 表单引用
  ROLL_BACK = 'ROLL_BACK', // 回退
}

export const LogTableColsMap = {
  form: [
    {
      title: $t('sys.onlineForm.formIdent'),
      key: 'serialNo',
      dataIndex: 'serialNo',
      ellipsis: true,
    },
    {
      title: $t('sys.webRender.onlineFormTitle'),
      key: 'formInstName',
      ellipsis: true,
      dataIndex: 'formInstName',
    },
    {
      title: $t('sys.onlineForm.formName'),
      key: 'formTmplName',
      dataIndex: 'formTmplName',
    },
    {
      title: $t('sys.onlineForm.formTmplCode'),
      dataIndex: 'formTmplCode',
      key: 'formTmplCode',
      ellipsis: true,
      width: 150,
    },
    {
      title: $t('sys.appDesigner.operationType'),
      dataIndex: 'operateType',
      key: 'operateType',
      ellipsis: true,
    },
    {
      title: $t('sys.onlineForm.source'),
      dataIndex: 'source',
      key: 'source',
      ellipsis: true,
    },
  ],
  edhr: [
    {
      title: $t('sys.edhr.relateMaterialNo'),
      dataIndex: 'container',
      key: 'container',
      ellipsis: true,
    },

    {
      title: $t('sys.edhr.mfgOrderCode'),
      dataIndex: 'mfgOrder',
      key: 'mfgOrder',
      ellipsis: true,
    },
    {
      title: $t('sys.edhr.productCode'),
      key: 'productCode',
      dataIndex: 'productCode',
      width: 100,
      ellipsis: true,
    },
    {
      title: $t('sys.edhr.productName'),
      key: 'productName',
      dataIndex: 'productName',
      width: 120,
      ellipsis: true,
    },
    {
      title: $t('sys.edhr.spec'),
      key: 'spec',
      dataIndex: 'spec',
      width: 90,
      ellipsis: true,
    },
    {
      title: $t('sys.edhr.name'),
      key: 'dhrName',
      dataIndex: 'dhrName',
      width: 120,
      ellipsis: true,
    },
    {
      title: $t('sys.appDesigner.operationType'),
      key: 'operateType',
      dataIndex: 'operateType',
      width: 120,
      ellipsis: true,
    },
  ],
};
