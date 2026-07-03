// import { Ref } from 'vue';

type AnyObj = Record<string, any>;

type UpdateSortOptions = {
  enabled?: boolean; // 是否启用自动更新排序字段
  field?: string; // 要更新的字段名（默认 'sort_num_'）
  start?: number; // 起始值（默认 1）
  step?: number; // 步长（默认 1）
};

function getKey(item?: AnyObj): string | undefined {
  if (!item) return undefined;
  const k = item.id_ ?? item._X_ROW_KEY;
  return k == null ? undefined : String(k);
}

function useReorder<T extends AnyObj>() {
  /**
   * 就地重排数组
   * @param arr 要重排的数组
   * @param keyOrder key 顺序数组（id_ 或 _X_ROW_KEY 的值）
   * @param options.appendRemaining 是否将未在 keyOrder 中的项追加到末尾（默认 true）
   * @param options.updateSort 更新 sort 字段的选项
   */
  function reorderInPlace(
    arr: T[],
    keyOrder: string[],
    options: { appendRemaining?: boolean; updateSort?: UpdateSortOptions } = {},
  ): T[] {
    const appendRemaining = options.appendRemaining ?? true;
    const updateSort = options.updateSort ?? { enabled: false };

    const map = new Map<string, T>();
    for (const item of arr) {
      const k = getKey(item);
      if (k) map.set(k, item);
    }

    const used = new Set<string>();
    const newOrder: T[] = [];

    for (const k of keyOrder) {
      const ks = String(k);
      if (map.has(ks) && !used.has(ks)) {
        newOrder.push(map.get(ks)!);
        used.add(ks);
      }
    }

    if (appendRemaining) {
      for (const item of arr) {
        const k = getKey(item) ?? '';
        if (!used.has(k)) {
          newOrder.push(item);
          used.add(k);
        }
      }
    }

    arr.length = 0;
    arr.push(...newOrder);

    if (updateSort?.enabled) {
      const field = updateSort.field ?? 'sort_num_';
      const start = Number(updateSort.start ?? 1);
      const step = Number(updateSort.step ?? 1);
      for (let i = 0; i < arr.length; i++) {
        // 直接赋值
        (arr[i] as AnyObj)[field] = start + i * step;
      }
    }
    return arr;
  }

  /**
   * 返回新数组
   */
  function reorderImmutable(
    arr: T[],
    keyOrder: string[],
    options: { appendRemaining?: boolean; updateSort?: UpdateSortOptions } = {},
  ): T[] {
    const appendRemaining = options.appendRemaining ?? true;
    const updateSort = options.updateSort ?? { enabled: false };

    const map = new Map<string, T>();
    for (const item of arr) {
      const k = getKey(item);
      if (k) map.set(k, item);
    }

    const used = new Set<string>();
    const result: T[] = [];

    for (const k of keyOrder) {
      const ks = String(k);
      if (map.has(ks) && !used.has(ks)) {
        result.push(map.get(ks)!);
        used.add(ks);
      }
    }

    if (appendRemaining) {
      for (const item of arr) {
        const k = getKey(item) ?? '';
        if (!used.has(k)) {
          result.push(item);
          used.add(k);
        }
      }
    }

    if (updateSort?.enabled) {
      const field = updateSort.field ?? 'sort_num_';
      const start = Number(updateSort.start ?? 1);
      const step = Number(updateSort.step ?? 1);
      return result.map((it, idx) => ({ ...(it as AnyObj), [field]: start + idx * step })) as T[];
    }

    return result;
  }

  return {
    reorderInPlace,
    reorderImmutable,
  };
}

export function useFormEntriesReorder<T extends AnyObj = AnyObj>(
  formData: Record<string, any>,
  entriesKey: string = 'form_entries_',
) {
  const { reorderInPlace } = useReorder<T>();

  /**
   * 重排 form_entries_
   * @param keyOrder id_ 或 _X_ROW_KEY 的顺序数组
   */
  function reorderFormEntriesInPlace(keyOrder: string[]) {
    if (!Array.isArray(formData[entriesKey])) {
      formData[entriesKey] = [];
    }

    return reorderInPlace(formData[entriesKey]!, keyOrder, {
      appendRemaining: false,
      updateSort: {
        enabled: true,
        field: 'sort_num_',
        start: 1,
        step: 1,
      },
    });
  }

  return {
    reorderFormEntriesInPlace,
  };
}
