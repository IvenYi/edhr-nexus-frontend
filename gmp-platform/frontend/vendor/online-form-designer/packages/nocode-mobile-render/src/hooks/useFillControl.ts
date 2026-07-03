import { ref, reactive, computed, Ref, inject } from 'vue';
import { has, debounce,cloneDeep, omit  } from 'lodash-es';
import { NCB_PROVIDE, deleteSubtableRow, transformUtils } from '@gct/nocode-base';
import type { IPaginationControl, LockMap, ISubTableDataContext, IMatrixDataProps } from '../types';
import type { ITd, IBasicInfoItem } from '@gct/nocode-base';

export function usePaginationControl(total: Ref<number>, initialIndex = 0): IPaginationControl {
  const currentIndex = ref(initialIndex);

  const locks = reactive({
    prev: false,
    next: false,
  });

  const isStart = computed(() => currentIndex.value === 0);
  const isEnd = computed(() => currentIndex.value >= total.value - 1);

  const setLock = (type: 'prev' | 'next', value: boolean) => {
    locks[type] = value;
  };

  const changeIndex = (type: 'prev' | 'next') => {
    currentIndex.value = Math.max(
      0,
      Math.min(total.value - 1, currentIndex.value + (type === 'prev' ? -1 : 1)),
    );
  };

  const _handlePrev = () => {
    if (locks.prev || isStart.value) return;
    setLock('prev', true);
    changeIndex('prev');
    setTimeout(() => setLock('prev', false), 300);
  };

  const _handleNext = () => {
    if (locks.next || isEnd.value) return;
    setLock('next', true);
    changeIndex('next');
    setTimeout(() => setLock('next', false), 300);
  };

  const debouncedHandlePrev = debounce(_handlePrev, 300, { leading: false, trailing: true });
  const debouncedHandleNext = debounce(_handleNext, 300, { leading: false, trailing: true });

  const handlePagination = (type: 'prev' | 'next') => {
    if (type === 'prev') {
      debouncedHandlePrev();
    } else {
      debouncedHandleNext();
    }
  };

  return {
    currentIndex,
    handlePagination,
    paginationStatus: {
      isStart,
      isEnd,
      total: computed(() => total.value),
      loadingPrev: computed(() => locks.prev),
      loadingNext: computed(() => locks.next),
    },
  };
}

export function useSubTableData(
  formState: Ref<Record<string, any>>,
  context: ISubTableDataContext,
) {
  const defaultDataMap = inject<any>(NCB_PROVIDE.DEFAULT_FIELD_DATA);
  const dataRelationShip = inject<IBasicInfoItem>(NCB_PROVIDE.DATA_RELATION_SHIP);
  const updateCalcCallback = inject<any>(NCB_PROVIDE.PAGE_DATA_CALL_BACK);

  const modelValue = computed({
    get: () => formState.value[context.subField] || [],
    set: (val) => (formState.value[context.subField] = val),
  });

  const visibleData = computed(() => {
    const map: Record<number, number> = {};
    const data: any[] = [];

    modelValue.value.forEach((item, realIndex) => {
      if (!item.deleted_) {
        const visibleIndex = data.length;
        map[visibleIndex] = realIndex;
        data.push(item);
      }
    });

    return { data, map };
  });

  /** 获取默认值 */
  const currentFieldDefaultData = computed(() => {
    return defaultDataMap?.[dataRelationShip?.uniqueId ?? ''] ?? {};
  });

  const setLock = (key: keyof LockMap, val: boolean) => {
    context?.lockMap?.[key] && (context.lockMap[key]!.value = val);
  };

  const _addRow = (options: { index: number;actionType?:'copyRow'; position: 'before' | 'after'; rowNum?: number;rowData:object }) => {
    const newRowsData =options.actionType==='copyRow'?[cloneDeep(omit(options.rowData, 'id_'))]: Array.from({ length: options.rowNum || 1 }, () =>
      transformUtils.addSubTableRowItem({
        defaultData: currentFieldDefaultData.value,
        subFieldId: context.subField,
        isRowSubTable2d: context.isRowSubTable2d,
        childInitRowLen: context.childInitRowLen,
        crossFieldKeys: context.crossFieldKeys,
      }),
    );

    const realIndex = visibleData.value.map[options.index];
    const insertIndex = options.position === 'before' ? realIndex : realIndex + 1;

    modelValue.value.splice(insertIndex, 0, ...newRowsData);
    updateCalcCallback?.(dataRelationShip?.uniqueId);
  };

  const _deleteRow = (rowData, visibleIndex: number) => {
    deleteSubtableRow(context.subField, visibleIndex);

    if (rowData.id_ || (rowData.group_ && rowData._2DTABLE_.some((item) => item.id_))) {
      rowData.deleted_ = true;
    } else {
      rowData.tempDeleted = true;
      modelValue.value = modelValue.value.filter((d) => !d.tempDeleted);
    }

    modelValue.value = [...modelValue.value];
    updateCalcCallback?.(dataRelationShip?.uniqueId);
    context?.callback?.();
  };

  const handleAddRow = debounce(
    async (options: { index: number; position: 'before' | 'after'; rowNum?: number }) => {
      if (context?.lockMap?.[options.position]?.value) return;
      setLock(options.position, true);
      try {
        await Promise.resolve(_addRow(options));
      } finally {
        setTimeout(() => setLock(options.position, false), 300);
      }
    },
    300,
    { leading: false, trailing: true },
  );

  const handleDeleteRow = debounce(
    async (rowData, visibleIndex: number) => {
      if (context?.lockMap?.delete?.value) return;
      setLock('delete', true);
      try {
        await Promise.resolve(_deleteRow(rowData, visibleIndex));
      } finally {
        setTimeout(() => setLock('delete', false), 300);
      }
    },
    300,
    { leading: false, trailing: true },
  );

  return {
    modelValue,
    visibleData,
    handleAddRow,
    handleDeleteRow,
  };
}

