import { FormComponents } from '/@page-designer/enum';
import { operateSysEnums } from '/@page-designer/enum';

const buttonOption = {
  [operateSysEnums.COPY]: FormComponents.SubTableCopyBtn,
  [operateSysEnums.COLUMNDELETE]: FormComponents.SubTableDeleteBtn,
  [operateSysEnums.EDIT]: FormComponents.SubTableEditBtn,
  [operateSysEnums.DETAILS]: FormComponents.TableInfoButton,
  [operateSysEnums.USAGEINFORMATION]: FormComponents.UseinfoButton,
  [operateSysEnums.MODELINGTRACEABILITY]: FormComponents.ModelingButton,
  [operateSysEnums.VERSION_COPY]: FormComponents.CopyVersionButton,
  [operateSysEnums.VERSION_CREATE]: FormComponents.CreateVersionButton,
  [operateSysEnums.COLUMNLINK]: FormComponents.TableLinkButton,
};
/**老版本按钮转化 */
export const transformButtons = (options = [], tablewidget = null) => {
  options.forEach((i: any) => {
    if (i.props.innerEvent) {
      i.type = buttonOption[i.props.sysMethedType] || FormComponents.CustomButton;
    } else {
      i.type = FormComponents.CustomButton;
    }
    i.parentComponent = FormComponents.MedProRdoTable;
    if (tablewidget) {
      i.props.model = tablewidget.props.model;
      i.props.modeldata = tablewidget.props.modeldata;
    }
  });
};
