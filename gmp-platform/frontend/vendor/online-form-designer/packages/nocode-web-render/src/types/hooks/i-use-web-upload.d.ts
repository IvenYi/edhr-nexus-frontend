export interface IUploadParams {
  type: 'image' | 'file';
  modelKey?: string;
}

type UploadFunction = (file: any, opts?: IUploadParams) => Promise<string> | string | void;

type TransferFunction = (filename: string) => string;

export interface IWebUploadApis {
  upload: UploadFunction | null;
  transfer: TransferFunction | null;
}
