import { defineComponent, reactive, computed, PropType, toRef, inject, onUnmounted } from 'vue';
import { last, pick, merge, cloneDeep, omit } from 'lodash-es';

import { NCB_PROVIDE } from '../emit';
import { transformUtils } from '../interface';
import BorderTD from './border-td.vue';

import { deleteSubtableRow, useWidgetStaticAttrs, setSelectMobileTdId } from '../hooks';
import type { BaseCoreComponent, ITd, ISubTable, ISubTableItem } from '../types';

import '../css/sub-table.less';
import { CellType } from '../constant';
import { useMaterialBalance } from '../hooks/material-balance/useMaterialBalance';

export default defineComponent({
  name: 'NocodeDocumentSubTable',
  props: {
    subInfo: {
      type: Object as PropType<ISubTableItem>,
      required: true,
    },
    /** 二维表相关信息 */
    subTable2dItem: {
      type: Object as PropType<any>,
    },
    widget: {
      type: Object as PropType<ISubTable>,
      required: true,
    },
    formData: {
      type: Object as PropType<any>,
      required: true,
    },
    /** 组件信息中心 */
    widgetCenter: {
      type: Object as PropType<Record<string, BaseCoreComponent.BasicSchema>>,
      required: true,
    },
    start: {
      type: Number,
      required: true,
    },
    end: {
      type: Number,
      required: true,
    },
    /** 是否是移动端渲染 */
    isMobile: {
      type: Boolean,
    },
  },
  setup(props, { emit, expose, slots }) {
    const defaultDataMap = inject<any>(NCB_PROVIDE.DEFAULT_FIELD_DATA);
    const updateCalcCallback = inject<any>(NCB_PROVIDE.PAGE_DATA_CALL_BACK);
    const openFillFieldsModal = inject<any>(NCB_PROVIDE.MOBILE_FILL_FIELDS_POPUP);

    const { showDisplayStatus, dataRelationShip } = useWidgetStaticAttrs(props.widget);

    const {
      field = '',
      colsWidth,
      dynamicIds,
      isRowSubTable2d,
      childInitRowLen,
      quickFill,
      subModelType,
    } = reactive(props.widget.props);

    const { openConsumeModal, destoryConsumeModal } = useMaterialBalance();

    const lastDynRowIdx = dynamicIds.length - 1;
    const lastDynamicId = last(dynamicIds);

    const realFormState = toRef(() => props.formData);

    const modelValue = computed({
      get() {
        return realFormState.value[field] ?? [];
      },
      set(val: any) {
        realFormState.value[field] = val;
      },
    });

    const dataInfo = computed(() => {
      // const filterValue = modelValue.value.filter((d) => !d.deleted_);
      const visibleToRealIndexMap: Record<number, number> = {}; // 记录真实坐标
      const filterValue: any[] = [];

      modelValue.value.forEach((item, realIndex) => {
        if (!item.deleted_) {
          const visibleIndex = filterValue.length;
          visibleToRealIndexMap[visibleIndex] = realIndex;
          filterValue.push(item);
        }
      });

      return {
        tableData: filterValue.slice(props.start, props.end),
        hasSubData: filterValue.length > 1,
        isEndRow: props.end === filterValue.length,
        visibleToRealIndexMap,
      };
    });

    /** 获取默认值 */
    const currentFieldDefaultData = computed(() => {
      return defaultDataMap?.[dataRelationShip?.uniqueId ?? ''] ?? {};
    });

    const showAction = computed(() => {
      if (props.isMobile) {
        return false;
      }
      if (dataRelationShip?.formChangeStatus) {
        return false;
      }

      return showDisplayStatus.value === 'edit-component';
    });

    const showQuickFillAction = computed(() => showAction.value && quickFill);

    const handleDeleteRow = (rowData, dataIdx) => {
      deleteSubtableRow(field, props.start + dataIdx);

      if (rowData.id_ || (rowData.group_ && rowData._2DTABLE_.some((item) => item.id_))) {
        rowData.deleted_ = true;
      } else {
        rowData.tempDeleted = true;
        modelValue.value = modelValue.value.filter((d) => !d.tempDeleted);
      }
      modelValue.value = [...modelValue.value];
      updateCalcCallback?.(dataRelationShip?.uniqueId);
    };

    const handleAddRow = ({
      index,
      position = 'after',
      rowNum = 1,
      actionType,
      rowData,
      quickFillDatas,
    }) => {
      const newRowsData =
        actionType === 'copyRow'
          ? [cloneDeep(omit(rowData, 'id_'))]
          : Array.from({ length: rowNum }, (_, index) =>
              transformUtils.addSubTableRowItem({
                defaultData: currentFieldDefaultData.value,
                quickFillData: quickFillDatas?.[index],
                subFieldId: field,
                isRowSubTable2d,
                childInitRowLen,
                crossFieldKeys: props.subTable2dItem?.crossFieldKeys,
              }),
            );
      const visibleIndex = props.start + index;
      const realIndex = dataInfo.value.visibleToRealIndexMap[visibleIndex];
      const insertIndex = position === 'before' ? realIndex : realIndex + 1;

      if (actionType === 'currentRow') {
        const firstData = newRowsData.shift();
        merge(rowData, firstData);
      }
      modelValue.value.splice(insertIndex, 0, ...newRowsData);

      updateCalcCallback?.(dataRelationShip?.uniqueId);
    };

    const handleDefaultClick = (rowData, dataIdx) => {
      const { fieldId } = props.subInfo;
      if (subModelType === 'MATERIAL_BALANCE') {
        const subData = realFormState.value[fieldId] || [];
        openConsumeModal(subData);
      }
    };

    const handleMenuClick =
      (rowData, dataIdx) =>
      ({ key, actionValue }) => {
        switch (key) {
          case 'insertRowBefore':
            handleAddRow({
              index: dataIdx,
              position: 'before',
              rowNum: actionValue?.upRowNum || 1,
              quickFillDatas: actionValue?.data,
              actionType: 'prevRow',
              rowData,
            });

            break;
          case 'insertRowAfter':
            handleAddRow({
              index: dataIdx,
              position: 'after',
              rowNum: actionValue?.downRowNum || 1,
              quickFillDatas: actionValue?.data,
              actionType: 'nextRow',
              rowData,
            });
            break;

          case 'insertRowCurrent':
            handleAddRow({
              index: dataIdx,
              position: 'after',
              rowNum: actionValue?.downRowNum || 1,
              quickFillDatas: actionValue?.data,
              actionType: 'currentRow',
              rowData,
            });
            break;
          case 'copyRowAfter':
            handleAddRow({
              index: dataIdx,
              position: 'after',
              rowNum: actionValue?.downRowNum || 1,
              quickFillDatas: actionValue?.data,
              actionType: 'copyRow',
              rowData,
            });
            break;
          case 'deleteRowCurrent':
            handleDeleteRow(rowData, dataIdx);
            break;
          case 'default':
            handleDefaultClick(rowData, dataIdx);
        }
      };

    const renderTr2Td = (
      trKey,
      trData,
      rowData,
      { showDelBtn, showActionMenu, dataIdx, dynHeight },
    ) => {
      return (
        <tr key={trKey} height={dynHeight || trData.props.height}>
          {trData.nextIds.map((tdId, tdIdx) => {
            const tdInfo = props.widgetCenter[tdId] as ITd;
            const tdAttrs = {
              key: tdId,
              id: tdId,
              hidden: tdInfo.cellHidden,
              borderAttrs: tdInfo.props.sourceBorderAttrs,
              autoMerge: tdInfo.fillDirection === 'x' ? tdInfo.xAutoMerge : tdInfo.autoMerge,
              fillDirection: tdInfo.fillDirection,
              ...pick(tdInfo.props, ['rowspan', 'colspan', 'class']),
            };

            const realTdAttrInfo = props.subInfo.mergeBlock?.[tdId];

            if (realTdAttrInfo) {
              Object.assign(tdAttrs, {
                ...pick(realTdAttrInfo, ['rowspan', 'colspan', 'borderAttrs']),
                hidden: false,
              });
            }

            if (tdInfo.cellValueType) {
              if (props.isMobile) {
                Object.assign(tdAttrs, {
                  onClick: setSelectMobileTdId.bind(
                    null,
                    tdInfo,
                    dataRelationShip,
                    props.widgetCenter,
                    openFillFieldsModal,
                    props.start + dataIdx,
                  ),
                });
              }

              const subWidgetAttrs = {
                formData: rowData,
              };

              if (dataIdx !== -1) {
                Object.assign(subWidgetAttrs, {
                  subtableFieldId: field,
                  realRowIndex: Number(props.start ?? 0) + dataIdx,
                  pageRowIndex: dataIdx,
                });
              }

              // 二维表处理了哦
              if (tdInfo.props.isNewFixedTableInDyn) {
                const cellFixedTableDataIdx = tdInfo.cellFixedTableDataIdx ?? 0;

                Object.assign(subWidgetAttrs, {
                  formData: rowData?.['_2DTABLE_']?.[cellFixedTableDataIdx] ?? {},
                  childSubTableDataIndex: cellFixedTableDataIdx,
                });
              }

              return (
                <BorderTD style={tdInfo.style} {...tdAttrs} isEmpty={true}>
                  {tdInfo.cellValueType !== CellType.Default || tdInfo.cellWidget.props.value
                    ? slots.widget?.({ tdInfo, ...subWidgetAttrs })
                    : null}
                </BorderTD>
              );
            }

            if (realTdAttrInfo && tdInfo.cellHidden) {
              return <BorderTD style={tdInfo.style} {...tdAttrs} isEmpty={true}></BorderTD>;
            }
          })}
          {showAction.value && showActionMenu ? (
            <div class="sub-table-action-bar">
              {slots.subAction?.({
                noPopover: subModelType === 'MATERIAL_BALANCE',
                showDelBtn,
                showQuickFillBtn: quickFill,
                subTableFieldId: field,
                mobileTdIdGroups: dataRelationShip?.mobileTdIdGroups,
                handleMenuClick: handleMenuClick(rowData, dataIdx),
              })}
            </div>
          ) : null}
        </tr>
      );
    };

    onUnmounted(() => {
      destoryConsumeModal();
    });

    return () => (
      <div class="cmp-sub-table">
        <table class="sub-table-wrapper" cellpadding="0" cellspacing="0">
          <colgroup>
            {colsWidth.map((cw, cwIdx) => (
              <col key={cwIdx} width={cw} />
            ))}
          </colgroup>
          <tbody>
            {props.subInfo.containerIds.map((trId, trIdx) => {
              const trInfo = props.widgetCenter[trId];
              if (trInfo.props.identifier !== 'dynamicTr') {
                const dynHeight = props.subInfo.dynamicRowHeights?.[trId];
                return renderTr2Td(trId, trInfo, realFormState.value, {
                  showDelBtn: false,
                  showActionMenu: false,
                  dataIdx: -1,
                  dynHeight,
                });
              }

              if (trId === lastDynamicId) {
                const lastDataIdx = dataInfo.value.tableData.length - 1;

                return dataInfo.value.tableData.map((data, dataIdx) => {
                  return dynamicIds.map((rowId, rowIdx) => {
                    // 判断是否是最后一行最后一列
                    const isLast = dataIdx === lastDataIdx && rowIdx === lastDynRowIdx;
                    // 按需显示删除按钮和添加按钮
                    const showDelBtn = dataInfo.value.hasSubData && rowIdx === lastDynRowIdx;
                    const showAddBtn = dataInfo.value.isEndRow && isLast;
                    const showActionMenu = rowIdx === lastDynRowIdx;

                    const row = props.widgetCenter[rowId];
                    const dynHeight = props.subInfo.dynamicRowHeights?.[rowId]?.[dataIdx];

                    return renderTr2Td(`${dataIdx}_${rowIdx}`, row, data, {
                      showDelBtn,
                      showActionMenu,
                      dataIdx,
                      dynHeight,
                    });
                  });
                });
              }
            })}
          </tbody>
        </table>
      </div>
    );
  },
});
