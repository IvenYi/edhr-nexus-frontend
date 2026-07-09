import { GctNative } from '@native/index';
import { Uploader } from './Uploader';
export default {
  Uploader,
  async openScan() {
    return new Promise((res, rej) => {
      GctNative.CAMERA.scanCode({
        success(arg) {
          res(arg.result);
        },
        fail() {
          rej();
        },
      });
    });
  },
};
