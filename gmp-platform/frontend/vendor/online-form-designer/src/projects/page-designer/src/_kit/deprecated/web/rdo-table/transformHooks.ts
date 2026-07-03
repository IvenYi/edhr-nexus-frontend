import { provide } from 'vue';
import { message as Message } from 'ant-design-vue';

export const useTableEvents = ({ getDataSource, getParameters }) => {
  /**注入的方法给按钮组件使用使用 */
  provide('tableEvent', {
    getImportParames: () => {
      return {};
    },
    afterImport: async (getChildData) => {
      getDataSource();
    },
    getParameters,
  });
};
