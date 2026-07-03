import { ref, computed, nextTick, toRaw, watch, inject } from 'vue';
import { isEmpty, merge, has, isNil } from 'lodash-es';
import { CreateType, FIELD_TYPE } from '@gct/runtime';
import { RenderModeEnum } from '../constant';
import { NCB_PROVIDE } from '../emit';
import {
  useCurrentPageFormState,
  useCalculateFormula,
  MaterialConsumeTableController,
} from '../hooks';
import { useNocodeEmitter } from './useNocodeEmitter';

import type { BaseCoreComponent, IBasicInfoItem, IParseFormulaVar } from '../types';

const { getParseFormulaVarInfos, calculateFormula } = useCalculateFormula();

export function useNocodeFormWidget(props, emit) {
  const widget: BaseCoreComponent.BasicSchema = props.widget;

  const MCTableC = inject<MaterialConsumeTableController>(
    NCB_PROVIDE.MATERIAL_CONSUME_TABLE_CONTROLLER,
  );

  const {
    field = '',
    fieldType,
    isFieldModel,
    fieldLink,
    createType,
    formulaExpr,
  } = widget.props || {};

  const targetFieldId = field ? (isFieldModel ? fieldLink : field) : '';

  const dataRelationShip = inject<IBasicInfoItem>(NCB_PROVIDE.DATA_RELATION_SHIP);

  const { currentPageFormState } = useCurrentPageFormState();

  const value = computed({
    get() {
      return props.modelValue;
    },
    set(value) {
      emit('update:modelValue', value);
    },
  });

  const { rowArgs, parseInfos } = getParseFormulaVarInfos(formulaExpr);

  const runCalc = () => {
    if (dataRelationShip?.renderModeType === RenderModeEnum.ViewMode) {
      return;
    }
    calculateFormula(formulaExpr, props.formData, currentPageFormState.value).then(
      (formulaValue) => {
        const isEmptyValue =
          formulaValue === undefined ||
          formulaValue === null ||
          (typeof formulaValue === 'string' && formulaValue.trim() === '') ||
          (Array.isArray(formulaValue) && formulaValue.length === 0);

        setValue(isEmptyValue ? null : Number(formulaValue));

        if (dataRelationShip?.formChangeStatus) {
          formulaOperationLog();
        }
      },
    );
  };

  watch(
    () => props.formData,
    () => {
      // 每次行变动或数据变动，重新绑定监听 解决中间插入行，公式有问题
      if (formulaExpr) {
        if (!isEmpty(rowArgs)) {
          parseInfos.forEach((parseInfo: IParseFormulaVar) => {
            const { type, processed, hashValue } = parseInfo;

            if (type === 'plain') {
              watch(() => currentPageFormState.value?.[processed], runCalc, { immediate: true });
            } else if (type === 'underscore') {
              watch(() => props.formData?.[processed], runCalc, { immediate: true });
            } else if (type === 'hash') {
              watch(
                () => currentPageFormState.value?.[hashValue]?.length,
                () => {
                  currentPageFormState.value?.[hashValue]?.forEach((row) => {
                    watch([() => row?.[processed], () => row?.deleted_], runCalc, {
                      immediate: true,
                    });
                  });
                },
                { immediate: true },
              );
            }
          });
        } else {
          runCalc();
        }
      }
    },
    { immediate: true },
  );

  function getValue() {
    return value.value;
  }
  function setValue(v) {
    value.value = v;
  }

  function isExecuteEvent(type) {
    if (dataRelationShip?.eventInstance && widget.event) {
      const methodName = widget.event.name;
      const methodType = widget.event.type;
      return methodName && methodType === type ? methodName : false;
    }
    return false;
  }

  function getOperationLogData(fieldKey, dataObj, callback) {
    const beforeValue = dataObj?.[fieldKey];
    let beforeLabel = beforeValue;
    const afterValue = value.value;
    let afterLabel = afterValue;

    if (typeof callback === 'function') {
      if (
        [
          FIELD_TYPE.BOOLEAN,
          FIELD_TYPE.OPTION,
          FIELD_TYPE.OPTION_MULTI,
          FIELD_TYPE.USER,
          FIELD_TYPE.USER_MULTI,
          FIELD_TYPE.ORG,
          FIELD_TYPE.ORG_MULTI,
          FIELD_TYPE.DEVICE,
          FIELD_TYPE.MFG_ORDER,
          FIELD_TYPE.PRODUCT,
          FIELD_TYPE.ROUTING_OPERATION,
          FIELD_TYPE.REPORTER,
          FIELD_TYPE.WAREHOUSE_MANAGER,
          FIELD_TYPE.NOT_GOOD_REASON,
          FIELD_TYPE.NOT_GOOD_GROUP,
          FIELD_TYPE.SCRAP_REASON,
          FIELD_TYPE.SCRAP_GROUP,
          FIELD_TYPE.SCRAP_MATERIAL,
          FIELD_TYPE.DEVICE_REF,
          FIELD_TYPE.DEVICE_REF_MULTI,
          FIELD_TYPE.REF,
        ].includes(fieldType as FIELD_TYPE)
      ) {
        const parsedValue = dataObj?.[`${fieldKey}_lb_`];
        try {
          // 尝试解析为 JSON
          beforeLabel = JSON.parse(parsedValue);
        } catch (error) {
          // 如果解析失败，说明是普通字符串
          beforeLabel = parsedValue;
        }

        afterLabel = callback(afterValue, true);
      }

      beforeLabel = Array.isArray(beforeLabel) ? beforeLabel.join() : beforeLabel;
      afterLabel = Array.isArray(afterLabel) ? afterLabel.join() : afterLabel;
    }

    return {
      beforeValue, // 修改之前的值(储存值)
      beforeLabel, // 修改之前的值(展示值)
      afterValue, // 修改之后的值(储存值)
      afterLabel, // 修改之后的值(展示值)
    };
  }

  function handleOperationLog(callback?: any) {
    const operationId = realFieldId.value ?? '';
    // 这里不需要考虑行是否删除的问题，应该批注修改的时候，肯定是已经完成的表单了
    let originData;

    if (props.subtableFieldId) {
      if (has(props, 'childSubTableDataIndex') && !isNil(props.childSubTableDataIndex)) {
        originData =
          dataRelationShip?.formChangeOriginData?.[props.subtableFieldId]?.[props.realRowIndex]?.[
            '_2DTABLE_'
          ]?.[props.childSubTableDataIndex] ?? {};
      } else {
        originData =
          dataRelationShip?.formChangeOriginData?.[props.subtableFieldId]?.[props.realRowIndex] ??
          {};
      }
    } else {
      originData = dataRelationShip?.formChangeOriginData;
    }

    const newData = getOperationLogData(targetFieldId, originData, callback);

    if (dataRelationShip) {
      dataRelationShip.formChangeNewData = merge({}, dataRelationShip.formChangeNewData, {
        [operationId]: {
          ...newData,
          cellLocation: operationId, // 单元格坐标
          cellType: fieldType, // 单元格类型(对应前端组件类型)
        },
      });
    }
  }

  async function formulaOperationLog() {
    await nextTick();
    if (dataRelationShip?.formChangeStatus) {
      handleOperationLog();
    }
  }

  async function handleEvent(
    eventType: 'onChange' | 'onBlur' | 'onPressEnter',
    callback: Function,
    valueData?: any,
  ) {
    await nextTick();

    if (MCTableC && eventType === 'onChange') {
      MCTableC.handleChange({
        field: targetFieldId!,
        row: props.formData,
        value: value.value,
        option: valueData,
      });
    }

    // 针对onChange的特殊处理
    if (eventType === 'onChange' && dataRelationShip?.formChangeStatus) {
      handleOperationLog(callback);
      return;
    }

    // 通用事件触发逻辑
    const methodName = isExecuteEvent(eventType);
    if (methodName) {
      dataRelationShip?.eventInstance.invoke(methodName, {
        value: value.value,
        valueData,
        formData: props.formData,
        pageFormData: currentPageFormState.value,
        fieldMeta: toRaw(widget.props),
        rowIndex: props.realRowIndex,
      });
    }

    // 统一触发自动保存（除特殊返回情况）
    const { emitter, EmitterEnum } = useNocodeEmitter();
    emitter.emit(EmitterEnum.__on_looper_auto_save, { changed: true });
  }

  const onChange = (callback: any = () => {}, options?: any) =>
    handleEvent('onChange', callback, options);

  const onBlur = () => {
    emit('blur');
    handleEvent('onBlur');
  };

  const onPressEnter = () => handleEvent('onPressEnter');

  const realFieldId = computed(() => {
    if (props.subtableFieldId) {
      if (has(props, 'childSubTableDataIndex') && !isNil(props.childSubTableDataIndex)) {
        return `${props.subtableFieldId}_${props.realRowIndex}_${targetFieldId}_${props.childSubTableDataIndex}`;
      }
      return `${props.subtableFieldId}_${props.realRowIndex}_${targetFieldId}`;
    }
    return targetFieldId;
  });

  const annotationInfo = computed(() => {
    const fieldId = realFieldId.value;
    if (!fieldId) {
      return false;
    }

    const annList = dataRelationShip?.annCellLocationList;
    const validatorList = dataRelationShip?.validatorLocationList;
    const annIncluded =
      dataRelationShip?.annSwitchStatus && Array.isArray(annList) && annList.includes(fieldId);
    const isSelected = dataRelationShip?.annSelectId === fieldId;
    const isInvalid = Array.isArray(validatorList) && validatorList.includes(fieldId);

    const annClassList: string[] = [];

    if (annIncluded) {
      annClassList.push(fieldId, 'annotation-mark');
      if (isSelected) annClassList.push('annotation-select');
    }

    if (annClassList.length || isInvalid) {
      return { annClassList, annFieldId: fieldId, showValidatorClass: isInvalid };
    }

    return false;
  });

  const isDynValue = computed(() => {
    return field === 'value_' && createType === CreateType.BUILTIN;
  });

  return {
    getValue,
    setValue,
    onChange,
    onBlur,
    onPressEnter,
    value,
    realFieldId,
    annotationInfo,
    isDynValue,
  };
}
