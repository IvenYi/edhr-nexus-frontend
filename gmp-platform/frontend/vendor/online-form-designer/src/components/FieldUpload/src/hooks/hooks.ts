import { UploadTypeEnum } from '../types';

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
  if (size / 1024 < 1) return (size / 1024).toFixed(2) + 'K';
  if (size / 1024 / 10 < 1) return (size / 1024).toFixed(1) + 'K';
  if (size / 1024 / 1024 < 1) return (size / 1024).toFixed(0) + 'K';
  if (size / 1024 / 1024 / 10 < 1) return (size / 1024 / 1024).toFixed(2) + 'M';
  return (size / 1024 / 1024).toFixed(2) + 'M';
};

export const typeParser = (fileName) => {
  const arr = fileName?.split('.') ?? [];
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
  if ([UploadTypeEnum.MP4, UploadTypeEnum.AVI].includes(type)) return 'MP4';
  if (type === UploadTypeEnum.PDF) return 'PDF';
  if (type === UploadTypeEnum.CER) return 'ssl';
  if (Object.values(UploadTypeEnum).includes(type)) return type;
  return 'attachment';
};
