import { FormComponents } from '/@page-designer/enum';
import { operateSysEnums } from '/@page-designer/enum';

const buttonOption = {
  [operateSysEnums.COPY]: FormComponents.SubTableCopyBtn,
  [operateSysEnums.COLUMNDELETE]: FormComponents.SubTableDeleteBtn,
  [operateSysEnums.EDIT]: FormComponents.SubTableEditBtn,
  [operateSysEnums.DETAILS]: FormComponents.TableInfoButton,
  [operateSysEnums.LABEL_PRINT]: FormComponents.LabelPrintButton,
  // [operateSysEnums.DOCUMENT_PRINT]: FormComponents.DocumentPrintButton,
  [operateSysEnums.COLUMNLINK]: FormComponents.TableLinkButton,
};
/**老版本按钮转化 */
export const transformButtons = (options = []) => {
  options.forEach((i: any) => {
    if (i.props.innerEvent) {
      i.type = buttonOption[i.props.sysMethedType] || FormComponents.CustomButton;
    } else {
      i.type = FormComponents.CustomButton;
    }
    if (i.type === FormComponents.LabelPrintButton) {
      i.props.refModel = i.props.model;
    }
    if (i.type === FormComponents.DocumentPrintButton) {
      i.props.refModel = i.props.model;
      i.children = i.props.fieldList;
    }
    if (i.type === FormComponents.SubTableCopyBtn) {
      i.props.model = i.props.model;
    }
    i.parentComponent = FormComponents.DataTable;
  });
};
