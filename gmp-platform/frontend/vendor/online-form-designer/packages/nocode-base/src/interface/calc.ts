import toPx from 'unit-to-px';
import dayjs from 'dayjs';
import { FIELD_TYPE } from '@gct/runtime';
import { merge, get, cloneDeep, last, first, isEmpty } from 'lodash-es';
import { uuid2 } from '../_utils_';
import { CellType, ComponentTypeEnum, RenderModeEnum } from '../constant';
import { renderUtils } from './render';
import { DOMHeightCalculator } from './dom-height-calculator';
import type { IMarketData, IDealWithItem, IPageItem, IPageData, IMergeCells } from '../types/index';

/**
 * 行高自适应有如下限制条件
 * 1. 表单单元格必须配置换行属性
 * 2. 数值、图片、附件、签名、追溯类型组件不支持
 * 3. 组合字段或者引用字段只要包含上述 2 中的一项，那么这个单元格也不支持
 * 4. 在动态表中，不会对一组行进行拆分
 * 5. 动态表的外围包裹的单元格不支持自适应
 * 6. 自适应可能会出现死循环的问题
 */
const calculator = new DOMHeightCalculator();

const LAB_JSON_TYPES = new Set([
  ComponentTypeEnum.Department,
  ComponentTypeEnum.EnumSelect,
  ComponentTypeEnum.Select,
  ComponentTypeEnum.Switch,
  ComponentTypeEnum.Userpicker,
]);

/** 计算内容高度 */
const getContentHeight = (content, width, style) => {
  if (!content) return 0;
  return calculator.calculateHeight({ content, width, style }).height;
};

/** 计算单元格宽度 */
const getCellWidth = (colsWidth, tdIndex, colspan) =>
  colsWidth.slice(tdIndex, tdIndex + colspan).reduce((acc, item) => acc + item, 0);

const buildCellStyle = (cellInfo) => ({
  fontSize: '12px',
  ...cellInfo.style,
  ...((cellInfo.cellWidget && cellInfo.cellWidget.style) || {}),
});

const makeDynEntry = ({ tdId, tdIndex, dataFsSymbol, cellFixedWidth, style, isCellMerge }) => ({
  tdId,
  tdIndex,
  dataFsSymbol,
  cellFixedWidth,
  style,
  isCellMerge,
});

const joinIfArray = (v) => (Array.isArray(v) ? v.join(', ') : v);

/** 获取接口存的数据 */
const getModelValue = (info, data) => {
  const multiple = info.fieldType === FIELD_TYPE.OPTION_MULTI;
  const value = info.isFieldModel ? data?._OPCT?.[info.field] : data?.[info.field];
  if (info.fieldType === FIELD_TYPE.BOOLEAN) {
    return renderUtils.getBoolValue(value);
  }
  return renderUtils.getValue(value, multiple);
};

const getShowModelValue = (info, field, data) => {
  const modelValue = getModelValue(info, data);

  const dictLookup = data?._DICT?.[field]?.[modelValue ?? ''];
  const fallbackField = data?.[field];
  let textValue = dictLookup ?? fallbackField ?? modelValue ?? '';

  textValue = joinIfArray(textValue);

  if (LAB_JSON_TYPES.has(info.componentType)) {
    const lab = renderUtils.getLabJsonValue(data, field);
    if (lab !== undefined && lab !== null && lab !== '') {
      textValue = joinIfArray(lab);
    }
  } else if (
    info.componentType === ComponentTypeEnum.Datepicker ||
    info.componentType === ComponentTypeEnum.DateTimepicker
  ) {
    const format = info.enableCustomFormat ? info.customFormat : info.format;
    const parsed = dayjs(textValue);
    textValue = parsed.isValid() ? parsed.format(format) : String(textValue ?? '');
  } else if (info.componentType === ComponentTypeEnum.Timepicker) {
    if (textValue) {
      const format = info.enableCustomFormat ? info.customFormat : info.format;
      const parsed = dayjs(`0000-01-01 ${textValue}`);
      textValue = parsed.isValid() ? parsed.format(format) : String(textValue);
    } else {
      textValue = '';
    }
  } else {
    textValue = String(textValue ?? '');
  }

  return textValue;
};

// 解析自定义标签
const analyzeCustomTag = (info, data) => {
  return info.template.replace(/<gct\b([^>]*)>([\s\S]*?)<\/gct>/g, (match, attrs, inner) => {
    const fm = inner.match(/\$\{\s*([^}\s]+)\s*\}/);
    const field = fm ? fm[1] : '';
    const val = getShowModelValue(info.fSymbol, field, data);
    return val || '';
  });
};

