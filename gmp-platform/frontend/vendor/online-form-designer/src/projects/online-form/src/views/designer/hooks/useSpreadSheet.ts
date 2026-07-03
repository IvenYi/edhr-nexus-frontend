import { ref, reactive, computed, unref } from 'vue';
import { PanelType, BorderPositionEnum, DesignMode, SubTableType } from '../enums';
import { isIn, isOverlap, num2Col } from '../utils';
import { XlsxParser } from '../utils/xlsx-parser';
import { WordParser } from '../utils/word-parser';
import { PaperCanvasImport } from '../utils/paper-canvas-import';
import { DomParser } from '../utils/dom-parser';
import { ImgParser } from '../utils/img-parser';
import { CellBorder } from '../utils/cell-border';
// import { FixedTable } from '../utils/fixed-table';
import { DataGroup } from '../utils/data-group';
import { CodeRunner } from '../utils/code-runner';
import { omit, cloneDeep, pick, isNil, times, isEmpty, has, range, merge } from 'lodash-es';
import {
  CreateType,
  FIELD_TYPE,
  FieldDefaultValueTypeEnum,
} from '/@online-form/views/designer/enums/local-field';
import { Modal, message } from 'ant-design-vue';
import { useI18n } from '/@/hooks/web/useI18n';
import {
  DEFAULT_ROW_HEIGHT,
  DEFAULT_COL_WIDTH,
  DefaultPaper,
  FieldTypeToCellWidgetMap,
} from '../constants';
import { useModelFields } from './useModelFields';
import type {
  IPaper,
  IRange,
  ICellStyle,
  IMedia,
  ITable,
  ICell,
  ICallback,
  IFixedTable,
  ICopyData,
  ISelectionPaperData,
  ICheckTableDataSource,
} from '../types';
import type { IBindField } from '@gct/nocode-base';
import type { CellWidget } from '../types/cell-widget';
import type { PaperWidget } from '/@online-form/views/types/paper-widget';
import type {
  // DocumentResponse,
  OnlineFormTmplResponse,
} from '/@/apis/gct-apaas/model';
import { widgetConfigMap } from '/@online-form/views/__cell_widgets__/index';
// import { asyncImportWidgetConfigList } from '/@online-form/views/__widgets__';
import { parseHtml } from './parse-html';
import toPx from 'unit-to-px';
// import { useFormHistory } from './useFormHistory';
// import { useCacheHistory, useCacheHistoryInner } from '/@/hooks/develop/useCacheHistory';
import type { IReverseModelItem } from './reverse-modeling';
import { NumColMap } from '/@online-form/views/designer/constants';
import { uuid2 } from '@/utils/uuid';
import { useAllSpreadSheets } from './useAllSpreadSheets';
import { isLocalDesignerId } from './local-designer-cache';

enum CellType {
  Default = 'Default',
  Widget = 'Widget',
  Field = 'Field',
}

enum Orientation {
  Portrait = 'portrait',
  Landscape = 'landscape',
}

enum FormTypeEnum {
  VIEW = 'VIEW',
  TEXT = 'TEXT',
}

enum PlatformEnum {
  INTEGRATION_PAAS_DP = 'INTEGRATION_PAAS_DP',
  INTEGRATION_PAAS_SI = 'INTEGRATION_PAAS_SI',
}

enum FormEditionEnum {
  EASY = 'EASY',
}

const { t } = useI18n();

const {
  setSheetMaps,
  setSheetsCallback,
  undoDisabled,
  redoDisabled,
  onUndo,
  onRestore,
  saveSheets,
  sheetsHasChanged,
  activeSheet,
  removeField,
} = useAllSpreadSheets();

const initBeforeScript = '';
const initScriptFuncTemplate = 'export function $name$({ $params$ }) {\n';
const initPageDataFuncTemplate = 'export async function GCT_BUILT_IN_DATA_LOAD({ params }) {\n';
const initPageDataFuncReturnTemplate = '  return {};\n';
const initAfterScript = '}';

const formStateDemo = `
 * const formState = {
 *  fieldKey1: '冠骋',
 *  fieldKey2: '研发中心',
 *  fieldKey3: 10000,
 *  subFieldKey: {
 *    data: [{
 *      f1: '中国'
 *    },{
 *      f1: '中国台湾'
 *    }],
 *  }
 * }
`;

function loadReverseModeling() {
  return import('./reverse-modeling');
}

function loadTableModal() {
  return import('/@online-form/views/designer/modules/modals/table-modal.vue');
}

function loadTheadModal() {
  return import('/@online-form/views/designer/modules/modals/thead-modal.vue');
}

function loadFieldEditModal() {
  return import('../modules/modals/field-edit-modal.vue');
}

async function generateRunJson(designerJson) {
  const { generateLocalRuntimeJson } = await import('../utils/local-runtime-json');
  return JSON.stringify(generateLocalRuntimeJson(designerJson));
}

const expPageInitFuncNode =
  '/**\n' +
  ' * 页面初始化函数\n' +
  ' * 在页面初始化函数中,我们可以对 formState 进行初始化,确保在获取接口数据之前设置默认值\n' +
  ' * 如果后端接口返回的结果中包含相同属性名称的字段,这些字段将会覆盖初始化的值\n' +
  ' * 而对于其他情况,我们将合并数据以确保完整性和一致性\n' +
  ' * @return {object} 需要初始化的数据对象\n' +
  ' * \n' +
  ' * 子表的数据格式要求：{data: [{f1:100},{f2:200}], dict:{}}\n' +
  ' * dict是存翻译的，可有可无\n' +
  ' * 例子：' +
  formStateDemo +
  ' */';

const expGlobalNode =
  '/**\n' +
  ' * 全局变量解释\n' +
  ' * @param {object} GlobalData 当前这个单据的整个表单数据对象（包含子表数据）\n' +
  ' * @param {object} CTX 全局公共方法对象 \n' +
  ' */\n\n';

const expParamsNote =
  '/**\n' +
  ' * 下列生成的方法入参变量解释\n' +
  ' * @param {any} value 输入内容\n' +
  ' * @param {any} valueData 选中内容详情\n' +
  ' * @param {object} formData 当前字段所属的表单数据对象（如果是子表的话是当前这条行数据）\n' +
  ' * @param {object} pageFormData 整个表单数据对象\n' +
  ' * @param {object} fieldMeta 当前字段信息对象\n' +
  ' * @param {number | undefined} rowIndex 子表行下标\n' +
  ' */\n';

const APIS: ICallback = {
  save: () => {},
  publish: (_data) => {},
};

/**
 * 单据数据
 */
const doc = ref<OnlineFormTmplResponse>({});
/**
 * 纸张数据
 */
const paper = ref<IPaper>({
  ...cloneDeep(DefaultPaper),
});

const getPaper = () => {
  return paper.value;
};

const cachePaper = ref<IPaper>({
  ...cloneDeep(DefaultPaper),
});

/** 有单元格直接内容在被编辑 */
const hasCellValueEditing = ref(false);

/**
 * 渲染节点
 */
const paperEle: HTMLElement | null = null;
/**
 * 选区
 */
const selection: IRange & { e: { _t: number; _l: number; _r: number; _b: number } } = reactive({
  t: 0,
  l: 0,
  b: 0,
  r: 0,
  e: {
    _t: 0,
    _l: 0,
    _b: 0,
    _r: 0,
  },
});

/** 是否有选中区域 */
const hasSelection = computed(() => {
  return selection.t !== 0;
});

/**
 * 网格线
 */
const gridLineVisible = ref<boolean>(true);
/**
 * 面板数据
 */
const panelData: {
  type: PanelType;
  refId?: string;
} = reactive({
  type: PanelType.Paper,
  refId: undefined,
});
/**
 * hover数据
 */
const hoverData: {
  type: PanelType;
  refId?: string;
} = reactive({
  type: PanelType.Paper,
  refId: undefined,
});

/**
 * 当前设计模式 默认打印
 */
const designMode = ref<DesignMode>(DesignMode.Print);
/** 设置设计模式 */
const setDesignMode = (mode: DesignMode) => {
  designMode.value = mode;
};
const sheetReadonly = computed(() => {
  return designMode.value === DesignMode.CollectView || designMode.value === DesignMode.Refer;
});

/** 平台参数类型 默认medpro平台 */
const platformType = ref<PlatformEnum>(PlatformEnum.INTEGRATION_PAAS_DP);
/** 设置平台参数类型 */
const setPlatformType = (type: PlatformEnum) => {
  platformType.value = type;
};

const rowHeightStage = computed(() => {
  const h = paper.value.rows.map((r) => r.height);
  h.forEach((value, index, arr) => {
    arr[index] = value + (index === 0 ? 0 : arr[index - 1]);
  });
  return [0, ...h];
});

const colWidthStage = computed(() => {
  const w = paper.value.cols.map((r) => r.width);
  w.forEach((value, index, arr) => {
    arr[index] = value + (index === 0 ? 0 : arr[index - 1]);
  });
  return [0, ...w];
});

const paperMedias = computed<Record<string, IMedia>>(() => {
  return (paper.value.medias ?? []).reduce((result, m) => {
    result[m.id] = m;
    return result;
  }, {});
});

const paperLayout = computed(() => {
  const { orientation } = paper.value;
  const size: number[] = [doc.value.width || 210, doc.value.height || 297].sort();
  if (orientation === Orientation.Portrait) {
    return {
      w: size[0],
      h: size[1],
    };
  } else {
    return {
      w: size[1],
      h: size[0],
    };
  }
});

/**
 * 根据内容自动计算高度
 */
const paperFitHeight = computed(() => {
  const contentHeight =
    paper.value.rows.length === 0 ? 0 : rowHeightStage.value[rowHeightStage.value.length - 1];
  const contentHeightMM = Math.ceil(contentHeight / parseFloat(toPx('mm')));
  return Math.max(
    contentHeightMM + paper.value.padding.t + paper.value.padding.b,
    paperLayout.value.h,
  );
});

/**
 * 所有子表
 */
const globalSubTables = computed(() => {
  const { dynamicTables, fixedTables } = paper.value;
  const dTables = (dynamicTables ?? []).map((item) => {
    if (!item.type) {
      item.type = SubTableType.DEFAULT;
    }
    return item;
  });
  const fTables = (fixedTables ?? []).map((item) => {
    if (!item.type) {
      item.type = SubTableType.FIXED;
    }
    return item;
  });
  return [...dTables, ...fTables];
});

/**
 * 当前单元格绑定信息
 */
const currentCell = computed<{
  x: number;
  y: number;
  name: string;
  data: ICell;
  dynamicTable?: ITable;
  fixedTable?: IFixedTable;
  dataGroup?: ITable;
  dataGroup2D?: ITable;
  modelKey: string;
  refFieldKey?: string;
} | null>(() => {
  const { _t, _l } = selection.e;
  if (_t === 0) {
    return null;
  }

  return judgeCellInfo(_l, _t);
});

/**
 * 多单元格
 */
