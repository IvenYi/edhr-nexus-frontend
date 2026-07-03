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
    title: t('sys.kit.category'),
    dataIndex: 'category',
    key: 'category',
    ellipsis: true,
  },
  {
    title: t('sys.kit.project'),
    dataIndex: 'project',
    key: 'project',
    ellipsis: true,
  },
  {
    title: t('sys.kit.fileCollect'),
    dataIndex: 'documentSetEntries',
    key: 'documentSetEntries',
  },
];

export const fileParser = (file) => {
  const fileList = file ? file.split(',') : [];
  return fileList.map((i) => ({
    path: import.meta.env.VITE_MINIO_PATH + i,
    name: i.split('/').at(-1),
  }));
};

export const getFileType = (fileName) => {
  const arr = fileName.split('.');
  const type = (arr[arr.length - 1] || 'png').toLowerCase();
  if ([UploadTypeEnum.PNG, UploadTypeEnum.JPG, UploadTypeEnum.JPEG].includes(type))
    return fileTypeEnum.PICTURE;
  if ([UploadTypeEnum.PDF].includes(type)) return fileTypeEnum.PDF;
  if ([UploadTypeEnum.MP4].includes(type)) return fileTypeEnum.VIDEO;
};

export enum UploadTypeEnum {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  PDF = 'pdf',
  MP4 = 'mp4',
}

export enum fileTypeEnum {
  PICTURE = 'picture',
  PDF = 'pdf',
  VIDEO = 'video',
  IFRAME = 'iframe',
}
