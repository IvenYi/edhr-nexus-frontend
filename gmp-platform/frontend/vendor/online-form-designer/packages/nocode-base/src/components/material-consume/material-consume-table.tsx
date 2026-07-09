import { defineComponent, reactive, computed, PropType, toRef, provide, inject, ref } from 'vue';
import { last, pick, merge, cloneDeep, omit } from 'lodash-es';

import { NCB_PROVIDE } from '../../emit';
import { transformUtils } from '../../interface';
import BorderTD from '../border-td.vue';

import {
  deleteSubtableRow,
  useWidgetStaticAttrs,
  setSelectMobileTdId,
  MaterialConsumeTableController,
  IMaterialConsumeData,
  MCDataUtil,
} from '../../hooks';
import type { BaseCoreComponent, ITd, ISubTable, ISubTableItem } from '../../types';

import '../../css/sub-table.less';
import { CellType } from '../../constant';
import MaterialConsumeAction from './material-consume-action.vue';
import { MaterialConsumeActionType } from './types';

export default defineComponent({
  name: 'NocodeMaterialConsumeTable',
  props: {
    subInfo: {
      type: Object as PropType<ISubTableItem>,
      required: true,
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
    tableController: {
      type: Object as PropType<MaterialConsumeTableController>,
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

    const { showDisplayStatus, dataRelationShip } = useWidgetStaticAttrs(props);

    const tableController = props.tableController as MaterialConsumeTableController;

    provide(NCB_PROVIDE.MATERIAL_CONSUME_TABLE_CONTROLLER, tableController);

    const {
      field = '',
      colsWidth,
      dynamicIds,
      isRowSubTable2d,
      childInitRowLen,
      quickFill,
    } = reactive(props.widget.props);

    /** 子表框选区域范围的最后一行的index */
    const lastDynRowIdx = dynamicIds.length - 1;
    /** 子表框选区域范围的最后一行的id */
    const lastDynamicId = last(dynamicIds);

    const realFormState = toRef(() => props.formData);

    const modelValue = computed({
      get() {
        return realFormState.value[field] ?? [];
      },
      set(val: any) {
        realFormState.value[field] = val;
        updateCalcCallback?.(dataRelationShip?.uniqueId);
      },
    });

    // 物料消耗表初始化数据
    tableController.setup({ tableDataRef: modelValue, widget: props.widget });

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
      // updateCalcCallback?.(dataRelationShip?.uniqueId);
    };

    const handleAddRow = ({
      index,
      position = 'after',
      rowNum = 1,
      actionType,
      rowData,
      quickFillDatas,
    }) => {
      if (tableController.hasEditingRow()) {
        return;
      }
      const newRowsData = (
        actionType === 'copyRow'
          ? [cloneDeep(omit(rowData, 'id_'))]
          : Array.from({ length: rowNum }, (_, index) =>
              transformUtils.addSubTableRowItem({
                defaultData: currentFieldDefaultData.value,
                quickFillData: quickFillDatas?.[index],
                subFieldId: field,
                isRowSubTable2d,
                childInitRowLen,
              }),
            )
      ) as IMaterialConsumeData[];

      // 设置行编辑开启
      newRowsData.forEach((rowData) => {
        rowData.is_confirmed_ = false;
      });

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

    const handleAction = (action: string, rowData: IMaterialConsumeData) => {
      console.log('action', action);
      switch (action) {
        case MaterialConsumeActionType.CONFIRM:
          tableController.confirm(rowData);
          break;
        case MaterialConsumeActionType.SCAN:
          tableController.openScanModal({
            title: props.widget.props.tableTitle,
          });
          break;
        case MaterialConsumeActionType.VIEW_BOM:
          tableController.openBomModal();
          break;
        case MaterialConsumeActionType.CHANGE_PARSE_RULE:
          tableController.changeScanRule();
          break;
      }
    };

    /**
     * 构造新的td信息，用于控制内容的子组件。
     * @param tdInfo
     * @return {*}
     */
    const getNewTdInfo = (tdInfo: ITd, rowData: IMaterialConsumeData) => {
      // 排除隐藏字段和没有field属性的单元格
      if (tdInfo.cellHidden || !tdInfo?.cellWidget?.props?.field) {
        return tdInfo;
      }
      const fieldKey = tdInfo.cellWidget.props.field! as any;
      // 非内置字段不处理，走原来的
      if (!MCDataUtil.allFields.includes(fieldKey)) {
        return tdInfo;
      }
      const cloneData = cloneDeep(tdInfo);
      // 正在编辑的行不禁用，其他行都禁用
      const isEditing = !rowData.is_confirmed_;
      let disabled = !isEditing;
      // 修改字段的禁用
      const disabledKeys = tableController.calcDisabledFields(rowData);
      if (disabledKeys.includes(fieldKey)) {
        disabled = true;
      }

      // 修改状态
      cloneData.cellWidget.props.disabled = disabled;
      // 禁用字段的必填状态都取消
      if (cloneData.cellWidget.props.disabled) {
        cloneData.cellWidget.props.required = false;
      }

      // 批次号根据物料版本进行联动过滤查询
      if (tdInfo.cellWidget.props.field === 'material_no_') {
        cloneData.cellWidget.props.newSpecificConfig.newOptions = [];
        merge(cloneData.cellWidget.props.newSpecificConfig, {
          newQueryData: {
            'product_id_.versionIn': rowData.product_id_
              ? [rowData.product_id_.split(':').pop()]
              : null,
          },
        });
      }

      return cloneData;
    };

    const handleMenuClick =
      (rowData, dataIdx) =>
      ({ key, actionValue }) => {
        switch (key) {
          case 'rowEdit':
            tableController.editRow(rowData);
            break;
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
        }
      };

    const renderTr2Td = (
      trKey,
      trData,
      rowData,
      { showDelBtn, showActionMenu, showScanBtn, showEditBtn, dataIdx, dynHeight },
    ) => {
      return (
        <tr key={trKey} height={dynHeight || trData.props.height}>
          {trData.nextIds.map((tdId, tdIdx) => {
            const tdInfo = getNewTdInfo(props.widgetCenter[tdId], rowData) as ITd;

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
          {showAction.value && showActionMenu && (
            <div class="sub-table-action-bar">
              {
                <MaterialConsumeAction
                  showBom={tableController.isPersonalBom}
                  showScanBtn={showScanBtn}
                  rowData={rowData}
                  onDoAction={handleAction}
                />
              }
              {slots.subAction?.({
                showDelBtn,
                showQuickFillBtn: false,
                subTableFieldId: field,
                showEditBtn: showEditBtn,
                showInsertMultiple: false,
                mobileTdIdGroups: dataRelationShip?.mobileTdIdGroups,
                handleMenuClick: handleMenuClick(rowData, dataIdx),
              })}
            </div>
          )}
        </tr>
      );
    };

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
              console.log('trInfo', trInfo);
              if (trInfo.props.identifier !== 'dynamicTr') {
                // 非动态行不允许显示操作按钮
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
                  // 输出整个重复区域的行
                  return dynamicIds.map((rowId, rowIdx) => {
                    // 是否是子表重复区域的最后一行
                    const isLastDynRow = rowIdx === lastDynRowIdx;
                    // 判断是否是最后一行最后一列
                    const isLast = dataIdx === lastDataIdx && isLastDynRow;
                    // 按需显示删除按钮和添加按钮
                    const showDelBtn =
                      dataInfo.value.hasSubData &&
                      isLastDynRow &&
                      // 开启了顺序投料时，只有最后一行可以删除
                      (tableController.enableSequenceLoading ? isLast : true);
                    // 按需显示删除按钮和添加按钮
                    const showScanBtn = isLast;
                    const showAddBtn = dataInfo.value.isEndRow && isLast;
                    const showActionMenu = isLastDynRow;

                    // 开启顺序投料时只有最后一行才显示编辑按钮
                    // 已经开启编辑的行不显示编辑按钮
                    const showEditBtn =
                      (tableController.enableSequenceLoading ? isLast : true) && data.is_confirmed_;

                    const row = props.widgetCenter[rowId];
                    const dynHeight = props.subInfo.dynamicRowHeights?.[rowId]?.[dataIdx];

                    return renderTr2Td(`${dataIdx}_${rowIdx}`, row, data, {
                      showDelBtn,
                      showActionMenu,
                      showScanBtn,
                      showEditBtn,
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