const hasReadonlyViewType = (cfg, data) => {
  if (!cfg || !cfg['gct-main']) return false;

  const allViewTypes = cfg['gct-main'].flatMap((item) => {
    const { fSymbol } = item;
    const modelValue = getModelValue(fSymbol, data);

    const extras: any = [];

    if (Array.isArray(modelValue)) {
      for (const mv of modelValue) {
        const branch = cfg?.[`${fSymbol.field}.${mv}`];
        if (Array.isArray(branch)) extras.push(...branch.map((b) => b.viewType));
      }
    } else {
      const branch = cfg?.[`${fSymbol.field}.${modelValue}`];
      if (Array.isArray(branch)) extras.push(...branch.map((b) => b.viewType));
    }

    return [item.viewType, ...extras];
  });

  return allViewTypes.some((v) => v === 'readonly-component');
};

const computeNewDynConfigText = (cfg, data) => {
  if (!cfg || !cfg['gct-main']) return '';

  const parts = cfg['gct-main'].flatMap((item) => {
    const primary = analyzeCustomTag(item, data);

    const modelValueForBranch = getModelValue(item.fSymbol, data);

    const extras: any = [];

    if (Array.isArray(modelValueForBranch)) {
      for (const mv of modelValueForBranch) {
        const branch = cfg?.[`${item.fSymbol.field}.${mv}`];
        if (Array.isArray(branch)) extras.push(...branch.map((b) => analyzeCustomTag(b, data)));
      }
    } else {
      const branch = cfg?.[`${item.fSymbol.field}.${modelValueForBranch}`];
      if (Array.isArray(branch)) extras.push(...branch.map((b) => analyzeCustomTag(b, data)));
    }

    return [primary, ...extras];
  });

  return parts.join('');
};

/** 处理 rowspan 和 colspan 和 动态单元格信息 */
function setCellMergeAndDynamicInfo({
  runtimeJson,
  marketList,
  widget,
  subInfo,
  currentTrIndex,
  curTdId,
  curTdIndex,
  dnyFormState,
  formState,
}) {
  const cellInfo = runtimeJson[curTdId];

  const upsertMergeCell = (targetRowIndex, mergeKey, entry, subWrapTdId) => {
    const extra = subInfo
      ? {
          subWidgetId: subInfo.widgetId,
          subWrapperTdId: subWrapTdId,
        }
      : undefined;

    merge(
      marketList[targetRowIndex],
      {
        mergeCells: {
          [mergeKey]: entry,
        },
      },
      extra,
    );
  };

  const upsertDynCell = (targetRowIndex, mergeKey, entry) => {
    merge(marketList[targetRowIndex], {
      dynCells: {
        [mergeKey]: entry,
      },
    });
  };

  const upsertDynForRow = (rowIndex, tdId, entry) => {
    upsertDynCell(rowIndex, tdId, entry);
  };

  const applyToRowspan = (startRowIndex, rowspanNumber, cb) => {
    for (let offset = 1; offset < rowspanNumber; offset++) {
      const nextRowIndex = startRowIndex + offset;
      const nextTrId = widget.nextIds[nextRowIndex];
      const nextTdId = runtimeJson[nextTrId].nextIds[curTdIndex];
      cb(nextRowIndex, nextTdId, offset);
    }
  };

  let rowspan = get(cellInfo.props, 'rowspan');
  const colspan = get(cellInfo.props, 'colspan');
  if (colspan && !rowspan) rowspan = '1';

  if (rowspan) {
    const rowspanNumber = parseInt(rowspan, 10);
    const colspanNumber = colspan ? parseInt(colspan, 10) : undefined;
    const borderAttrs = get(cellInfo.props, 'sourceBorderAttrs');
    const value = get(cellInfo.cellWidget.props, 'value');
    const cellUuid = uuid2(8);

    upsertMergeCell(
      currentTrIndex,
      cellUuid,
      {
        tdId: curTdId,
        dataFsSymbol: `gct.${curTdId}`,
        rowspan: rowspanNumber,
        colspan: colspanNumber,
        borderAttrs,
        value,
      },
      curTdId,
    );

    applyToRowspan(currentTrIndex, rowspanNumber, (rowIndex, nextTdId, offset) => {
      upsertMergeCell(
        rowIndex,
        cellUuid,
        {
          tdId: nextTdId,
          dataFsSymbol: `gct.${curTdId}`, // 引用原始 top 的符号
          rowspan: rowspanNumber - offset,
          colspan: colspanNumber,
          borderAttrs,
          value,
        },
        nextTdId,
      );
    });
  }

  if (cellInfo.cellHidden) return;

  const colspanNumberForWidth = rowspan ? (colspan ? parseInt(colspan, 10) : undefined) : 1;
  const commonStyle = buildCellStyle(cellInfo);
  const colsWidth = widget.props.colsWidth;

  const processDynCell = ({ textOrValue }) => {
    const cellFixedWidth = getCellWidth(colsWidth, curTdIndex, Number(colspanNumberForWidth ?? 1));

    if (dnyFormState) {
      merge(dnyFormState, { [`gct.${curTdId}`]: textOrValue });
    }

    const rowspanNumber = parseInt(rowspan, 10);
    const isCellMerge = rowspanNumber > 1;

    const entry = makeDynEntry({
      tdId: curTdId,
      tdIndex: curTdIndex,
      dataFsSymbol: `gct.${curTdId}`,
      cellFixedWidth,
      style: commonStyle,
      isCellMerge: isCellMerge,
    });

    upsertDynForRow(currentTrIndex, curTdId, entry);

    // 如果有 rowspan，写入后续行
    if (rowspan) {
      applyToRowspan(currentTrIndex, rowspanNumber, (rowIndex, nextTdId) => {
        const entryForRow = makeDynEntry({
          tdId: nextTdId,
          tdIndex: curTdIndex,
          dataFsSymbol: `gct.${curTdId}`,
          cellFixedWidth,
          style: commonStyle,
          isCellMerge: true,
        });
        upsertDynForRow(rowIndex, nextTdId, entryForRow);
      });
    }
  };

  const shouldProcess =
    cellInfo.cellValueType === CellType.Field &&
    cellInfo?.props?.autoLineBreak &&
    !isEmpty(cellInfo.newDynConfig);

  if (!shouldProcess) return;

  const computeIfNeeded = (rowData) => {
    return hasReadonlyViewType(cellInfo.newDynConfig, rowData)
      ? undefined
      : computeNewDynConfigText(cellInfo.newDynConfig, rowData);
  };

  let flagKey = 'gct_dyn_main';
  // 字段是主模型或者固定表的
  if (cellInfo.preLocation === ComponentTypeEnum.PAPER) {
    if (cellInfo.props.isNewFixedTableTd || cellInfo.props.isNewCheckTable2D) {
      // 固定表 检验表
      flagKey = 'gct_dyn_sub_gd';
    }
  } else if (cellInfo.cellWidget.props.subFieldKey && cellInfo.cellWidget.props.subModelKey) {
    // 动态表 二维表
    flagKey = 'gct_dyn_sub_dt';
  }

  if (flagKey === 'gct_dyn_sub_dt') {
    const formData = formState?.[widget.props.field] ?? [];
    const results = formData.map((item) => computeIfNeeded(item));

    // 仅在至少有一项需要动态计算时才调用
    // todo 这里如果是空的话，说明当前行的这个字段是不需要动态计算的
    const hasAny = results.some((v) => v !== undefined);
    if (hasAny) {
      processDynCell({ textOrValue: results });
    }
  } else {
    const formData =
      flagKey === 'gct_dyn_sub_gd'
        ? formState?.[cellInfo.props.fixedTableFieldId]?.[cellInfo.cellFixedTableDataIdx ?? 0]
        : formState;

    const text = computeIfNeeded(formData);

    if (text !== undefined) {
      processDynCell({ textOrValue: text });
    }
  }
}

