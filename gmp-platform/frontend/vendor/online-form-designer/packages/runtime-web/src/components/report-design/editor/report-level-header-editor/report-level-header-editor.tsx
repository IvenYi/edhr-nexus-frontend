import { defineComponent, nextTick, ref, onUnmounted } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { IGctDndData, useGctFormValue } from '@gct/runtime';
import { gctFieldTreeSelect as GctFieldTreeSelect } from '../../../gct-field-tree-select';
import { useReportViewController } from '../../hooks';
// import './report-level-header-editor.scss';

/**
 * 排序值编辑器
 */
export const ReportLevelHeaderEditor = defineComponent({
  name: 'ReportLevelHeaderEditor',
  props: {
    value: {
      type: Array<IGctDndData>,
      required: true,
    },
  },
  setup() {
    const ns = useNamespace('report-level-header-editor');
    const val = useGctFormValue<IGctDndData[]>();
    const reportView = useReportViewController();
    const { dataColumn = [], fieldMap } = reportView.state.schema;
    // if (!val.value?.length) {
      val.value = dataColumn.map((key) => ({ key }));
    // }
    function setLabelByFun(key, title) {
      fieldMap[key].alias = title;
    }
    function changeValue() {
      val.value = val.value;
    }
    function onFieldDelete(_, fieldItem) {
      loop(val.value, fieldItem.id, (value, index, children) => {
        children.splice(index, 1);
      });
      changeValue();
    }
    function onFieldAdd(_, fieldItem) {
      console.log(111);
      
      val.value = [...val.value, { key: fieldItem.id }];
    }

    function onReplace(_, newValue, old) {
      loop(val.value, old.id, (value, index, children) => {
        children.splice(index, 1, { key: newValue.id });
      });
      changeValue();
    }
    reportView.hooks.field.delete.tap(onFieldDelete);
    reportView.hooks.field.add.tap(onFieldAdd);
    reportView.hooks.field.replace.tap(onReplace);
    onUnmounted(() => {
      reportView.hooks.field.delete.removeTap(onFieldDelete);
      reportView.hooks.field.add.removeTap(onFieldAdd);
      reportView.hooks.field.replace.removeTap(onReplace);
    });

    return { ns, val, setLabelByFun, fieldMap, changeValue };
  },
  render() {
    return (
      <div class={this.ns.b()}>
        <GctFieldTreeSelect
          getLabelByFun={(widget) => widget.alias || widget.fieldName}
          setLabelByFun={this.setLabelByFun}
          getFieldTypeByFun={(widget) => widget.fieldType}
          groupOptions={this.val}
          fieldMap={this.fieldMap}
          fieldNames={{
            children: 'children',
            title: 'title',
            key: 'key',
          }}
          onChange={this.changeValue}
        />
      </div>
    );
  },
});

function loop(data: any[], key: string, callback: any) {
  const length = data.length;
  for (let i = 0; i < length; i++) {
    const item = data[i];
    if (item.key === key) {
      callback(item, i, data);
      break;
    }
    if (item.children) {
      loop(item.children, key, callback);
    }
  }
}
