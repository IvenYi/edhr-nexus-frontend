import { computed, defineComponent, PropType, ref } from 'vue';
import { useNamespace } from '@gct-paas/core';
import { ISelectTableEditor, useGctFormValue } from '@gct/runtime';
import { TableProps } from 'ant-design-vue';
import './gct-select-form-table.scss';

export const GctSelectFormTable = defineComponent({
  name: 'GctSelectFormTable',
  props: {
    model: {
      type: Object as PropType<ISelectTableEditor>,
      required: true,
    },
    value: {
      type: Array<IObject>,
      default: () => [],
    },
  },
  setup(props) {
    const ns = useNamespace('select-form-table');

    const tableRef = ref();

    const searchVal = ref<string>('');

    const val = useGctFormValue();

    const rowSelection = computed<TableProps['rowSelection']>(() => {
      return {
        type: props.model.multiple ? 'checkbox' : 'radio',
        fixed: true,
        selectedRowKeys: props.model.isKeys
          ? val.value
          : val.value.map((item: IObject) => item[props.model.tableModel.key || 'id']),
        onChange: (selectedRowKeys: (string | number)[], selectedRows: IObject[]) => {
          if (props.model.isKeys) {
            val.value = selectedRowKeys;
          } else {
            val.value = selectedRows;
          }
        },
        getCheckboxProps: (record: IObject) => ({
          disabled: record.name === 'Disabled User', // Column configuration not to be checked
          name: record.name,
        }),
      };
    });

    function onSearch() {
      if (searchVal.value) {
        searchVal.value = searchVal.value.trim();
        if (searchVal.value && tableRef.value) {
          tableRef.value.reload({ query: searchVal.value });
        }
      } else {
        if (tableRef.value) {
          tableRef.value.reload();
        }
      }
    }

    return () => {
      return (
        <div class={ns.b()}>
          <div class={ns.e('search')}>
            <a-input-search
              placeholder="搜索数据集名称"
              v-model:value={searchVal.value}
              onSearch={onSearch}
            />
          </div>
          <div class={ns.e('table')}>
            <gct-table
              ref={(ref) => (tableRef.value = ref)}
              row-selection={rowSelection.value}
              data={val.value}
              model={props.model.tableModel}
              count={val.value.length.toString()}
              {...(props.model.props || {})}
            />
          </div>
        </div>
      );
    };
  },
});
