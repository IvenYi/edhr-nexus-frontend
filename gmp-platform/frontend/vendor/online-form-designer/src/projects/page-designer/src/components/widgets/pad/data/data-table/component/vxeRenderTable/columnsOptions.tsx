import { toRaw, computed } from 'vue';
import { VxeGridProps } from 'vxe-table';
import { tableColumnWidthEnum } from '/@page-designer/enum';
import { OperateTable } from '/@page-designer/types/web';
import { columnsType } from '../../type';
import { selectionTypeEnums } from '/@/enums/appEnum';
import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
import { tableWidgetByDept } from '/@web-render/render/Event/Dependency/useDependencyToShow';
import { watchDebounced } from '@vueuse/core';
import { TableTypeEnum } from '@gct/runtime';
import { addOptionsByGrouping, getMinWidthByField } from '../transform';
import { showToast } from 'vant';

export interface getColumnOptions {
  move: (isBefore: boolean, toData: any, dragData: any) => void;
  end: (data: any) => void;
}

export function useGetColumns(props: P, opts?: getColumnOptions) {
  const options: VxeGridProps['columns'] = [
    {
      colId: 'radio',
      align: 'center',
      width: 40,
      fixed: getFixed(props.gridType, 'left'),
      field: 'radio',
      type: 'radio',
      visible: !!props.rowSelectionRadio,
      slots: {
        radio: 'radio',
      },
    },
    {
      colId: 'checkbox',
      width: 40,
      fixed: getFixed(props.gridType, 'left'),
      field: 'checkbox',
      type: 'checkbox',
      visible: !!props.rowSelection,
    },
    {
      colId: 'seq',
      type: 'seq',
      width: 55,
      fixed: getFixed(props.gridType, 'left'),
      field: 'seq',
      visible: props.serialNumber,
      resizable: true,
      minWidth: 50,
      slots: {
        header: () => $t('sys.pageDesigner.index'),
      },
    },
  ];
  watchDebounced(
    () => props.tableColumns.length,
    () => {
      props.tableColumns.forEach((i) => {
        initFieldWidgetRuntime(i)
          .then((fieldInfo) => {
            i.props.label = i.props.label || fieldInfo?.name;
            //rdo 识别父
            i.props.parentField = fieldInfo.parentField === 1;
          })
          .catch((err) => {
            /**隐藏已经删除的字段 */
            // i.props.hidden = true;
          });
        tableWidgetByDept(i);
      });
    },
    {
      immediate: true,
    },
  );

  const columnsOptions = computed(() => {
    const fieldope = [];
    if (props.multiLevelHeader) {
      const fieldMap = {};
      props.tableColumns.forEach((i, index) => {
        const row: ArrayType<VxeGridProps['columns']> = createColumnByField(
          i,
          props.isTree ? index === 0 : false,
        );
        fieldMap[i.id] = row;
      });
      addOptionsByGrouping(props.levelHeaderGrouping, fieldMap).forEach((row) => {
        fieldope.push(row);
      });
    } else {
      props.tableColumns.forEach((i, index) => {
        const row: ArrayType<VxeGridProps['columns']> = createColumnByField(
          i,
          props.isTree ? index === 0 : false,
        );
        fieldope.push(row);
      });
    }

    if (props.operateColumn) {
      const ope = getOperateProps(props.operateColumn, props.gridType);
      fieldope.push(ope);
    }

    return [...options, ...fieldope];
  });
  return columnsOptions;
}

/**创建表格列 */
function createColumnByField(i, treeNode) {
  return {
    colId: i.id,
    width: getColumnWidthByStyle(i.style),
    minWidth: getMinWidthByField(i),
    treeNode,
    resizable: true,
    field: i.props.field,
    title: i.props.label,
    fixed: i.props.fixedAlign,
    visible: !i.props.hidden,
    slots: {
      header: 'header',
      default: 'default',
      edit: 'default_deit',
    },
    editRender: {
      enabled: !i.props.readonly,
    },
    params: toRaw(i),
  };
}

function getOperateProps(operateColumn, gridType) {
  //*操作
  const { style } = operateColumn;
  const { fixedAlign, label } = operateColumn.props;
  return {
    colId: 'operate',
    width: style.columnwidth + 'px',
    resizable: true,
    fixed: getFixed(gridType, fixedAlign),
    title: label,
    slots: {
      default: 'ope_default',
    },
  };
}
function getColumnWidthByStyle(style) {
  return style?.columnwidthConfigure === tableColumnWidthEnum.ENUMERATION
    ? style.columnwidth + 'px'
    : '';
}
function getFixed(gridType: TableTypeEnum, fixed) {
  return gridType !== TableTypeEnum.EMBED ? fixed : null;
}
interface P {
  /**数据源 */
  modelValue: { [key: string]: any }[];
  /**加载 */
  loading?: boolean;
  /** 是否可选*/
  rowSelection?: boolean;
  /**单选多选 */
  rowSelectionType?: selectionTypeEnums;
  /**显示操作 */
  showOperate?: boolean;
  /**操作配置 */
  operateColumn?: OperateTable;
  /**列配置 */
  tableColumns: columnsType;
  /**行拖拽 */
  rowdraggable?: boolean;
  serialNumber?: boolean;
  radioDisabled?: boolean;
  isTree: boolean;
  rowDragSort?: boolean;
  // 子模型
  subTableWidget?: IData;
  gridType: TableTypeEnum;
  /**是否单选 */
  rowSelectionRadio?: boolean;
  /**是否开启多级表头 */
  multiLevelHeader?: boolean;
  /**多级表头数组 key,title */
  levelHeaderGrouping?: any[];
}
