import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const userColumns: BasicColumn[] = [
  {
    title: t('sys.fullname'),
    dataIndex: 'fullname',
    width: 150,
    fixed: 'left',
  },
  {
    title: t('sys.userName'),
    dataIndex: 'username',
  },
  {
    title: t('sys.empNo'),
    dataIndex: 'empNo',
    width: 150,
  },
  {
    title: t('sys.mobile'),
    dataIndex: 'mobile',
  },
  {
    title: t('sys.role'),
    dataIndex: 'role',
  },
  {
    title: t('sys.status'),
    // width: 150,
    dataIndex: 'state',
  },
  {
    title: t('sys.Dept'),
    width: 150,
    dataIndex: 'departmentList',
  },
  {
    title: t('sys.org.manager'),
    width: 150,
    dataIndex: 'managerUserName',
  },
  {
    title: t('sys.createTime'),
    dataIndex: 'createTime',
  },
  {
    title: t('sys.createUser'),
    width: 150,
    dataIndex: 'createUserName',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'left',
    fixed: 'right',
  },
];

export const userDepartmentColumns = [
  {
    title: t('sys.model.org'),
    dataIndex: 'orgId',
    width: 250,
  },
  {
    title: t('sys.model.org') + t('sys.name'),
    dataIndex: 'orgName',
    ellipsis: true,
  },
  {
    title: t('sys.principal'),
    dataIndex: 'principal',
    width: 100,
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 200,
    fixed: 'right',
  },
];

export const extendsFields = [
  {
    title: '字段名称',
    dataIndex: 'fieldName',
  },
  {
    title: '所属字段',
    dataIndex: 'relationField',
  },
  {
    title: '是否必填',
    dataIndex: 'required',
  },
];
