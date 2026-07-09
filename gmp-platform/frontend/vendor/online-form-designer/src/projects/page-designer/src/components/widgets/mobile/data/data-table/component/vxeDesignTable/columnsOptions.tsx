import { useI18n } from '/@/hooks/web/useI18n';
import { ref, toRef } from 'vue';
import { VxeGridProps } from 'vxe-table';
import { tableColumnWidthEnum, TableEditingMethodEnum } from '/@page-designer/enum';
import { selectionTypeEnums } from '/@/enums/appEnum';
import {
  OperateTable,
  ColumnTable,
  FormulaTable,
  DataTable,
  SubTable,
} from '/@page-designer/types/web';

const { t } = useI18n();

export function useGetColumns(props: P, getheaderClass) {
  const columnsOptions = toRef(() => {
    const options: VxeGridProps['columns'] = [
      // {
      //   width: 35,
      //   field: 'drag',
      //   visible: props.rowdraggable,
      //   slots: {
      //     default: () => <span class="cursor-move iconfont icon-drag"></span>,
      //   },
      // },
      {
        width: 60,
        fixed: 'left',
        field: 'radio',
        type: 'radio',
        visible: props.rowSelection && props.rowSelectionType === selectionTypeEnums.SingleChoice,
      },
      {
        width: 60,
        fixed: 'left',
        field: 'checkbox',
        type: 'checkbox',
        visible: props.rowSelection && props.rowSelectionType === selectionTypeEnums.MultipleChoice,
      },
      {
        type: 'seq',
        width: 50,
        field: 'seq',
        visible: props.serialNumber,
        slots: {
          header: () => t('sys.pageDesigner.index'),
        },
      },
    ];
    props.columns.forEach((i, index) => {
      const row: ArrayType<VxeGridProps['columns']> = {
        width: getColumnWidthByStyle(i.style),
        resizable: true,
        showOverflow: 'tooltip',
        field: i.props.field,
        title: i.props.label,
        treeNode: props.isTree ? index === 0 : false,
        className: getheaderClass(i.id, 'cell-active'),
        headerClassName: getheaderClass(i.id),
        slots: {
          header: 'header',
          default: 'default',
        },
        params: i,
      };
      options.push(row);
    });
    return options;
  });
  return columnsOptions;
}

function getColumnWidthByStyle(style) {
  return style?.columnwidthConfigure === tableColumnWidthEnum.PERCENTAGE
    ? style.columnwidth + '%'
    : '';
}

interface P {
  /**数据源 */
  datasource: { [key: string]: any }[];
  /**字段信息 */
  columns: (ColumnTable | FormulaTable)[];
  /** 是否可选*/
  rowSelection?: boolean;
  /**单选多选 */
  rowSelectionType?: selectionTypeEnums;
  /**操作配置 */
  operateColumn?: OperateTable;
  /**行拖拽 */
  rowdraggable?: boolean;
  tableWidget: DataTable | SubTable;
  editMethods?: TableEditingMethodEnum;
  serialNumber?: boolean;
  isTree: boolean;
}
