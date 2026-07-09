import { FormComponents } from '/@page-designer/enum';
import { SUB_TABLE_OPE_EVENT_TYPE } from '/@page-designer/enum';

const buttonOption = {
  [SUB_TABLE_OPE_EVENT_TYPE.COPY]: FormComponents.SubTableCopyBtn,
  [SUB_TABLE_OPE_EVENT_TYPE.DELETE]: FormComponents.SubTableDeleteBtn,
  [SUB_TABLE_OPE_EVENT_TYPE.EDIT]: FormComponents.SubTableEditBtn,
};

export const transformButtons = (options = []) => {
  options.forEach((i: any) => {
    if (i.props.innerEvent) {
      i.type = buttonOption[i.props.sysMethedType] || FormComponents.CustomButton;
    } else {
      i.type = FormComponents.CustomButton;
    }
    i.parentComponent = FormComponents.SubTable;
  });
};
