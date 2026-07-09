import { inject, computed, h, toRaw, toRef } from 'vue';
import { isEmpty, isNil, has } from 'lodash-es';
import { NCB_PROVIDE } from '../emit';
import {
  CellWidgetViewState,
  FormTypeEnum,
  RenderModeEnum,
  BpmnNodeTypeEnum,
  ComponentTypeEnum,
  MobileFillTypeEnum,
} from '../constant';
import { useNocodeEmitter } from './useNocodeEmitter';
import { useExpression } from '@/components/Expression/hooks/useExpressionCalc';
import type {
  BaseCoreComponent,
  IBasicInfoItem,
  IParseFormulaVar,
  IPaper,
  ITd,
  ISubTable2DInfo,
  ICheckTable2DInfo,
} from '../types';

/** 获取当前页面的formState */
export function useCurrentPageFormState() {
  const formStateMap = inject<any>(NCB_PROVIDE.FROM_DATA);
  const dataRelationShip = inject<IBasicInfoItem>(NCB_PROVIDE.DATA_RELATION_SHIP);

  const currentPageFormState = computed(() => {
    return formStateMap?.[dataRelationShip?.uniqueId ?? ''] ?? {};
  });

  return {
    currentPageFormState,
  };
}

/** 获取组件静态属性 */
export function useWidgetStaticAttrs(widget) {
  const dataRelationShip = inject<IBasicInfoItem>(NCB_PROVIDE.DATA_RELATION_SHIP);

  const {
    field = '',
    fieldType,
    isFieldModel,
    fieldLink,
    modelKey,
    refModelKey,
    placeholder,
    bindCompStyleType,
    viewState,
    newSpecificConfig,
  } = widget.props || {};
  const disabled = toRef(widget.props, 'disabled');
  const readonly = toRef(widget.props, 'field_readonly');
  const newRequired = toRef(widget.props, 'required');
  const newQueryDataRef = computed(() => widget.props.newSpecificConfig?.newQueryData);
  const {
    newFieldName,
    newModelName,
    newOptions = [],
    newUploadConfig = {},
    newPrecision = 0,
    newLoadFinished2Options,
    newTotalCount,
    newRefRecordNo,
    newQueryData,
    newQueryCondition,
    forcedDisabled,
    newPlaceholder,
    newRulesForRounding,
    newComponentProps = {},
    newDisplayRule = undefined,
  } = newSpecificConfig || {};

  const targetFieldId = field ? (isFieldModel ? fieldLink : field) : '';

  /**
   * readonly-text
   * readonly-component
   * edit-component
   */
  const newDisplayStatus = computed(() => {
    const readonlyString =
      viewState === CellWidgetViewState.Disabled || viewState === CellWidgetViewState.Auto
        ? 'readonly-component'
        : 'readonly-text';
    const editString = readonly.value ? 'readonly-component' : 'edit-component';

    // 查看批注状态下都是纯只读文本
    if (dataRelationShip?.annSwitchStatus) return 'readonly-text';

    // 关联模型字段直接只读
    if (isFieldModel) return readonlyString;

    const renderMode = dataRelationShip?.renderModeType;
    const bpmnMap = dataRelationShip?.bpmnFieldAuthMap;
    const key = `${modelKey}.${field}`;

    // 从权限 map 中取字段信息
    const getFieldAuth = () => bpmnMap?.[key];

    // 字段权限里能否找到当前字段
    const resolveFromAuth = (info) => {
      if (isEmpty(info)) return null;
      // 如果是编辑权限
      if (info.edit && !info.readonly) return editString;
      // 如果是只读权限
      if (info.readonly && !info.edit) return readonlyString;
      return null;
    };

    // 填报模式下
    if (renderMode === RenderModeEnum.FormMode) {
      // 如果不是流程表单
      if (dataRelationShip?.formType !== FormTypeEnum.PROCESS) {
        const auth = getFieldAuth();
        const fromAuth = resolveFromAuth(auth);
        return fromAuth ?? editString;
      }

      // 获取流程字段权限
      const auth = getFieldAuth();
      const fromAuth = resolveFromAuth(auth);
      if (fromAuth) return fromAuth;

      // 如果不在流程权限字段map中，那么根据流程节点判断
      const bpmnType = dataRelationShip?.bpmnType;
      if (bpmnType === BpmnNodeTypeEnum.BpmnApproval || bpmnType === BpmnNodeTypeEnum.BpmnJudge) {
        // 审批节点、判断节点默认是只读
        return readonlyString;
      }

      // 开始节点或者其他节点默认是编辑
      return editString;
    }

    // 查看模式统一只读
    if (renderMode === RenderModeEnum.ViewMode) {
      return readonlyString;
    }

    return readonly.value ? 'readonly-text' : 'edit-component';
  });

  const newDisabled = computed(() => {
    if (newDisplayStatus.value === 'edit-component') {
      return forcedDisabled || disabled.value;
    }

    return viewState === CellWidgetViewState.Disabled || disabled.value;
  });

  /** 是否单元格配置了自动换行 */
  const isAutoLineBreak = computed(() => {
    if (
      !isEmpty(widget.style) &&
      has(widget.style, 'whiteSpace') &&
      has(widget.style, 'wordBreak') &&
      widget.style.whiteSpace === 'pre-wrap' &&
      widget.style.wordBreak === 'break-all'
    ) {
      return true;
    }
    return false;
  });

  return {
    field,
    fieldType,
    modelKey,
    refModelKey,
    isFieldModel,
    fieldLink,
    targetFieldId,
    placeholder: newPlaceholder || placeholder,
    bindCompStyleType,

    /** 字段名称 */
    showFieldName: newFieldName,
    /** 字段所属模型名称 */
    showModelName: newModelName,
    /** 是否必填 */
    showRequired: newRequired,
    /** 是否禁用 */
    showDisabled: newDisabled,
    /** 显示状态 */
    showDisplayStatus: newDisplayStatus,
    /** 下拉列表 */
    options: newOptions,
    /** 附件、图片配置项 */
    uploadConfig: newUploadConfig,
    /** 小数位数 */
    realPrecision: newPrecision,
    /** 精度小数的修约规则 */
    rulesForRounding: newRulesForRounding,
    /** 记录单号是否是链接 */
    realRefRecordNo: newRefRecordNo,
    /** 下拉列表内容是否都加载完成 */
    loadFinished2Options: newLoadFinished2Options,
    /** Rdo下拉框内容总数 */
    newTotalCount,
    /** 查询条件 */
    newQueryData,
    /** 查询条件响应式 */
    newQueryDataRef,
    /** 查询条件 */
    queryCondition: newQueryCondition,
    /** 组件额外参数 */
    newComponentProps,
    /** 显示规则 */
    newDisplayRule,
    dataRelationShip,
    /** 是否是自动换行 */
    isAutoLineBreak,
  };
}

