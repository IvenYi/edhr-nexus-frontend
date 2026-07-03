export type UploadType = 'file' | 'image';

export interface IUploadParams {
  maxCount: number;
  acceptList: string[];
  maxSize: number;
  success: Function;
  error: Function;
}

type UploadFunction = (uploadType: UploadType, opts: IUploadParams) => void;

type TransferFunction = (filename: string) => string;

export interface IUploadApis {
  upload: UploadFunction | null;
  transfer: TransferFunction | null;
}
