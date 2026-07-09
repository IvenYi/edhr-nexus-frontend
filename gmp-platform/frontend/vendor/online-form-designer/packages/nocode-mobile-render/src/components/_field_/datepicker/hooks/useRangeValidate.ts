import { ref, computed, onBeforeMount, onBeforeUnmount, reactive } from 'vue';
import dayjs from 'dayjs';
import { isNil, isEmpty } from 'lodash-es';
import { FIELD_TYPE } from '@gct/runtime';
import {
  RangeValidateMode,
  renderUtils,
  commonUtils,
  useCalculateFormula,
  useCurrentPageFormState,
  useFormulaExpWatcher,
} from '@gct/nocode-base';

export function useRangeValidate(props, value) {
  const {
    fieldType,
    minDate,
    minDateFormulaExpr,
    maxDate,
    maxDateFormulaExpr,
    enableRangeValidate,
    maxDateValidateMode,
    minDateValidateMode,
  } = reactive(props.widget.props);

  const { currentPageFormState } = useCurrentPageFormState();
  const { calculateFormula, getMergeParseInfos } = useCalculateFormula();

  const minFormulaValue = ref<number | undefined>();
  const maxFormulaValue = ref<number | undefined>();
  let stopWatcher: (() => void) | undefined;

  const formatType = fieldType === FIELD_TYPE.DATE_TIME ? 'YYYY-MM-DD HH:mm:ss' : 'YYYY-MM-DD';

  const hasFixedMax = computed(
    () => maxDateValidateMode === RangeValidateMode.Fixed_Number && !isNil(maxDate),
  );

  const hasVarMax = computed(
    () =>
      maxDateValidateMode === RangeValidateMode.Variable_Validate &&
      !isNaN(Number(maxFormulaValue.value)),
  );

  const hasFixedMin = computed(
    () => minDateValidateMode === RangeValidateMode.Fixed_Number && !isNil(minDate),
  );

  const hasVarMin = computed(
    () =>
      minDateValidateMode === RangeValidateMode.Variable_Validate &&
      !isNaN(Number(minFormulaValue.value)),
  );

  const maxTimestamp = computed<number | undefined>(() => {
    if (hasFixedMax.value) {
      return dayjs(maxDate).unix();
    }
    if (hasVarMax.value) {
      // 假定 formula 已返回 unix timestamp 或可以直接使用的数字
      return Number(maxFormulaValue.value);
    }
    return undefined;
  });

  const minTimestamp = computed<number | undefined>(() => {
    if (hasFixedMin.value) {
      return dayjs(minDate).unix();
    }
    if (hasVarMin.value) {
      return Number(minFormulaValue.value);
    }
    return undefined;
  });

  const outOfRange = computed(() => {
    if (!enableRangeValidate) return false;
    return renderUtils.isOutOfRange(value.value, minTimestamp.value, maxTimestamp.value);
  });

  // const rules = computed(() => {
  //   const arr: any[] = [];

  //   // 固定最小值
  //   if (hasFixedMin.value) {
  //     arr.push({
  //       validator: (val, _rule) => {
  //         if (commonUtils.isEmptyValue(value.value)) return '';
  //         const inputTime = dayjs(value.value).unix();
  //         if (inputTime < minTimestamp.value!) {
  //           return `字段值不能小于${dayjs.unix(minTimestamp.value!).format(formatType)}`;
  //         }
  //         return '';
  //       },
  //       trigger: 'onChange',
  //     });
  //   }

  //   // 固定最大值
  //   if (hasFixedMax.value) {
  //     arr.push({
  //       validator: (val, _rule) => {
  //         if (commonUtils.isEmptyValue(value.value)) return '';
  //         const inputTime = dayjs(value.value).unix();
  //         if (inputTime > maxTimestamp.value!) {
  //           return `字段值不能大于${dayjs.unix(maxTimestamp.value!).format(formatType)}`;
  //         }
  //         return Promise.resolve();
  //       },
  //       trigger: 'onChange',
  //     });
  //   }

  //   // 公式最小值
  //   if (hasVarMin.value) {
  //     arr.push({
  //       validator: async (val, _rule) => {
  //         if (commonUtils.isEmptyValue(value.value)) return '';
  //         const inputTime = dayjs(value.value).unix();
  //         if (inputTime < minFormulaValue.value!) {
  //           return `字段值不能小于${dayjs.unix(minFormulaValue.value!).format(formatType)}`;
  //         }
  //         return '';
  //       },
  //       trigger: 'onChange',
  //     });
  //   }

  //   // 公式最大值
  //   if (hasVarMax.value) {
  //     arr.push({
  //       validator: async (val, _rule) => {
  //         if (commonUtils.isEmptyValue(value.value)) return '';
  //         const inputTime = dayjs(value.value).unix();
  //         if (inputTime > maxFormulaValue.value!) {
  //           return `字段值不能大于${dayjs.unix(maxFormulaValue.value!).format(formatType)}`;
  //         }
  //         return '';
  //       },
  //       trigger: 'onChange',
  //     });
  //   }

  //   return arr;
  // });

  const onCalculateFormula = (type: 'min' | 'max') => {
    if (type === 'min') {
      return calculateFormula(
        minDateFormulaExpr ?? '',
        (props as any).formData,
        currentPageFormState.value,
      );
    } else {
      return calculateFormula(
        maxDateFormulaExpr ?? '',
        (props as any).formData,
        currentPageFormState.value,
      );
    }
  };

  onBeforeMount(() => {
    if (!enableRangeValidate) return;

    const needMinValidateCalc =
      !!minDateFormulaExpr && minDateValidateMode === RangeValidateMode.Variable_Validate;
    const needMaxValidateCalc =
      !!maxDateFormulaExpr && maxDateValidateMode === RangeValidateMode.Variable_Validate;

    const parseInfos = getMergeParseInfos({
      minFormulaExpr: needMinValidateCalc ? minDateFormulaExpr ?? '' : '',
      maxFormulaExpr: needMaxValidateCalc ? maxDateFormulaExpr ?? '' : '',
    });

    const { setupWatchesFromMerged, stop } = useFormulaExpWatcher({
      props,
      currentPageFormState,
      needMinValidateCalc,
      needMaxValidateCalc,
      onCalculateFormula: (t) => onCalculateFormula(t as 'min' | 'max'),
      onMinComputed: (v: number) => (minFormulaValue.value = v),
      onMaxComputed: (v: number) => (maxFormulaValue.value = v),
      debounceMs: 200,
    });

    setupWatchesFromMerged(parseInfos);
    stopWatcher = stop;
  });

  onBeforeUnmount(() => {
    stopWatcher?.();
  });

  return {
    minFormulaValue,
    maxFormulaValue,
    minTimestamp,
    maxTimestamp,
    outOfRange,
    stop: () => stopWatcher?.(),
  };
}
