import { LowCodeModal } from '../modal-types';
import { linkageItem } from '../views';
import { LowCodeWidget } from '../widget-basic-types';
import {
  InputProps,
  UploadFileProps,
  FormProps,
  DescriptionsProps,
  DataTableProps,
  DataListProps,
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
  SwitchProps,
  SearchProps,
  ExportProps,
  ProcessButtonProps,
  LayoutProps,
  GridProps,
  GridColProps,
  ColumnsProps,
  ButtonContainerProps,
  SubTableProps,
  WorkflowNodesProps,
  LabelPrintProps,
  TabsProps,
  RefDataTableProps,
  TabPaneProps,
  ReadonlyCmpProps,
  CustomFieldProps,
  OperateProps,
  OperateButtonProps,
  ColumnTableProps,
  FormulaProps,
  TableSelectProps,
  GenRadioProps,
  GenSwitchProps,
  EsopProps,
  ExpressionProps,
  AggProps,
  treeTableProps,
  BaseButtonProps,
  DynamicTableProps,
  TransactionProps,
  SerialRuleProps,
  SelectSearchProps,
  TextProps,
  CollapseProps,
  SpaceOccupationProps,
  PrinterProps,
  SignatureProps,
  OnlineFormProps,
  TmplTreeSelectProps,
  DocumentPrintProps,
  RangeUserProps,
  GenImageProps,
  IframeProps,
  SubDataTableProps,
  ResetButtonProps,
  FormProcessProps,
  ApprovalHistoryProps,
  FlowDiagramProps,
  approveButtonProps,
  ButtonProcessContainerProps,
  BizProcessProps,
  TableApproveButtonProps,
  CustomCodeProps,
  ApprovalProcessProps,
  DividerProps,
} from './props-types';
import { FormComponents, DisplayEnums } from '/@page-designer/enum';

export interface Userpicker extends LowCodeWidget.BasicSchema {
  props: UserProps;
}

export interface Department extends LowCodeWidget.BasicSchema {
  props: DeptProps;
}

export interface Printer extends LowCodeWidget.BasicSchema {
  props: PrinterProps;
}

export interface Signature extends LowCodeWidget.BasicSchema {
  props: SignatureProps;
}

export interface TmplTreeSelect extends LowCodeWidget.BasicSchema {
  props: TmplTreeSelectProps;
}

export interface OnlineForm extends LowCodeWidget.BasicSchema {
  props: OnlineFormProps;
}

