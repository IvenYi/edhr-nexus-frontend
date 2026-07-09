import { useI18n } from '/@/hooks/web/useI18n';
import { toRef, watch, ref } from 'vue';
import { VxeGridProps } from 'vxe-table';
import { tableColumnWidthEnum, TableEditingMethodEnum } from '/@page-designer/enum';
import {
  OperateTable,
  ColumnTable,
  FormulaTable,
  DataTable,
  SubTable,
} from '/@page-designer/types/web';
import { selectionTypeEnums } from '/@/enums/appEnum';
import { initFieldWidgetRuntime } from '/@page-designer/hooks/getFieldSchema';
import { TableTypeEnum } from '@gct/runtime';
import { forEachRight } from 'lodash-es';
import { addOptionsByGrouping, getMinWidthByField } from '../transform';

const { t } = useI18n();

export function useGetColumns(props: P) {
  const columnsOptions = toRef(() => {
    const options: VxeGridProps['columns'] = [
      {
        width: 35,
        field: 'drag',
        fixed: 'left',
        visible: props.rowDragSort === true,
        slots: {
          default: () => <span class="cursor-move iconfont icon-drag"></span>,
        },
      },
      {
        width: 40,
        fixed: 'left',
        field: 'radio',
        type: 'radio',
        visible: props.rowSelectionRadio,
      },
      {
        width: 40,
        fixed: 'left',
        field: 'checkbox',
        type: 'checkbox',
        visible: props.rowSelection,
      },
      {
        width: 30,
        fixed: 'left',
        type: 'expand',
        // title: '展开',
        slots: {
          content: 'content',
        },
        visible: props.gridType === TableTypeEnum.EMBED && props.enableEmbed === true,
      },
      {
        type: 'seq',
        width: 55,
        fixed: 'left',
        field: 'seq',
        visible: props.serialNumber,
        slots: {
          header: () => t('sys.pageDesigner.index'),
        },
      },
    ];
    forEachRight(props.columns, (i, index) => {
      initFieldWidgetRuntime(i)
        .then((fieldInfo) => {
          i.alias = i.props.label || fieldInfo?.name;
        })
        .catch((err) => {
          //通过倒序遍历删除 不存在的字段
          // props.columns.splice(index, 1);
        });
    });

    if (props.multiLevelHeader) {
      const fieldMap = {};
      props.columns.forEach((i, index) => {
        const row: ArrayType<VxeGridProps['columns']> = createColumnByField(
          i,
          props.isTree ? index === 0 : false,
        );
        fieldMap[i.id] = row;
      });
      addOptionsByGrouping(props.levelHeaderGrouping, fieldMap).forEach((row) => {
        options.push(row);
      });
    } else {
      props.columns.forEach((i, index) => {
        const row: ArrayType<VxeGridProps['columns']> = createColumnByField(
          i,
          props.isTree ? index === 0 : false,
        );
        options.push(row);
      });
    }

    if (props.operateColumn) {
      //*操作
      const { style } = props.operateColumn;
      const { fixedAlign } = props.operateColumn.props;
      options.push({
        width: style.columnwidth + 'px',
        resizable: true,
        fixed: fixedAlign,
        slots: {
          header: 'ope_header',
          default: 'ope_default',
        },
      });
    }

    return options;
  });
  return columnsOptions;
}
/**创建表格列 */
function createColumnByField(i, treeNode) {
  return {
    width: getColumnWidthByStyle(i.style),
    minWidth: getMinWidthByField(i),
    resizable: true,
    treeNode,
    // showOverflow: 'tooltip',
    field: i.id,
    title: i.props.label,
    fixed: i.props.fixedAlign,
    slots: {
      header: 'header',
      default: 'default',
    },
    params: i,
  };
}
function getColumnWidthByStyle(style) {
  return style?.columnwidthConfigure === tableColumnWidthEnum.ENUMERATION
    ? style.columnwidth + 'px'
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
  rowDragSort?: boolean;
  tableWidget: DataTable | SubTable;
  editStatus?: boolean;
  editMethods?: TableEditingMethodEnum;
  serialNumber?: boolean;
  isTree: boolean;
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

function treeMap(tree, callback) {
  if (!tree) return [];
  return tree.map((node) => {
    // 调用回调函数处理当前节点
    const newNode = callback(node);

    // 如果当前节点有子节点，递归处理子节点
    if (node.children && node.children.length > 0) {
      newNode.children = treeMap(node.children, callback);
    }
    // 返回处理后的节点
    return newNode;
  });
}
