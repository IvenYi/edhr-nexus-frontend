import { FormComponents, operateSysEnums } from '/@page-designer/enum';
import { cloneDeep } from 'lodash-es';
import { FIELD_TYPE } from '@/enums/appEnum';

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
  });
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
    return 150;
  }
}
