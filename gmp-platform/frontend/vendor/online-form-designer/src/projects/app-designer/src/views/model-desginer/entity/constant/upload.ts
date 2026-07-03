/**
 * 支持上传的类型
 */
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
}

export const uploadType = {
  image: [
    {
      type: UploadTypeEnum.JPG,
    },
    {
      type: UploadTypeEnum.JPEG,
    },
    {
      type: UploadTypeEnum.PNG,
    },
    {
      type: UploadTypeEnum.BMP,
    },
  ],
  attachment: [
    {
      type: UploadTypeEnum.PDF,
    },
    {
      type: UploadTypeEnum.XLSX,
    },
    {
      type: UploadTypeEnum.DOC,
    },
    {
      type: UploadTypeEnum.MP4,
    },
  ],
  esop: [
    {
      type: UploadTypeEnum.JPG,
    },
    {
      type: UploadTypeEnum.JPEG,
    },
    {
      type: UploadTypeEnum.PNG,
    },
    {
      type: UploadTypeEnum.PDF,
    },
    {
      type: UploadTypeEnum.MP4,
    },
  ],
};