export function useMatrixData(config: IMatrixDataProps) {
  const displayMode = ref(config.layoutMode || 'horizontal');

  const groupHandler = {
    // 处理 二维表 类型
    subTable2d: {
      mainGroupKey: (tdId: string) => {
        const td = config.widgetCenter[tdId] as ITd;
        let colKey;
        if (has(td.props, 'isNewFixedTableInDyn') && td.props.isNewFixedTableInDyn) {
          colKey = td.cellFixedTableDataIdx ?? 0;
        } else {
          colKey = 'belong-row';
        }
        return {
          rowKey: 0,
          colKey,
        };
      },
      linkGroupKey: (tdId: string) => {
        const td = config.widgetCenter[tdId] as ITd;
        if (has(td.props, 'isNewFixedTableTd') && td.props.isNewFixedTableTd) {
          return td.cellFixedTableDataIdx ?? 0;
        }
        return 'exclude-key';
      },
    },
    // 处理 检验表 类型
    checkTable2d: {
      mainGroupKey: (tdId: string) => {
        const td = config.widgetCenter[tdId] as ITd;
        let colKey;
        if (td.props?.checkTableType === 'child') {
          colKey = td.cellCheckTableDataColIdx ?? 0;
        } else if (td.props?.checkTableType === 'row') {
          colKey = 'belong-row';
        }

        return {
          rowKey: td.cellCheckTableDataRowIdx ?? 0,
          colKey,
        };
      },
      linkGroupKey: (tdId: string) => {
        const td = config.widgetCenter[tdId] as ITd;
        if (td.props?.checkTableType === 'col') {
          return td.cellCheckTableDataColIdx ?? 0;
        }
        return 'exclude-key';
      },
    },
  }[config.mode];

  const getSortedKeys = (obj) => {
    return Object.keys(obj)
      .map(Number)
      .sort((a, b) => a - b);
  };

  const maybeFlat = (arr, shouldFlat: boolean) => {
    return shouldFlat ? arr.flat() : arr;
  };

  const layoutMatrix = computed(() => {
    const mainGroups = config.mainWidgetIds.reduce((groups, tdId) => {
      const { rowKey, colKey } = groupHandler.mainGroupKey(tdId);
      if (!groups[rowKey]) {
        groups[rowKey] = { row: [], child: {} };
      }
      if (colKey === 'belong-row') {
        groups[rowKey].row.push(tdId);
      } else if (typeof colKey === 'number') {
        groups[rowKey].child[colKey] = groups[rowKey].child[colKey] || [];
        groups[rowKey].child[colKey].push(tdId);
      }
      return groups;
    }, {});

    const linkGroups = config.linkWidgetIds.reduce((groups, tdId) => {
      const colKey = groupHandler.linkGroupKey(tdId);
      if (colKey !== 'exclude-key' && typeof colKey === 'number') {
        groups[colKey] = groups[colKey] || [];
        groups[colKey].push(tdId);
      }
      return groups;
    }, {});

    const needFlat = config.mode === 'subTable2d';
    const sortedMainKeys = getSortedKeys(mainGroups);
    const sortedLinkKeys = getSortedKeys(linkGroups);

    // 横向填报
    const horizontal = maybeFlat(
      sortedMainKeys.map((r) => {
        const { row, child } = mainGroups[r];
        // 当sortedLinkKeys都为空时，直接使用child的键
        const keysToUse = sortedLinkKeys.length ? sortedLinkKeys : getSortedKeys(child);
        const cols = keysToUse.map((c) => [...(linkGroups[c] || []), ...(child[c] || [])]);
        return [...row, cols];
      }),
      needFlat,
    );

    // 当sortedLinkKeys都为空时，直接使用child的键
    const verticalKeys = sortedLinkKeys.length
      ? sortedLinkKeys
      : getSortedKeys(mainGroups[sortedMainKeys[0]]?.child);

    // 纵向填报
    const vertical = verticalKeys.map((c) => {
      const linkIds = linkGroups?.[c];
      const rows = sortedMainKeys.map((r) => [
        ...mainGroups[r].row,
        ...(mainGroups[r].child[c] || []),
      ]);
      return [...(linkIds || []), maybeFlat(rows, needFlat)];
    });

    return {
      horizontal,
      vertical,
    };
  });

  const currentLayoutMatrix = computed(() => {
    return displayMode.value === 'horizontal'
      ? layoutMatrix.value.horizontal
      : layoutMatrix.value.vertical;
  });

  return {
    layoutMatrix,
    displayMode,
    currentLayoutMatrix,
    toggleMode: () => {
      displayMode.value = displayMode.value === 'horizontal' ? 'vertical' : 'horizontal';
      config?.callback?.();
    },
  };
}
