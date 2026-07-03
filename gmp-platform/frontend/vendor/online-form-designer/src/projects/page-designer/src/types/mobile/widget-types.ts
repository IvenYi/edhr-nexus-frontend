import { LowCodeWidget } from '../widget-basic-types';
import {
  InputProps,
  FormProps,
  DataTableProps,
  ButtonProps,
  SelectProps,
  RadioProps,
  NumberProps,
  DoubleProps,
  MoneyProps,
  DateTimeProps,
  TimeProps,
  DateProps,
  UserProps,
  DeptProps,
  PrinterProps,
  TmplTreeSelectProps,
  SwitchProps,
  QuickSearchProps,
  SearchProps,
  ExportProps,
  UploadFileProps,
  CollapseProps,
  CardListProps,
  CardHeaderLeftProps,
  CardHeaderRightProps,
  CardContentProps,
  TabsProps,
  TabPaneProps,
  GenRadioProps,
  ButtonContainerProps,
  BaseButtonProps,
  CardOpeBtnProps,
  TextProps,
  DescriptionsProps,
  GenSwitchProps,
  GenImageProps,
  DataListProps,
  GridProps,
  GridColProps,
  SignatureProps,
  FormProcessProps,
  ProcessButtonProps,
  approveButtonProps,
  ApprovalHistoryProps,
} from './props-types';
import { FormComponents } from '/@page-designer/enum';

export interface Userpicker extends LowCodeWidget.BasicSchema {
  props: UserProps;
}
export interface Department extends LowCodeWidget.BasicSchema {
  props: DeptProps;
}
export interface Printer extends LowCodeWidget.BasicSchema {
  props: PrinterProps;
}
export interface TmplTreeSelect extends LowCodeWidget.BasicSchema {
  props: TmplTreeSelectProps;
}
export interface Datepicker extends LowCodeWidget.BasicSchema {
  props: DateProps;
}
export interface DateTimepicker extends LowCodeWidget.BasicSchema {
  props: DateTimeProps;
}
export interface Timepicker extends LowCodeWidget.BasicSchema {
  props: TimeProps;
}

export interface InputNumber extends LowCodeWidget.BasicSchema {
  props: NumberProps;
}

export interface InputDouble extends LowCodeWidget.BasicSchema {
  props: DoubleProps;
}

export interface InputMoney extends LowCodeWidget.BasicSchema {
  props: MoneyProps;
}
export interface Checkbox extends LowCodeWidget.BasicSchema {
  props: RadioProps;
}
export interface Radio extends LowCodeWidget.BasicSchema {
  props: RadioProps;
}

export interface Select extends LowCodeWidget.BasicSchema {
  props: SelectProps;
}

export interface Signature extends LowCodeWidget.BasicSchema {
  props: SignatureProps;
}

export interface Textarea extends LowCodeWidget.BasicSchema {
  props: InputProps;
}
export interface Switch extends LowCodeWidget.BasicSchema {
  props: SwitchProps;
}
export interface Input extends LowCodeWidget.BasicSchema {
  props: InputProps;
}
export interface Form extends LowCodeWidget.BasicSchema {
  props: FormProps;
}
export interface FormProcess extends LowCodeWidget.BasicSchema {
  props: FormProcessProps;
}

export interface ApprovalHistory extends LowCodeWidget.BasicSchema {
  props: ApprovalHistoryProps;
}
export interface Descriptions extends LowCodeWidget.BasicSchema {
  props: DescriptionsProps;
}
export interface QuickSearch extends LowCodeWidget.BasicSchema {
  props: QuickSearchProps;
}

export interface Search extends LowCodeWidget.BasicSchema {
  props: SearchProps;
}

