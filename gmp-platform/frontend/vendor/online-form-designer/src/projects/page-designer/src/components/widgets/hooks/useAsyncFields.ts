import { computed, watch } from 'vue';
import { useSelectedWidget } from '/@page-designer/hooks/useSelectedWidget';
import { MaterialEnum } from '/@/enums/appEnum';
import { eachTree, findNode, findNodeAll } from '/@/utils/helper/treeHelper';
import { cloneDeep, difference, get, has, set, xor } from 'lodash-es';
import { useScope } from '/@page-designer/hooks/useScope';

const needAsyncAttrs = [
  'label',
  'required',
  'readonly',
  'disabled',
  'placeholder',
  'showExplain',
  'explain',
  'reg',
  'regHint',
  'bindCompStyleType',
  'displayCurrency',
  'separator',
  'currency',
  'separator',
  'format',
  'range',
  'dateType',
  'timeType',
  'enableAutofill',
  'autofillRules',
  'notSubmitInHide',
  'selectType',
  'notAutoFix',
];

const needAsyncStyles = ['contentFont', 'tagStyleOpen', 'tagStyle'];

/**
 * 子表字段配置同步
 */
export function useAsyncFieldConfig(widget) {
  const { selectedWidget } = useSelectedWidget();

  const listFields = computed(() => {
    return widget.children![3].children;
  });

  const modalFields = computed(() => {
    return findNodeAll(widget.children[0].children[0].children[0].children, (item) => {
      return item.isField && item.materialType === MaterialEnum.MaterialSubTableModalField;
    });
  });

  const isSubTableField = computed(() => {
    return selectedWidget.value.materialType === MaterialEnum.MaterialSubTableField;
  });

  const isSubTableModalField = computed(() => {
    return selectedWidget.value.materialType === MaterialEnum.MaterialSubTableModalField;
  });

  // 无论怎么样，配置是同步的，
  // 如果弹窗中字段没有操作过，字段需要同步
  // 如果弹窗中字段新增或者删除字段，两边字段独立，
  const setAsyncAttrValue = (source, target) => {
    const sourceField = source.find((item) => item.id === selectedWidget.value.id);
    const targetField = target.find((item) => item.id === selectedWidget.value.id);

    if (targetField) {
      targetField.i18n = sourceField.i18n;
      needAsyncAttrs
        .filter((attr) => has(sourceField.props, attr))
        .forEach((attr) => {
          targetField.props[attr] = sourceField.props[attr];
        });

      needAsyncStyles.forEach((attr) => {
        targetField.style[attr] = sourceField.style[attr];
      });
    }
  };

  watch(
    () => selectedWidget.value,
    (info) => {
      if (isSubTableField.value) {
        setAsyncAttrValue(listFields.value, modalFields.value);
      } else if (isSubTableModalField.value) {
        setAsyncAttrValue(modalFields.value, listFields.value);
      }
    },
    {
      deep: true,
    },
  );

  return {};
}

/**
 * 操作子表字段
 * @returns
 */
export function useAsyncOperateField() {
  /** 同步字段属性 */
  function asyncFieldAttr(widget, fields, checked) {
    const listFieldIds = fields.map((item) => item.id);

    eachTree(widget.children[0].children[0].children[0].children, (node: any) => {
      if (
        node.isField &&
        node.materialType === MaterialEnum.MaterialSubTableModalField &&
        listFieldIds.includes(node.id)
      ) {
        node.props.readonly = checked;
      }
    });
  }

  // 递归删除满足条件的字段
  function removeNodesInPlace(node, condition) {
    if (!node || !node.children) {
      return;
    }

    let i = 0;
    while (i < node.children.length) {
      const child = node.children[i];
      if (condition(child)) {
        // 删除满足条件的子节点
        node.children.splice(i, 1);
      } else {
        // 递归处理子节点的子节点
        removeNodesInPlace(child, condition);
        i++;
      }
    }
  }

  function asyncFieldInfo(w, list) {
    // 不需要同步
    if (!w.props.isFieldAsync) {
      return;
    }
    const listFieldIds = list
      .filter(
        (item) =>
          has(item, 'materialType') && item.materialType === MaterialEnum.MaterialSubTableField,
      )
      .map((item) => item.id);

    const modalFieldIds: any = [];
    eachTree(w.children[0].children[0].children[0].children, (node: any) => {
      if (node.isField && node.materialType === MaterialEnum.MaterialSubTableModalField) {
        modalFieldIds.push(node.id);
      }
    });

    // 同步 新增、 删除
    const fieldUtils: any = { add: [], remove: [] };
    // 先用difference过滤出需要新增的字段
    fieldUtils.add = difference(listFieldIds, modalFieldIds);
    // 在用 xor 过滤出两数组不同的值，在用difference过滤出需要删除的字段
    fieldUtils.remove = difference(xor(listFieldIds, modalFieldIds), fieldUtils.add);

    // 同步 删除
    if (fieldUtils.remove.length !== 0) {
      removeNodesInPlace(w.children[0].children[0].children[0], (node) => {
        return fieldUtils.remove.includes(node.id);
      });
    }

    // 同步 新增
    if (fieldUtils.add.length !== 0) {
      fieldUtils.add.forEach((fieldId) => {
        const field = list.find((item) => item.id === fieldId);
        if (field) {
          const cloneFieldWidget = cloneDeep(field);
          cloneFieldWidget.materialType = MaterialEnum.MaterialSubTableModalField;
          cloneFieldWidget.preLocation = w.props.bindSubTableFormId;
          w.children[0].children[0].children[0].children!.push(cloneFieldWidget);
        }
      });
    }
  }

  /** 断开子表字段同步 */
  function unBindAsyncStatus(subTableId) {
    if (subTableId) {
      const { scopeData } = useScope();
      const preCompInfo = findNode(scopeData.value, (widget) => {
        return widget.id === subTableId;
      });
      // 子表模态框框情况下，如果新拖入字段或者删除字段，需要断开字段同步开关
      if (preCompInfo && get(preCompInfo, 'props.isFieldAsync')) {
        preCompInfo.props.isFieldAsync = false;
      }
    }
  }

  return {
    /** 同步字段属性 */
    asyncFieldAttr,
    /** 同步字段信息 */
    asyncFieldInfo,
    /** 断开子表字段同步 */
    unBindAsyncStatus,
  };
}