/** 公式计算 */
export function useCalculateFormula() {
  const { identify, calculate } = useExpression();

  const getFieldDataValue = (parseInfo: IParseFormulaVar, formData: any) => {
    const getTextValue = (processedKey: string, value: any) => {
      const dict = formData?._DICT?.[processedKey];
      const textValue = dict?.[value ?? ''] || value;
      return Array.isArray(textValue) ? textValue.join() : textValue;
    };

    const { type, processed, hashValue } = parseInfo;

    if (type === 'hash') {
      // 解决空数组不触发计算
      const tableData = toRaw(formData?.[hashValue] || []);
      return tableData
        .filter((d) => !d.deleted_)
        .map((row) => getTextValue(processed, row?.[processed]))
        .filter((i) => !isNil(i));
    }

    return getTextValue(processed, formData?.[processed]);
  };

  /** 解析表达式变量 */
  const parseFormulaVar = (formulaVar: string) => {
    const result: IParseFormulaVar = {
      original: formulaVar,
      type: '',
      processed: '',
      hashValue: '',
      dataType: '',
    };

    if (/^\$([^$]+)\$\.(.+)$/.test(formulaVar)) {
      const match = formulaVar.match(/^\$([^$]+)\$\.(.+)$/)!;
      result.type = 'hash';
      result.processed = match[2];
      result.hashValue = match[1];
      result.dataType = 'globType';
    } else if (/^_\.(.+)$/.test(formulaVar)) {
      const match = formulaVar.match(/^_\.(.+)$/)!;
      result.type = 'underscore';
      result.processed = match[1];
      result.dataType = 'currentRowType';
    } else {
      result.type = 'plain';
      result.processed = formulaVar;
      result.dataType = 'globType';
    }
    return result;
  };

  const getParseFormulaVarInfos = (expr?: string) => {
    const rowArgs = expr ? identify(expr) : [];

    return {
      rowArgs,
      parseInfos: rowArgs.map((curr) => parseFormulaVar(curr)),
    };
  };

  const calculateFormula = async (expr: string, formData: any, currentPageFormState: any) => {
    const rowArgs = identify(expr);

    const formulaData = isEmpty(rowArgs)
      ? {}
      : rowArgs.reduce((total, curr) => {
          const parseInfo = parseFormulaVar(curr);

          total[curr] = getFieldDataValue(
            parseInfo,
            parseInfo.dataType === 'currentRowType' ? formData : currentPageFormState,
          );
          return total;
        }, {});

    return calculate(expr, formulaData);
  };

  /** 合并解析结果去重 */
  const mergeParseInfos = (a: IParseFormulaVar[] = [], b: IParseFormulaVar[] = []) => {
    const map = new Map<string, IParseFormulaVar>();
    const keyOf = (p: IParseFormulaVar) => `${p.type}||${p.processed}||${p.hashValue ?? ''}`;
    for (const p of a || []) map.set(keyOf(p), p);
    for (const p of b || []) map.set(keyOf(p), p);
    return Array.from(map.values());
  };

  /** 解析并合并 parseInfos */
  const getMergeParseInfos = (options: { minFormulaExpr: string; maxFormulaExpr: string }) => {
    const { minFormulaExpr, maxFormulaExpr } = options;

    let minInfos: IParseFormulaVar[] = [];
    let maxInfos: IParseFormulaVar[] = [];

    try {
      if (minFormulaExpr) minInfos = getParseFormulaVarInfos(minFormulaExpr)?.parseInfos || [];
    } catch (e) {
      minInfos = [];
    }

    try {
      if (maxFormulaExpr) maxInfos = getParseFormulaVarInfos(maxFormulaExpr)?.parseInfos || [];
    } catch (e) {
      maxInfos = [];
    }

    const merged = mergeParseInfos(minInfos, maxInfos);
    return merged;
  };

  return {
    identify,
    getParseFormulaVarInfos,
    calculateFormula,
    getMergeParseInfos,
  };
}

