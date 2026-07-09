import { App } from 'vue';
import UploadFile from './upload-file';
import UploadImage from './upload-image';
import UserSignature from './user-signature';

export default {
  install(app: App) {
    app.use(UploadFile);
    app.use(UploadImage);
    app.use(UserSignature);
  }
}
