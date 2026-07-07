import { ref, toRaw, watch } from 'vue';
import { uuid2 } from '@/utils/uuid';
import { useCacheHistory, useCacheHistoryInner } from '/@/hooks/develop/useCacheHistory';
import { DefaultPaper } from '../constants';
import { cloneDeep, debounce, has, omit, pick } from 'lodash-es';
import { CommonAttr, IPaper, IRange } from '../types';
import { Modal, message } from 'ant-design-vue';
import { PanelType, SubTableType } from '../enums';
import { IModelMetaMap, useModelFields } from './useModelFields';
import { SpreadSheetEventType, useSpreadSheetEvent } from './useSpreadSheetEvent';

type FieldReplaceCallback = (params: { modelKey: string; oldKey: string; newKey: string }) => void;

interface IFormTmplBom {
  id_?: string;
  table_key_?: string;
  deleted_?: boolean;
  data_version_?: unknown;
  entries_?: Array<{ operation_sort_num_: number }>;
}

export interface ISheet {
  sheetId: string;
  title: string;
  runJson?: string;
  startIndex?: number;
  paper: IPaper;
}

export interface DesignerSheets {
  mainModelKey?: string;
  modelMetaMap?: IModelMetaMap;
  sheets?: ISheet[];
}

interface SaveSheetsOptions {
  markClean?: boolean;
}

const designerConfig = ref<DesignerSheets>({});
const formDesignInfo = ref<any>({});
const sheetsData = ref<ISheet[]>([]);
const cloneSheetsData = ref<ISheet[]>([]);
const activeSheetId = ref<string | undefined>();
const activeSheet = ref<any>('');
const historyIdRef = ref('ONLINE_FORM_HISTORY_ID');
const LOCAL_FORM_DESIGNER_ID = '__local__';
/** 永久暂停缓存历史 */
const pauseCacheHistory = ref(true);
/** 跳过下一次变更导致的缓存历史 */
const skipNextCacheHistory = ref(false);

const { historyUtils } = useCacheHistory();
const { emitter } = useSpreadSheetEvent();

const APIS: {
  data: {
    panelData?: {
      type: PanelType;
      refId?: string;
    };
    selection?: IRange & { e: { _t: number; _l: number; _r: number; _b: number } };
  };
  init: (params) => void;
  set: (paper: IPaper) => void;
  save: () => void;
  historyCallback: (params) => void;
  getRunJson: () => Promise<string>;
  create: (params) => object;
} = {
  data: {},
  init: (_params) => {},
  set: (_paper) => {},
  save: () => {},
  historyCallback: (_params) => {},
  getRunJson: async () => '',
  create: (_params) => ({}),
};

const setActive = (sheetId?: string) => {
  skipNextCacheHistory.value = true;
  activeSheetId.value = sheetId;
  activeSheet.value = sheetId ? getSheet(sheetId) : '';
};

const getSheet = (paperId: string): ISheet | undefined => {
  return sheetsData.value.find((item) => item.sheetId === paperId);
};

const getSheetConfig = (sheet) => {
  return cloneDeep(pick(sheet.paper, CommonAttr));
};

const syncSheetConfig = (sheet) => {
  const config = getSheetConfig(sheet);
  if (config) {
    sheetsData.value.forEach((item) => {
      if (item.sheetId !== sheet.sheetId) {
        item.paper = {
          ...item.paper,
          ...config,
        };
      }
    });
  }
};

const checkPaperHasChanged = (sheet) => {
  const initSheet = cloneSheetsData.value.find((e) => e.sheetId === sheet.sheetId);
  if (!initSheet) return true;
  return JSON.stringify(initSheet.paper) !== JSON.stringify(sheet.paper);
};

const buildSheetRunJson = async (sheet) => {
  if (sheet && (checkPaperHasChanged(sheet) || !sheet?.runJson)) {
    sheet.runJson = await APIS.getRunJson();
  }
};