/** 选择批注id */
export function setSelectAnnotationId(
  id: string | undefined,
  basicInfoItem: IBasicInfoItem | undefined,
) {
  if (!isEmpty(id) && basicInfoItem) {
    const { emitter, EmitterEnum } = useNocodeEmitter();

    const newId = id === 'gct-nocode-ann-main' ? '' : id;
    basicInfoItem.annSelectId = newId;

    emitter.emit(EmitterEnum.__on__open_single_annotation_detail_, {
      cellLocation: newId,
    });
  }
}

/** 选择校验错误信息id */
export function setSelectValidatorId(event: MouseEvent, basicInfoItem: IBasicInfoItem | undefined) {
  if (basicInfoItem && event.target) {
    const cellDiv = (event.target as HTMLElement).closest('.cell-wrapper');
    if (!cellDiv) return;
    const ids = Array.from(cellDiv.querySelectorAll('.validator-icon'))
      .map((el) => el.dataset.ann)
      .filter(Boolean);

    const validateList = ids.map((id) => basicInfoItem.validatorMessageMap?.[id]).filter(Boolean);

    const flattenedErrors = validateList.flatMap((validates) =>
      validates.map(({ field, message }) => JSON.parse(message)),
    );

    const resultMap = flattenedErrors.reduce((acc, item) => {
      const { showModelName, showModelKey, subFieldKey, showFieldName, targetFieldId, message } =
        item;
      if (!acc[showModelKey]) {
        acc[showModelKey] = {
          showModelName,
          showModelKey,
          subFieldKey,
          fields: [],
        };
      }
      acc[showModelKey].fields.push({ showFieldName, targetFieldId, message });
      return acc;
    }, {});

    if (Object.keys(resultMap).length) {
      const contentVNode = h(
        'div',
        { class: 'nocode-validator-tooltip-wrapper' },
        Object.values(resultMap).map((data: any) =>
          h('div', { class: 'nocode-validator-tooltip-container', key: data.showModelKey }, [
            h('div', { class: 'nocode-validator-tooltip-header' }, data.showModelName),
            h(
              'div',
              { class: 'nocode-validator-tooltip-header-label' },
              `${data.showModelKey}${data.subFieldKey ? '｜' + data.subFieldKey : ''}`,
            ),
            h(
              'ul',
              { class: 'nocode-validator-tooltip-content' },
              data.fields.map((field, index) =>
                h(
                  'li',
                  { key: `${field.targetFieldId}-${index}` },
                  `${field.showFieldName}（${field.targetFieldId}）：${field.message}`,
                ),
              ),
            ),
          ]),
        ),
      );

      window.gct.openUtil.popover(
        event.target as HTMLElement,
        contentVNode,
        {},
        { placement: 'top-center' },
      );
    }
  }
}

