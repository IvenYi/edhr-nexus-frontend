export enum UploadTypeEnum {
  JPG = 'jpg',
  JPEG = 'jpeg',
  PNG = 'png',
  BMP = 'bmp',
  DOCX = 'docx',
  PDF = 'pdf',
  XLSX = 'xlsx',
  DOC = 'doc',
  MP4 = 'mp4',
  AVI = 'avi',
  PPT = 'ppt',
  GIF = 'gif',
}

export interface AttrObjType {
  /** 单个文件大小 */
  maxSize?: number;
  /** 最大上传数量 */
  maxCount?: number;
  /** 支持的格式数组 */
  accept?: string[];
  /** 支持的格式 */
  acceptStr?: string;
}

export enum statusEnum {
  EXCEPTION = 'exception',
  ACTIVE = 'active',
}

export interface fileType {
  name: string;
  path: string;
  size: number;
}

export interface FileItemType {
  uid: string;
  name?: string;
  status?: statusEnum;
  path?: string;
  fileSize?: number;
  percentNum?: number;
}

export const getFileSize = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(blob.size);
        };
        reader.readAsText(blob);
      } else {
        reject(`Error ${xhr.status}: ${xhr.statusText}`);
      }
    };
    xhr.send();
  });
};

export const sizeParser = (size) => {
  if (size / 1000 < 1) return (size / 1000).toFixed(2) + 'K';
  if (size / 1000 / 10 < 1) return (size / 1000).toFixed(1) + 'K';
  if (size / 1000 / 1000 < 1) return (size / 1000).toFixed(0) + 'K';
  if (size / 1000 / 1000 / 10 < 1) return (size / 1000 / 1000).toFixed(1) + 'M';
  return (size / 1000 / 1000).toFixed(0) + 'M';
};

export const typeParser = (fileName) => {
  const arr = fileName.split('.');
  let type = arr[arr.length - 1] || 'png';
  type = type.toLowerCase();
  if (
    [
      UploadTypeEnum.PNG,
      UploadTypeEnum.JPG,
      UploadTypeEnum.JPEG,
      UploadTypeEnum.BMP,
      UploadTypeEnum.GIF,
    ].includes(type)
  )
    return 'img';
  if ([UploadTypeEnum.DOCX, UploadTypeEnum.DOC].includes(type)) return UploadTypeEnum.DOC;
  if ([UploadTypeEnum.MP4, UploadTypeEnum.AVI].includes(type)) return UploadTypeEnum.MP4;
  if (Object.values(UploadTypeEnum).includes(type)) return type;
  return 'attachment';
};
