import { cloneDeep } from 'lodash-es';
import { CreateType, FIELD_TYPE } from '/@online-form/views/designer/enums/local-field';
import type { FieldMetaDTO, OnlineFormTmplResponse } from '/@/apis/gct-apaas/model';

type IModelMetaMap = Record<
  string,
  {
    meta: {
      key?: string;
      name?: string;
      subModel?: number;
    };
    fields: FieldMetaDTO[];
  }
>;

export const LOCAL_FORM_DESIGNER_ID = '__local__';
export const LOCAL_FORM_MODEL_KEY = 'local_form_model';
const LOCAL_FORM_DESIGNER_STORAGE_KEY = 'paas_main_front.local_form_designer.document';
const DEFAULT_ROW_HEIGHT = 30;
const DEFAULT_COL_WIDTH = 75;
const LOCAL_DEFAULT_PAPER = {
  canvasMode: 'sheet',
  padding: {
    t: 10,
    r: 10,
    b: 10,
    l: 10,
  },
  orientation: 'portrait',
  cols: Array(10)
    .fill('')
    .map(() => ({
      width: DEFAULT_COL_WIDTH,
    })),
  rows: Array(20)
    .fill('')
    .map(() => ({
      height: DEFAULT_ROW_HEIGHT,
    })),
  cells: Array(20)
    .fill('')
    .map(() =>
      Array(12)
        .fill('')
        .map(() => ({})),
    ),
  mergedCells: [],
  paperWidgets: [],
};

function createDefaultPaper() {
  return cloneDeep(LOCAL_DEFAULT_PAPER);
}

function normalizePaper(paper?: Record<string, any>) {
  const defaultPaper = createDefaultPaper();
  const nextPaper = {
    ...defaultPaper,
    ...(paper || {}),
  };

  if (!Array.isArray(nextPaper.cols) || nextPaper.cols.length === 0) {
    nextPaper.cols = defaultPaper.cols;
  }
  if (!Array.isArray(nextPaper.rows) || nextPaper.rows.length === 0) {
    nextPaper.rows = defaultPaper.rows;
  }
  if (!Array.isArray(nextPaper.cells) || nextPaper.cells.length === 0) {
    nextPaper.cells = defaultPaper.cells;
  }
  if (!Array.isArray(nextPaper.mergedCells)) {
    nextPaper.mergedCells = [];
  }
  if (!Array.isArray(nextPaper.paperWidgets)) {
    nextPaper.paperWidgets = [];
  }
  if (!Array.isArray(nextPaper.dynamicTables)) {
    nextPaper.dynamicTables = [];
  }
  if (!Array.isArray(nextPaper.fixedTables)) {
    nextPaper.fixedTables = [];
  }
  if (!Array.isArray(nextPaper.dataGroups)) {
    nextPaper.dataGroups = [];
  }
  if (!Array.isArray(nextPaper.dataGroups2D)) {
    nextPaper.dataGroups2D = [];
  }
  if (!nextPaper.padding) {
    nextPaper.padding = defaultPaper.padding;
  }

  const colCount = nextPaper.cols.length;
  nextPaper.cells = nextPaper.cells.map((row) => {
    const nextRow = Array.isArray(row) ? [...row] : [];
    while (nextRow.length < colCount) {
      nextRow.push({});
    }
    return nextRow;
  });
  while (nextPaper.cells.length < nextPaper.rows.length) {
    nextPaper.cells.push(Array(colCount).fill('').map(() => ({})));
  }

  return nextPaper;
}

function normalizeDesignerJson(input?: string) {
  const defaultDesignerJson = JSON.parse(createDefaultDocument().designerJson || '{}');
  let parsed: any = {};
  try {
    parsed = input ? JSON.parse(input) : {};
  } catch (error) {
    console.warn(error);
  }

  const sheets = Array.isArray(parsed.sheets) && parsed.sheets.length > 0
    ? parsed.sheets
    : defaultDesignerJson.sheets;

  return JSON.stringify({
    ...defaultDesignerJson,
    ...parsed,
    mainModelKey: LOCAL_FORM_MODEL_KEY,
    modelMetaMap: parsed.modelMetaMap || defaultDesignerJson.modelMetaMap,
    sheets: sheets.map((sheet, index) => ({
      sheetId: sheet?.sheetId || `local_sheet_${index + 1}`,
      title: sheet?.title || `工作表 ${index + 1}`,
      startIndex: typeof sheet?.startIndex === 'number' ? sheet.startIndex : index,
      runJson: sheet?.runJson,
      paper: {
        ...normalizePaper(sheet?.paper),
        mainModelKey: LOCAL_FORM_MODEL_KEY,
      },
    })),
  });
}