const changeActiveSheet = async (sheet: ISheet) => {
  // 如果是同一个 sheet 则不处理
  if (activeSheetId.value === sheet.sheetId) {
    return;
  }
  // 切换前，先把每个 sheet的配置同步一遍
  if (activeSheetId.value) {
    skipNextCacheHistory.value = true;
    const curSheet = getSheet(activeSheetId.value);
    if (curSheet) {
      syncSheetConfig(curSheet);
    }
    await buildSheetRunJson(curSheet);
  }
  const { sheetId, paper } = sheet;
  setActive(sheetId);
  emitter.emit(SpreadSheetEventType.SHEET_CHANGE, { to: sheetId });
  if (paper && APIS.set && typeof APIS.set === 'function') {
    APIS.set(paper);
  }
};

const {
  undoDisabled,
  restoreDisabled: redoDisabled,
  onUndo,
  onRestore,
} = useCacheHistoryInner({
  historyIdRef: historyIdRef,
  callback: (content) => {
    const cacheData = JSON.parse(content);
    console.log('缓存历史回退----', cacheData);
    const { panelData, selection, sheets, sheetId } = cacheData;
    APIS.historyCallback({
      panelData,
      selection,
    });
    const oldSheet = sheets.find((e) => e.sheetId === activeSheetId.value);
    // 新建的 sheet 在初始化缓存时是不存在的
    if (!oldSheet) {
      // const idx = sheetsData.value.findIndex((item) => item.sheetId === activeSheetId.value);
      // if (idx > -1) {
      //   sheetsData.value.splice(idx, 1);
      // }
      setActive(sheetId);
      APIS.set(sheets.find((e) => e.sheetId === sheetId)?.paper);
      return;
    }
    activeSheet.value.paper = oldSheet.paper;
    if (sheetId !== activeSheetId.value) {
      syncSheetConfig(oldSheet);
      buildSheetRunJson(oldSheet);
      setActive(sheetId);
      APIS.set(sheets.find((e) => e.sheetId === sheetId)?.paper);
    } else {
      APIS.set(oldSheet.paper);
    }
    skipNextCacheHistory.value = true;
  },
});

function _cacheStep() {
  const sheets = sheetsData.value.map((e) => ({
    sheetId: e.sheetId,
    paper: e.paper,
  }));
  const cacheData = {
    sheets,
    sheetId: activeSheetId.value,
    // sheet: toRaw(sheet || activeSheet.value),
    panelData: toRaw(APIS.data.panelData),
    selection: toRaw(APIS.data.selection),
  };
  console.log('cache', cacheData);
  historyUtils.addHistory({
    historyId: historyIdRef.value,
    past: JSON.stringify(cacheData),
  });
}

const cacheStep = debounce(_cacheStep, 500);

watch(
  // 排除不要监听的配置，转成字符串来比较是否变化
  () => JSON.stringify(omit(activeSheet.value?.paper, 'javascript')),
  (val) => {
    if (val && !pauseCacheHistory.value && !skipNextCacheHistory.value) {
      cacheStep();
    }
    if (skipNextCacheHistory.value) {
      skipNextCacheHistory.value = false;
    }
  },
);

/**
 * 普通表单里支持的字段替换操作
 * @param params
 */
const fieldReplaceCb: FieldReplaceCallback = (params) => {
  sheetsData.value.forEach((sheet) => {
    replaceAllFieldKeysLocal(sheet.paper, params);
  });
};

function isLocalDesignerInfo(info = formDesignInfo.value) {
  return info?.id === LOCAL_FORM_DESIGNER_ID;
}

function replaceAllFieldKeysLocal(
  paper: IPaper,
  params: { modelKey: string; oldKey: string; newKey: string },
) {
  const replaceBindField = (target: any) => {
    if (!target || target.model !== params.modelKey || target.field !== params.oldKey) {
      return;
    }
    target.field = params.newKey;
  };

  paper.cells?.forEach((row: any[]) => {
    row.forEach((cell: any) => {
      replaceBindField(cell?.fieldMeta);
      cell?.multiFieldsContent?.forEach?.((item) => replaceBindField(item?.fieldMeta));
    });
  });

  paper.dynamicTables?.forEach((table: any) => {
    if (table.model === params.modelKey && table.field === params.oldKey) {
      table.field = params.newKey;
    }
  });

  paper.fixedTables?.forEach((table: any) => {
    if (table.model === params.modelKey && table.field === params.oldKey) {
      table.field = params.newKey;
    }
  });
}

