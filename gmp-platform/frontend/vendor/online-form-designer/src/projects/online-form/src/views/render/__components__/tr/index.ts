import { ComponentTypeEnum } from '@gct/nocode-base';
import { has, isEmpty, merge, pick, cloneDeep, get } from 'lodash-es';
import { AsyncGctOnlineComponents } from '../../__components__/index';

import type { IComponent } from '/@online-form/views/types/base-core-component.d';

import type { ITrProps } from '@gct/nocode-base';

class Tr implements IComponent {
  component = 'tr' as ComponentTypeEnum;
  wrapperCmpConfig({ data, parent }) {
    const cmp: { props: ITrProps } = {
      props: {
        ...pick(data.attrs ?? {}, ['height']),
        subTableRow: '',
      },
    };

    if (has(data, 'type') && !isEmpty(data.type)) {
      cmp.props.identifier = data.type; // 组件标识符

      const compClass = AsyncGctOnlineComponents.getWidgetClassMapByType(parent.component);
      if (compClass && compClass.updateCmpConfig) {
        compClass.updateCmpConfig({ data: parent, result: data });
      }
    }

    // 当前行包含子表
    if (
      data.children.some(
        (item) =>
          has(item, 'children') &&
          item.children.length === 1 &&
          item.children[0].tag === 'table' &&
          item.children[0].field,
      )
    ) {
      const td = data.children.find(
        (item) =>
          has(item, 'children') &&
          item.children.length === 1 &&
          item.children[0].tag === 'table' &&
          item.children[0].field,
      );

      cmp.props.subTableRow = td.children[0].field;
      cmp.props.subTableCmpType = td.children[0].isFixedTable
        ? ComponentTypeEnum.FIXED_TABLE
        : ComponentTypeEnum.SUB_TABLE;
      cmp.props.subTableRowTypes = td.children[0].children[1].children.map((item) => {
        return item.type ?? 'fixed';
      });
    }

    if (has(data, 'tempMergeCells') && !isEmpty(data.tempMergeCells)) {
      cmp.props.mergeCells = cloneDeep(data.tempMergeCells);
    }

    return cmp;
  }

  updateCmpConfig({ data, result, idx }) {
    if (!data.props.mergeCells) {
      data.props.mergeCells = {};
    }

    // data.props.mergeCells[result.id] = parseInt(get(result.attrs, 'rowspan'));
    data.props.mergeCells[result.id] = {
      rsn: result.id,
      num: parseInt(get(result.attrs, 'rowspan')),
      colspan: parseInt(get(result.attrs, 'colspan')),
      idx: idx,
    };
  }
}

export default new Tr();
