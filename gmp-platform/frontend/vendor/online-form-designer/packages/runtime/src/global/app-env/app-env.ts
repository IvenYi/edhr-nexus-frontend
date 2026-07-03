import { IAppEnv } from '../../interface';

export class AppEnv implements IAppEnv {
  get MINIO_PATH(): string {
    const serverAddress = window.sessionStorage.getItem('APP_SERVER') || '';
    return `${serverAddress || window.location.origin}/minio/`;
  }
}
