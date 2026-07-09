import { useI18n } from '/@/hooks/web/useI18n';
import { ColumnsType } from 'ant-design-vue/es/table/Table.d';

const { t } = useI18n();

export const columns: ColumnsType<any> = [
  {
    key: 'name_',
    dataIndex: 'name_',
    title: t('sys.webRender.edhrApplication.projectName'),
    width: 300,
    ellipsis: true,
  },
  {
    key: 'type_',
    dataIndex: 'type_',
    title: t('sys.webRender.edhrApplication.valueFieldType'),
    customRender: ({ text }) => t(`sys.pageDesigner.dynamicFormType.${text}`),
    width: 300,
    ellipsis: true,
  },
  {
    key: 'modify_user_name_',
    dataIndex: 'modify_user_name_',
    title: t('sys.appDesigner.modifier'),
    width: 120,
    ellipsis: true,
  },
  {
    key: 'modify_time_',
    dataIndex: 'modify_time_',
    width: 200,
    title: t('sys.appDesigner.modificationTime'),
    ellipsis: true,
  },
  {
    key: 'action',
    dataIndex: 'action',
    title: t('sys.operation'),
    width: 200,
    align: 'center',
    fixed: 'right',
  },
];

export const icons: { [key: string]: string } = {
  boolean: 'icon-buer',
  decimal: 'icon-jingduxiaoshu1',
  integer: 'icon-zhengshu',
  string: 'icon-danhangwenben',
  user: 'icon-renyuan1',
  org: 'icon-zuzhiquanxian1',
  date: 'icon-riqi1',
  date_time: 'icon-riqishijian',
  image: 'icon-tupian1',
};