/** 快速累加和 */
function addCumulativeSumFast(list: Array<IDealWithItem | IDealWithItem[]>, initialHeight = 0) {
  let currentHeight = initialHeight;

  const sumFastList = list.map((item) => {
    if (!Array.isArray(item)) {
      currentHeight += item.height;
      return currentHeight;
    } else {
      return item.map((other) => {
        if (!Array.isArray(other)) {
          currentHeight += other.height;
          return currentHeight;
        }

        return other.map((sd) => {
          return last(
            sd.map((sdItem) => {
              currentHeight += sdItem.height;
              return currentHeight;
            }),
          );
        });
      });
    }
  });

  return {
    sumFastList,
    sumHeight: currentHeight,
  };
}

/** 获取切分点 */
function findClosestHeightFast(data, paperHeight) {
  // 递归将嵌套数组扁平化，同时保留路径索引
  const flattenData = (data, parentIndices = []) => {
    const flatData: any = [];
    data.forEach((item, i) => {
      const currentIndices: any = [...parentIndices, i];
      if (Array.isArray(item)) {
        flatData.push(...flattenData(item, currentIndices));
      } else {
        const height = parseFloat(item); // 提取高度
        if (!isNaN(height)) {
          flatData.push({ height, indices: currentIndices });
        }
      }
    });
    return flatData;
  };

  // 二分查找比目标值小或等于的最大值
  const binarySearchClosest = (flatData, target) => {
    let left = 0,
      right = flatData.length - 1;
    let result = null;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const { height } = flatData[mid];

      if (height <= target) {
        result = flatData[mid];
        left = mid + 1;
      } else {
        right = mid - 1;
      }
    }

    return result;
  };

  const flatData = flattenData(data); // 扁平化数据
  const result: any = binarySearchClosest(flatData, paperHeight);
  return result;
}

