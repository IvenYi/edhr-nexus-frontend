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
  return fileTypeEnum.IFRAME;
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

export interface ISopDocument {
  id: string;
  name: string;
  file: string;
  type: string;
  url: string;
  pageNumber: number;
}

export interface ISelectedDocument {
  id: string;
  fileType: fileTypeEnum | string;
  sourceUrl: string | object;
  loading: boolean;
}
