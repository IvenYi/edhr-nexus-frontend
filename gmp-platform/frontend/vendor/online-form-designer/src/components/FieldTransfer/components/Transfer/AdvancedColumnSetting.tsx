import { defineComponent, watch } from 'vue';
import { useTreeData } from '../../hooks/useTreeData';
import AdvancedTransfer from './AdvancedTransfer';

import type { FieldItem, ColumnItem, ColumnsChange } from '../../types/index.d';

export default defineComponent({
  name: 'AdvancedColumnSetting',
  props: {
    /** 所有字段 */
    fields: {
      type: Array as PropType<FieldItem[]>,
      required: true,
    },
    /** 树形数据 */
    columns: Array as PropType<ColumnItem[]>,
    /** 是否启用多级表头 */
    useMultiLevelTHead: Boolean,
    /** 是否刷新数据 */
    isResetData: Boolean,
    /** 是否支持拖拽 */
    draggable: Boolean,
    /** 穿梭框标题集合 */
    titles: Array as PropType<string[]>,
    maxEnableCount: Number as PropType<number>,
    /** 回调方法 */
    onColumnsChange: Function as PropType<ColumnsChange>,
  },
  setup(props, { expose }) {
    const treeObj = useTreeData(
      props.useMultiLevelTHead,
      props.isResetData,
      props.draggable,
      props.maxEnableCount,
      props.onColumnsChange,
    );

    watch(
      [() => props.columns, () => props.fields],
      () => {
        treeObj.onChangeTree(props.columns ?? [], props.fields);
      },
      {
        deep: true,
        immediate: true,
      },
    );

    const getResult = () => {
      return {
        useMultiLevelTHead: treeObj.multiple,
        headerTree: treeObj.data,
      };
    };

    expose({
      getResult,
    });

    return () => {
      return <AdvancedTransfer dataSource={props.fields} treeObj={treeObj} titles={props.titles} />;
    };
  },
});