export interface RangeUser extends LowCodeWidget.BasicSchema {
  props: RangeUserProps;
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

export interface Transaction extends LowCodeWidget.BasicSchema {
  props: TransactionProps;
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
export interface FlowDiagram extends LowCodeWidget.BasicSchema {
  props: FlowDiagramProps;
}
export interface Descriptions extends LowCodeWidget.BasicSchema {
  props: DescriptionsProps;
}
export interface Search extends LowCodeWidget.BasicSchema {
  props: SearchProps;
}
export interface RefDataTable extends DataTable {
  props: RefDataTableProps;
}
export interface DataTable extends LowCodeWidget.BasicSchema {
  props: DataTableProps;
  children: [
    OperateTable,
    { alias: string; props: IData; children: (FormulaTable | ColumnTable)[] },
    { alias: string; props: IData; children: OperateButton[] },
    { alias: string; props: IData; children: OperateButton[] },
    SubDataTable,
  ];
}
export interface TreeTable extends LowCodeWidget.BasicSchema {
  props: treeTableProps;
  children: [
    OperateTable,
    { alias: string; props: IData; children: (FormulaTable | ColumnTable)[] },
    { alias: string; props: IData; children: OperateButton[] },
    { alias: string; props: IData; children: OperateButton[] },
  ];
}

export interface TreeTableMobile extends LowCodeWidget.BasicSchema {
  props: treeTableProps;
  children: (FormulaTable | ColumnTable)[];
}
export interface DataTableMobile extends LowCodeWidget.BasicSchema {
  props: DataTableProps;
  children: (FormulaTable | ColumnTable)[];
}
export interface FormulaTable extends LowCodeWidget.BasicSchema {
  props: FormulaProps;
}
export interface OperateTable extends LowCodeWidget.BasicSchema {
  props: OperateProps;
  children: OperateButton[];
}
export interface OperateButton extends LowCodeWidget.BasicSchema {
  props: OperateButtonProps;
}
export interface ColumnTable extends LowCodeWidget.BasicSchema {
  props: ColumnTableProps;
  children?: [LowCodeWidget.SearchSchema];
}
export interface DataList extends LowCodeWidget.BasicSchema {
  props: DataListProps;
}
export interface Button extends LowCodeWidget.BasicSchema {
  /**布局 块级 行内 */
  display: DisplayEnums.INLINE_BLOCK;
  props: ButtonProps;
}

export interface approveButton extends LowCodeWidget.BasicSchema {
  props: approveButtonProps;
}

export interface TableApproveButton extends LowCodeWidget.BasicSchema {
  props: TableApproveButtonProps;
}
export interface ResetButton extends LowCodeWidget.BasicSchema {
  props: ResetButtonProps;
}
export interface BaseButton extends LowCodeWidget.BasicSchema {
  /**布局 块级 行内 */
  display: DisplayEnums.INLINE_BLOCK;
  props: BaseButtonProps;
}
export interface LabelPrintButton extends LowCodeWidget.BasicSchema {
  props: LabelPrintProps;
}
export interface DocumentPrintButton extends LowCodeWidget.BasicSchema {
  props: DocumentPrintProps;
}
export interface ExportButton extends LowCodeWidget.BasicSchema {
  props: ExportProps;
}
export interface ProcessButton extends LowCodeWidget.BasicSchema {
  props: ProcessButtonProps;
}

export interface tabPane extends LowCodeWidget.BasicSchema {
  props: TabPaneProps;
}
export interface Tabs extends LowCodeWidget.BasicSchema {
  props: TabsProps;
  children: tabPane[];
}
export interface LayoutContainer extends LowCodeWidget.BasicSchema {
  display: DisplayEnums.BLOCK;
  props: LayoutProps;
}
export interface ButtonContainer extends LowCodeWidget.BasicSchema {
  props: ButtonContainerProps;
  children: Button[];
}
export interface ButtonProcessContainer extends LowCodeWidget.BasicSchema {
  props: ButtonProcessContainerProps;
  children: approveButton[];
}
export interface Grid extends LowCodeWidget.BasicSchema {
  props: GridProps;
  children: GridCol[];
}
export interface GridCol extends LowCodeWidget.BasicSchema {
  props: GridColProps;
}
export interface LayoutColumns extends LowCodeWidget.BasicSchema {
  props: ColumnsProps;
}
export interface UploadFile extends LowCodeWidget.BasicSchema {
  props: UploadFileProps;
}

export interface SubTable extends LowCodeWidget.BasicSchema {
  props: SubTableProps;
  children: [
    LowCodeModal.Modal,
    OperateTable,
    ButtonContainer,
    { alias: string; children: LowCodeWidget.FieldSchema[] },
  ];
}
export interface DynamicTable extends LowCodeWidget.BasicSchema {
  props: DynamicTableProps;
  children: [
    LowCodeModal.Modal,
    OperateTable,
    ButtonContainer,
    { alias: string; children: LowCodeWidget.FieldSchema[] },
  ];
}
export interface WorkflowNodes extends LowCodeWidget.BasicSchema {
  props: WorkflowNodesProps;
}

export interface ReadonlyCmp extends LowCodeWidget.BasicSchema {
  props: ReadonlyCmpProps;
}

export interface CustomField extends LowCodeWidget.BasicSchema {
  props: CustomFieldProps;
}

export interface TableSelect extends LowCodeWidget.BasicSchema {
  props: TableSelectProps;
  children: [Search, { alias: string; children: LowCodeWidget.FieldSchema[] }, OperateTable];
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

export interface ESOP extends LowCodeWidget.BasicSchema {
  props: EsopProps;
}

export interface Expression extends LowCodeWidget.BasicSchema {
  props: ExpressionProps;
}

export interface Agg extends LowCodeWidget.BasicSchema {
  props: AggProps;
}

export interface SerialRule extends LowCodeWidget.BasicSchema {
  props: SerialRuleProps;
}

export interface SelectSearch extends LowCodeWidget.BasicSchema {
  props: SelectSearchProps;
  children: ColumnTable[];
  linkageField: linkageItem[];
}
export interface Collapse extends LowCodeWidget.BasicSchema {
  props: CollapseProps;
}

export interface SpaceOccupation extends LowCodeWidget.BasicSchema {
  props: SpaceOccupationProps;
}

export interface Divider extends LowCodeWidget.BasicSchema {
  props: DividerProps;
}

export interface Text extends LowCodeWidget.BasicSchema {
  props: TextProps;
}
export interface GenImage extends LowCodeWidget.BasicSchema {
  props: GenImageProps;
}

export interface BottomButtonContainer extends LowCodeWidget.BasicSchema {
  props: ButtonContainerProps;
  children: Button[];
}

export interface Iframe extends LowCodeWidget.BasicSchema {
  props: IframeProps;
}
export interface CustomCode extends LowCodeWidget.BasicSchema {
  props: CustomCodeProps;
}
export interface SubDataTable extends DataTable {
  props: SubDataTableProps;
}

export interface BizProcess extends LowCodeWidget.BasicSchema {
  props: BizProcessProps;
}

export interface ApprovalProcess extends LowCodeWidget.BasicSchema {
  props: ApprovalProcessProps;
}

/**
 * type 和 类型的映射关系
 */
export interface Mapping {
  [FormComponents.SubmitButton]: Button;
  [FormComponents.ResetButton]: ResetButton;
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
  [FormComponents.Search]: Search;
  [FormComponents.Select]: Select;
  [FormComponents.Userpicker]: Userpicker;
  [FormComponents.Timepicker]: Timepicker;
  [FormComponents.Textarea]: Textarea;
  [FormComponents.TabPane]: tabPane;
  [FormComponents.Tabs]: Tabs;
  [FormComponents.DataTableOpe]: OperateTable;
  [FormComponents.OpeButton]: OperateButton;
  [FormComponents.DataTableColumn]: ColumnTable;
  [FormComponents.DataTableFormula]: FormulaTable;
  [FormComponents.ESOP]: ESOP;
  [FormComponents.EXPRESSION]: Expression;
  [FormComponents.AGG]: Agg;
  [FormComponents.ButtonContainer]: ButtonContainer;
  [FormComponents.BottomButtonContainer]: BottomButtonContainer;
  [FormComponents.DataList]: DataList;
  [FormComponents.RdoDataList]: DataList;
  [FormComponents.RdoForm]: Form;
  [FormComponents.MedProRdoForm]: Form;
  [FormComponents.SerialRule]: SerialRule;
  [FormComponents.CustomField]: CustomField;
  [FormComponents.Descriptions]: Descriptions;
  [FormComponents.GenImage]: GenImage;
  [FormComponents.SubDataTable]: SubDataTable;
  [FormComponents.TableSelect]: TableSelect;
  [FormComponents.SubTable]: SubTable;
  [FormComponents.ProcessApproveButton]: approveButton;
  [FormComponents.BizProcess]: BizProcess;
  [FormComponents.FormProcess]: FormProcess;
  [FormComponents.ApprovalProcess]: ApprovalProcess;
}
