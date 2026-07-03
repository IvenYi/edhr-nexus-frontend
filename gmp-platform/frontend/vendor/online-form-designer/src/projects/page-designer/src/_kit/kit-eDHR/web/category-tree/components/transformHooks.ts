import { operateSysEnums } from '/@page-designer/enum';
import { provide } from 'vue';
import { message as Message } from 'ant-design-vue';

export const useTableEvents = ({ Event, deleteDataByids, model }) => {
  /**注入的方法给按钮组件使用使用 */
  provide('tableEvent', {
    async delete(row) {
      const { id_ } = row;
      await deleteById(id_);
    },
    async edit(row, widget) {
      const { refModal, refForm } = widget.props;
      const title = widget.props?.syncBtnNameToModal ? widget.props?.title : '';
      return new Promise((res, rej) => {
        Event.context.$getModal(refModal).open({
          data: operateSysEnums.EDIT,
          title,
          async onOpen(ctx) {
            const form = await ctx.$asyncRef(refForm);
            form.setValue(row);
          },
          onClose(arg) {
            res(arg);
          },
        });
      });
    },
    async openDetails(row, widget) {
      const { refModal, refForm } = widget.props;
      const title = widget.props?.syncBtnNameToModal ? widget.props?.title : '';
      return new Promise((res, rej) => {
        Event.context.$getModal(refModal).open({
          data: operateSysEnums.DETAILS,
          title,
          async onOpen(ctx) {
            const form = await ctx.$asyncRef(refForm);
            ctx.$setPropsByKey(refForm, { readonly: true });
            form.setValue(row);
          },
          onClose(arg) {
            res(arg);
          },
        });
      });
    },
    async modelingTraceability(row, widget) {
      /**建模追溯*/
      Event.context.$modelingTraceability({ id: row.id_, modelKey: model }).open();
    },
  });
  /**
   * 删除选中行根据Id
   */
  async function deleteById(id) {
    await deleteDataByids([id]);
    Message.success($t('sys.delSuccess'));
  }
};