/** 切分 */
function processData(data, indices, value, prevPageData) {
  // 提取指定前缀的字符串
  const extractByPrefix = (array, prefix) => {
    if (!Array.isArray(array)) return [];
    return array.flat(Infinity).filter((item) => item.status === prefix);
  };

  // 获取指定路径的父级数组
  const getParentArray = (array, indexPath) => {
    if (indexPath.length <= 1) {
      return [];
    }

    const temp = array[indexPath?.[0]].flat(Infinity);

    const aa = temp.slice(
      0,
      indexPath.slice(1).reduce((a, b) => a + b, 1),
    );

    return aa;
  };

  // 分割数组
  const dfsSplit = (array, indexPath) => {
    // 如果索引路径为空，直接返回原数组为 temp2
    if (!indexPath.length) return { current: [], next: array };

    const [currentIndex, ...remainingPath] = indexPath;

    const current = array.slice(0, currentIndex); // 当前页
    const next = array.slice(currentIndex + 1); // 下一页

    const currentElement = array[currentIndex];

    if (remainingPath.length > 0 && Array.isArray(currentElement)) {
      // 如果当前索引是嵌套数组，则递归处理
      const { current: subCurrent, next: subNext } = dfsSplit(currentElement, remainingPath);

      return {
        current: [...current, subCurrent.length > 0 ? subCurrent : currentElement],
        next: subNext.length > 0 ? [subNext, ...next] : next,
      };
    }

    // 如果没有剩余路径或当前索引不是数组，直接加入 temp1
    return {
      current: [...current, currentElement],
      next,
    };
  };

  // 主逻辑
  const { current, next } = dfsSplit(data, indices);

  // console.log('current', current);
  // console.log('next', next);

  // 提取 GH 开头的数组
  const GHlist = extractByPrefix(current, calcUtils.GH);
  // 提取 SH 开头的数组
  const parentArray = getParentArray(data, indices);
  const SHlist = extractByPrefix(parentArray, calcUtils.SH);

  // console.log('GHlist', GHlist);
  // console.log('SHlist', SHlist);

  let cloneNext = cloneDeep(next);
  if (Array.isArray(next) && next.length !== 0) {
    if (SHlist.length !== 0) {
      if (cloneNext?.[0]) {
        if (Array.isArray(cloneNext?.[0])) {
          cloneNext?.[0]?.unshift(...SHlist);
        } else {
          cloneNext = [...SHlist, ...cloneNext];
        }
      }
    }
    if (GHlist.length !== 0) {
      cloneNext = [...GHlist, ...cloneNext];
    }
  }

  const pageData: IPageItem = {
    uuids: new Set(),
    dynHeights: new Map(),
    relation: {},
    totalHeight: value,
  };

  current.forEach((item) => {
    if (!Array.isArray(item)) {
      pageData.uuids.add(item.uuid);
      pageData.dynHeights.set(item.uuid, item.height);
    } else {
      const dynLen = item.find((sItem) => Array.isArray(sItem))?.length ?? 0;

      const flatList = item
        .map((sItem) => (!Array.isArray(sItem) ? sItem : first(sItem)))
        .flat(Infinity);

      const subFieldId = flatList?.[0].subFieldId;

      const prevEnd = prevPageData && prevPageData[subFieldId] ? prevPageData[subFieldId].end : 0;

      pageData.relation[subFieldId] = { start: prevEnd, end: prevEnd + dynLen };

      flatList.forEach((sItem) => {
        pageData.uuids.add(sItem.uuid);
      });

      for (const kk of item) {
        if (Array.isArray(kk)) {
          for (const row of kk) {
            for (const cell of row) {
              const { uuid, height } = cell;
              const existing = pageData.dynHeights.get(uuid);
              if (existing === undefined) {
                pageData.dynHeights.set(uuid, [height]);
              } else if (Array.isArray(existing)) {
                existing.push(height);
              } else {
                pageData.dynHeights.set(uuid, [existing, height]);
              }
            }
          }
        } else {
          pageData.dynHeights.set(kk.uuid, kk.height);
        }
      }
    }
  });
  // console.log('pageData', pageData);
  // console.log('cloneNext', cloneNext);

  return {
    current: pageData,
    next: cloneNext,
  };
}

