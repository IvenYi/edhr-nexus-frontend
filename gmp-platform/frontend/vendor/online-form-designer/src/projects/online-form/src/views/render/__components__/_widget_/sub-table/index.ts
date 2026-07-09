import { ComponentTypeEnum } from '@gct/nocode-base';
import { pick, has, isEmpty } from 'lodash-es';
import { FIELD_TYPE } from '/@/enums/appEnum';

import type { IComponent } from '/@online-form/views/types/base-core-component.d';
import type { ISubTableProps } from '@gct/nocode-base';

class SubTable implements IComponent {
  component = ComponentTypeEnum.SUB_TABLE;
  wrapperCmpConfig({ data, dataCenter }) {
    const cmp: { props: ISubTableProps } = {
      props: {
        ...pick(data.attrs ?? {}, ['cellpadding', 'cellspacing']),
        theadIds: [],
        dynamicIds: [],
        colsWidth: [],
      },
    };

    const paperProps = dataCenter[ComponentTypeEnum.PAPER].props;
    const fixedTableFieldMap = paperProps.fixedTableFieldMap ?? {};
    const subTable2DList = paperProps.subTable2DList ?? [];
    const fixedTableLenMap = paperProps.fixedTableLenMap ?? {};
    const materialConsumeTableList = paperProps.materialConsumeTableList ?? [];

    // 子表
    if (has(data, 'field')) {
      cmp.props.field = data.field;
      cmp.props.modelKey = data.model;
      cmp.props.fieldType = FIELD_TYPE.MASTERSLAVE;
      cmp.props.quickFill = data.quickFill;
      cmp.props.tableTitle = data.tableTitle;
      cmp.props.subModelType = data.subModelType;

      // 二维表特殊处理
      const info = subTable2DList.find(
        (item) => item.subTable2d && item.rowSubFieldKey === data.field,
      );

      if (info) {
        cmp.props.isRowSubTable2d = true;
        cmp.props.childInitRowLen = 1 * ((fixedTableLenMap?.[info.colSubFieldKey] ?? 0) + 1);
      }

      // 物料消耗表特殊处理
      const mcTable = materialConsumeTableList.find((item) => item.masterSubField === data.field);
      cmp.props.isMaterialConsumeTable = !!mcTable;
      cmp.props.materialConsumeTableId = mcTable?.tableKey;
      cmp.props.modelKey = mcTable?.modelKey;
    }

    data.children?.forEach((item) => {
      if (item.tag === 'colgroup') {
        cmp.props.colsWidth = item.children.map((col) => col.attrs.width);
      }

      if (item.tag === 'tbody' && !isEmpty(fixedTableFieldMap)) {
        item.children.forEach((tr) => {
          tr.children.forEach((td) => {
            if (td.cellRef && td.subTableType === 'CHECK') {
            } else if (td.cellConfigRefId) {
              const config = fixedTableFieldMap[td.cellConfigRefId];

              // 动态表里有固定表（二维表）
              if (config && has(config, 'fixedTable') && config.fixedTable!.indexedTd) {
                if (td.dataGroupIndex === 0) {
                  config.value = td.value;
                }

                if (has(config, 'masterFieldKey')) {
                  const info = subTable2DList.find(
                    (item) => item.subTable2d && item.rowSubFieldKey === config.masterFieldKey,
                  );
                  if (info) {
                    td.isNewFixedTableInDyn = true;
                  }
                }
              }
            }
          });
        });
      }
    });

    return cmp;
  }

  updateCmpConfig({ data, result }) {
    function $setAttr2TableProp(attr: string, to_attr: string) {
      if (result.type === attr) {
        if (!has(data.props, to_attr)) {
          data.props[to_attr] = [];
        }
        data.props[to_attr].push(result.id);
      }
    }

    // todo 暂不考虑 dynamicTr 不在一个区间的情况
    $setAttr2TableProp('dynamicTr', 'dynamicIds');
    $setAttr2TableProp('thead', 'theadIds');
  }
}

export default new SubTable();
