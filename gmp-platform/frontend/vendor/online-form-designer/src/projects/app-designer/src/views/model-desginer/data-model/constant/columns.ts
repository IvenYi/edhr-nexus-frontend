import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';
import { UserServiceTypeOptions, UserServiceTypeOptionsMap } from '/@app-designer/constant';

const { t } = useI18n();
export const dataFieldColumns: BasicColumn[] = [
  {
    title: t('sys.index'),
    dataIndex: 'index',
    width: 70,
    fixed: 'left',
  },
  {
    title: t('sys.pageDesigner.fieldTitle'),
    dataIndex: 'name',
    fixed: 'left',
  },
  {
    title: `${t('sys.field')}KEY`,
    dataIndex: 'key',
  },
  {
    title: t('sys.pageDesigner.fieldType'),
    dataIndex: 'type',
  },
  {
    title: t('sys.component.dataConnection.fieldSource'),
    dataIndex: 'createType',
  },
  {
    title: t('sys.pageDesigner.inputAttr'),
    dataIndex: 'required',
  },
  {
    title: t('sys.pageDesigner.model'),
    dataIndex: 'bindInfo',
  },
  // {
  //   title: t('sys.uniqueConstraint'),
  //   dataIndex: 'uniqueConstraint',
  // },
  {
    title: t('sys.defaultValue'),
    dataIndex: 'defaultValue',
  },
  {
    title: t('sys.description'),
    dataIndex: 'description',
  },
  {
    title: t('sys.createUser'),
    dataIndex: 'createUserName',
  },
  {
    title: t('sys.createTime'),
    dataIndex: 'createTime',
  },
  {
    title: t('sys.modifier'),
    dataIndex: 'modifyUserName',
  },
  {
    title: t('sys.modifyTime'),
    dataIndex: 'modifyTime',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'left',
    fixed: 'right',
  },
];

export const dataModelColumns: BasicColumn[] = [
  {
    title: `${t('sys.model')}KEY`,
    dataIndex: 'originModelKey',
  },
  {
    title: t('sys.model') + t('sys.name'),
    dataIndex: 'originModelName',
  },
  {
    title: t('sys.updatePerson'),
    dataIndex: 'modifyUserName',
  },
  {
    title: t('sys.updateTime'),
    dataIndex: 'modifyTime',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'left',
    fixed: 'right',
  },
];

export const businessServiceColumns: BasicColumn[] = [
  {
    title: '服务名称',
    dataIndex: 'name',
    width: 236,
  },
  {
    title: '服务KEY',
    dataIndex: 'key',
    width: 236,
  },
  {
    title: '服务方式',
    dataIndex: 'method',
    width: 165,
  },
  {
    title: '服务类型',
    dataIndex: 'type',
    width: 123,
    customRender: ({ record }) => {
      const i18nKey = UserServiceTypeOptionsMap[record.type]?.label;
      return i18nKey ? t(i18nKey) : record.type;
    },
  },
  {
    title: '服务描述',
    dataIndex: 'description',
    width: 225,
  },
  {
    title: '操作',
    dataIndex: 'action',
    // key: 'action',
    width: 240,
    align: 'left',
    fixed: 'right',
  },
];

export const triggerColumns: BasicColumn[] = [
  {
    title: t('sys.appDesigner.triggerAbbrName'),
    dataIndex: 'name',
    fixed: 'left',
  },
  {
    title: 'KEY',
    dataIndex: 'key',
  },
  {
    title: t('sys.appDesigner.triggerAbbrType'),
    dataIndex: 'executeType',
  },
  {
    title: t('sys.appDesigner.linkMethod'),
    dataIndex: 'bizServiceKeys',
  },
  {
    title: t('sys.updatePerson'),
    dataIndex: 'modifyUserName',
  },
  {
    title: t('sys.updateTime'),
    dataIndex: 'modifyTime',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    fixed: 'right',
  },
];

export const checkModelColumns: BasicColumn[] = [
  {
    title: t('sys.model.modelFields'),
    dataIndex: 'name',
  },
  {
    title: t('sys.model.assignMethod'),
    dataIndex: 'assignMethod',
  },
  {
    title: t('sys.model.assignment'),
    dataIndex: 'assignment',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 100,
    fixed: 'right',
  },
];