const createLocalField = (type: FIELD_TYPE, key: string, name: string): FieldMetaDTO => ({
  id: `${LOCAL_FORM_MODEL_KEY}_${key}`,
  key,
  name,
  type,
  modelKey: LOCAL_FORM_MODEL_KEY,
  createType: CreateType.USER_DEFINED,
});

const createLocalModelMetaMap = (): IModelMetaMap => ({
  [LOCAL_FORM_MODEL_KEY]: {
    meta: {
      key: LOCAL_FORM_MODEL_KEY,
      name: '本地表单模型',
    },
    fields: [
      createLocalField(FIELD_TYPE.TEXT, 'text_1', '文本'),
      createLocalField(FIELD_TYPE.DATE, 'date_1', '日期'),
      createLocalField(FIELD_TYPE.DOUBLE, 'number_1', '数值'),
    ],
  },
});

function createDefaultDocument(): OnlineFormTmplResponse {
  return {
    id: LOCAL_FORM_DESIGNER_ID,
    name: '本地表单设计',
    version: 'V1',
    default: 1,
    formType: 'BASE',
    edition: 'EASY',
    modelKey: LOCAL_FORM_MODEL_KEY,
    modelName: '本地表单模型',
    designerJson: JSON.stringify({
      mainModelKey: LOCAL_FORM_MODEL_KEY,
      modelMetaMap: createLocalModelMetaMap(),
      sheets: [
        {
          sheetId: 'local_sheet_1',
          title: '工作表 1',
          startIndex: 0,
          paper: {
            ...createDefaultPaper(),
            mainModelKey: LOCAL_FORM_MODEL_KEY,
          },
        },
      ],
    }),
    runtimeJson: '',
    communicationConfig: '',
    formTmplBomList: [],
  };
}

function normalizeLocalDesignerDocument(
  data?: Partial<OnlineFormTmplResponse>,
): OnlineFormTmplResponse {
  const defaultDocument = createDefaultDocument();
  return {
    ...defaultDocument,
    ...cloneDeep(data),
    id: LOCAL_FORM_DESIGNER_ID,
    modelKey: LOCAL_FORM_MODEL_KEY,
    modelName: '本地表单模型',
    designerJson: normalizeDesignerJson(data?.designerJson || defaultDocument.designerJson),
  };
}

function getStoredLocalDesignerDocument() {
  if (typeof window === 'undefined') {
    return createDefaultDocument();
  }

  try {
    const cached = window.localStorage.getItem(LOCAL_FORM_DESIGNER_STORAGE_KEY);
    return cached ? normalizeLocalDesignerDocument(JSON.parse(cached)) : createDefaultDocument();
  } catch (error) {
    console.warn(error);
    return createDefaultDocument();
  }
}

function setStoredLocalDesignerDocument(data: OnlineFormTmplResponse) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(LOCAL_FORM_DESIGNER_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn(error);
  }
}

let localDesignerDocument = getStoredLocalDesignerDocument();

export function isLocalDesignerId(id?: string) {
  return id === LOCAL_FORM_DESIGNER_ID;
}

export function getLocalDesignerDocument(id: string = LOCAL_FORM_DESIGNER_ID) {
  return cloneDeep({
    ...localDesignerDocument,
    id,
  });
}

export function saveLocalDesignerDocument(data: Partial<OnlineFormTmplResponse>) {
  localDesignerDocument = normalizeLocalDesignerDocument({
    ...localDesignerDocument,
    ...cloneDeep(data),
  });
  setStoredLocalDesignerDocument(localDesignerDocument);
  return getLocalDesignerDocument();
}

export function getLocalDesignerModelMetaMap(): IModelMetaMap {
  try {
    const designerJson = JSON.parse(localDesignerDocument.designerJson || '{}');
    if (designerJson.modelMetaMap?.[LOCAL_FORM_MODEL_KEY]) {
      return cloneDeep(designerJson.modelMetaMap);
    }
  } catch (error) {
    console.warn(error);
  }

  return createLocalModelMetaMap();
}

export function getLocalDesignerModelInfo() {
  const model = getLocalDesignerModelMetaMap()[LOCAL_FORM_MODEL_KEY];
  return {
    key: LOCAL_FORM_MODEL_KEY,
    name: '本地表单模型',
    type: 'BASE',
    fieldMetaList: cloneDeep(model?.fields ?? []),
  };
}

export function getLocalDesignerFieldList(modelKey?: string) {
  const model = getLocalDesignerModelMetaMap()[modelKey || LOCAL_FORM_MODEL_KEY];
  return cloneDeep(model?.fields ?? []);
}