export interface DataTable extends LowCodeWidget.BasicSchema {
  props: Required<DataTableProps>;
}
export interface Button extends LowCodeWidget.BasicSchema {
  props: ButtonProps;
}
export interface ExportButton extends LowCodeWidget.BasicSchema {
  props: ExportProps;
}
export interface UploadFile extends LowCodeWidget.BasicSchema {
  props: UploadFileProps;
}
export interface Collapse extends LowCodeWidget.BasicSchema {
  props: CollapseProps;
}
export interface CardList extends LowCodeWidget.BasicSchema {
  props: CardListProps;
  children: CardHeaderLeft[] | CardHeaderRight[] | CardContent[] | CardOpeBtn[];
}
export interface CardHeaderLeft extends LowCodeWidget.BasicSchema {
  props: CardHeaderLeftProps;
}
export interface CardHeaderRight extends LowCodeWidget.BasicSchema {
  props: CardHeaderRightProps;
}
export interface CardContent extends LowCodeWidget.BasicSchema {
  props: CardContentProps;
}
export interface CardOpeBtn extends LowCodeWidget.BasicSchema {
  props: CardOpeBtnProps;
}
export interface BaseButton extends LowCodeWidget.BasicSchema {
  props: BaseButtonProps;
}
export interface ProcessButton extends LowCodeWidget.BasicSchema {
  props: ProcessButtonProps;
}
export interface approveButton extends LowCodeWidget.BasicSchema {
  props: approveButtonProps;
}
export interface tabPane extends LowCodeWidget.BasicSchema {
  props: TabPaneProps;
}
export interface Tabs extends LowCodeWidget.BasicSchema {
  props: TabsProps;
  children: tabPane[];
}

export interface GenCheckbox extends LowCodeWidget.BasicSchema {
  props: GenRadioProps;
}
export interface GenRadio extends LowCodeWidget.BasicSchema {
  props: GenRadioProps;
}

export interface GenSwitch extends LowCodeWidget.BasicSchema {
  props: GenSwitchProps;
}

export interface ButtonContainer extends LowCodeWidget.BasicSchema {
  props: ButtonContainerProps;
  children: Button[];
}

export interface BottomButtonContainer extends LowCodeWidget.BasicSchema {
  props: ButtonContainerProps;
  children: Button[];
}

export interface Text extends LowCodeWidget.BasicSchema {
  props: TextProps;
}

export interface GenImage extends LowCodeWidget.BasicSchema {
  props: GenImageProps;
}

export interface DataList extends LowCodeWidget.BasicSchema {
  props: DataListProps;
}

export interface Grid extends LowCodeWidget.BasicSchema {
  props: GridProps;
  children: GridCol[];
}
export interface GridCol extends LowCodeWidget.BasicSchema {
  props: GridColProps;
}

export interface Mapping {
  [FormComponents.SubmitButton]: Button;
  [FormComponents.ResetButton]: Button;
  [FormComponents.Checkbox]: Checkbox;
  [FormComponents.DataTable]: DataTable;
  [FormComponents.DataVTable]: DataTable;
  [FormComponents.DateTimepicker]: DateTimepicker;
  [FormComponents.Datepicker]: Datepicker;
  [FormComponents.Department]: Department;
  [FormComponents.Form]: Form;
  [FormComponents.Input]: Input;
  [FormComponents.Inputnumber]: InputNumber;
  [FormComponents.InputDouble]: InputDouble;
  [FormComponents.Inputmoney]: InputMoney;
  [FormComponents.Radio]: Radio;
  [FormComponents.QuickSearch]: QuickSearch;
  [FormComponents.Search]: Search;
  [FormComponents.Select]: Select;
  [FormComponents.Userpicker]: Userpicker;
  [FormComponents.Timepicker]: Timepicker;
  [FormComponents.Textarea]: Textarea;
  [FormComponents.Collapse]: Collapse;
  [FormComponents.TabPane]: tabPane;
  [FormComponents.GenCheckbox]: GenCheckbox;
  [FormComponents.GenRadio]: GenRadio;
  [FormComponents.ButtonContainer]: ButtonContainer;
  [FormComponents.BottomButtonContainer]: BottomButtonContainer;
  [FormComponents.Text]: Text;
  [FormComponents.GenImage]: GenImage;
  [FormComponents.DataList]: DataList;
}
