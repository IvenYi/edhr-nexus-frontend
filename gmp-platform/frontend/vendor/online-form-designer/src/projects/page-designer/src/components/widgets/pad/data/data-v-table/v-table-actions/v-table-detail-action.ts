import { operateSysEnums } from '@gct/runtime';
import { VTableBaseAction } from './v-table-base-action';

/**
 * 操作列-详情按钮
 *
 * @export
 * @class VTableDetailAction
 * @extends {VTableBaseAction}
 */
export class VTableDetailAction extends VTableBaseAction {
  protected override async onClick(row: IData, rowIndex?: number): Promise<void> {
    const { refModal, refForm } = this.widget.props;
    const title = this.widget.props?.syncBtnNameToModal ? this.widget.props?.title : '';
    return new Promise((res, rej) => {
      this.event.context.$getModal!(refModal).open({
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
  }
}
