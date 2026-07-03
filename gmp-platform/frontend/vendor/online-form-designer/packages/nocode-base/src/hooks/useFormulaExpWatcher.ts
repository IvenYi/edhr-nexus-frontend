import { watch } from 'vue';
import { debounce } from 'lodash-es';
import { getRowId } from '../_utils_';
import type { IParseFormulaVar } from '@gct/nocode-base';

export function useFormulaExpWatcher(options: {
  props: any;
  currentPageFormState: any;
  needMinValidateCalc: boolean;
  needMaxValidateCalc: boolean;
  onCalculateFormula: (type: 'min' | 'max') => void;
  onMinComputed?: (value: any) => void;
  onMaxComputed?: (value: any) => void;
  debounceMs?: number;
  returnType?: string;
}) {
  const {
    props,
    currentPageFormState,
    needMinValidateCalc,
    needMaxValidateCalc,
    onCalculateFormula,
    onMinComputed,
    onMaxComputed,
    debounceMs = 200,
    returnType = 'string',
  } = options;

  let calcReqId = 0;
  async function computeMinMaxOnce() {
    const myId = ++calcReqId;

    const getValue = (v) => {
      if (returnType === 'number') {
        const parsed = v == null ? null : parseFloat(String(v));
        return Number.isFinite(parsed) ? parsed : null;
      }
      return v;
    };

    if (needMinValidateCalc) {
      try {
        const v = await onCalculateFormula('min');
        if (myId !== calcReqId) return;
        onMinComputed?.(getValue(v));
      } catch (e) {}
    }

    if (needMaxValidateCalc) {
      try {
        const v = await onCalculateFormula('max');
        if (myId !== calcReqId) return;
        onMaxComputed?.(getValue(v));
      } catch (e) {}
    }
  }

  const debouncedCompute = debounce(computeMinMaxOnce, debounceMs);

  const topStops: Array<() => void> = [];
  const hashRowStops = new Map<string, Map<string, () => void>>(); // Map<hashValue, Map<rowIndex, stopFn>>

  const clearAllStops = () => {
    while (topStops.length) {
      const s = topStops.shift();
      try {
        s && s();
      } catch (e) {}
    }
    for (const [, rowMap] of hashRowStops) {
      for (const stop of rowMap.values()) {
        try {
          stop && stop();
        } catch (e) {}
      }
    }
    hashRowStops.clear();

    // 取消防抖（lodash 的 debounce 提供 cancel）
    (debouncedCompute as any).cancel?.();

    // 忽略在途结果
    calcReqId++;
  };

  /** 建立 watchers */
  const setupWatchesFromMerged = (parseInfos: IParseFormulaVar[] = []) => {
    // clearAllStops();

    if (!needMinValidateCalc && !needMaxValidateCalc) return;

    if (!Array.isArray(parseInfos) || parseInfos.length === 0) {
      // 主要是要考虑公式里没有配置字段的情况
      debouncedCompute();
      return;
    }

    for (const p of parseInfos) {
      const { type, processed, hashValue } = p;

      if (type === 'plain') {
        // 监听主模型第一层字段
        const stop = watch(
          () => currentPageFormState.value?.[processed],
          () => {
            console.log('plain');
            debouncedCompute();
          },
          { immediate: true },
        );
        topStops.push(stop);
      } else if (type === 'underscore') {
        // 当前行
        const stop = watch(
          () => props.formData?.[processed],
          () => {
            console.log('underscore');
            debouncedCompute();
          },
          { immediate: true },
        );
        topStops.push(stop);
      } else if (type === 'hash') {
        if (!hashRowStops.has(hashValue)) hashRowStops.set(hashValue, new Map());
        const rowMap = hashRowStops.get(hashValue)!;

        const stopLen = watch(
          () => currentPageFormState.value?.[hashValue]?.length ?? 0,
          () => {
            const arr = currentPageFormState.value?.[hashValue];

            for (const row of arr) {
              const rid = `${getRowId(row)}_${processed}`;
              if (!rowMap.has(rid)) {
                const stopPerRow = watch(
                  () => [row?.[processed], row?.deleted_],
                  () => {
                    debouncedCompute();
                  },
                  { immediate: true },
                );

                rowMap.set(rid, stopPerRow);
              }
            }

            const existingIds = new Set(arr.map(getRowId));

            for (const r of Array.from(rowMap.keys())) {
              if (!existingIds.has(r)) {
                const rid = `${r}_${processed}`;
                const s = rowMap.get(rid);
                s && s();
                rowMap.delete(rid);
              }
            }

            debouncedCompute();
          },
          { immediate: true },
        );

        topStops.push(stopLen);
      }
    }

    debouncedCompute();
  };

  const stop = () => {
    clearAllStops();
  };

  return {
    setupWatchesFromMerged,
    stop,
  };
}
