import { defineComponent, h, ref } from 'vue';

const EmptyComponent = defineComponent({
  name: 'HostedNocodeBaseEmptyComponent',
  setup(_props, { slots }) {
    return () => slots.default?.() ?? h('span');
  },
});

export const PlatformEnum = {
  INTEGRATION_PAAS_DP: 'INTEGRATION_PAAS_DP',
  INTEGRATION_PAAS_SI: 'INTEGRATION_PAAS_SI',
  INTEGRATION_PAAS_EBR: 'INTEGRATION_PAAS_EBR',
};

export const FormTypeEnum = {
  VIEW: 'VIEW',
  TEXT: 'TEXT',
  BASE: 'BASE',
  PROCESS: 'PROCESS',
  FILE: 'FILE',
};

export const RenderModeEnum = {
  EDIT: 'EDIT',
  VIEW: 'VIEW',
  PRINT: 'PRINT',
  DESIGN: 'DESIGN',
};

export const PageSizeEnum = { A3: 'A3', A4: 'A4', A5: 'A5', CUSTOM: 'CUSTOM' };
export const ChangeType = { CREATE: 'CREATE', UPDATE: 'UPDATE', DELETE: 'DELETE' };
export const InstanceStatusValues = { DISABLE: 'DISABLE', ENABLE: 'ENABLE', RUNNING: 'RUNNING' };
export const EBR_PROVIDE_ENUM = { EBR_CONTEXT: 'EBR_CONTEXT' };
export const EbrWikiLayout = { TREE: 'TREE', CATALOG: 'CATALOG' };
export const OfficeTypeEnum = { WORD: 'WORD', EXCEL: 'EXCEL', PDF: 'PDF' };
export const MaterialStatusEnum = { NORMAL: 'NORMAL', ABNORMAL: 'ABNORMAL' };
export const BuiltinAction = {};
export const BasicAction = {};
export const SignatureTypeEnum = { PASSWORD: 'PASSWORD', HANDWRITE: 'HANDWRITE' };
export const MobileFillTypeEnum = {};
export const TimeDiffFormat = {};
export const PaperWidgeType = {
  Text: 'text',
  Image: 'image',
  Barcode: 'barcode',
  Qrcode: 'qrcode',
  Pagination: 'pagination',
  Watermark: 'watermark',
  Diagonal: 'diagonal',
  RangeLimit: 'rangelimit',
  Line: 'line',
  Serialnumber: 'serialnumber',
  Power: 'power',
  TimeDiff: 'timediff',
};
export const PaginationFormat = { Custom: 'custom' };
export const WidgetImageSizeMode = { Auto: 'auto', Custom: 'custom' };
export const BwipCodeType = {
  Code39: 'code39',
  Code128: 'code128',
  QRCode: 'qrcode',
  GS1DataMatrix: 'gs1datamatrix',
};
export const DiagonalDirection = { Left: 'left', Right: 'right' };
export const LineType = { Solid: 'solid', Dashed: 'dashed', Dotted: 'dotted' };
export const LineDirection = { Horizontal: 'horizontal', Vertical: 'vertical' };
export const PaperWidgeValueType = { Fixed: 'fixed', Field: 'field', Formula: 'formula', Text: 'text', Expression: 'expression' };
export const BooleanShowMode = { Text: 'text', Checkbox: 'checkbox' };
export const LabelPosition = { Before: 'before', After: 'after', Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' };
export const Orientation = { Portrait: 'portrait', Landscape: 'landscape', Horizontal: 'horizontal', Vertical: 'vertical' };
export const RangeValidateMode = { None: 'none', Include: 'include', Exclude: 'exclude' };
export const FieldSysVarDefaultValueEnum = {};
export const JoinModelTypeEum = {};
export const ImageDisplayModeEnum = { ADAPTIVE: 'ADAPTIVE', ORIGINAL: 'ORIGINAL', CUSTOM: 'CUSTOM' };
export const ComponentTypeEnum = {};
export const CellType = { Default: 'Default', Widget: 'Widget', Field: 'Field' };
export const BindCmpStyleEnum = {};
export const DecimalDisplayMode = {};
export const DateFormat = {};
export const NCB_PROVIDE = {};
export const CellWidgetViewState = { Readonly: 'readonly', Disabled: 'disabled', Auto: 'auto' };
export const EmptySymbol = {
  '/': '/',
  '--': '--',
  '——': '——',
  NA: 'NA',
  'N/A': 'N/A',
  empty: 'empty',
  none: 'none',
};
export const ASSIGNMENTSTRATEGY_ENUM = { alwaysCover: 'alwaysCover' };
export const Dependency_ENUM = { READONLY: 'READONLY', REQUIRED: 'REQUIRED', DISABLED: 'DISABLED', ASSIGNMENT: 'ASSIGNMENT' };
export const ButtonTypeEnum = {};
export const CardControlEnum = {};
export const CategoryModuleEnum = {};
export const DocumentLayout = {};
export const DocumentPaper = {};
export const DocumentQuickFillin = {};
export const DocumentSubTableAction = {};
export const EntityModelCategoryEnum = {};
export const ExpressionModeEnum = {};
export const ExpressionTabEnum = {};
export const FileModeEnum = {};
export const FillingTypeEnum = {};
export const FormVersionAction = {};
export const FormVersionActionMap = {};
export const FormVersionActions = {};
export const FormVersionParentActions = {};
export const PrintModeEnum = {};
export const PrintModeEnums = {};
export const ReturnTypeEnum = {};
export const SignMode = {};
export const SignShowTypeEnum = {};
export const SignatureNumberTypeEnum = {};
export const SignatureTimeTypeEnum = {};
export const SummaryApproveHisTypeEnum = {};
export const TransactionMode = {};
export const ViewTypeEnum = {};

export const commonUtils = {
  transformTreeData: (data: unknown) => data,
  getTreeDataByList: (data: unknown) => data,
};

export const sqlUtils = {};
export const renderUtils = {};
export const refUtils = {};
export const transformUtils = {};

export const EdhrNewWikiTree = EmptyComponent;
export const MobileSingleFormFillModal = EmptyComponent;

export function useNocodeEmitter() {
  return {
    emit: () => undefined,
    on: () => undefined,
    off: () => undefined,
  };
}

export function useWidgetStaticAttrs() {
  return {};
}

export function useNocodeFormWidget() {
  return {
    widgetRef: ref(),
    fieldWidget: ref({ props: {} }),
    attrs: {},
  };
}

export function useOnlineFormActionButton() {
  return {};
}

export function useOnlineFormTransformField2Component() {
  return {};
}

export function useCurrentPageFormState() {
  return {
    currentPageFormState: ref({}),
  };
}

export function useDependency(_widget?: unknown, props: Record<string, any> = {}) {
  return {
    fieldWidget: ref(props.widget ?? { props: {} }),
    value: ref(undefined),
  };
}

export function useCalculateFormula() {
  return {
    calculateFormula: () => undefined,
    getParseFormulaVarInfos: () => [],
    getMergeParseInfos: () => [],
  };
}

export function useFormModel() {
  return {};
}

export function useFormTmplConfig() {
  return {};
}

export function useRenderPageFactory() {
  return {};
}

export function useFormVersion() {
  return {};
}

export function useFormulaExpWatcher() {
  return {};
}

export const DeviceConnector = {};
export const DeviceLink = {};
export const DeviceLinkTmplUtil = {};
export const FormTmplConfigController = class {};
export const FormAnnotationController = class {};
export const FormModelController = class {};
export const NocodeAdapter = class {};
