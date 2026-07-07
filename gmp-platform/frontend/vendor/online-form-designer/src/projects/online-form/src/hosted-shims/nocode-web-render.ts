type UploadApis = {
  upload?: (file: File, opts?: Record<string, any>) => Promise<string | void>;
  transfer?: (filename: string) => string;
};

const uploadApis: UploadApis = {
  transfer: (filename: string) => filename || '',
};

export enum PrintModeEnum {
  ASYNC = 'async',
  SYNC = 'sync',
}

export enum FileModeEnum {
  ZIP = 'zip',
  UN_ZIP = 'unZip',
}

export function useWebUpload() {
  return {
    upload: async (file: File, opts?: Record<string, any>) => uploadApis.upload?.(file, opts),
    transfer: (filename: string) => uploadApis.transfer?.(filename) || '',
    setUploadApis: (opts: UploadApis) => {
      Object.assign(uploadApis, opts);
    },
  };
}

export function initWebPaasUploadApis() {}

export function useWebAnnotation() {
  return {
    confirm: ({ onOk }: { onOk?: () => void } = {}) => onOk?.(),
    warn: () => {},
    info: () => {},
    openFormAbandonV2Modal: async () => undefined,
    openFormAbandonModal: async () => undefined,
    openFormAbandonMedProModal: async () => undefined,
  };
}

export async function formPrint() {}

export class McWebRender {}

export class MbWebRender {}

export function initWebNocodeAdapter() {}
