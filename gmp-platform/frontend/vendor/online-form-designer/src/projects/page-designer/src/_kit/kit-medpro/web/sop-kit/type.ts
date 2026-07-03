import type { TableColumnsType } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';

const { t } = useI18n();

export const columns: TableColumnsType = [
  {
    title: t('sys.pageDesigner.index'),
    dataIndex: 'index',
    key: 'index',
    width: 62,
  },
  {
    title: t('sys.kit.product'),
    dataIndex: 'product',
    key: 'product',
    ellipsis: true,
  },
  {
    title: t('sys.workflow.spec'),
    dataIndex: 'spec',
    key: 'spec',
    ellipsis: true,
  },
  {
    title: t('sys.kit.device'),
    dataIndex: 'device',
    key: 'device',
    ellipsis: true,
  },
  {
    title: t('sys.kit.sopFile'),
    dataIndex: 'sopDocument',
    key: 'sopDocument',
  },
];

export interface fileType {
  name: string;
  path: string;
  size: number;
}

export const switchIcons = [
  {
    icon: 'icon-liebiaozhanshi',
    name: 'List',
    key: 'switch_icon_list',
  },
  {
    icon: 'icon-kapianzhanshi',
    name: 'Card',
    key: 'switch_icon_card',
  },
];

export const fileParser = (file) => {
  const fileList = file ? file.split(',') : [];
  return fileList.map((i) => ({
    path: import.meta.env.VITE_MINIO_PATH + i,
    name: i.split('/').at(-1),
  }));
};
