import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';
import { ColumnsType } from 'ant-design-vue/es/table/Table.d';
import { useRootSetting } from '/@/hooks/setting/useRootSetting';

const { t } = useI18n();
const { getSecurityConfig } = useRootSetting();
export const columns: BasicColumn[] = [
  {
    title: t('sys.index'),
    dataIndex: 'no',
    fixed: 'left',
    width: 50,
  },
  {
    title: t('sys.fullname'),
    dataIndex: 'fullname',
    fixed: 'left',
  },
  {
    title: t('sys.userName'),
    dataIndex: 'username',
  },
  {
    title: t('sys.mobile'),
    dataIndex: 'mobile',
  },
  {
    title: t('sys.affTenant'),
    dataIndex: 'tenantNames',
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
    width: getSecurityConfig.value.enableSignPassword == 1 ? 255 : 150,
    align: 'left',
    fixed: 'right',
  },
];

export const tenantInfoColumn: ColumnsType<any> = [
  {
    title: t('sys.org.soTenant'),
    dataIndex: 'name',
  },
  {
    title: t('sys.status'),
    dataIndex: 'enabled',
  },
  {
    title: t('sys.org.soDepartment'),
    dataIndex: 'orgNames',
  },
  {
    title: t('sys.org.duty'),
    dataIndex: 'duty',
  },
  {
    title: t('sys.org.manager'),
    dataIndex: 'managerName',
  },
];