/** 分页工具类 */
export const calcUtils = {
  /** 全局表头 */
  GH: 'GH',
  /** 固定行 */
  FR: 'FR',
  /** 子表表头 */
  SH: 'SH',
  /** 子表动态行 */
  SD: 'SD',

  /** 获取模板大盘概述 */
  marketOverview: (runtimeJson, formState) => {
    // console.log('ss runtimeJson', runtimeJson);
    const paper = runtimeJson[ComponentTypeEnum.PAPER];

    const tempMarketList: Array<IMarketData> = Array.from({ length: paper.nextIds.length }, () => {
      return {
        trId: '',
        status: '',
        height: 0,
        mergeCells: {},
        dynCells: {},
      };
    });

    const tempSubMarketMap = {};
    const dnyFormState = {};

    let currentTrIndex = 0;

    while (currentTrIndex < paper.nextIds.length) {
      const currentTrId = paper.nextIds[currentTrIndex];
      const { props } = runtimeJson[currentTrId];

      if (props.subTableCmpType === ComponentTypeEnum.SUB_TABLE && props.subTableRow) {
        props.subTableRowTypes.forEach((type, typeIndex) => {
          const flag =
            type === 'thead' ? calcUtils.SH : type === 'dynamicTr' ? calcUtils.SD : calcUtils.FR;
          const realTrIndex = currentTrIndex + typeIndex;
          const realTrId = paper.nextIds[realTrIndex];
          const realTrInfo = runtimeJson[realTrId];

          merge(tempMarketList[realTrIndex], {
            trId: realTrId,
            status: flag,
            height: get(realTrInfo, 'props.height', 30),
            subFieldId: props.subTableRow,
          });

          realTrInfo.nextIds.forEach((realTd, realTdIndex) => {
            const realTdInfo = runtimeJson[realTd];

            // 子表table信息
            let subInfo;

            if (realTdInfo.nextIds?.length) {
              const subWidgetId = realTdInfo.nextIds[0];

              // 用于子表内部切分处理，和外层无关系
              const subWidget = runtimeJson[subWidgetId];

              const subtableMarketList: Array<Omit<IMarketData, 'height'>> = Array.from(
                { length: subWidget.nextIds.length },
                () => {
                  return {
                    trId: '',
                    status: '',
                    mergeCells: {},
                    dynCells: {},
                  };
                },
              );

              subWidget.nextIds.forEach((strId, strIndex) => {
                merge(subtableMarketList[strIndex], {
                  trId: strId,
                });

                runtimeJson[strId].nextIds.forEach((stdId, stdIndex) => {
                  setCellMergeAndDynamicInfo({
                    runtimeJson,
                    marketList: subtableMarketList,
                    widget: subWidget,
                    subInfo: undefined,
                    currentTrIndex: strIndex,
                    curTdId: stdId,
                    curTdIndex: stdIndex,
                    dnyFormState,
                    formState,
                  });
                });
              });

              tempSubMarketMap[subWidgetId] = subtableMarketList;
              subInfo = {
                widgetId: subWidgetId,
              };
            }

            setCellMergeAndDynamicInfo({
              runtimeJson,
              marketList: tempMarketList,
              widget: paper,
              subInfo,
              currentTrIndex: realTrIndex,
              curTdId: realTd,
              curTdIndex: realTdIndex,
              dnyFormState,
              formState,
            });
          });

          const subWidgetId = tempMarketList[realTrIndex].subWidgetId;
          if (subWidgetId && tempSubMarketMap[subWidgetId]) {
            merge(tempSubMarketMap[subWidgetId]?.[typeIndex], {
              linkTrId: tempMarketList[realTrIndex].trId,
              status: tempMarketList[realTrIndex].status,
            });
          }
        });

        currentTrIndex += props.subTableRowTypes.length;
      } else {
        merge(tempMarketList[currentTrIndex], {
          trId: currentTrId,
          status: props.identifier === 'thead' ? calcUtils.GH : calcUtils.FR,
          height: get(props, 'height', 30),
        });

        runtimeJson[currentTrId].nextIds.forEach((curTdId, curTdIndex) => {
          setCellMergeAndDynamicInfo({
            runtimeJson,
            marketList: tempMarketList,
            widget: paper,
            subInfo: undefined,
            currentTrIndex,
            curTdId,
            curTdIndex,
            dnyFormState,
            formState,
          });
        });

        currentTrIndex++;
      }
    }

    // console.log('获取模板大盘概述 marketList:', tempMarketList);

    const grouped = new Map();
    const marketMap = new Map<string, IMarketData>();
    const dealWithList: Array<IDealWithItem | IDealWithItem[]> = [];
    tempMarketList.forEach((item, index) => {
      const uuid = `t${index}${uuid2(8)}`;
      marketMap.set(uuid, item);
      const subFieldId = item.subFieldId;
      if (!subFieldId) {
        dealWithList.push({
          uuid: uuid,
          status: item.status,
          height: item.height,
        });
      } else {
        if (!grouped.has(subFieldId)) {
          // 初次出现，创建分组并加入结果
          const group = [];
          grouped.set(subFieldId, group);
          dealWithList.push(group);
        }
        // 将项加入对应分组
        grouped.get(subFieldId).push({
          uuid: uuid,
          status: item.status,
          height: item.height,
          subFieldId,
        });
      }
    });

    const subMarketMap = Object.fromEntries(
      Object.entries(tempSubMarketMap).map(([key, value]: [any, any]) => [
        key,
        value.reduce((acc, item: IMarketData) => {
          acc[item.linkTrId!] = item;
          return acc;
        }, {}),
      ]),
    );

    return {
      /** 模板大盘概述集合 */
      marketMap,
      /** 子表概述集合 */
      subMarketMap,
      /** 处理列表 */
      dealWithList,
      /** 动态分页内容 */
      dnyFormState,
    };
  },

  /** 获取纸张内容最大高度 */
  getPaperHeight: (paper) => {
    //! 当前是固定行模式了，所以不需要在动态获取纸张+内容高度，直接通过插件计算高度
    const { pageHeight, pageMargins } = paper.props || {};
    const paddings = pageMargins?.split(' ');
    const paperHeight = parseFloat(toPx(`${pageHeight}mm`));
    const ptValue = parseFloat(toPx(`${paddings?.[0] || '0'}mm`));
    const pbValue = parseFloat(toPx(`${paddings?.[2] || '0'}mm`));

    return Math.floor(paperHeight - ptValue - pbValue);
  },

  /** 预设子表长度后获取完整模板数据 */
  expandSDRows: (
    baseMarket: {
      marketMap: Map<string, IMarketData>;
      subMarketMap: any;
      dealWithList: (IDealWithItem | IDealWithItem[])[];
      dnyFormState: Record<string, any>;
    },
    config: Record<string, number>,
    paperHeight: number,
  ) => {
    const toMergeMap = (mergeCells: IMergeCells) =>
      new Map(Object.values(mergeCells).map((m) => [m.tdId, m]));

    function computeDynHeightAndUpdate({ dynList, getState, setState, mergeMap, baseHeight }) {
      if (!dynList || dynList.length === 0) {
        return Math.min(baseHeight || 0, paperHeight);
      }

      const heights = dynList.map((dynItem) => {
        const content = getState(dynItem.dataFsSymbol);
        if (dynItem.isCellMerge) {
          const mergeCell = mergeMap.get(dynItem.tdId);
          return mergeCell && mergeCell.rowspan === 1
            ? getContentHeight(content, dynItem.cellFixedWidth, dynItem.style)
            : 0;
        }
        return getContentHeight(content, dynItem.cellFixedWidth, dynItem.style);
      });

      // 获取当前行的最大动态高度
      const maxFromHeights = heights.length ? Math.max(...heights, baseHeight) : baseHeight;
      const maxDynHeight = Math.min(maxFromHeights, paperHeight);

      // 再遍历一遍处理合并单元格：计算可见/隐藏文本并更新状态
      for (const dynItem of dynList) {
        if (!dynItem.isCellMerge) continue;
        const mergeCell = mergeMap.get(dynItem.tdId);
        if (!mergeCell) continue;
        const content = getState(dynItem.dataFsSymbol);

        const res = calculator.calculateHeightWithMax({
          content,
          width: dynItem.cellFixedWidth,
          style: dynItem.style,
          maxHeight: maxDynHeight,
        });

        mergeCell.visibleText = res.visibleText;
        mergeCell.isDynRo = true; // 虽然子表和主表都设置了，但是真正用的时候只有主表在用
        setState(dynItem.dataFsSymbol, res.hiddenText);
      }

      return maxDynHeight;
    }

    return baseMarket.dealWithList.map((rawItem) => {
      if (!Array.isArray(rawItem)) {
        const mInfo = baseMarket.marketMap.get(rawItem.uuid);
        if (mInfo && !isEmpty(mInfo.dynCells)) {
          const mMergeMap = toMergeMap(mInfo.mergeCells);
          const mDynList = Object.values(mInfo.dynCells);
          const baseHeight = rawItem.height;

          const maxDynHeight = computeDynHeightAndUpdate({
            dynList: mDynList,
            getState: (symbol) => baseMarket.dnyFormState[symbol],
            setState: (symbol, newVal) => {
              baseMarket.dnyFormState[symbol] = newVal;
            },
            mergeMap: mMergeMap,
            baseHeight,
          });

          return {
            ...rawItem,
            height: maxDynHeight,
          };
        }
        return rawItem;
      }

      const sdItems = rawItem.filter((si) => si.status === calcUtils.SD);
      const others = rawItem.filter((si) => si.status !== calcUtils.SD);

      let repeatedSDs: any = [];

      if (sdItems.length > 0) {
        const key = sdItems[0].subFieldId || '';
        const repeatCount = config[key] || 1;

        repeatedSDs = Array.from({ length: repeatCount }, (_, sIndex) => {
          return sdItems.map((sdItem) => {
            const wrapInfo = baseMarket.marketMap.get(sdItem.uuid);
            if (wrapInfo && wrapInfo.subFieldId && wrapInfo.subWidgetId) {
              const sInfo: IMarketData =
                baseMarket.subMarketMap?.[wrapInfo.subWidgetId]?.[wrapInfo.trId];

              if (sInfo && !isEmpty(sInfo.dynCells)) {
                const sMergeMap = toMergeMap(sInfo.mergeCells);
                const sDynList = Object.values(sInfo.dynCells);
                const baseHeight = sdItem.height;

                const maxDynHeight = computeDynHeightAndUpdate({
                  dynList: sDynList,
                  getState: (symbol) => {
                    const arr = baseMarket.dnyFormState[symbol];
                    return Array.isArray(arr) ? arr[sIndex] : undefined;
                  },
                  setState: (symbol, newHidden) => {
                    if (!Array.isArray(baseMarket.dnyFormState[symbol])) {
                      baseMarket.dnyFormState[symbol] = [];
                    }
                    baseMarket.dnyFormState[symbol][sIndex] = newHidden;
                  },
                  mergeMap: sMergeMap,
                  baseHeight,
                });

                return {
                  ...sdItem,
                  height: maxDynHeight,
                };
              }
            }

            return sdItem;
          });
        });
      }

      const newOthers = others?.map((oItem) => {
        const oWrapInfo = baseMarket.marketMap.get(oItem.uuid);
        if (oWrapInfo && oWrapInfo.subFieldId && oWrapInfo.subWidgetId) {
          const osInfo: IMarketData =
            baseMarket.subMarketMap?.[oWrapInfo.subWidgetId]?.[oWrapInfo.trId];
          if (osInfo && !isEmpty(osInfo.dynCells)) {
            const osMergeMap = toMergeMap(osInfo.mergeCells);
            const osDynList = Object.values(osInfo.dynCells);
            const baseHeight = oItem.height;
            const maxDynHeight = computeDynHeightAndUpdate({
              dynList: osDynList,
              getState: (symbol) => baseMarket.dnyFormState[symbol],
              setState: (symbol, newVal) => {
                baseMarket.dnyFormState[symbol] = newVal;
              },
              mergeMap: osMergeMap,
              baseHeight,
            });

            return {
              ...oItem,
              height: maxDynHeight,
            };
          }
        }
        return oItem;
      });

      return [...newOthers, repeatedSDs];
    });
  },

  /** 递归分页 */
  pageListRecursion: (
    realDealWithList: Array<IDealWithItem | IDealWithItem[]>,
    maxHeight: number,
  ) => {
    const cloneRealDealWithList = cloneDeep(realDealWithList);
    // console.log('纸张高度', maxHeight);
    const pageList: IPageItem[] = [];

    const recursive = (data: Array<IDealWithItem | IDealWithItem[]>, prevPageData) => {
      const info = addCumulativeSumFast(data);
      // console.log('快速累加和info: ', info);
      const cutPoint = findClosestHeightFast(info.sumFastList, maxHeight);
      // console.log('切分点', cutPoint);
      const result = processData(data, cutPoint.indices, cutPoint.height, prevPageData);

      pageList.push(result.current);

      if (result.next.length !== 0) {
        return recursive(result.next, result.current.relation);
      } else {
        return pageList;
      }
    };

    return recursive(cloneRealDealWithList, undefined);
  },

  // todo tangjian（还可以优化代码）
  /** 获取分页数据列表 */
  getPageData: (pageList, baseMarketObj) => {
    const pageData: IPageData[] = pageList.map((pageItem) => {
      const uuids = [...pageItem.uuids].map((uuid) => {
        return {
          uuid,
          ...baseMarketObj.marketMap.get(uuid),
        };
      }) as IMarketData[];
      // console.log('uuids', uuids);

      const result = uuids.reduce(
        (acc: any, item: any) => {
          // 添加 trId 到 containerIds
          acc.containerIds.push(item.trId);

          // 处理 mergeCells
          Object.entries(item.mergeCells).forEach(([key, value]: [string, any]) => {
            if (!acc.mergeCells[key]) {
              acc.mergeCells[key] = {
                firstTdId: value.tdId,
                sourceTdId: value.dataFsSymbol.replace('gct.', ''),
                rowspan: 1, // 初始值为 1
                borderAttrs: value.borderAttrs,
                value: value.value,
                isDynRo: value.isDynRo,
                visibleText: value.visibleText || '',
              };
              if (value.colspan) {
                acc.mergeCells[key].colspan = value.colspan;
              }
            } else {
              // 累加 rowspan
              acc.mergeCells[key].rowspan += 1;
              // 累加内容
              acc.mergeCells[key].visibleText =
                acc.mergeCells[key].visibleText + (value.visibleText || '');
            }
          });

          // 收集 subWidgetId 和 subWrapperTdId 信息
          if (item.subFieldId) {
            if (!acc.subTableMap[item.subWidgetId]) {
              acc.subTableMap[item.subWidgetId] = {
                wrapperTdId: null,
                wrapperTdIds: [],
                widgetId: null,
                fieldId: null,
                widgets: [],
                dynamicRowHeights: {},
              };
            }

            // 设置 wrapperTdId 为第一个值
            if (!acc.subTableMap[item.subWidgetId].wrapperTdId) {
              acc.subTableMap[item.subWidgetId].wrapperTdId = item.subWrapperTdId;
            }

            // ! 调试使用
            // if (!acc.subTableMap[item.subWidgetId].wrapperTdIds.includes(item.subWrapperTdId)) {
            //   acc.subTableMap[item.subWidgetId].wrapperTdIds.push(item.subWrapperTdId);
            // }

            // 设置 widgetId 为第一个值
            if (!acc.subTableMap[item.subWidgetId].widgetId) {
              acc.subTableMap[item.subWidgetId].widgetId = item.subWidgetId;
            }

            // 设置 fieldId 为第一个值
            if (!acc.subTableMap[item.subWidgetId].fieldId) {
              acc.subTableMap[item.subWidgetId].fieldId = item.subFieldId;
            }

            const subWidgetInfo = baseMarketObj.subMarketMap?.[item.subWidgetId]?.[item.trId];

            // 添加 containerId
            acc.subTableMap[item.subWidgetId].widgets.push(subWidgetInfo);

            if (!isEmpty(subWidgetInfo.dynCells)) {
              acc.subTableMap[item.subWidgetId].dynamicRowHeights[subWidgetInfo.trId] =
                pageItem.dynHeights.get(item.uuid);
            }
          } else {
            if (!isEmpty(item.dynCells)) {
              acc.dynamicRowHeights[item.trId] = pageItem.dynHeights.get(item.uuid);
            }
          }
          return acc;
        },
        {
          containerIds: [],
          dynamicRowHeights: {},
          mergeCells: {},
          subTableMap: {},
        },
      );

      // console.log('result', result);

      const newMergeCells = Object.values(result.mergeCells).reduce((acc: any, item: any) => {
        const { firstTdId, ...rest } = item;
        acc[firstTdId] = rest;
        return acc;
      }, {});

      const newSubTableMap = Object.values(result.subTableMap).reduce((acc: any, item: any) => {
        const res = item.widgets.reduce(
          (acc: any, sItem: any) => {
            // 累加 containerIds
            acc.containerIds.push(sItem.trId);

            // 处理 mergeCells
            Object.entries(sItem.mergeCells).forEach(([key, value]: [string, any]) => {
              if (!acc.mergeCells[key]) {
                acc.mergeCells[key] = {
                  firstTdId: value.tdId,
                  rowspan: 1, // 初始值为 1
                  borderAttrs: value.borderAttrs,
                  value: value.value,
                };
                if (value.colspan) {
                  acc.mergeCells[key].colspan = value.colspan;
                }
              } else {
                // 累加 rowspan
                acc.mergeCells[key].rowspan += 1;
              }
            });
            return acc;
          },
          {
            containerIds: [],
            mergeCells: {},
          },
        );

        const newMergeCells = Object.values(res.mergeCells).reduce((acc: any, item: any) => {
          const { firstTdId, ...rest } = item;
          acc[firstTdId] = rest;
          return acc;
        }, {});

        acc[item.wrapperTdId] = {
          uuid: `sub_page_${Math.random().toString(36).substr(2)}`,
          fieldId: item.fieldId,
          widgetId: item.widgetId,
          wrapperTdId: item.wrapperTdId,
          containerIds: res.containerIds,
          dynamicRowHeights: item.dynamicRowHeights,
          mergeBlock: newMergeCells,
        };
        return acc;
      }, {});

      // console.log('tangjian newMergeCells', newMergeCells);
      // console.log('tangjian newSubTableMap', newSubTableMap);
      return {
        uuid: `page_${Math.random().toString(36).substr(2)}`,
        containerIds: result.containerIds,
        dynamicRowHeights: result.dynamicRowHeights,
        mergeBlock: newMergeCells,
        relation: pageItem.relation,
        totalHeight: pageItem.totalHeight,
        subTableMap: newSubTableMap,
      };
    });

    return pageData;
  },

  initCalc: (runtimeJson, formState) => {
    const baseMarketObj = calcUtils.marketOverview(runtimeJson, formState);
    const paper = runtimeJson[ComponentTypeEnum.PAPER];
    const paperHeight2Px = calcUtils.getPaperHeight(paper);
    console.log('模板大盘概述baseMarketObj: ', baseMarketObj);
    console.log('paperHeight2Px: ', paperHeight2Px);

    const { subTableFieldMap = [] } = paper.props ?? {};

    const config = Object.fromEntries(
      subTableFieldMap.map((key) => [
        key,
        formState?.[key]?.filter((d) => !d.deleted_)?.length || 1,
      ]),
    );
    console.log('tangjian config: ', config);
    const realDealWithList = calcUtils.expandSDRows(baseMarketObj, config, paperHeight2Px);
    console.log('真实模板数据realMarketList: ', realDealWithList);

    const pageList = calcUtils.pageListRecursion(realDealWithList, paperHeight2Px);

    const pageData: IPageData[] = calcUtils.getPageData(pageList, baseMarketObj);

    console.log('tangjian pageData', pageData);
    return pageData;
  },
};
