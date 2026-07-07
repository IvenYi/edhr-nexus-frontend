type RequestHandler = (_config?: unknown, _options?: unknown) => Promise<any>;

const emptyRequest: RequestHandler = async () => undefined;

export const defHttp = {
  get: emptyRequest,
  post: emptyRequest,
  put: emptyRequest,
  delete: emptyRequest,
  patch: emptyRequest,
  request: emptyRequest,
  uploadFile: emptyRequest,
  downloadFile: emptyRequest,
};

export function createAxios() {
  return defHttp;
}

export function applyRequestHeaders(config: any) {
  return config;
}

export class VAxios {}

export default defHttp;
