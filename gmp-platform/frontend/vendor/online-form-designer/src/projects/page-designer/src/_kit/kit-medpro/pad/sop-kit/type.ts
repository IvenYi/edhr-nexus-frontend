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
