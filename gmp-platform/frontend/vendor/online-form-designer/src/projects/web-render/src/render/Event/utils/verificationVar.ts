import { GLOBAL_VAR_TYPE } from '/@page-designer/enum';
import dayjs from 'dayjs';
const verificationMap = {
  [GLOBAL_VAR_TYPE.DATE]: {
    callback(value) {
      return dayjs(value, ['YYYY-MM-DD', 'YYYY/MM/DD'], true).isValid();
    },
    message: '日期变量格式为YYYY-MM-DD,YYYY/MM/DD',
  },
  [GLOBAL_VAR_TYPE.TIME]: {
    callback(value) {
      return dayjs(value, 'HH:mm:ss', true).isValid();
    },
    message: '时间变量格式HH:mm:ss',
  },
  [GLOBAL_VAR_TYPE.DATETIME]: {
    callback(value) {
      return dayjs(value, ['YYYY-MM-DD HH:mm:ss', 'YYYY/MM/DD HH:mm:ss']).isValid();
    },
    message: '日期时间变量格式为YYYY-MM-DD HH:mm:ss,YYYY/MM/DD HH:mm:ss',
  },
};

export function verificationData(value, type) {
  if (type === GLOBAL_VAR_TYPE.NULL) {
    return true;
  }
  const { callback, message } = verificationMap[type] || {
    callback(value) {
      return Object.prototype.toString.call(value).slice(8, -1).toLowerCase() === type;
    },
    value: '变量值必须为' + type,
  };
  if (callback(value)) {
    return Promise.resolve();
  } else {
    return Promise.reject(message);
  }
}
