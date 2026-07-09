import { operateSysEnums } from '/@page-designer/enum';
import { provide } from 'vue';

export const useTableEvents = ({ Event }) => {
  /**注入的方法给按钮组件使用使用 */
  provide('tableEvent', {
    async linkPage(row, widget) {
      const { linkPage } = widget.props;
      Event.context.$push!(linkPage, { id: row.id_ });
    },
    async edit(row, widget, rowIndex) {
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
  });
};
