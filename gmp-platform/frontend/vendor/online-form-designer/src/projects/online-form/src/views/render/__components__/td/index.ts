import { get, has, pick, cloneDeep, isEmpty } from 'lodash-es';
import { AsyncGctOnlineComponents, getFieldWidget } from '../../__components__/index';

import { PaperWidgeType, ComponentTypeEnum, CellType } from '@gct/nocode-base';

import type { PaperWidget } from '/@online-form/views/types/paper-widget.d.ts';

import type {
  IComponent,
  IWrapperCmpConfigPrams,
} from '/@online-form/views/types/base-core-component.d';
import type { BaseCoreComponent, ITd } from '@gct/nocode-base';

class Td implements IComponent {
  component = 'td' as ComponentTypeEnum;
  wrapperCmpConfig({ data, parent, prev_trs, idx, dataCenter }: IWrapperCmpConfigPrams) {
    const cmp = {
      props: {
        ...pick(data.attrs ?? {}, ['colspan', 'rowspan']),
        autoLineBreak: false,
        sourceBorderAttrs: ['cbt', 'cbr', 'cbb', 'cbl', 'bold'].filter((key) => data[key]),
      },
      style: { ...pick(data.style, 'backgroundColor') },
      autoMerge: data.autoMerge || false,
      xAutoMerge: data.xAutoMerge || false,
      fillDirection: data.fillDirection || undefined,
    } as ITd;

    if (
      !isEmpty(data.style) &&
      has(data.style, 'whiteSpace') &&
      has(data.style, 'wordBreak') &&
      data.style.whiteSpace === 'pre-wrap' &&
      data.style.wordBreak === 'break-all'
    ) {
      cmp.props.autoLineBreak = true;
    }

    const fixedTableFieldMap = dataCenter[ComponentTypeEnum.PAPER].props.fixedTableFieldMap;

    let config = data;

    // 检验表字段信息
    if (
      has(data, 'cellRef') &&
      data.cellRef &&
      data.subTableType === 'CHECK' &&
      fixedTableFieldMap[data.cellRef]
    ) {
      // 检验表字段信息要从外部获取
      config = fixedTableFieldMap[data.cellRef];
      cmp.props.isNewCheckTable2D = data.isNewCheckTable2D;
      cmp.props.fixedTableFieldId = data.fixedTableFieldId;
      cmp.props.checkTableType = data.checkTableType;
    } else if (
      has(data, 'cellConfigRefId') &&
      data.cellConfigRefId &&
      fixedTableFieldMap[data.cellConfigRefId]
    ) {
      // 固定表字段信息要从外部获取
      config = fixedTableFieldMap[data.cellConfigRefId];
      cmp.props.isNewFixedTableTd = data.isNewFixedTable;
      cmp.props.fixedTableFieldId = data.fixedTableFieldId;
      cmp.props.isNewFixedTableInDyn = data.isNewFixedTableInDyn;
      cmp.autoMerge = config.autoMerge;
      cmp.xAutoMerge = config.xAutoMerge;
      cmp.fillDirection = config.fillDirection;
    }

    // 如果td下的内容是字段
    if (config.valueType === CellType.Field) {
      cmp.cellValueType = CellType.Field;

      // 组合字段开启
      if (has(config, 'multiFields') && config.multiFields) {
        const cmpKey = ComponentTypeEnum.CombineFields;

        const widgetClass = AsyncGctOnlineComponents.getWidgetClassMapByType(cmpKey);
        if (widgetClass && widgetClass.wrapperCmpConfig) {
          const widgetInfo = widgetClass.wrapperCmpConfig({
            data: {
              fieldInfos: cloneDeep(config.multiFieldsContent ?? []),
              style: data.style,
            },
          });
          cmp.cellWidget = {
            id: `${cmpKey}_${Date.now()}_${Math.random().toString(36).substr(2)}`,
            component: cmpKey,
            ...widgetInfo,
          } as BaseCoreComponent.BasicSchema;
        }
      } else {
        const fieldWidget = getFieldWidget(config, data.style);
        if (fieldWidget) {
          cmp.cellWidget = { ...fieldWidget };
        }
      }

      // 检验表从colIndex和rowIndex取坐标
      if (has(data, 'colIndex') || has(data, 'rowIndex')) {
        if (has(data, 'rowIndex')) {
          cmp.cellCheckTableDataRowIdx = data.rowIndex;
        }

        if (has(data, 'colIndex')) {
          cmp.cellCheckTableDataColIdx = data.colIndex;
        }
      } else if (has(data, 'dataGroupIndex')) {
        cmp.cellFixedTableDataIdx = data.dataGroupIndex;
      }
    } else if (config.valueType === CellType.Widget) {
      // td下内容是组件
      cmp.cellValueType = CellType.Widget;

      // 如果td下的内容是组件（二维码、条形码、图片组件）
      const { paperWidget }: { paperWidget: PaperWidget.BasicSchema } = config || {};

      let tag;
      if (paperWidget.type === PaperWidgeType.Qrcode) {
        tag = ComponentTypeEnum.Qrcode;
      } else if (paperWidget.type === PaperWidgeType.Barcode) {
        tag = ComponentTypeEnum.Barcode;
      } else if (paperWidget.type === PaperWidgeType.Image) {
        tag = ComponentTypeEnum.Image;
      } else if (paperWidget.type === PaperWidgeType.Diagonal) {
        tag = ComponentTypeEnum.Diagonal;
      } else if (paperWidget.type === PaperWidgeType.RangeLimit) {
        tag = ComponentTypeEnum.RangeLimit;
      } else if (paperWidget.type === PaperWidgeType.Line) {
        tag = ComponentTypeEnum.Line;
      } else if (paperWidget.type === PaperWidgeType.Serialnumber) {
        tag = ComponentTypeEnum.Serialnumber;
      } else if (paperWidget.type === PaperWidgeType.Power) {
        tag = ComponentTypeEnum.Power;
      } else if (paperWidget.type === PaperWidgeType.TimeDiff) {
        tag = ComponentTypeEnum.Timediff;
      }

      const widgetClass = AsyncGctOnlineComponents.getWidgetClassMapByType(tag);

      if (widgetClass && widgetClass.wrapperCmpConfig) {
        const widgetInfo = widgetClass.wrapperCmpConfig({
          data: {
            info: { ...paperWidget },
            style: data.style,
          },
        });

        cmp.cellWidget = {
          id: `${tag}_${Date.now()}_${Math.random().toString(36).substr(2)}`,
          component: tag,
          ...widgetInfo,
        } as BaseCoreComponent.BasicSchema;
      }

      // 检验表从colIndex和rowIndex取坐标
      if (has(data, 'colIndex') || has(data, 'rowIndex')) {
        if (has(data, 'rowIndex')) {
          cmp.cellCheckTableDataRowIdx = data.rowIndex;
        }

        if (has(data, 'colIndex')) {
          cmp.cellCheckTableDataColIdx = data.colIndex;
        }
      } else if (has(data, 'dataGroupIndex')) {
        cmp.cellFixedTableDataIdx = data.dataGroupIndex;
      }
    } else if (config.valueType === CellType.Default) {
      // td下内容是纯文本
      cmp.cellValueType = CellType.Default;

      const widgetClass = AsyncGctOnlineComponents.getWidgetClassMapByType(ComponentTypeEnum.RO);

      if (widgetClass && widgetClass.wrapperCmpConfig) {
        const widgetInfo = widgetClass.wrapperCmpConfig({
          data: {
            text: config.value ?? '',
            style: data.style,
          },
        });

        cmp.cellWidget = {
          id: `ro_${Date.now()}_${Math.random().toString(36).substr(2)}`,
          component: ComponentTypeEnum.RO,
          ...widgetInfo,
        } as BaseCoreComponent.BasicSchema;
      }
    } else {
      cmp.cellHidden = config.cellHidden ?? false;
    }

    // 处理 rowspan
    if (has(data, 'attrs') && has(data.attrs, 'rowspan')) {
      const _rowspan_ = parseInt(get(data.attrs, 'rowspan'));
      if (_rowspan_ > 1) {
        const trClass = AsyncGctOnlineComponents.getWidgetClassMapByType('tr');

        if (trClass && trClass.updateCmpConfig) {
          trClass.updateCmpConfig({ data: parent, result: data, idx });
        }

        // 获取当前节点在父节点的位置
        const nodeIndex = prev_trs.findIndex((k) => k.id === parent.id);
        if (nodeIndex !== -1) {
          // 设置相邻 rowspan-1 个tr的属性
          for (let i = 1; i < _rowspan_; i++) {
            const nextTr = prev_trs[nodeIndex + i];
            if (nextTr && nextTr.tag === 'tr') {
              if (!nextTr.tempMergeCells) {
                nextTr.tempMergeCells = {};
              }
              // nextTr.tempMergeCells[data.id] = parseInt(get(data.attrs, 'rowspan'));
              nextTr.tempMergeCells[data.id] = {
                rsn: data.id,
                num: parseInt(get(data.attrs, 'rowspan')),
                colspan: parseInt(get(data.attrs, 'colspan')),
                idx: idx,
              };
            }
          }
        }
      }
    }

    return cmp;
  }
}

export default new Td();
