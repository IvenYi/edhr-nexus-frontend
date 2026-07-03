import { ref, computed, onBeforeMount, onBeforeUnmount, reactive } from 'vue';
import {
  RangeValidateMode,
  useCalculateFormula,
  useCurrentPageFormState,
  useFormulaExpWatcher,
} from '@gct/nocode-base';

export function useRangeValidate(props, value) {
  const {
    minValue,
    minFormulaExpr,
    maxValue,
    maxFormulaExpr,

    enableRangeValidate,
    maxValidateMode,
    minValidateMode,
  } = reactive(props.widget.props);

  const { currentPageFormState } = useCurrentPageFormState();
  const { calculateFormula, getMergeParseInfos } = useCalculateFormula();

  const minFormulaValue = ref();
  const maxFormulaValue = ref();
  let stopWatcher: (() => void) | undefined;

  const outOfRange = computed(() => {
    if (!enableRangeValidate) return false;

    // value 假定是当前输入的值（ref/prop），处理空值与非数字
    const raw = value.value;
    if (raw === null || raw === undefined || raw === '') return false;
    const num = Number(raw);
    if (isNaN(num)) return false;

    // 取 min / max（优先从对应模式取值）
    let min: number | undefined;
    let max: number | undefined;

    if (minValidateMode === RangeValidateMode.Fixed_Number) {
      min = minValue != null ? Number(minValue) : undefined;
    } else if (minValidateMode === RangeValidateMode.Variable_Validate) {
      min = minFormulaValue?.value != null ? Number(minFormulaValue.value) : undefined;
    }

    if (maxValidateMode === RangeValidateMode.Fixed_Number) {
      max = maxValue != null ? Number(maxValue) : undefined;
    } else if (maxValidateMode === RangeValidateMode.Variable_Validate) {
      max = maxFormulaValue?.value != null ? Number(maxFormulaValue.value) : undefined;
    }

    if (typeof min === 'number' && !isNaN(min) && num < min) return true;
    if (typeof max === 'number' && !isNaN(max) && num > max) return true;

    return false;
  });

  const onCalculateFormula = (type) => {
    if (type === 'min') {
      return calculateFormula(minFormulaExpr!, props.formData, currentPageFormState.value);
    } else if (type === 'max') {
      return calculateFormula(maxFormulaExpr!, props.formData, currentPageFormState.value);
    }
  };

  onBeforeMount(() => {
    if (!enableRangeValidate) return;

    const needMinValidateCalc =
      !!minFormulaExpr && minValidateMode === RangeValidateMode.Variable_Validate;
    const needMaxValidateCalc =
      !!maxFormulaExpr && maxValidateMode === RangeValidateMode.Variable_Validate;

    const parseInfos = getMergeParseInfos({
      minFormulaExpr: needMinValidateCalc ? minFormulaExpr : '',
      maxFormulaExpr: needMaxValidateCalc ? maxFormulaExpr : '',
    });

    const { setupWatchesFromMerged, stop } = useFormulaExpWatcher({
      props,
      currentPageFormState,
      needMinValidateCalc,
      needMaxValidateCalc,
      onCalculateFormula,
      onMinComputed: (v) => (minFormulaValue.value = v),
      onMaxComputed: (v) => (maxFormulaValue.value = v),
      debounceMs: 200,
      returnType: 'number',
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
    outOfRange,
    stop: () => stopWatcher?.(),
  };
}