const currentMultiCells = computed<{
  from: string;
  to: string;
  range: IRange;
} | null>(() => {
  const { l, r, t, b, e } = selection;
  const { _t } = e;
  // 未选
  if (_t === 0) {
    return null;
  }
  // 一行一列
  if (l === r && t === b) {
    return null;
  }
  // 合并单元格
  if (paper.value.mergedCells?.find((m) => m.b === b && m.l === l && m.r === r && m.t === t)) {
    return null;
  }
  return {
    from: `${num2Col(l)}${t}`,
    to: `${num2Col(r)}${b}`,
    range: { ...omit(selection, 'e') },
  };
});

/**
 * 固定表信息扩展
 * 解析数据分组 区域 单元格
 */
const tableDataGroups = computed(() => {
  return [
    ...(paper.value.dynamicTables ?? []).filter((item) => SubTableType._2D === item.type),
    ...(paper.value.fixedTables ?? []).filter((item) => SubTableType.FIXED === item.type),
  ].map((item) => {
    const table = new DataGroup(paper.value, {
      ...item,
      _dataGroupRange: item.dgRange,
    });
    return table.calcDataGroups();
  });
});

const checkRowDataGroups = computed(() => {
  const data = (paper.value.fixedTables ?? [])
    .filter((item) => item.type === SubTableType.CHECK)
    .map((item) => {
      const ds = paper.value.checkTableDataSource?.find((ds) => ds.id === item.checkDsId);
      const table = new DataGroup(paper.value, {
        ...item,
        autoFill: true,
        _dataGroupRange: item.rowRange,
        _dataGroupCount: ds?.data.length || 1,
      });
      return table.calcDataGroups();
    });
  console.log('check row', data);
  return data;
});

const checkColDataGroups = computed(() => {
  const data = (paper.value.fixedTables ?? [])
    .filter((item) => item.type === SubTableType.CHECK)
    .map((item) => {
      const table = new DataGroup(paper.value, {
        ...item,
        _dataGroupRange: item.dgRange,
      });
      return table.calcDataGroups();
    });
  console.log('check col', data);
  return data;
});

/**
 * 自定义脚本中的导出函数
 */
const availableFunctions = computed(() => {
  const code = (paper.value.javascript ?? '').trim();
  if (!code) return [];
  return CodeRunner.identifyFns(code);
});

const isTextOnlineForm = computed(() => {
  return (
    !isEmpty(doc.value) && has(doc.value, 'formType') && doc.value.formType === FormTypeEnum.TEXT
  );
});

const isViewOnlineForm = computed(() => {
  return (
    !isEmpty(doc.value) && has(doc.value, 'formType') && doc.value.formType === FormTypeEnum.VIEW
  );
});

/** 初始化生成一条脚本函数 */
function getInitScriptFunction(methodName, params: string[]) {
  const methodParams = ['value', 'formData', 'fieldMeta', 'rowIndex'].concat(params);
  return [
    initBeforeScript,
    initScriptFuncTemplate.replace('$name$', methodName).replace('$params$', methodParams as any),
    initAfterScript,
  ].join('\n');
}

function getInitExpNode(data) {
  if (data) {
    return '';
  }
  const initPageDataFunc = [
    initBeforeScript,
    initPageDataFuncTemplate,
    initPageDataFuncReturnTemplate,
    initAfterScript,
  ].join('\n');
  return expPageInitFuncNode + initPageDataFunc + '\n\n' + expGlobalNode + expParamsNote;
}

/**
 * 检测选区是否与表头动态表冲突
 * @param selection
 * @param showMessage
 * @returns
 */
const checkSelectionConflict = (selection: IRange, showMessage?: boolean) => {
  // 判断重叠
  if (paper.value.thead?.thRange && isOverlap(selection, paper.value.thead.thRange)) {
    showMessage && message.warn($t('sys.onlineForm.currentRegionInvalid'));
    return true;
  }
  const conflictItem = [
    ...(paper.value.dynamicTables ?? []),
    ...(paper.value.fixedTables ?? []),
  ].find((item) => {
    const { thRange, range } = item;
    const itemRange = { ...range };
    if (thRange) {
      itemRange.t = thRange.t;
    }
    return isOverlap(itemRange, selection);
  });
  if (conflictItem) {
    showMessage && message.warn($t('sys.onlineForm.currentRegionInvalid'));
    return true;
  }
};

const _clearSelection = () => {
  // 清空选中区域
  Object.assign(selection, {
    l: 0,
    r: 0,
    t: 0,
    b: 0,
    e: {
      _l: 0,
      _r: 0,
      _t: 0,
      _b: 0,
    },
  });
};

/**
 * 清空选中
 * @author lingxiaoming
 * @date 2024-06-13 11:28:15
 */
function clearSelection(clearPanelData = true) {
  // 设置当前面板数据为单据
  if (clearPanelData) {
    Object.assign(panelData, {
      type: PanelType.Paper,
      refId: undefined,
    });
  }
  _clearSelection();
}

/** start: 表单历史记录 */
// const historyIdRef = ref('ONLINE_FORM_HISTORY_ID');
// const { historyUtils } = useCacheHistory();
// historyUtils.init({ historyId: historyIdRef.value, max: 20 });
/** 永久暂停缓存历史 */
const pauseCacheHistory = ref(true);
/** 跳过下一次变更导致的缓存历史 */
// const skipNextCacheHistory = ref(false);

// const {
//   undoDisabled,
//   restoreDisabled: redoDisabled,
//   onUndo,
//   onRestore,
// } = useCacheHistoryInner({
//   historyIdRef: historyIdRef,
//   callback: (content) => {
//     const cacheData = JSON.parse(content);
//     console.log('缓存历史回退----', cacheData);
//     paper.value = cacheData.paper;
//     Object.assign(panelData, cacheData.panelData);
//     Object.assign(selection, cacheData.selection);
//     skipNextCacheHistory.value = true;
//   },
// });

// function _cacheStep() {
//   const cacheData = {
//     paper: paper.value,
//     panelData: toRaw(panelData),
//     selection: toRaw(selection),
//   };
//   historyUtils.addHistory({
//     historyId: historyIdRef.value,
//     past: JSON.stringify(cacheData),
//   });
// }

// const cacheStep = debounce(_cacheStep, 500);

// 监听数据变化，变更停止之后就缓存
// watch(
//   // 排除不要监听的配置，转成字符串来比较是否变化
//   () => JSON.stringify(omit(paper.value, 'javascript')),
//   () => {
//     if (!pauseCacheHistory.value && !skipNextCacheHistory.value) {
//       cacheStep();
//     }
//     if (skipNextCacheHistory.value) {
//       skipNextCacheHistory.value = false;
//     }
//   },
// );

function undo() {
  if (!undoDisabled.value) {
    onUndo();
  }
}

function redo() {
  if (!redoDisabled.value) {
    onRestore();
  }
}

/** end: 表单历史记录 */

/** 清除单元格配置信息(保留样式配置) */
function clearCellConfig(cell: ICell) {
  cell.type = CellType.Default;
  cell.fieldMeta = undefined;
  cell.fieldWidget = undefined;
  cell.paperWidget = undefined;
  cell.multiFieldsContent = undefined;
  cell.multiFields = undefined;
  cell.value = undefined;
  cell.autoMerge = undefined;
  cell.xAutoMerge = undefined;
  cell.fillDirection = undefined;
}

/**
 * 清空单元格
 * @author lingxiaoming
 * @date 2024-06-27 05:53:36
 * @param {ICell} cell
 */
function clearCell(cell: ICell) {
  clearCellConfig(cell);
  cell.style = undefined;
}

/**
 * 清空范围内的所有单元格
 * @author lingxiaoming
 * @date 2024-06-27 05:54:44
 * @param {IRange} range
 */
function clearRangeCells(range: IRange) {
  const { b, r } = range;
  const l = range.l < 1 ? 1 : range.l;
  const t = range.t < 1 ? 1 : range.t;
  for (let x = l; x <= r; x++) {
    for (let y = t; y <= b; y++) {
      const cell = paper.value.cells[y - 1][x - 1];
      clearCell(cell);
    }
  }
}

/**
 * 重置选择范围内的单元格为初始状态
 * - 清除所有单元格配置和值
 * - 清除范围内的合并单元格
 * - 默认不传参数重置的是当前选中范围
 * @param range
 */
function resetRange(range: IRange = selection) {
  if (range.l === 0) {
    console.warn('没有选中合法的范围');
    return;
  }
  // 清除范围内的合并单元格
  paper.value.mergedCells = paper.value.mergedCells.filter((item) => !isIn(item, range));
  clearRangeCells(range);
}

/** 判断单元格信息 */
function judgeCellInfo(
  x: number,
  y: number,
): {
  x: number;
  y: number;
  name: string;
  data: ICell;
  dynamicTable?: ITable;
  fixedTable?: ITable;
  dataGroup?: ITable;
  dataGroup2D?: ITable;
  /** 所属模型key */
  modelKey: string;
  /** 所属模型在主模型上的关联字段key */
  refFieldKey?: string;
} | null {
  if (x === 0) {
    return null;
  }

  const dynamicTable = paper.value.dynamicTables?.find(
    (item) => item.range.t <= y && item.range.b >= y && item.range.l <= x && item.range.r >= x,
  );

  const fixedTable = paper.value.fixedTables?.find(
    (item) => item.range.t <= y && item.range.b >= y && item.range.l <= x && item.range.r >= x,
  );

  const dataGroup = globalSubTables.value?.find((item) => {
    return (
      item.type === SubTableType.FIXED &&
      item.dgRange &&
      item.dgRange.l <= x &&
      item.dgRange.r >= x &&
      item.dgRange.t <= y &&
      item.dgRange.b >= y
    );
  });

  const dataGroup2D = globalSubTables.value?.find(
    (item) =>
      [SubTableType._2D, SubTableType.CHECK].includes(item.type!) &&
      item.dgRange &&
      ((item.range.t > y && item.dgRange.t <= y) || (item.range.b < y && item.dgRange.b >= y)) &&
      item.range.l <= x &&
      item.range.r >= x,
  );

  let modelKey = doc.value.modelKey!;
  let refFieldKey: string | undefined = undefined;
  if (dynamicTable) {
    modelKey = dynamicTable.model!;
    refFieldKey = dynamicTable.field!;
  } else if (fixedTable) {
    modelKey = fixedTable.model;
    refFieldKey = fixedTable.field;
  } else if (dataGroup2D) {
    modelKey = dataGroup2D.model;
    refFieldKey = dataGroup2D.field;
  }

  return {
    x: x,
    y: y,
    name: `${num2Col(x)}${y}`,
    data: paper.value.cells[y - 1][x - 1],
    dynamicTable,
    fixedTable,
    dataGroup,
    dataGroup2D,
    modelKey,
    refFieldKey,
  };
}

const isEasyEdition = computed(() => doc.value.edition === FormEditionEnum.EASY);

