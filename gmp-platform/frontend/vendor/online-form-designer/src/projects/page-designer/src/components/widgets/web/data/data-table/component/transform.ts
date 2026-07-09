import { FormComponents } from '/@page-designer/enum';
import { operateSysEnums } from '/@page-designer/enum';
import { cloneDeep } from 'lodash-es';
import { FIELD_TYPE } from '@/enums/appEnum';
const buttonOption = {
  [operateSysEnums.COPY]: FormComponents.SubTableCopyBtn,
  [operateSysEnums.COLUMNDELETE]: FormComponents.SubTableDeleteBtn,
  [operateSysEnums.EDIT]: FormComponents.SubTableEditBtn,
  [operateSysEnums.DETAILS]: FormComponents.TableInfoButton,
  [operateSysEnums.USAGEINFORMATION]: FormComponents.UseinfoButton,
  [operateSysEnums.MODELINGTRACEABILITY]: FormComponents.ModelingButton,
  [operateSysEnums.LABEL_PRINT]: FormComponents.LabelPrintButton,
  // [operateSysEnums.DOCUMENT_PRINT]: FormComponents.DocumentPrintButton,
  [operateSysEnums.COLUMNLINK]: FormComponents.TableLinkButton,
};

enum AlignType {
  LEFT = 'left',
  CENTER = 'center',
  RIGHT = 'right',
  JUSTIFY = 'justify',
}

const alignMap: Record<AlignType, string> = {
  [AlignType.LEFT]: 'flex-start',
  [AlignType.CENTER]: 'center',
  [AlignType.RIGHT]: 'flex-end',
  [AlignType.JUSTIFY]: 'space-between',
};

/**老版本按钮转化 */
export const transformButtons = (options = []) => {
  options.forEach((i: any) => {
    if (i.props.innerEvent) {
      i.type = buttonOption[i.props.sysMethedType] || FormComponents.CustomButton;
    } else {
      i.type = FormComponents.CustomButton;
    }
    if (i.type === FormComponents.LabelPrintButton) {
      i.props.refModel = i.props.model;
    }
    if (i.type === FormComponents.DocumentPrintButton) {
      i.props.refModel = i.props.model;
      i.children = i.props.fieldList;
    }
    if (i.type === FormComponents.SubTableCopyBtn) {
      i.props.model = i.props.model;
    }
    i.parentComponent = FormComponents.DataTable;
  });
};

export function addOptionsByGrouping(levelHeaderGrouping, fieldMap) {
  return treeMap(cloneDeep(levelHeaderGrouping), (node) => {
    if (node.isGroup) {
      return {
        title: node.title,
        children: node.children,
        visible: node.children && node.children.length > 0,
        slots: {
          header: 'groupHeader',
        },
      };
    } else {
      return fieldMap[node.key];
    }
  })
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

export function getMinWidthByField(widget: any) {
  if (widget.props.fieldType === FIELD_TYPE.DATE_TIME) {
    return 150
  }
}

export function transformFont2flexStyle(params) {
  const flexStyle = params.style?.contentFont?.align as AlignType;
  return alignMap[flexStyle] || 'flex-start';
}