import { defineComponent, computed, toRaw } from 'vue';

import { ISelectObj, useModelField } from '../../hooks/useModelField';
import AdvancedColumnSetting from './AdvancedColumnSetting';
import { FIELD_TYPE, CreateType } from '/@/enums/appEnum';
import { isEmpty } from 'lodash-es';
import { SCOPEINFO } from '../../utils/enum';

export default defineComponent({
  name: 'FieldTransfer',
  props: {
    objFields: Object as PropType<ISelectObj>,
    /** 选中的字段数组 */
    value: Array,
    /** 穿梭框标题集合 */
    titles: Array as PropType<string[]>,
    maxEnableCount: Number as PropType<number>,
    disabledFieldKey: Array as PropType<string[]>,
    /** 包含的字段 */
    containFieldType: Array as PropType<FIELD_TYPE[]>,
    /** 包含的字段Key */
    containFieldKey: Array as PropType<string[]>,
    /**包含的字段创建类型 */
    containCreateType: Array as PropType<CreateType[]>,
    /** 排除的字段Key */
    excludeFieldKey: Array as PropType<string[]>,
    /** 排除的字段 */
    excludeFieldType: Array as PropType<FIELD_TYPE[]>,
    /**过滤函数 */
    filterFieldByFunction: Function,
    onChange: Function,
    /** 是否支持拖拽 */
    draggable: Boolean,
  },
  setup(props) {
    const { getFieldCodeChainStr } = useModelField(SCOPEINFO.FIELD_LIST);

    const result = computed(() => {
      const fields: any[] = [];
      const _fieldMap = {};
      const processColumns: any = [];

      if (!props.objFields?.modelKey) {
        return {
          fields,
          fieldMap: _fieldMap,
          columns: processColumns,
          otherFieldCount: 0,
        };
      }

      if (Array.isArray(props.value)) {
        props.value.forEach((item: any) => {
          const key = `${item.fieldCodeChain}!${item.key}`;

          _fieldMap[key] = item;
          // 不是当前对象的push到左侧数据源中
          if (
            item.fieldCodeChain !== (props.objFields?.fieldCodeChain ?? props.objFields?.modelKey)
          ) {
            fields.push({
              id: key,
              modelKey: item.modelKey,
              displayLabel: item.name,
              type: item.type,
              disabled: item.disabled,
            });
          }

          processColumns.push({
            id: key,
            title: item.name,
            tooltip: getFieldCodeChainStr(item.fieldCodeChain, item.name),
            fieldType: item.type,
            type: 'field',
            // disableEditable: false,
            // 非当前对象的字段，需要把checkbox禁用掉，不能选择
            // disableCheckbox: false
          });
        });
      }

      // 得到所有字段
      props.objFields.fieldList
        .filter((flist) => {
          // 如果提供了自定义过滤函数，则使用该函数进行过滤，返回false表示排除该字段
          if (
            typeof props.filterFieldByFunction === 'function' &&
            !props.filterFieldByFunction(flist)
          ) {
            return false;
          }

          // 如果设置了包含的创建类型，且字段有创建类型，则检查该字段的创建类型是否在包含列表中
          // 如果不在包含列表中，则排除该字段
          if (
            props.containCreateType &&
            flist.createType &&
            !props.containCreateType.includes(flist.createType as CreateType)
          ) {
            return false;
          }

          // 如果设置了包含的字段类型或字段key，则进行包含性检查
          if (props.containFieldType || props.containFieldKey) {
            const isContainFieldType = (props.containFieldType ?? []).includes(
              flist.type as FIELD_TYPE,
            );
            const isContainFieldKey = (props.containFieldKey ?? []).includes(flist.key as string);
            // 只有当字段类型或字段key在包含列表中时才包含该字段（满足任一条件即可）
            return isContainFieldType || isContainFieldKey;
          }

          // 如果设置了排除的字段类型或字段key，则进行排除性检查
          if (props.excludeFieldType || props.excludeFieldKey) {
            const isExcludeFieldType = (props.excludeFieldType ?? []).includes(
              flist.type as FIELD_TYPE,
            );
            const isExcludeFieldKey = (props.excludeFieldKey ?? []).includes(flist.key as string);
            // 如果字段类型或字段key在排除列表中，则排除该字段（满足任一排除条件就排除）
            return !(isExcludeFieldType || isExcludeFieldKey);
          }

          // 如果以上条件都不满足，则默认包含该字段
          return true;
        })
        .forEach((fl) => {
          const key = `${props.objFields?.fieldCodeChain}!${fl.key}`;
          if (isEmpty(_fieldMap[key])) {
            _fieldMap[key] = {
              ...toRaw(fl),
              isFieldModel: props.objFields?.isFieldModel,
              fieldCodeChain: props.objFields?.fieldCodeChain,
            };
          }
          // 判断当前对象是否为主模型
          const isMainModel =
            props?.objFields?.fieldCodeChain &&
            JSON.parse(props.objFields?.fieldCodeChain).modelKey &&
            JSON.parse(props.objFields?.fieldCodeChain).modelKey === props.objFields?.modelKey;
          fields.push({
            id: key,
            modelKey: fl.modelKey,
            displayLabel: fl.name,
            type: fl.type,
            disabled: !!(isMainModel && props.disabledFieldKey?.includes(fl.key)),
          });
        });

      const otherFieldCount = processColumns.reduce((pre, cur: any) => {
        return pre + (cur.disableCheckbox ? 1 : 0);
      }, 0);
      return {
        fields,
        fieldMap: _fieldMap,
        columns: processColumns,
        otherFieldCount,
      };
    });

    const handleColumnsChange = (columns) => {
      if (typeof props?.onChange === 'function') {
        props?.onChange(columns.map((column) => result.value.fieldMap[column.id]));
      }
    };

    return () => {
      return (
        <AdvancedColumnSetting
          key={props.objFields?.fieldCodeChain ?? props.objFields?.modelKey}
          fields={result.value.fields}
          columns={result.value.columns}
          useMultiLevelTHead={false}
          titles={props.titles}
          maxEnableCount={props.maxEnableCount}
          // otherFieldCount={otherFieldCount}
          draggable={props.draggable}
          onColumnsChange={handleColumnsChange}
        />
      );
    };
  },
});
