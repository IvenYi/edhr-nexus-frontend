import { genMessage } from '../helper';
import vantLocale from 'vant/es/locale/lang/zh-CN';

const modules = import.meta.glob<true, string, any>('@/locales/lang/zh-CN/**/*.ts', {
  eager: true,
});
export default {
  message: {
    ...genMessage(modules, 'src/locales/lang/zh-CN'),
    vantLocale,
  },
};