export function useSpreadSheet() {
  setSheetsCallback({
    set: setPaper,
    init: initPaper,
    create: createPaperConfig,
    data: { panelData, selection },
    historyCallback: (data) => {
      // paper.value = data.paper;
      Object.assign(panelData, data.panelData);
      Object.assign(selection, data.selection);
    },
    getRunJson: () => generateRunJson(domToJson()),
  });

  /**
   * 初始化
   * @param el
   * @param dataId
   */
  async function init() {}

  function setDoc(data) {
    doc.value = data;
  }

  function setCachePaper() {
    cachePaper.value = cloneDeep(paper.value);
  }

  function initPaper(data) {
    // 清空选择
    clearSelection();
    pauseCacheHistory.value = false; // 开始监听历史记录
    // historyUtils.resetHistoryById(historyIdRef.value); //重置历史记录

    paper.value = data;

    // @ts-ignore
    // 取doc上的方向作为初始值
    const orientation = doc.value.direction as Orientation;

    // 只有初始化进来时读取配置的纸张方向
    if (orientation) {
      paper.value.orientation = orientation;
    }

    // 存一下主模型的key
    paper.value.mainModelKey = doc.value.modelKey!;

    setCachePaper();
    console.log('paper.value.paramToField', paper.value.paramToField);
    // paperEle = document.querySelector('.spread-sheet');

    // 初始化反向建模
    if (
      isEasyEdition.value &&
      doc.value.formType !== FormTypeEnum.TEXT &&
      !isLocalDesignerId(doc.value.id)
    ) {
      // const { initialize: initialize1 } = useReverseModeling();
      // initialize1({ paper: paper });
      /** 版本历史控制 */
      import('./usePublishVersion').then(({ usePublishVersion }) => {
        const { initialize: initialize2 } = usePublishVersion();
        initialize2({ doc: doc });
      });
    }
  }

  function setPaper(p) {
    // 清空选择
    clearSelection();
    paper.value = p;
  }

  // function getSaveData() {
  //   // 删除反向建模未使用的字段
  //   if (isEasyEdition.value) {
  //     const { clearUnusedModel } = useReverseModeling();
  //     const { modelMetaMap } = useModelFields();
  //     clearUnusedModel({ paper: paper.value });
  //     paper.value.modelMetaMap = toRaw(modelMetaMap.value);
  //   }

  //   const data: Required<DocumentDTO> & {
  //     direction?: Orientation;
  //   } = {
  //     designerJson: JSON.stringify(paper.value),
  //     runtimeJson: JSON.stringify(generateRuntimeJson(domToJson())),
  //     direction: paper.value.orientation,
  //   };
  //   setCachePaper();
  //   return data;
  // }

  async function save() {
    const data = await saveSheets(isEasyEdition.value);
    await APIS.save(data);
    // APIS.save(getSaveData());
  }

  /**
   * 找到指定坐标的单元格所在的合并区域，找不到就是非合并的单元格
   * @author lingxiaoming
   * @date 2024-06-07 09:48:10
   * @param {number} x 横向坐标
   * @param {number} y 纵向坐标
   * @return {*}  {(IRange | undefined)}
   */
  function findMergeCell(x: number, y: number): IRange | undefined {
    return paper.value.mergedCells.find((c) => c.l <= x && c.r >= x && c.t <= y && c.b >= y);
  }

  /**
   * 合并单元格是否是合法的,选中范围必须大于一个单元格
   * @author lingxiaoming
   * @date 2024-07-22 02:10:43
   * @param {IRange} range
   * @return {*}  {boolean}
   */
  function isValidMergeCell(range: IRange): boolean {
    return range.l !== range.r || range.t !== range.b;
  }

  /**
   * 选中某个单元格元素
   * @author lingxiaoming
   * @date 2024-06-07 10:19:28
   * @param {HTMLElement} el 单元格的DOM元素
   */
  function selectCellElement(el: HTMLElement) {
    const x1 = Number(el.dataset.x);
    const y1 = Number(el.dataset.y);
    // todo 判断是否属于子表
    setPanelData({
      type: PanelType.Cell,
    });
    //  if(paper.value.dynamicTables.find(item=>item.range.t<=y1 && item.range.b>=y1 && item.range.l<=x1 &&item.range.r>= x1  )){
    //   panelType.value = PanelType.
    //  }

    const rowspan = el.getAttribute('rowspan');
    const colspan = el.getAttribute('colspan');
    if (rowspan && colspan) {
      Object.assign(selection, {
        l: x1,
        r: x1 + Number(colspan) - 1,
        t: y1,
        b: y1 + Number(rowspan) - 1,
        e: {
          _l: x1,
          _r: x1 + Number(colspan) - 1,
          _t: y1,
          _b: y1 + Number(rowspan) - 1,
        },
      });
    } else {
      Object.assign(selection, {
        l: x1,
        r: x1,
        t: y1,
        b: y1,
        e: {
          _l: x1,
          _r: x1,
          _t: y1,
          _b: y1,
        },
      });
    }
  }

  /**
   * 处理单元格的点击事件回调
   * @author lingxiaoming
   * @date 2024-06-07 10:18:48
   * @param {*} e 事件对象
   */
  function handleCellClick(e) {
    let currentCell = e.currentTarget;
    const x1 = Number(currentCell.dataset.x);
    const y1 = Number(currentCell.dataset.y);

    // 已经在选中区域里面的时候，忽略鼠标右击的选中
    if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
      if (selection.l <= x1 && selection.r >= x1 && selection.t <= y1 && selection.b >= y1) {
        return;
      }
    }

    selectCellElement(currentCell);

    function handleMouseMove(e2) {
      if (e2.target === currentCell) return;
      const pathList = e2.path || (e2.composedPath && e2.composedPath());
      const node = pathList.find((path) => path?.nodeName === 'TD');

      if (!node) return;

      currentCell = node;
      const x2 = Number(node.dataset.x);
      const y2 = Number(node.dataset.y);

      if (Number.isNaN(x2) || Number.isNaN(y2)) return;

      const [l, r] = x1 <= x2 ? [x1, x2] : [x2, x1];
      const [t, b] = y1 <= y2 ? [y1, y2] : [y2, y1];

      const crossCells = paper.value.mergedCells.filter((c) => isOverlap(c, { l, r, t, b }));
      const lMin = Math.min(...crossCells.map((c) => c.l), l);
      const rMax = Math.max(...crossCells.map((c) => c.r), r);
      const tMin = Math.min(...crossCells.map((c) => c.t), t);
      const bMax = Math.max(...crossCells.map((c) => c.b), b);

      Object.assign(selection, {
        l: lMin,
        r: rMax,
        t: tMin,
        b: bMax,
      });
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    // 鼠标左击才监听拖拽
    if (e.button === 0) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
  }

  /**
   * 选中当前选中单元格周围的单元格
   * 如果没有当前选中的单元格则什么都不做
   * @author lingxiaoming
   * @date 2024-06-07 10:30:09
   * @param {('left' | 'right' | 'top' | 'bottom')} position
   */
  function selectSurroundingCell(position: 'left' | 'right' | 'top' | 'bottom') {
    if (!selection.l) {
      return;
    }

    const { _t, _b, _l, _r } = selection.e;
    let x = 0;
    let y = 0;
    switch (position) {
      case 'left':
        x = _l - 1;
        y = _t;
        break;
      case 'right':
        x = _r + 1;
        y = _t;
        break;
      case 'top':
        x = _l;
        y = _t - 1;
        break;
      case 'bottom':
        x = _l;
        y = _b + 1;
        break;
      default:
        throw new Error(
          $t('sys.onlineForm.selectSurroundingCell.tip1', {
            position,
          }),
        );
    }

    // 坐标超出整个页面范围时，什么都不做
    if (x <= 0 || x > paper.value.cols.length || y <= 0 || y > paper.value.rows.length) {
      console.log('单元格已经处于边缘，无法移动');
      return;
    }

    // 如果处于合并单元格时，更换坐标到合并单元格
    const mergeCell = findMergeCell(x, y);
    if (mergeCell) {
      x = mergeCell.l;
      y = mergeCell.t;
    }

    const cellEl = document.querySelector(`[data-x="${x}"][data-y="${y}"]`) as HTMLElement;
    if (!cellEl) {
      throw new Error(
        $t('sys.onlineForm.selectSurroundingCell.tip1', {
          x,
          y,
        }),
      );
    }

    selectCellElement(cellEl);
  }

  /**
   * 设置列宽
   * @author lingxiaoming
   * @date 2024-06-14 09:20:39
   * @param {number} index 第几列
   * @param {number} width 宽度
   */
  function setColWidth(index: number, width: number) {
    Object.assign(paper.value.cols[index - 1], {
      width: width,
      manual: true,
    });
  }

  /**
   * 拖拽列宽
   * @param e
   */
  function resizeCol(e) {
    const x = e.target.parentNode.dataset.x;

    function handleMouseMove(e2) {
      setColWidth(x, e2.clientX - e.target.parentNode.getBoundingClientRect().left);
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  /**
   * 设置行高
   * @author lingxiaoming
   * @date 2024-06-14 09:20:39
   * @param {number} index 第几行
   * @param {number} height 高度
   */
  function setRowHeight(index: number, height: number) {
    Object.assign(paper.value.rows[index - 1], {
      height: height,
      manual: true,
    });
  }

  /**
   * 拖拽行高
   * @param e
   */
  function resizeRow(e) {
    const y = e.target.parentNode.dataset.y;

    function handleMouseMove(e2) {
      setRowHeight(y, e2.clientY - e.target.parentNode.getBoundingClientRect().top);
    }

    function handleMouseUp() {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }

  /**
   * 删除合并单元格
   * @author lingxiaoming
   * @date 2024-07-22 01:07:31
   * @param {IRange} range
   */
  function removeMergedCell(range: IRange): void {
    paper.value.mergedCells = paper.value.mergedCells.filter((c) => !isOverlap(c, range));
  }

  /**
   * 添加合并单元格
   * @author lingxiaoming
   * @date 2024-07-22 01:08:26
   * @param {IRange} range
   */
  function addMergedCell(range: IRange): void {
    removeMergedCell(range);
    paper.value.mergedCells.push({
      l: range.l,
      r: range.r,
      t: range.t,
      b: range.b,
    });
  }

  /**
   * 合并
   */
  function setMerge() {
    addMergedCell(selection);
    Object.assign(selection.e, {
      _l: selection.l,
      _r: selection.r,
      _t: selection.t,
      _b: selection.b,
    });
  }
  /**
   * 拆分
   */
  function cancelMerge() {
    removeMergedCell(selection);
    Object.assign(selection.e, {
      _l: selection.l,
      _r: selection.l,
      _t: selection.t,
      _b: selection.t,
    });
  }

  /**
   * 设置子表
   * @param data
   */
  async function _setTable(data: any) {
    const { name, model, field, mainModel, colModel, colField, type } = data as any;
    const range = { ...omit(selection, 'e') };
    const id = Math.random().toString(36).substring(2, 10);
    const table: ITable = {
      id,
      name,
      field,
      model,
      mainModel,
      range: { ...range },
      colModel,
      colField,
      type,
      autoFill: true,
      quickFill: true,
      fillDirection: 'x',
      indexedTd: SubTableType.DEFAULT !== type, // 通过索引渲染
    };

    if (
      [
        SubTableType.DEFAULT,
        SubTableType._2D,
        SubTableType.MATERIAL_CONSUMPTION,
        SubTableType.MATERIAL_BALANCE,
      ].includes(type)
    ) {
      if (paper.value.dynamicTables) {
        paper.value.dynamicTables.push(table);
      } else {
        paper.value.dynamicTables = [table];
      }
      const typeMap = {
        [SubTableType.DEFAULT]: PanelType.DynamicTable,
        [SubTableType._2D]: PanelType._2DTable,
        [SubTableType.MATERIAL_CONSUMPTION]: PanelType.MaterialConsumptionTable,
        [SubTableType.MATERIAL_BALANCE]: PanelType.MaterialBalanceTable,
      };
      // 清空选区内容
      clearRangeCells(table.range);
      setPanelData({
        type: typeMap[type],
        refId: id,
      });
    } else {
      if (type === SubTableType.CHECK) {
        // 初始化检验项数据源
        const dsId = Math.random().toString(36).substring(2, 10);
        const ds: ICheckTableDataSource = {
          id: dsId,
          data: [],
          modelKey: model,
          subFieldKey: field,
        };

        if (paper.value.checkTableDataSource) {
          paper.value.checkTableDataSource.push(ds);
        } else {
          paper.value.checkTableDataSource = [ds];
        }

        table.rowRange = { ...range };
        table.checkDsId = dsId;
      }
      if (paper.value.fixedTables) {
        paper.value.fixedTables.push(table);
      } else {
        paper.value.fixedTables = [table];
      }
      // 清空选区内容
      clearRangeCells(table.range);
      setPanelData({
        type: type === SubTableType.CHECK ? PanelType.CheckTable : PanelType.FixedTable,
        refId: id,
      });
    }
  }

  /**
   * 根据类型添加子表
   * @param type
   * @returns
   */
  async function setSubTable(type: SubTableType = SubTableType.DEFAULT) {
    if (selection.t === 0) {
      message.warn(`请先选择${t('sys.onlineForm.subTableType.' + type)}区域`);
      return;
    }
    if (checkSelectionConflict(selection, true)) return;

    const { default: TableModal } = await loadTableModal();
    const { ok, data } = await gct.openUtil.modal<{
      ok: Boolean;
      data: any;
    }>(
      TableModal,
      { type },
      { title: `添加${t('sys.onlineForm.subTableType.' + type)}`, width: '640px' },
    );
    if (!ok) return;

    _setTable(data);
  }

  /**
   * 移除动态表
   * @param table
   */
  function removeSubTable(table: ITable) {
    const isFixed = [SubTableType.FIXED, SubTableType.CHECK].includes(table.type);
    const is2D = [SubTableType._2D, SubTableType.CHECK].includes(table.type);
    const index = isFixed
      ? paper.value.fixedTables?.findIndex((item) => item.id === table.id)
      : paper.value.dynamicTables?.findIndex((item) => item.id === table.id);

    if (typeof index === 'number' && index > -1) {
      if (is2D) {
        removeDataGroup2D(table);
      }
      if (table.type === SubTableType.CHECK) {
        // 检验表的移除需要删除数据源
        const dsIndex = paper.value.checkTableDataSource?.findIndex(
          (item) => item.id === table.checkDsId,
        );
        typeof dsIndex === 'number' &&
          dsIndex > -1 &&
          paper.value.checkTableDataSource?.splice(dsIndex, 1);
      }
      clearRangeCells(table.range);
      if (isFixed) {
        paper.value.fixedTables?.splice(index, 1);
      } else {
        paper.value.dynamicTables?.splice(index, 1);
      }
    }
  }

  /**
   * 设置数据分组
   * todo: 仅支持规则形状
   */
  function setDataGroup(fixedTable: IFixedTable, dataGroupRange: IRange) {
    fixedTable.dgRange = omit(dataGroupRange, 'e');
  }

  /**
   * 设置二维表的数据分组
   */
  function setDataGroup2D(table: ITable, dataGroupRange: IRange) {
    table.dgRange = omit(dataGroupRange, 'e');
  }

  /**
   * 移除数据分组
   */
  function removeDataGroup(table: IFixedTable) {
    if (!table) return;
    if (!table.dgRange) return;
    clearRangeCells(table.dgRange);
    table.dgRange = undefined;
  }

  /**
   * 移除动态关联
   */
  function removeDataGroup2D(table: ITable) {
    if (!table) return;
    if (!table.dgRange) return;
    const tRange = {
      ...table.dgRange,
      b: table.range.t - 1,
    };
    const bRange = {
      ...table.dgRange,
      t: table.range.b + 1,
    };
    tRange.t <= tRange.b && clearRangeCells(tRange);
    bRange.t <= bRange.b && clearRangeCells(bRange);
    table.dgRange = undefined;
    table.refColField = undefined;
    table.refRowField = undefined;
  }

  /**
   * 设置表头
   */
  async function setThead() {
    const { t, b, l, r } = selection;

    if (t === 0) {
      message.warn($t('sys.onlineForm.pleaseSelectHeaderRegionFirst'));
      return;
    }

    if (checkSelectionConflict(selection, true)) return;

    const { default: TheadModal } = await loadTheadModal();
    const { ok, data } = await gct.openUtil.modal(
      TheadModal,
      {},
      {
        title: $t('sys.onlineForm.addHeader'),
        width: '640px',
      },
    );
    if (!ok) return;

    if (data.mode === '2' || data.mode === '3') {
      const table = [...(paper.value.dynamicTables ?? []), ...(paper.value.fixedTables ?? [])].find(
        (item) => item.id === data.tableId,
      );
      if (table) {
        table.thRange = { t, b, l, r };
        table.thName = data.name;
      }
    } else if (data.mode === '1') {
      paper.value.thead = {
        thName: data.name,
        thRange: { t, b, l, r },
      };
    }
  }
  function removeThead(table?: ITable | IFixedTable) {
    if (table) {
      table.thName = undefined;
      table.thRange = undefined;
    } else {
      paper.value.thead = undefined;
    }
  }

  /**
   * 在指定的列序号前插入行
   * @author lingxiaoming
   * @date 2024-07-09 02:34:16
   * @param {number} [row] 指定插入的行序号(从1开始)
   * @param {number} [inheritRow] 指定继承的行的数据
   */
  function insertRow(row?: number, inheritRow?: ICell[]) {
    const rowIndex = (row ?? paper.value.rows.length) - 1;
    paper.value.rows.splice(rowIndex, 0, {
      height: DEFAULT_ROW_HEIGHT,
    });
    // 继承行的样式，不存在则创建一个都是undefined的空数组
    const _inheritRow = isNil(inheritRow)
      ? new Array(paper.value.cols.length).fill(undefined)
      : inheritRow;
    paper.value.cells.splice(
      rowIndex,
      0,
      _inheritRow.map((cell) => {
        const style = cell?.style ? cloneDeep(cell?.style) : undefined;
        const border = cell?.border ? cloneDeep(cell?.border) : undefined;
        return {
          style,
          border,
        };
      }),
    );

    const adjustRange = (range: IRange) => {
      const { t, b } = range;
      if (rowIndex + 1 <= t) {
        range.t++;
        range.b++;
      } else if (rowIndex + 1 <= b) {
        range.b++;
      }
    };

    // 处理表头
    if (paper.value.thead?.thRange) {
      adjustRange(paper.value.thead.thRange);
    }
    // 处理子表
    globalSubTables.value.forEach((item) => {
      item.range && adjustRange(item.range);
      item.thRange && adjustRange(item.thRange);
      item.dgRange && adjustRange(item.dgRange);
      item.rowRange && adjustRange(item.rowRange);
    });
    // 处理合并单元格
    paper.value.mergedCells.forEach((cell) => {
      adjustRange(cell);
    });
  }

  /**
   * 在指定的列序号前插入多行数据
   * @author lingxiaoming
   * @date 2024-07-31 02:53:50
   * @param {number} [insertNo] 指定插入的行序号(从1开始)
   * @param {number} count 指定要插入的行数(1行以上)
   * @param {number} [inheritNo] 指定要继承样式的行序号(从1开始),不提供就是不继承
   */
  function insertRows(insertNo: number, count: number, inheritNo?: number) {
    const inheritRow: ICell[] | undefined = isNil(inheritNo)
      ? undefined
      : paper.value.cells[inheritNo - 1];
    times(count, () => {
      insertRow(insertNo, inheritRow);
    });
  }

  /**
   * 在指定的列序号前插入列
   * @author lingxiaoming
   * @date 2024-07-09 02:32:06
   * @param {number} [col] 指定插入的列序号(从1开始)
   * @param {ICell[]} [insertCols] 指定继承列的数据
   */
  function insertCol(col?: number, insertCols?: ICell[]) {
    const colIndex = (col ?? paper.value.cols.length) - 1;
    paper.value.cols.splice(colIndex, 0, { width: DEFAULT_COL_WIDTH });
    paper.value.cells.forEach((row, index) => {
      const cell = insertCols ? insertCols[index] : undefined;
      const style = cell?.style ? cloneDeep(cell?.style) : undefined;
      const border = cell?.border ? cloneDeep(cell?.border) : undefined;
      row.splice(colIndex, 0, { value: '', style, border });
    });

    const adjustRange = (range: IRange) => {
      const { l, r } = range;
      if (colIndex + 1 <= l) {
        range.l++;
        range.r++;
      } else if (colIndex + 1 <= r) {
        range.r++;
      }
    };

    // 处理表头
    if (paper.value.thead?.thRange) {
      adjustRange(paper.value.thead.thRange);
    }
    // 处理子表
    globalSubTables.value.forEach((item) => {
      item.range && adjustRange(item.range);
      item.thRange && adjustRange(item.thRange);
      item.dgRange && adjustRange(item.dgRange);
      item.rowRange && adjustRange(item.rowRange);
    });
    // 处理合并单元格
    paper.value.mergedCells.forEach((cell) => {
      adjustRange(cell);
    });
  }

  /**
   * 在指定的列序号前插入多列数据
   * @author lingxiaoming
   * @date 2024-07-31 02:53:50
   * @param {number} [insertNo] 指定插入的列序号(从1开始)
   * @param {number} count 指定要插入的列数(1列以上)
   * @param {number} [inheritNo] 指定要继承样式的列序号(从1开始),不提供就是不继承
   */
  function insertCols(insertNo: number, count: number, inheritNo?: number) {
    let inheritCols: ICell[] | undefined = undefined;
    if (!isNil(inheritNo)) {
      inheritCols = [];
      paper.value.cells.forEach((row) => {
        inheritCols!.push(row[inheritNo - 1]);
      });
    }

    times(count, () => {
      insertCol(insertNo, inheritCols);
    });
  }

  /**
   * 删除行
   * @param row
   */
  function deleteRow(row: number) {
    paper.value.rows.splice(row - 1, 1);
    paper.value.cells.splice(row - 1, 1);

    /**
     * 调整range范围，如果整个范围被删除返回true
     * @author lingxiaoming
     * @date 2024-06-26 03:55:52
     * @param {IRange} range
     * @return {*}  {(true | void)}
     */
    const adjustRange = (range: IRange): true | void => {
      const { t, b } = range;
      if (row === t && row === b) {
        return true;
      } else if (row < t) {
        range.t--;
        range.b--;
      } else if (row <= b) {
        range.b--;
      }
    };

    // 处理表头
    if (paper.value.thead?.thRange) {
      if (adjustRange(paper.value.thead.thRange)) {
        paper.value.thead = undefined;
      }
    }
    // 处理动态表
    paper.value.dynamicTables = (paper.value.dynamicTables ?? []).filter((item) => {
      if (adjustRange(item.range)) {
        return false;
      }

      const ranges = ['thRange', 'dgRange', 'rowRange'];

      for (const key of ranges) {
        const rg = item[key];
        if (rg && adjustRange(rg)) {
          // 特殊处理 thRange 要同时清除 thName
          if (key === 'thRange') {
            item.thName = undefined;
          }
          item[key] = undefined;
        }
      }

      return true;
    });
    // 处理固定表
    paper.value.fixedTables = (paper.value.fixedTables ?? []).filter((item) => {
      if (adjustRange(item.range)) {
        return false;
      }

      const ranges = ['thRange', 'dgRange', 'rowRange'];

      for (const key of ranges) {
        const rg = item[key];
        if (rg && adjustRange(rg)) {
          // 特殊处理 thRange 要同时清除 thName
          if (key === 'thRange') {
            item.thName = undefined;
          }
          item[key] = undefined;
        }
      }

      return true;
    });
    // 处理合并单元格
    paper.value.mergedCells = paper.value.mergedCells.filter((cell) => {
      if (adjustRange(cell)) {
        return false;
      }
      // 合并单元格只框选了一个单元格的时候,删除它
      if (cell.l === cell.r && cell.t === cell.b) {
        return false;
      }
      return true;
    });
  }

  /**
   * 删除列
   * @param col
   */
  function deleteCol(col: number) {
    paper.value.cols.splice(col - 1, 1);
    paper.value.cells.forEach((row) => {
      row.splice(col - 1, 1);
    });

    /**
     * 调整range范围，如果整个范围被删除返回true
     * @author lingxiaoming
     * @date 2024-06-26 03:55:52
     * @param {IRange} range
     * @return {*}  {(true | void)}
     */
    const adjustRange = (range: IRange): true | void => {
      const { l, r } = range;
      if (col === l && col === r) {
        return true;
      } else if (col < l) {
        range.l--;
        range.r--;
      } else if (col <= r) {
        range.r--;
      }
    };

    // 处理表头
    if (paper.value.thead?.thRange) {
      if (adjustRange(paper.value.thead.thRange)) {
        paper.value.thead = undefined;
      }
    }
    // 处理动态表
    paper.value.dynamicTables = (paper.value.dynamicTables ?? []).filter((item) => {
      if (adjustRange(item.range)) {
        return false;
      }
      if (item.thRange) {
        if (adjustRange(item.thRange)) {
          item.thName = undefined;
          item.thRange = undefined;
        }
      }
      if (item.dgRange) {
        if (adjustRange(item.dgRange)) {
          item.dgRange = undefined;
        }
      }
      return true;
    });
    // 处理固定表
    paper.value.fixedTables = (paper.value.fixedTables ?? []).filter((item) => {
      if (adjustRange(item.range)) {
        return false;
      }
      if (item.thRange) {
        if (adjustRange(item.thRange)) {
          item.thName = undefined;
          item.thRange = undefined;
        }
      }
      // 数据分组
      if (item.dgRange) {
        if (adjustRange(item.dgRange)) {
          item.dgRange = undefined;
        }
      }
      if (item.rowRange) {
        if (adjustRange(item.rowRange)) {
          item.rowRange = undefined;
        }
      }
      return true;
    });
    // 处理合并单元格
    paper.value.mergedCells = paper.value.mergedCells.filter((cell) => {
      if (adjustRange(cell)) {
        return false;
      }
      // 合并单元格只框选了一个单元格的时候,删除它
      if (cell.l === cell.r && cell.t === cell.b) {
        return false;
      }
      return true;
    });
  }

  /**
   * 解析上传的excel文件
   * @param file
   */
  type XlsxToJsonPayload = {
    withFields?: boolean;
  };

  function getImportFileExtension(file: File) {
    return file.name.split('.').pop()?.toLowerCase() ?? '';
  }

  function validateImportFile(file: File) {
    const extension = getImportFileExtension(file);
    if (!['xlsx', 'xlsm', 'xls', 'docx', 'doc'].includes(extension)) {
      message.error('仅支持导入 .xlsx/.xlsm/.xls/.docx/.doc 文件');
      return false;
    }
    return true;
  }

  async function importFileToPaper(file: File, payload?: XlsxToJsonPayload) {
    if (!validateImportFile(file)) return false;
    if (WordParser.isWord(file)) {
      const padding = paper.value.padding;
      const { w, h } = unref(paperLayout);
      const size = [w - padding.l - padding.r + 'mm', h - padding.t - padding.b + 'mm'];
      const paper2 = await WordParser.docx2json(file);
      XlsxParser.contentFitToPaper(paper2 as any, size as any);
      Object.assign(paper.value, omit(PaperCanvasImport.fromSheetPaper(paper2), 'orientation'));
      return true;
    }
    await xlsxToJson(file, payload);
    return true;
  }

  async function xlsxToJson(file: File, payload?: XlsxToJsonPayload) {
    const padding = paper.value.padding;
    const { w, h } = unref(paperLayout);
    const size = [w - padding.l - padding.r + 'mm', h - padding.t - padding.b + 'mm'];
    if (payload?.withFields) {
      const { modelMetaMap } = useModelFields();
      const keyList = (modelMetaMap.value[doc.value.modelKey!]?.fields ?? []).map((i) => i.key!);

      // 带字段导入
      const {
        paper: paper2,
        fields,
        paperFields,
      } = await XlsxParser.xlsx2jsonWithFields(file, keyList);
      XlsxParser.contentFitToPaper(paper2 as any, size as any);
      Object.assign(paper.value, omit(paper2, 'orientation'));
      const { useReverseModeling } = await loadReverseModeling();
      const { addField, getFieldDTO, getFieldConfig } = useReverseModeling();
      const extFieldStatus: Array<{
        key: string;
        status: boolean;
      }> = doc.value.extFieldStatus ? JSON.parse(doc.value.extFieldStatus) : [];
      // 名称和key的映射，不提供key，使用名称绑定的时候使用
      const fieldNameKeyMap = new Map<string, string>();

      const generateUniqueKey = (base: string, existsFn): string => {
        let result = base;
        while (existsFn(result)) {
          result = `${base}__rand${uuid2(16).toLowerCase()}__`;
        }
        return result;
      };

      fields?.forEach((item) => {
        const { type, key, name: rawName, required, uniqueConstraint, disabled } = item;
        if (!key || !rawName) {
          return;
        }

        // 同 key 字段跳过

        const modelFields = modelMetaMap.value[doc.value.modelKey!]?.fields ?? [];

        const existingKeys = modelFields.map((f) => f.key);

        // 如果 key 重复，直接跳过
        if (existingKeys.includes(key)) return;

        // const existingNames = modelFields.map((f) => f.name);
        // // 如果已经导入过（含随机后缀），就跳过
        // if (isAlreadyAdded(rawName, existingNames)) {
        //   return;
        // }

        // 检查是否已存在相同name
        const nameExists = (n: string) => modelFields.find((f) => f.name === n);

        // 尝试确保唯一性（如冲突，加 __randxxxx__ 后缀）
        const name = generateUniqueKey(rawName, nameExists);

        const field = getFieldDTO({ type, model: doc.value.modelKey! });
        // 合并 key 名称 类型 必填 唯一 (当提供值的时候)
        merge(field, {
          key,
          name,
          required,
          uniqueConstraint,
          defaultValue: {
            type: FieldDefaultValueTypeEnum.NONE,
            value: undefined,
          },
        });
        if (disabled) {
          extFieldStatus.push({
            key: field.key!,
            status: false,
          });
        }
        fieldNameKeyMap.set(field.name!, field.key!);
        addField(field);
      });
      doc.value.extFieldStatus = extFieldStatus.length > 0 ? JSON.stringify(extFieldStatus) : null;

      paperFields.forEach((item) => {
        const fieldKey = item.fieldKey || fieldNameKeyMap.get(item.fieldName!);
        const config = getFieldConfig(item.fieldType);
        const bindField: IBindField = {
          field: fieldKey,
          fieldLink: fieldKey,
          fieldType: item.fieldType as any,
          model: doc.value.modelKey,
          modelLink: doc.value.modelKey,
          isFieldModel: false,
          createType: CreateType.USER_DEFINED,
          refModelKey: config?.bindInfo,
        };
        bindFieldToCell(bindField, item.x, item.y);
      });
      setTimeout(() => {
        // 等待 DOM 更新完成后执行
        // 专业模式直接走发布
        if (isEasyEdition.value) {
          message.success(t('sys.doSuccess'));
        } else {
          publish();
        }
      }, 0);
    } else {
      // 普通导入
      const paper2 = await XlsxParser.xlsx2json(file);
      XlsxParser.contentFitToPaper(paper2 as any, size as any);
      Object.assign(paper.value, omit(paper2, 'orientation'));
    }
  }

  /**
   *
   * @returns 检查固定表数据分组是否完整
   */
  function checkFixedTableComplete(): boolean {
    const unCompleteTableGroup = tableDataGroups.value.some((group) => {
      return !group.cells.length;
    });
    return !unCompleteTableGroup;
  }

  /**
   * 设计态表格转成渲染json
   * @returns
   */
  function domToJson() {
    const tableEl = (paperEle || document).querySelector(
      '.spread-sheet__paper .paper-content table',
    );
    if (!tableEl) return;

    if (!checkFixedTableComplete()) {
      const warning = t('sys.onlineForm.unCompletedFixedTableWarning');
      message.warn(warning);
      throw new Error(warning);
    }

    const paperJson = DomParser.dom2json(
      tableEl,
      paper.value,
      {
        type: doc.value.paperSize as any,
        size: [paperLayout.value.w, paperLayout.value.h],
      },
      {
        tableDataGroups: tableDataGroups.value,
        checkColDataGroups: checkColDataGroups.value,
        checkRowDataGroups: checkRowDataGroups.value,
        globalSubTables: globalSubTables.value,
      },
    );
    // console.log('[function domToJson]:', JSON.stringify(paperJson));
    return paperJson;
  }

  /**
   * 设置样式
   * @param style
   */
  function setStyle(style: ICellStyle) {
    const { l, r, t, b } = selection;
    for (let x = l; x <= r; x++) {
      for (let y = t; y <= b; y++) {
        // 判断是否合并
        const mergedCell = findMergeCell(x, y);
        // 仅合并的起始cell 或 未合并 设置样式
        if ((mergedCell && mergedCell.t === y && mergedCell.l === x) || !mergedCell) {
          const oldStyle = paper.value.cells?.[y - 1]?.[x - 1]?.style ?? {};

          if (style['text-align'] === 'justify') {
            style['text-align-last'] = 'justify';
          } else if (style['text-align']) {
            style['text-align-last'] = undefined;
          }

          const newStyle = {
            ...oldStyle,
            ...style,
          };

          if (paper.value.cells?.[y - 1]?.[x - 1]) {
            paper.value.cells[y - 1][x - 1].style = newStyle as any;
          }
        }
      }
    }
  }

  /**
   * 设置换行
   * @param active
   */
  function setTextWrap(active = true) {
    // nowrap
    // 取消换行 删除行height

    if (active) {
      setStyle({
        'word-break': 'break-all',
        'white-space': 'pre-wrap',
      });
    } else {
      setStyle({
        'word-break': undefined,
        'white-space': undefined,
      } as any);
    }
  }

  /**
   * 设置文本样式
   * @param value
   * @param active
   */
  function setTextDecoration(value: 'underline' | 'line-through', active = true) {
    const { l, r, t, b } = selection;
    for (let x = l; x <= r; x++) {
      for (let y = t; y <= b; y++) {
        // 判断是否合并
        const mergedCell = paper.value.mergedCells.find(
          (c) => c.l <= x && c.r >= x && c.t <= y && c.b >= y,
        );
        // 仅合并的起始cell 或 未合并 设置样式
        if ((mergedCell && mergedCell.t === y && mergedCell.l === x) || !mergedCell) {
          const style = paper.value.cells?.[y - 1]?.[x - 1]?.style ?? {};

          let textDecorations: any[] = style['text-decoration']
            ? (style['text-decoration'] as string).split(' ')
            : [];
          if (active) {
            !textDecorations.includes(value) && textDecorations.push(value);
          } else {
            textDecorations = textDecorations.filter((item) => item !== value);
          }
          style['text-decoration'] =
            textDecorations.length === 0 ? undefined : textDecorations.join(' ');
          if (paper.value.cells?.[y - 1]?.[x - 1]) {
            paper.value.cells[y - 1][x - 1].style = style as any;
          }
        }
      }
    }
  }

  /**
   * 设置边框
   * @param type
   */
  function setBorder(type: BorderPositionEnum, bold = false) {
    const { l, r, t, b } = selection;
    if (type === BorderPositionEnum.left) {
      const x = l;
      for (let y = t; y <= b; y++) {
        CellBorder.setLeft(x, y, paper.value, bold);
      }
    } else if (type === BorderPositionEnum.right) {
      const x = r;
      for (let y = t; y <= b; y++) {
        CellBorder.setRight(x, y, paper.value, bold);
      }
    } else if (type === BorderPositionEnum.top) {
      const y = t;
      for (let x = l; x <= r; x++) {
        CellBorder.setTop(x, y, paper.value, bold);
      }
    } else if (type === BorderPositionEnum.bottom) {
      const y = b;
      for (let x = l; x <= r; x++) {
        CellBorder.setBottom(x, y, paper.value, bold);
      }
    } else if (type === BorderPositionEnum.all) {
      for (let x = l; x <= r; x++) {
        for (let y = t; y <= b; y++) {
          CellBorder.setLeft(x, y, paper.value, bold);
          CellBorder.setRight(x, y, paper.value, bold);
          CellBorder.setTop(x, y, paper.value, bold);
          CellBorder.setBottom(x, y, paper.value, bold);
        }
      }
    } else if (type === BorderPositionEnum.outer || type === BorderPositionEnum.outerBold) {
      const outerBold = type === BorderPositionEnum.outerBold;
      setBorder(BorderPositionEnum.left, outerBold);
      setBorder(BorderPositionEnum.right, outerBold);
      setBorder(BorderPositionEnum.top, outerBold);
      setBorder(BorderPositionEnum.bottom, outerBold);
    } else if (type === BorderPositionEnum.none) {
      for (let x = l; x <= r; x++) {
        for (let y = t; y <= b; y++) {
          CellBorder.clearBorder(x, y, paper.value);
        }
      }
    }
  }

  /**
   * 全选
   */
  function selectAll() {
    Object.assign(selection, {
      t: 1,
      l: 1,
      b: paper.value.rows.length,
      r: paper.value.cols.length,
    });
  }

  /**
   * 选中整列
   * @param col
   */
  function selectCol(colStart: number, colEnd: number = colStart) {
    Object.assign(selection, {
      t: 1,
      l: colStart,
      b: paper.value.rows.length,
      r: colEnd,
    });
  }

  /**
   * 选中整行
   * @param row
   */
  function selectRow(rowStart: number, rowEnd = rowStart) {
    Object.assign(selection, {
      t: rowStart,
      l: 1,
      b: rowEnd,
      r: paper.value.cols.length,
    });
  }

  /**
   * 插入图片
   * @param file 图片文件
   * @param embed 内嵌单元格
   * @returns
   */
  async function insertImage(file, embed = false) {
    if (!file) return;
    if (embed && selection.t === 0) return;
    const { src, height, width } = await ImgParser.read(file);
    const media = paper.value.medias?.find((m) => m.src === src);
    let mediaId = media?.id;
    if (!mediaId) {
      mediaId = Math.random().toString(36).substring(2, 10);
      if (!paper.value.medias) paper.value.medias = [];
      paper.value.medias.push({
        id: mediaId,
        src: src as string,
      });
    }

    if (embed) {
      const { t, l } = selection;
      Object.assign(paper.value.cells[t - 1][l - 1], {
        type: CellType.Image,
        value: mediaId,
      });

      const { width: colWidth, manual: isColManual } = paper.value.cols[l - 1];
      const { height: rowHeight, manual: isRowManual } = paper.value.rows[t - 1];

      if ((!isColManual && !isRowManual) || (isColManual && !isRowManual)) {
        // 处理行高
        const targetHeight = colWidth * (height / width);
        if (rowHeight < targetHeight) {
          paper.value.rows[t - 1].height = targetHeight;
        }
      } else if (!isColManual && isRowManual) {
        // 处理列宽
        const targetWidth = rowHeight * (width / height);
        paper.value.cols[l - 1].width = targetWidth;
      }
    } else {
      if (!paper.value.images) paper.value.images = [];
      paper.value.images.push({
        id: Math.random().toString(36).substring(2, 10),
        mediaId,
        layout: {
          height,
          width,
          top: 0,
          left: 0,
        },
      });
    }
  }

  function setPanelData(data: { type: PanelType; refId?: string }) {
    _clearSelection();
    Object.assign(panelData, data);
  }
  function setHoverData(data: { type: PanelType; refId?: string }) {
    Object.assign(hoverData, data);
  }

  function addPaperWidget(position: 'header' | 'footer', data: PaperWidget.BasicSchema) {
    if (position === 'header') {
      if (paper.value.paperHeaderWidgets) {
        paper.value.paperHeaderWidgets.push(data);
      } else {
        paper.value.paperHeaderWidgets = [data];
      }
      // setPanelData(PanelType.PaperHeaderWidget, data.id);
    } else if (position === 'footer') {
      if (paper.value.paperFooterWidgets) {
        paper.value.paperFooterWidgets.push(data);
      } else {
        paper.value.paperFooterWidgets = [data];
      }
      // setPanelData(PanelType.PaperFooterWidget, data.id);
    }
  }

  function removePaperWidget(position: 'header' | 'footer', id: string) {
    if (position === 'header') {
      const index = paper.value.paperHeaderWidgets?.findIndex((w) => w.id === id);
      if (typeof index === 'number' && index > -1) {
        paper.value.paperHeaderWidgets?.splice(index, 1);
      }
    } else if (position === 'footer') {
      const index = paper.value.paperFooterWidgets?.findIndex((w) => w.id === id);
      if (typeof index === 'number' && index > -1) {
        paper.value.paperFooterWidgets?.splice(index, 1);
      }
    }
  }

  /**
   * 获取字段组件配置信息
   * @author lingxiaoming
   * @date 2024-06-26 07:55:50
   * @param {IBindField} data
   * @return {*}
   */
  function getFieldWidget(data: IBindField) {
    // 字段组件配置信息
    const fieldWidget: CellWidget.BasicSchema | undefined = cloneDeep(
      widgetConfigMap[FieldTypeToCellWidgetMap[data.fieldType!]].config,
    );
    if (data.subModelType === 'WAREHOUSE_IN_OUT' && data.fieldType === FIELD_TYPE.PRODUCT) {
      fieldWidget!.autofillRules = [
        {
          fromField: 'name_',
          toField: 'product_id_name_',
        },
        {
          fromField: 'code_',
          toField: 'product_id_code_',
        },
        {
          fromField: 'spec_',
          toField: 'product_id_spec_',
        },
      ];
    }
    return {
      ...fieldWidget,
      subModelType: data.subModelType || undefined,
      required:
        data.subModelType === SubTableType.MATERIAL_BALANCE &&
        data.field === 'material_balance_percent_'
          ? false
          : true, // 默认必填
    };
  }

  /**
   * 绑定字段到单元格
   * @param data
   * @param x
   * @param y
   */
  function bindFieldToCell(data: IBindField, x?: number, y?: number) {
    const { _t, _l } = selection.e;
    let t = _t;
    let l = _l;
    if (x && y) {
      t = y;
      l = x;
    }

    // 字段组件配置信息
    const fieldWidget = getFieldWidget(data);

    const content = {
      type: CellType.Field,
      fieldMeta: data,
      fieldWidget: fieldWidget,
    };
    const cell = paper.value.cells[t - 1][l - 1];
    if (cell.multiFields) {
      if (cell.multiFieldsContent === undefined) {
        cell.multiFieldsContent = [];
      }
      cell.multiFieldsContent.push({
        ...content,
        id: Math.random().toString(36).substring(2, 10),
      });
    } else {
      // 清空value的值
      cell.value = undefined;
      Object.assign(cell, {
        ...content,
        style: {
          ...cell?.style,
          'text-align': 'center',
          'vertical-align': 'middle',
        },
      });
    }
  }

  /**
   * 绑定组件到单元格
   * @param data
   * @param x
   * @param y
   */
  function bindWidgetToCell(data: PaperWidget.BasicSchema, x?: number, y?: number) {
    const { _t, _l } = selection.e;
    let t = _t;
    let l = _l;
    if (x && y) {
      t = y;
      l = x;
    }
    const cell = paper.value.cells[t - 1][l - 1];
    // 清空value的值
    cell.value = undefined;
    Object.assign(cell, {
      type: CellType.Widget,
      paperWidget: data,
      style: {
        ...paper.value.cells[t - 1][l - 1]?.style,
        'text-align': 'center',
        'vertical-align': 'middle',
      },
    });
  }

  /**
   * 绑定字段到页眉页脚组件
   * @param data
   * @returns
   */
  function bindFieldToWidget(data: IBindField) {
    let widget: PaperWidget.BasicSchema | undefined;
    if (panelData.type === PanelType.PaperHeaderWidget) {
      widget = paper.value.paperHeaderWidgets?.find((item) => item.id === panelData.refId);
    } else if (panelData.type === PanelType.PaperFooterWidget) {
      widget = paper.value.paperFooterWidgets?.find((item) => item.id === panelData.refId);
    }
    if (!widget) return;
    Object.assign(widget, {
      value: data.field,
      fieldType: data.fieldType,
      modelKey: data.model,
      modelLink: data.modelLink,
      fieldLink: data.fieldLink,
      isFieldModel: data.isFieldModel,
      subModelKey: data.subModelKey,
      subFieldKey: data.subFieldKey,
      createType: data.createType,
      refModelKey: data.refModelKey,
      subModelType: data.subModelType,
    });
  }

  /**
   * 绑定字段到单元格组件
   * @param data
   */
  function bindFieldToCellPaperWidget(data: IBindField, x?: number, y?: number) {
    const { _t, _l } = selection.e;
    let t = _t;
    let l = _l;
    if (x && y) {
      t = y;
      l = x;
    }
    paper.value.cells[t - 1][l - 1].paperWidget!.value = data.field!;
    // @ts-ignore
    paper.value.cells[t - 1][l - 1].paperWidget!.fieldType = data.fieldType;
    // @ts-ignore
    paper.value.cells[t - 1][l - 1].paperWidget!.modelKey = data.model;
    // @ts-ignore
    paper.value.cells[t - 1][l - 1].paperWidget!.modelLink = data.modelLink;
    // @ts-ignore
    paper.value.cells[t - 1][l - 1].paperWidget!.fieldLink = data.fieldLink;
    // @ts-ignore
    paper.value.cells[t - 1][l - 1].paperWidget!.isFieldModel = data.isFieldModel;
    // @ts-ignore
    paper.value.cells[t - 1][l - 1].paperWidget!.subModelKey = data.subModelKey;
    // @ts-ignore
    paper.value.cells[t - 1][l - 1].paperWidget!.subFieldKey = data.subFieldKey;
    // @ts-ignore
    paper.value.cells[t - 1][l - 1].paperWidget!.createType = data.createType;
    // @ts-ignore
    paper.value.cells[t - 1][l - 1].paperWidget!.refModelKey = data.refModelKey;
  }

  /**
   * 删除单元格绑定的字段
   * @param x
   * @param y
   * @param contentId 内容id 组合字段时使用
   */
  function unbindFieldFromCell(x, y, contentId?: string) {
    const data: Partial<ICell> = {
      type: CellType.Default,
      value: undefined,
      fieldMeta: undefined,
      fieldWidget: undefined,
    };
    const cell = paper.value.cells[y - 1][x - 1];
    if (contentId) {
      const contentIndex = (cell.multiFieldsContent ?? []).findIndex(
        (item) => item.id === contentId,
      );
      contentIndex >= 0 && cell.multiFieldsContent?.splice(contentIndex, 1);
    } else {
      Object.assign(cell, data);
    }
  }

  /**
   * 删除单元格绑定的组件
   * @param x
   * @param y
   */
  function unbindWidgetFromCell(x: number, y: number) {
    const data: Partial<ICell> = {
      type: CellType.Default,
      value: undefined,
      paperWidget: undefined,
    };
    Object.assign(paper.value.cells[y - 1][x - 1], data);
  }

  function setCallback(cbs: Partial<ICallback> = {}) {
    Object.assign(APIS, cbs);
  }

  /**
   * 切换组合字段标志 修改组件数据
   * @param x
   * @param y
   * @param multi
   */
  function toggleMultiFields(x: number, y: number, multi: boolean) {
    const cell = paper.value.cells[y - 1][x - 1];
    if (multi) {
      if (cell.multiFieldsContent === undefined) {
        cell.multiFieldsContent = [];
      }

      const { type, fieldMeta, fieldWidget } = cell;
      if (type === CellType.Field && cell.fieldMeta && cell.fieldWidget) {
        cell.multiFieldsContent.push({
          id: Math.random().toString(36).substring(2, 10),
          type,
          fieldMeta,
          fieldWidget,
        });
      }
      // 清空组件数据
      Object.assign(cell, {
        fieldMeta: undefined,
        fieldWidget: undefined,
        paperWidget: undefined,
        type: undefined,
      });
    } else {
      if (cell.multiFieldsContent?.length) {
        const { type, fieldMeta, fieldWidget } = cell.multiFieldsContent[0];
        Object.assign(cell, { type, fieldMeta, fieldWidget });
      }
      // 清空组合字段数据
      cell.multiFieldsContent = undefined;
    }
  }

  function judgeFieldDragInCell(data: IBindField, opts) {
    const firstModel = data.modelLink?.split('.')?.[0];
    if (!firstModel) return true;

    const { modelMetaMap } = useModelFields();
    const meta = modelMetaMap.value[firstModel]?.meta;

    const isSubTable = meta?.subModel ? true : false;

    const currentCellInfo = judgeCellInfo(opts.cellX, opts.cellY);

    if (!currentCellInfo) return true;

    const cellNeedSubTable =
      currentCellInfo?.dynamicTable || currentCellInfo?.fixedTable || currentCellInfo?.dataGroup2D;

    if ((!isSubTable && cellNeedSubTable) || (isSubTable && !cellNeedSubTable)) {
      message.warn(
        !isSubTable && cellNeedSubTable
          ? '主模型字段不能绑定到子模型单元格上!'
          : '子表字段不能绑定到主模型单元格上!',
      );
      return true;
    }

    const modelKey =
      currentCellInfo?.dataGroup2D?.colModel ||
      currentCellInfo?.dynamicTable?.model ||
      currentCellInfo?.fixedTable?.model;

    if (isSubTable && cellNeedSubTable && modelKey !== firstModel) {
      message.warn('字段不能跨模型绑定!');
      return true;
    }

    return false;
  }

  /**
   * 获取所有子表范围集合
   * @return {*}
   */
  function getAllSubTableRanges(): IRange[] {
    const subTableRanges: IRange[] = [];
    if (paper.value.dynamicTables?.length) {
      subTableRanges.push(...paper.value.dynamicTables.map((item) => item.range));
    }
    if (paper.value.fixedTables?.length) {
      subTableRanges.push(...paper.value.fixedTables.map((item) => item.range));
    }
    return subTableRanges;
  }

  /**
   * 判断指定范围内是否在子表区域内部
   * @param range
   * @return {*}
   */
  function isInSubTable(range: IRange): boolean {
    const subTableRanges: IRange[] = getAllSubTableRanges();
    return subTableRanges.some((item) => isIn(range, item));
  }

  /**
   * 计算指定范围内的相关数据
   * 以选中范围左上角单元格为基准定位的
   * @author lingxiaoming
   * @date 2024-07-05 05:03:48
   * @param {IRange} range
   * @return {*}  {ISelectionPaperData}
   */
  function calcSelectionPaperData(
    range: IRange,
    excludeOpts = {
      /** 排除子表字段信息 */
      noSubFields: true,
    },
  ): ISelectionPaperData {
    const { l, r, t, b } = range;
    const cells: ICell[][] = [];

    // 遍历范围内的单元格并拼接成二维数组
    for (let rowIndex = t; rowIndex <= b; rowIndex++) {
      const row = paper.value.cells[rowIndex - 1];
      const copyRow: ICell[] = [];
      for (let colIndex = l; colIndex <= r; colIndex++) {
        const cell = row[colIndex - 1];
        const cloneCell = cloneDeep(cell);
        // 移除子表字段信息配置
        if (excludeOpts.noSubFields) {
          if (
            cloneCell.type === CellType.Field &&
            cloneCell.fieldMeta?.model !== doc.value.modelKey
          ) {
            // 移除字段信息配置
            clearCellConfig(cloneCell);
          } else if (
            cloneCell.multiFields &&
            cloneCell.multiFieldsContent?.length &&
            cloneCell.multiFieldsContent[0].fieldMeta?.model !== doc.value.modelKey
          ) {
            // 移除组合字段信息配置
            clearCellConfig(cloneCell);
          }
        }
        copyRow.push(cloneCell);
      }
      cells.push(copyRow);
    }

    // 找到范围内涉及到的合并单元格
    const mergedCells = paper.value.mergedCells
      .filter((item) => {
        return isOverlap(item, range);
      })
      .map((item) => ({
        l: item.l - l + 1,
        r: item.r - l + 1,
        t: item.t - t + 1,
        b: item.b - t + 1,
      }));

    return {
      cells,
      mergedCells,
    };
  }

  /**
   * 比较两个范围数组是否一致
   * 忽略顺序，只要个数一致，且每个范围的数值都能有对应的匹配
   *
   * @author lingxiaoming
   * @date 2024-07-05 04:46:25
   * @param {IRange[]} rangesA
   * @param {IRange[]} rangesB
   * @return {*}
   */
  function compareRangeArr(rangesA: IRange[], rangesB: IRange[]) {
    const sortCompare = (a: IRange, b: IRange) => {
      if (a.t !== b.t) {
        return a.l - b.l;
      }
      if (a.b !== b.b) {
        return a.b - b.b;
      }
      if (a.l !== b.l) {
        return a.l - b.l;
      }
      return a.r - b.r;
    };
    const rangesAStr = rangesA
      .filter((item) => isValidMergeCell(item))
      .sort(sortCompare)
      .map((item) => `${item.t}-${item.l}-${item.b}-${item.r}`)
      .join(',');
    const rangesBStr = rangesB
      .filter((item) => isValidMergeCell(item))
      .sort(sortCompare)
      .map((item) => `${item.t}-${item.l}-${item.b}-${item.r}`)
      .join(',');
    return rangesAStr === rangesBStr;
  }

  function copy(): ICopyData | undefined {
    if (!hasSelection.value) {
      message.error($t('sys.onlineForm.pleaseSelectContentToCopyFirst'));
      return;
    }

    const selectionPaperData = calcSelectionPaperData(pick(selection, ['t', 'l', 'b', 'r']));

    return {
      documentId: doc.value.id!,
      ...selectionPaperData,
    };
  }

  function paste(type: 'online-form', data: ICopyData);
  function paste(type: 'text', data: string);
  function paste(type: 'html', data);
  function paste(type: string, data) {
    if (!hasSelection.value) {
      message.error($t('sys.onlineForm.pleaseSelectAreaToPasteFirst'));
      return;
    }

    // 处理表单复制的数据和处理Excel复制的数据（html格式）
    if (type === 'online-form' || type === 'html') {
      const copyData = type === 'html' ? parseHtml(data) : (data as ICopyData);

      const isSameDoc = copyData.documentId === doc.value.id;
      const rowNum = copyData.cells.length;
      const colNum = copyData.cells[0].length;

      const pasteRange = {
        l: selection.l,
        t: selection.t,
        r: selection.l + colNum - 1,
        b: selection.t + rowNum - 1,
      };

      if (pasteRange.r > paper.value.cols.length || pasteRange.b > paper.value.rows.length) {
        Modal.warning({
          title: $t('sys.onlineForm.pasteFailed'),
          content: '复制区域的大小超过粘贴区域的剩余空间，请增加足够的单元格后重试！',
        });
        return;
      }

      const pasteAreaPaperData = calcSelectionPaperData(pasteRange);

      let isAllowPaste = false;
      if (pasteAreaPaperData.mergedCells.length === 0) {
        isAllowPaste = true;
        copyData.mergedCells.forEach((item) => {
          const { l, r, t, b } = item;
          const newMerge = {
            l: l + pasteRange.l - 1,
            r: r + pasteRange.l - 1,
            t: t + pasteRange.t - 1,
            b: b + pasteRange.t - 1,
          };
          addMergedCell(newMerge);
        });
      } else {
        isAllowPaste = compareRangeArr(copyData.mergedCells, pasteAreaPaperData.mergedCells);
      }
      if (!isAllowPaste) {
        // message.error('粘贴区域与复制区域不匹配!');
        Modal.warning({
          title: $t('sys.onlineForm.pasteFailed'),
          content: '粘贴区域与复制区域不匹配!',
        });
        return;
      }

      copyData.cells.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          const { t, l } = pasteRange;
          const paperCell = paper.value.cells[t + rowIndex - 1][l + colIndex - 1];
          const copyCell = copyData.cells[rowIndex][colIndex];
          if (isSameDoc) {
            if (
              isInSubTable({ t: t + rowIndex, l: l + colIndex, b: t + rowIndex, r: l + colIndex })
            ) {
              copyCell.fieldMeta = undefined;
              copyCell.multiFieldsContent = undefined;
              copyCell.multiFields = undefined;
              copyCell.type = copyCell.type === CellType.Field ? CellType.Default : copyCell.type;
            }
            // 如果是同一个文档且不再子表范围内，则完整粘贴
            Object.assign(paperCell, copyCell);
          } else {
            // 不是同一个表单的只复制边框，样式，和直接内容
            Object.assign(paperCell, {
              border: copyCell.border,
              style: copyCell.style,
              value: copyCell.value,
            });
          }
        });
      });

      return;
    }

    // 处理普通文本数据
    if (type === 'text') {
      const cell = paper.value.cells[selection.t - 1][selection.l - 1];
      cell.value = data;
      return;
    }
  }

  /** 设置当前选中区域为数据分组，如果可行的话 */
  function setCurrentDataGroup() {
    const fixedTable = paper.value.fixedTables?.find((item) => isIn(selection, item.range));
    if (fixedTable) {
      setDataGroup(fixedTable, selection);
    }
  }

  /** 绑定反向建模到指定单元格 */
  async function reverseModelingToCell(opts: { x: number; y: number; item: IReverseModelItem }) {
    // 处理模型字段相关信息
    const currentCellInfo = judgeCellInfo(opts.x, opts.y);

    if (!currentCellInfo) return;

    const { useReverseModeling } = await loadReverseModeling();
    const { addField, getFieldDTO, validateOnlyBusinessKey } = useReverseModeling();

    if (validateOnlyBusinessKey(opts.item.type, currentCellInfo.modelKey)) {
      message.error(
        t('sys.model.businessFieldOnlyOnePerType', { type: t(`sys.model.${opts.item.type}`) }),
      );
      return;
    }
    const field = getFieldDTO({ ...opts.item, model: currentCellInfo.modelKey! });

    // 处理绑定字段相关信息
    const bindField: IBindField = {
      field: field.key,
      fieldType: field.type as any,
      model: field.modelKey,
      isFieldModel: false,
    };

    // 如果是动态表里绑定的是子表字段需要额外处理
    if (currentCellInfo.modelKey !== doc.value.modelKey) {
      bindField.subFieldKey = currentCellInfo.refFieldKey;
      bindField.subModelKey = currentCellInfo.modelKey;
    }

    // 执行添加和绑定
    addField(field);
    bindFieldToCell(bindField, opts.x, opts.y);
  }

  /** 弹出模态编辑修改虚拟字段信息 */
  async function editField(opts: { fieldKey: string; modelKey: string }) {
    const { default: FieldEditModal } = await loadFieldEditModal();
    gct.openUtil.modal(
      FieldEditModal,
      {
        field: opts,
      },
      {
        title: $t('sys.model.editField'),
        width: 640,
        zIndex: 1031,
      },
    );
  }

  /** 单据发布 */
  async function publish() {
    // const saveData = getSaveData();
    const saveData = await saveSheets(isEasyEdition.value);
    const { useReverseModeling } = await loadReverseModeling();
    const { getAllFieldVos } = useReverseModeling();
    const fieldMetaList = getAllFieldVos();
    console.log('fieldMetaList', fieldMetaList);
    await APIS.publish(
      { ...saveData, fieldMetaList, extFieldStatus: doc.value.extFieldStatus },
      t('sys.doSuccess'),
    );
  }

  /** 获取单元格的dom元素 */
  function getCellDom(opts: { x: number; y: number }) {
    const cellDomId = 'sheet-cell--' + `${NumColMap[opts.x]}${opts.y}`;
    return document.getElementById(cellDomId);
  }

  /** 自动设置单元格的宽度 */
  function setCellAutoWidth(opts: { x: number; y: number }) {
    const { x, y } = opts;
    const cell = paper.value.cells[y - 1][x - 1];
    if (cell.multiFields) {
      message.error('组合字段不支持自动设置宽度');
      return;
    } else if (cell.type !== CellType.Field) {
      message.error('只有绑定字段的单元格支持自动设置宽度');
      return;
    }
    if (cell.style) {
      const isWrap =
        cell.style['word-break'] === 'break-all' || cell.style['white-space'] === 'pre-line';
      if (isWrap) {
        message.error('换行的单元格无法自动计算并设置宽度');
        return;
      }
    }

    // 计算单元格的宽度（合并单元格计算所有列的宽度）
    let cellWidth = paper.value.cols[x - 1].width;
    const mergeCell = findMergeCell(x, y);
    if (mergeCell) {
      cellWidth = range(mergeCell.l, mergeCell.r + 1).reduce((sum, colNum) => {
        return sum + paper.value.cols[colNum - 1].width;
      }, 0);
    }

    // 获取单元格所对应的前后缀的宽度之和
    const cellEl = getCellDom(opts);
    console.log(cellEl);

    const prefixWidth =
      cellEl?.querySelector<HTMLElement>('.cell-widget-design .prefix')?.offsetWidth || 0;
    const suffixWidth =
      cellEl?.querySelector<HTMLElement>('.cell-widget-design .suffix')?.offsetWidth || 0;

    const restWidth = cellWidth - prefixWidth - suffixWidth;
    // feat:[1023094] 调整字段宽度最小限制 75 => 35（组件样式不变形的宽度）
    if (restWidth < 35 + 2) {
      message.error('单元格剩余的宽度不足，无法自动设置宽度');
      return;
    }

    cell.fieldWidget!.compWidth = restWidth - 2;
  }

  /** 自动设置单元格的高度 */
  function setCellAutoHeight(opts: { x: number; y: number }) {
    const { x, y } = opts;
    const cell = paper.value.cells[y - 1][x - 1];
    if (cell.multiFields) {
      message.error('组合字段不支持自动设置高度');
      return;
    } else if (cell.type !== CellType.Field) {
      message.error('只有绑定字段的单元格支持自动设置高度');
      return;
    }

    if (cell.style) {
      const isWrap =
        cell.style['word-break'] === 'break-all' || cell.style['white-space'] === 'pre-line';
      if (isWrap) {
        message.error('换行的单元格无法自动计算并设置高度');
        return;
      }
    }

    let cellHeight = paper.value.rows[y - 1].height;
    const mergeCell = findMergeCell(x, y);

    if (mergeCell) {
      cellHeight = range(mergeCell.t, mergeCell.b + 1).reduce((sum, colNum) => {
        return sum + paper.value.rows[colNum - 1].height;
      }, 0);
    }

    cell.fieldWidget!.compHeight = cellHeight - 2;
  }

  /** 动态生成Paper配置的函数 */
  function createPaperConfig(res) {
    if (res && res.paperSize === 'CUSTOM' && res.width && res.height && res.direction) {
      const size: number[] = [res.width, res.height].sort();

      if (res.direction === Orientation.Landscape) {
        size.reverse();
      }

      const pageWidthPx = parseInt(toPx(`${size[0]}mm`));
      const pageHeightPx = parseInt(toPx(`${size[1]}mm`));

      const availableWidthPx = pageWidthPx - DefaultPaper.padding.l - DefaultPaper.padding.r;
      const availableHeightPx = pageHeightPx - DefaultPaper.padding.t - DefaultPaper.padding.b;

      const cols = Math.max(1, Math.floor(availableWidthPx / DEFAULT_COL_WIDTH));
      const rows = Math.max(1, Math.floor(availableHeightPx / DEFAULT_ROW_HEIGHT));

      return {
        cols: Array(cols)
          .fill('')
          .map(() => ({
            width: DEFAULT_COL_WIDTH,
          })),
        rows: Array(rows)
          .fill('')
          .map(() => ({
            height: DEFAULT_ROW_HEIGHT,
          })),
        cells: Array(rows)
          .fill('')
          .map(() =>
            Array(cols)
              .fill('')
              .map(() => ({})),
          ),
      };
    }
    return {};
  }

  return {
    init,
    save,

    setSheetMaps,
    setDoc,
    setPaper,
    getPaper,
    // getSaveData,

    doc,
    paper,
    cachePaper,
    paperLayout,
    paperMedias,
    selection,
    currentCell,
    currentMultiCells,
    gridLineVisible,
    rowHeightStage,
    colWidthStage,
    paperFitHeight,
    isTextOnlineForm,
    isViewOnlineForm,
    globalSubTables,

    resizeCol,
    resizeRow,
    setColWidth,
    setRowHeight,

    selectAll,
    handleCellClick,
    clearSelection,
    selectSurroundingCell,
    selectCol,
    selectRow,

    insertRow,
    insertCol,
    insertRows,
    insertCols,
    deleteCol,
    deleteRow,

    setMerge,
    cancelMerge,
    findMergeCell,
    setStyle,
    setBorder,
    setTextWrap,
    setTextDecoration,

    validateImportFile,
    importFileToPaper,
    xlsxToJson,
    domToJson,

    setThead,
    removeThead,
    setSubTable,
    removeSubTable,
    setDataGroup,
    setDataGroup2D,
    removeDataGroup,
    removeDataGroup2D,

    insertImage,

    addPaperWidget,
    removePaperWidget,

    getFieldWidget,
    bindFieldToCell,
    unbindFieldFromCell,
    bindWidgetToCell,
    unbindWidgetFromCell,
    bindFieldToWidget,
    bindFieldToCellPaperWidget,

    toggleMultiFields,

    panelData,
    setPanelData,
    hoverData,
    setHoverData,

    designMode,
    setDesignMode,
    sheetReadonly,

    platformType,
    setPlatformType,

    tableDataGroups,
    checkRowDataGroups,
    checkColDataGroups,
    availableFunctions,
    getInitScriptFunction,
    getInitExpNode,

    setCallback,
    judgeCellInfo,
    judgeFieldDragInCell,

    copy,
    paste,
    hasCellValueEditing,

    // 撤销
    undoDisabled,
    redoDisabled,
    undo,
    redo,
    setCurrentDataGroup,
    resetRange,
    reverseModelingToCell,
    isEasyEdition,
    removeField,
    editField,
    publish,
    setCellAutoWidth,
    setCellAutoHeight,
    createPaperConfig,

    // sheets
    sheetsHasChanged,
    activeSheet,
  };
}