const hostedDesignerOnlyBuild = import.meta.env.VITE_ONLINE_FORM_HOSTED_ONLY === 'true';

async function loadHostedReverseModeling() {
  return import('/src/projects/online-form/src/hosted-shims/reverse-modeling.ts');
}

async function loadStandaloneReverseModeling() {
  return import(
    /* @vite-ignore */ '/src/projects/online-form/src/views/designer/hooks/reverse-modeling/index.ts'
  );
}

async function loadReverseModeling() {
  return hostedDesignerOnlyBuild ? loadHostedReverseModeling() : loadStandaloneReverseModeling();
}

export const useAllSpreadSheets = () => {
  // 初始化历史记录
  historyUtils.init({ historyId: historyIdRef.value, max: 20 });

  const setSheetMaps = (maps: DesignerSheets | IPaper, info: any) => {
    resetAll();
    formDesignInfo.value = { ...info };
    if (!maps) {
      maps = {
        mainModelKey: info.modelKey,
        ...{
          ...cloneDeep(DefaultPaper),
          ...APIS.create(info),
        },
      };
    }
    pauseCacheHistory.value = false; // 开始监听历史记录
    const { sheets, mainModelKey, modelMetaMap } = maps;
    if (!has(maps, 'sheets')) {
      sheetsData.value = [
        {
          sheetId: uuid2(16),
          paper: maps,
          title: $t('sys.onlineForm.worksheet') + ' 1',
          startIndex: 0,
        },
      ];
    } else {
      sheetsData.value = sheets;
    }
    mergeFormTmplBomList(info.formTmplBomList);

    designerConfig.value = {
      mainModelKey,
      modelMetaMap,
    };
    if (!isLocalDesignerInfo(info)) {
      loadReverseModeling().then(({ useReverseModeling }) => {
        const { initialize } = useReverseModeling();
        initialize({ fieldReplace: fieldReplaceCb, modelMetaMap });
      });
    }
    cloneSheetsData.value = cloneDeep(sheetsData.value);
    const { sheetId, paper } = sheetsData.value[0];
    if (paper && APIS.init && typeof APIS.init === 'function') {
      APIS.init(paper);
    }
    setActive(sheetId);
    cacheStep();
  };

  const addSheet = async (data?) => {
    const { default: AddSheet } = await import('../modules/sheets/add-sheet.vue');
    const res: any = await gct.openUtil.modal(
      AddSheet,
      {
        data,
        validator: (rule, value) => {
          if (!value || !value.trim()) {
            return Promise.reject($t('sys.onlineForm.pleaseEnterWorksheetName'));
          }
          if (
            sheetsData.value.some(
              (e) =>
                (!data && e.title === value) ||
                (data && e.sheetId !== data.sheetId && e.title === value),
            )
          ) {
            return Promise.reject($t('sys.onlineForm.worksheetNameAlreadyExists'));
          }
          return Promise.resolve();
        },
      },
      {
        title: data
          ? $t('sys.component.dataConnection.rename')
          : $t('sys.onlineForm.createNewWorksheet'),
        zIndex: 1040,
      },
    );
    if (!res.ok) return;
    if (data) {
      const sheet = getSheet(data.sheetId)!;
      sheet.title = res.data.title;
    } else {
      const config = getSheetConfig(activeSheet.value);
      const maxIdx = Math.max(...sheetsData.value.map((e) => e.startIndex ?? 0));
      const sheet = {
        title: res.data.title,
        sheetId: uuid2(16),
        startIndex: maxIdx + 1,
        paper: {
          ...cloneDeep(DefaultPaper),
          ...APIS.create(formDesignInfo.value),
          ...config,
        },
      };
      cacheStep();
      sheetsData.value.push(sheet);
      await changeActiveSheet(sheet);
    }
  };

  const deleteSheet = async (sheet) => {
    Modal.confirm({
      title: $t('sys.onlineForm.deleteSheetConfirmTip', { name: sheet.title }),
      content: $t('sys.onlineForm.deletedConfirmTip'),
      zIndex: 1040,
      onOk: async () => {
        if (activeSheetId.value === sheet.sheetId) {
          activeSheetId.value = '';
          setActive();
        }
        const idx = sheetsData.value.findIndex((item) => item.sheetId === sheet.sheetId);
        if (idx > -1) {
          sheetsData.value.splice(idx, 1);
          const curIdx = idx > sheetsData.value.length - 1 ? sheetsData.value.length - 1 : idx;
          await changeActiveSheet(sheetsData.value[curIdx]);
        }
        historyUtils.resetHistoryById(historyIdRef.value);
      },
    });
  };

  const setSheetsCallback = (opts = {}) => {
    Object.assign(APIS, opts);
  };

  function resetAll() {
    setActive();
    sheetsData.value = [];
    cloneSheetsData.value = [];
    designerConfig.value = {};
    formDesignInfo.value = {};
    historyUtils.resetHistoryById(historyIdRef.value); //重置历史记录
  }

  function caculateRowIdx(obj = {}, offset = 0) {
    return Object.entries(obj).reduce((map, [k, v]) => {
      const idx = Number(k.match(/\d+/)?.[0]) ?? 0;
      const key = k.replace(/\d+/, (idx + offset).toString());
      map[key] = v;
      return map;
    }, {});
  }

  /**
   * 保存所有工作表
   * @param isEasyEdition 是否是傻瓜模式
   * @returns
   */
  async function saveSheets(isEasyEdition?: boolean, options: SaveSheetsOptions = {}) {
    try {
      // 删除反向建模未使用的字段
      if (isEasyEdition && !isLocalDesignerInfo()) {
        const { useReverseModeling } = await loadReverseModeling();
        const { clearUnusedModel } = useReverseModeling();
        const { modelMetaMap } = useModelFields();
        clearUnusedModel({ ...designerConfig.value, sheets: sheetsData.value });
        designerConfig.value.modelMetaMap = toRaw(modelMetaMap.value);
      }
      await buildSheetRunJson(activeSheet.value);
      const run = sheetsData.value.reduce(
        (obj: any, s: any) => {
          if (!s.startIndex && s.startIndex !== 0) {
            const max = Math.max(...sheetsData.value.map((s: any) => s.startIndex ?? -1));
            s.startIndex = max + 1;
          }
          const json = JSON.parse(s.runJson!);
          const props = json.paper.props;
          obj.nextIds = [...(obj.nextIds || []), ...(json.paper.nextIds || [])];
          obj.cells = {
            ...obj.cells,
            ...omit(json, 'paper'),
          };
          obj.subTableFieldMap = [...obj.subTableFieldMap, ...(props?.subTableFieldMap || [])];
          obj.subTable2DList = [...obj.subTable2DList, ...(props?.subTable2DList || [])];
          obj.checkTable2DList = [...obj.checkTable2DList, ...(props?.checkTable2DList || [])];
          obj.fixedTableFieldMap = {
            ...obj.fixedTableFieldMap,
            ...caculateRowIdx(props?.fixedTableFieldMap || {}, s.startIndex * 10000),
          };
          obj.fixedTableLenMap = {
            ...obj.fixedTableLenMap,
            ...(props?.fixedTableLenMap || {}),
            // ...caculateRowIdx(props?.fixedTableLenMap || {}, s.startIndex),
          };
          return obj;
        },
        {
          nextIds: [],
          cells: {},
          subTableFieldMap: [],
          fixedTableFieldMap: {},
          fixedTableLenMap: {},
          subTable2DList: [],
          checkTable2DList: [],
        },
      );
      const runJsonSheet = JSON.parse(activeSheet.value.runJson);
      if (run.checkTable2DList?.length) {
        // 存在检验表的情况下提前打上第一行的标记 方便运行时候 复制行
        const checkedTableCells = Object.values(run.cells).filter((c) => c.props.isNewCheckTable2D);
        run.checkTable2DList.forEach((item: any) => {
          const rowSubFieldKey = item.rowSubFieldKey;
          const cellItem = checkedTableCells.find(
            (c) => c.props.fixedTableFieldId === rowSubFieldKey,
          );
          item.cellId = cellItem?.preId;
        });
      }
      if (options.markClean !== false) {
        cloneSheetsData.value = cloneDeep(sheetsData.value);
      }
      return {
        designerJson: JSON.stringify({ ...designerConfig.value, sheets: sheetsData.value }),
        runtimeJson: JSON.stringify({
          paper: {
            ...runJsonSheet.paper,
            nextIds: run.nextIds,
            props: {
              ...runJsonSheet.paper.props,
              ...omit(run, ['cells', 'nextIds']),
            },
          },
          ...run.cells,
        }),
        direction: activeSheet.value.paper.orientation,
        formTmplBomList: collectFormTmplBomList(),
      };
    } catch (error) {
      return Promise.reject(error);
    }
  }

  const sheetsHasChanged = () => {
    return JSON.stringify(cloneSheetsData.value) !== JSON.stringify(sheetsData.value);
  };

  /** 普通表单里支持的删除字段操作 */
  async function removeField(opts: { fieldKey: string; modelKey: string }) {
    const { calcUsedFields, useReverseModeling } = await loadReverseModeling();
    const { removeField: remove } = useReverseModeling();
    const usedFields = calcUsedFields({
      mainModelKey: designerConfig.value.mainModelKey!,
      sheets: sheetsData.value ?? designerConfig.value.sheets,
    });
    const removeKey = `${opts.modelKey}.${opts.fieldKey}`;
    if (usedFields.includes(removeKey)) {
      message.warn($t('sys.onlineForm.fieldInUseCannotBeDeleted'));
      return;
    }

    Modal.confirm({
      title: $t('sys.confirmDel', {
        sth: $t('sys.field'),
      }),
      zIndex: 2000,
      async onOk() {
        remove({ fieldKey: opts.fieldKey, modelKey: opts.modelKey });
      },
      onCancel() {},
    });
  }

  /**
   * 收集每个分页里的bom配置信息
   */
  function collectFormTmplBomList() {
    const { formTmplBomList } = formDesignInfo.value;
    const result: IFormTmplBom[] = [];
    const usedIds: string[] = [];
    sheetsData.value.forEach((sheet) => {
      sheet.paper.dynamicTables?.forEach((table) => {
        if (table.mcBomConfig) {
          result.push(table.mcBomConfig);
          if (table.mcBomConfig.id_) {
            // 后台存过的数据
            usedIds.push(table.mcBomConfig.id_);
          }
        }
      });
    });

    // 补充删除的数据
    formTmplBomList.forEach((item) => {
      if (item.id_ && !usedIds.includes(item.id_)) {
        item.deleted_ = true;
        result.push(item);
      }
    });
    return result.map((i) => {
      // 不克隆影响表单是否修改的判断
      const cloneData = cloneDeep(i);
      // 删除的话连续保存会报被别人修改
      delete cloneData.data_version_;
      return cloneData;
    });
  }

  /**
   * 根据list替换每个表单的物料消费表的配置
   * @param list
   */
  function mergeFormTmplBomList(list?: IFormTmplBom[]) {
    if (!list?.length) {
      return;
    }
    sheetsData.value.forEach((sheet) => {
      sheet.paper.dynamicTables?.forEach((table) => {
        if (table.type === SubTableType.MATERIAL_CONSUMPTION) {
          table.mcBomConfig = list.find((item) => item.table_key_ === `${table.id}:${table.field}`);

          // 按operation_sort_num_字段排序
          if (table.mcBomConfig?.entries_.length) {
            table.mcBomConfig.entries_ = table.mcBomConfig.entries_.sort(
              (a, b) => a.operation_sort_num_ - b.operation_sort_num_,
            );
          }
        }
      });
    });
  }

  return {
    designerConfig,
    sheetsData,
    activeSheetId,
    activeSheet,

    setSheetMaps,
    getSheet,
    addSheet,
    deleteSheet,
    changeActiveSheet,
    setSheetsCallback,
    saveSheets,
    sheetsHasChanged,

    undoDisabled,
    redoDisabled,
    onUndo,
    onRestore,

    removeField,
  };
};