/** 选择移动端tdId */
export function setSelectMobileTdId(
  tdInfo: ITd,
  basicInfoItem: IBasicInfoItem | undefined,
  widgetCenter: Record<string, BaseCoreComponent.BasicSchema>,
  callback,
  sbRowIndex?: number,
) {
  const getWidgetInfo = () => {
    const { preLocation, props: tdProps } = tdInfo || {};
    const paper = widgetCenter?.[ComponentTypeEnum.PAPER] as IPaper;
    const subTable2DList = paper.props.subTable2DList ?? [];
    const checkTable2DList = paper.props.checkTable2DList ?? [];
    const fixedTableLenMap = paper.props.fixedTableLenMap ?? {};

    const getTdIds = (key) => [...(basicInfoItem?.mobileTdIdGroups.get(key) || [])];

    const assignWidgetInfo = (
      fillType: MobileFillTypeEnum,
      params:
        | (ISubTable2DInfo & { childInitRowLen: number })
        | ICheckTable2DInfo
        | { rowSubFieldKey: string; colSubFieldKey?: string },
    ) => {
      const { rowSubFieldKey = '', colSubFieldKey = '' } = params;

      const mainSetKey =
        rowSubFieldKey !== 'gct_mobile_main' ? `gct_mobile_sub.${rowSubFieldKey}` : rowSubFieldKey;
      const linkSetKey = colSubFieldKey ? `gct_mobile_sub.${colSubFieldKey}` : colSubFieldKey;

      return {
        fillType,
        clickTdId: tdInfo.id,
        clickSbRowIndex: sbRowIndex,
        mainWidgetIds: getTdIds(mainSetKey),
        linkWidgetIds: getTdIds(linkSetKey),
        subInfo: params,
      };
    };

    if (preLocation === ComponentTypeEnum.PAPER) {
      if (tdProps.isNewFixedTableTd) {
        const item = subTable2DList.find(
          (i) => i.subTable2d && i.colSubFieldKey === tdProps.fixedTableFieldId,
        );

        return item
          ? assignWidgetInfo(MobileFillTypeEnum.SUB_TABLE_2D, {
              ...item,
              childInitRowLen: 1 * ((fixedTableLenMap?.[item.colSubFieldKey] ?? 0) + 1),
            })
          : assignWidgetInfo(MobileFillTypeEnum.FIXED_TABLE, {
              rowSubFieldKey: tdProps.fixedTableFieldId!,
            });
      }

      if (tdProps.isNewCheckTable2D) {
        const item = checkTable2DList.find(
          (i) =>
            i.checkTable2d &&
            (i.colSubFieldKey === tdProps.fixedTableFieldId ||
              i.rowSubFieldKey === tdProps.fixedTableFieldId),
        );

        if (item) {
          return assignWidgetInfo(MobileFillTypeEnum.CHECK_TABLE_2D, item);
        }
      }

      return assignWidgetInfo(MobileFillTypeEnum.MAIN_FIELD, { rowSubFieldKey: 'gct_mobile_main' });
    }

    const subTableFieldId = widgetCenter?.[preLocation!]?.props?.field;

    if (!subTableFieldId) return;

    const item = subTable2DList.find((i) => i.subTable2d && i.rowSubFieldKey === subTableFieldId);

    return item
      ? assignWidgetInfo(MobileFillTypeEnum.SUB_TABLE_2D, {
          ...item,
          childInitRowLen: 1 * ((fixedTableLenMap?.[item.colSubFieldKey] ?? 0) + 1),
        })
      : assignWidgetInfo(MobileFillTypeEnum.SUB_TABLE, { rowSubFieldKey: subTableFieldId });
  };

  if (basicInfoItem) {
    basicInfoItem.mobileSelectTdId = tdInfo.id;

    const widgetInfo = getWidgetInfo();

    callback?.(basicInfoItem, widgetInfo);
  }
}

/** 获取动态表快速填报信息 */
export function getSubTableQuickFillInfo(subTableFieldId, mobileTdIdGroups: Map<any, any>) {
  const getTdIds = (key) => [...(mobileTdIdGroups.get(key) || [])];

  const assignWidgetInfo = (
    fillType: MobileFillTypeEnum,
    params:
      | (ISubTable2DInfo & { childInitRowLen: number })
      | ICheckTable2DInfo
      | { rowSubFieldKey: string; colSubFieldKey?: string },
  ) => {
    const { rowSubFieldKey = '', colSubFieldKey = '' } = params;

    const mainSetKey =
      rowSubFieldKey !== 'gct_mobile_main' ? `gct_mobile_sub.${rowSubFieldKey}` : rowSubFieldKey;
    const linkSetKey = colSubFieldKey ? `gct_mobile_sub.${colSubFieldKey}` : colSubFieldKey;

    return {
      fillType,
      mainWidgetIds: getTdIds(mainSetKey),
      linkWidgetIds: getTdIds(linkSetKey),
      subInfo: params,
    };
  };

  if (!subTableFieldId) return;

  return assignWidgetInfo(MobileFillTypeEnum.SUB_TABLE, { rowSubFieldKey: subTableFieldId });
}
