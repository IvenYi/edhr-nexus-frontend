import { BasicColumn } from '/@/components/Table/src/types/table';
import { useI18n } from '/@/hooks/web/useI18n';
import { UserServiceTypeOptionsMap } from '/@app-designer/constant';

const { t } = useI18n();
export const viewFieldColumns: BasicColumn[] = [
  {
    title: t('sys.index'),
    dataIndex: 'index',
    width: 72,
    fixed: 'left',
  },
  {
    title: t('sys.pageDesigner.fieldTitle'),
    dataIndex: 'name',
    fixed: 'left',
  },
  {
    title: t('sys.model.viewFieldKey'),
    dataIndex: 'key',
  },
  {
    title: t('sys.pageDesigner.fieldType'),
    dataIndex: 'type',
  },
  {
    title: t('sys.pageDesigner.model'),
    dataIndex: 'bindInfo',
  },
  {
    title: t('sys.model.viewOriginFieldName'),
    dataIndex: 'originFieldName',
  },
  {
    title: t('sys.model.viewOriginFieldKey'),
    dataIndex: 'originFieldKey',
  },
  {
    title: t('sys.model.viewOriginModelName'),
    dataIndex: 'originModelName',
  },
  {
    title: t('sys.model.viewOriginModelKey'),
    dataIndex: 'originModelKey',
  },
  {
    title: t('sys.createUser'),
    dataIndex: 'createUserName',
  },
  {
    title: t('sys.createTime'),
    dataIndex: 'createTime',
    minWidth: 170,
    width: 170,
  },
  {
    title: t('sys.modifier'),
    dataIndex: 'modifyUserName',
  },
  {
    title: t('sys.modifyTime'),
    dataIndex: 'modifyTime',
    minWidth: 170,
    width: 170,
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'left',
    fixed: 'right',
  },
];

export const viewBusinessServiceColumns: BasicColumn[] = [
  {
    title: t('sys.model.viewBsName'),
    dataIndex: 'name',
  },
  {
    title: t('sys.model.viewBsKey'),
    dataIndex: 'key',
  },
  {
    title: t('sys.model.viewBsMethod'),
    dataIndex: 'method',
  },
  {
    title: t('sys.model.viewBsType'),
    dataIndex: 'type',
    customRender: ({ record }) => {
      const i18nKey = UserServiceTypeOptionsMap[record.type]?.label;
      return i18nKey ? t(i18nKey) : record.type;
    },
  },
  {
    title: t('sys.model.viewBsDesc'),
    dataIndex: 'description',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'left',
    fixed: 'right',
  },
];

export const viewFunctionColumns: BasicColumn[] = [
  {
    title: t('sys.appDesigner.globalMethodName'),
    dataIndex: 'name',
  },
  {
    title: `${t('sys.model.functionMenu')}KEY`,
    dataIndex: 'key',
  },
  {
    title: t('sys.type'),
    dataIndex: 'type',
    customRender: ({ record }) => {
      const i18nKey = UserServiceTypeOptionsMap[record.type]?.label;
      return i18nKey ? t(i18nKey) : record.type;
    },
  },
  {
    title: t('sys.description'),
    dataIndex: 'description',
  },
  {
    title: t('sys.operation'),
    dataIndex: 'action',
    width: 150,
    align: 'left',
    fixed: 'right',
  },
];

export const dataTemplateColumns: BasicColumn[] = [
  {
    dataIndex: 'index',
    title: t('sys.index'),
    width: 72,
  },
  {
    dataIndex: 'name',
    title: '模板名称',
    align: 'left',
  },
  {
    dataIndex: 'key',
    title: '模板KEY',
    align: 'left',
  },
  {
    dataIndex: 'type',
    title: '模板类型',
    align: 'left',
  },
  {
    dataIndex: 'createUserName',
    title: t('sys.createUser'),
    align: 'left',
  },
  {
    dataIndex: 'createTime',
    title: t('sys.createTime'),
    align: 'left',
    minWidth: 170,
    width: 170,
  },
  {
    dataIndex: 'modifyUserName',
    title: t('sys.modifier'),
    align: 'left',
  },
  {
    dataIndex: 'modifyTime',
    title: t('sys.modifyTime'),
    align: 'left',
    minWidth: 170,
    width: 170,
  },
  {
    dataIndex: 'actions',
    title: t('sys.operation'),
    align: 'left',
    fixed: 'right',
    width: 130,
  },
];
