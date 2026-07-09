import { ComponentTypeEnum, PageSizeEnum, ParamModelTypeEnum } from '@gct/nocode-base';
import { PageSize2FormatOpt } from '/@online-form/utils/page.enum';
import { has, cloneDeep, isEmpty, isNil } from 'lodash-es';
import type { IComponent } from '/@online-form/views/types/base-core-component.d';
import type {
  IPaper,
  ISubTable2DInfo,
  ICheckTable2DInfo,
  IMaterialConsumeTableInfo,
} from '@gct/nocode-base';

class Paper implements IComponent {
  component = ComponentTypeEnum.PAPER;
  wrapperCmpConfig({ data }) {
    const pageSize = data?.type ?? PageSizeEnum.A4;
    const isCustom = pageSize === PageSizeEnum.CUSTOM;
    const pageFormatMM = (isCustom ? (data?.size ?? []) : PageSize2FormatOpt[pageSize]).slice();

    if (!isCustom && data?.orientation === 'landscape') {
      pageFormatMM.reverse();
    }

    const [pageWidth, pageHeight] = pageFormatMM;

    const cmp = {
      id: ComponentTypeEnum.PAPER,
      component: ComponentTypeEnum.PAPER,
      preId: null,
      preLocation: null,
      nextIds: [],
      props: {
        pageSize,
        pageWidth,
        pageHeight,
        pageMargins: data?.padding ?? '12mm 16mm',
        subTableFieldMap: data?.subTableFieldMap ?? [],
        fixedTableInfoMap: [],
        javascript: data?.javascript ?? '',
        fixedTableLenMap: {},
        subTable2DList: [],
        checkTable2DList: [],
        materialConsumeTableList: [],
        materialBalanceTableList: [],
      },
      headerWidgets: data?.headerWidgets,
      footerWidgets: data?.footerWidgets,
    } as IPaper;

    if (has(data, 'images')) {
      cmp.watermarks = data.images.map((item) => {
        return {
          id: `image_${Date.now()}_${Math.random().toString(36).substr(2)}`,
          type: 'watermark',
          styles: item.attrs.style,
          value: item.attrs.src,
        };
      });
    }

    if (has(data, 'paramToField')) {
      cmp.props.globalParams = data.paramToField.reduce((prev, current) => {
        if (!current.subModelField) {
          prev[current.toField] = current.key;
        } else {
          if (!prev[current.subModelField]) {
            prev[current.subModelField] = {};
          }
          prev[current.subModelField][current.toField] = current.key;
        }
        return prev;
      }, {});
    }

    // 参数映射（只能是主模型）
    if (has(data, 'parameterMapping')) {
      cmp.props.paramsMapList = data.parameterMapping
        .map((item) => {
          return item.toFields.map((k) => {
            return {
              field: k.field,
              fieldType: k.fieldType,
              createType: k.createType,
              formKey: item.formKey,
              paramMapType: item?.paramMapType ?? ParamModelTypeEnum.CompParam,
              modelKey: item.modelKey || k.model,
              subModel: item.subModel,
              subFieldKey: item.subFieldKey,
            };
          });
        })
        .flat();
    }

    // 数据源
    if (has(data, 'customDataSource')) {
      cmp.props.customDataSource = data.customDataSource.map((item) => {
        return {
          joinModelKey: item.joinModelKey,
          joinSubModel: item.joinSubModel,
          joinModelType: item.joinModelType,
          joinFormRefId: item.joinFormRefId,
          joinSqlJson: item.joinSqlJson,
          joinBuiltinConfig: item.joinBuiltinConfig,
          joinIpaasConfig: item.joinIpaasConfig,
          query: item.onExpressions
            .filter((kk) => kk.fieldKey && kk.operator)
            .map((kk) => {
              return {
                exp: `${kk.fieldKey}.${kk.operator}:${kk.id}`,
                formKey: kk.formKey,
              };
            }),
          onFieldMap: item.onFieldMap,
        };
      });
    }

    if (has(data, 'cellConfigMap')) {
      cmp.props.fixedTableFieldMap = cloneDeep(data.cellConfigMap);
    }

    // 二维表信息map
    if (has(data, 'masterField2SubTable') && !isNil(data.masterField2SubTable)) {
      cmp.props.subTable2DList = Object.values(data.masterField2SubTable)
        .filter((i: any) => i.type === '2D')
        .map((item: any) => {
          return {
            subTable2d: true,
            rowSubFieldKey: item.field,
            rowSubModelKey: item.model,
            colSubFieldKey: item.colField,
            colSubModelKey: item.colModel,
            rowRefFieldKey: item.refRowField,
            colRefFieldKey: item.refColField,
            crossFieldKeys: item.crossFields,
          } as ISubTable2DInfo;
        });
    }

    // 物料消耗表信息map
    if (
      has(data, 'masterField2MaterialConsumeTable') &&
      !isNil(data.masterField2MaterialConsumeTable)
    ) {
      console.log('masterField2MaterialConsumeTable', data);
      cmp.props.materialConsumeTableList = Object.values(data.masterField2MaterialConsumeTable).map(
        (item: any) => {
          return {
            masterSubField: item.field,
            tableKey: item.id,
            modelKey: item.model,
          } as IMaterialConsumeTableInfo;
        },
      );
    }

    // 物料消耗表信息map
    if (
      has(data, 'masterField2MaterialBalanceTable') &&
      !isNil(data.masterField2MaterialBalanceTable)
    ) {
      console.log('masterField2MaterialBalanceTable', data);
      cmp.props.materialBalanceTableList = Object.values(data.masterField2MaterialBalanceTable).map(
        (item: any) => {
          return {
            masterSubField: item.field,
            tableKey: item.id,
            modelKey: item.model,
          } as IMaterialConsumeTableInfo;
        },
      );
    }

    // 检验表信息map
    if (has(data, 'masterField2CheckTable') && !isNil(data.masterField2CheckTable)) {
      cmp.props.checkTable2DList = Object.values(data.masterField2CheckTable)
        .filter((i: any) => i.type === 'CHECK')
        .map((item: any) => {
          const checkDsData = data?.checkTableDataSource?.find((aa) => aa.id === item.checkDsId);

          return {
            checkTable2d: true,
            rowSubFieldKey: item.field,
            rowSubModelKey: item.model,
            colSubFieldKey: item.colField,
            colSubModelKey: item.colModel,
            rowRefFieldKey: item.refRowField,
            colRefFieldKey: item.refColField,
            crossFieldKeys: item.crossFields,
            checkDsId: item.checkDsId,
            checkDsData: checkDsData?.data,
            rowCount: item.rowCount,
            colCount: item.colCount,
          } as ICheckTable2DInfo;
        });
    }

    const table = data?.children?.[0];
    if (table && table.tag === 'table') {
      table.children.forEach((item) => {
        if (item.tag === 'colgroup') {
          cmp.props.colsWidth = item.children.map((col) => col.attrs.width);
        }

        if (item.tag === 'tbody' && !isEmpty(cmp.props.fixedTableFieldMap)) {
          item.children.forEach((tr) => {
            tr.children.forEach((td) => {
              if (td.cellRef && td.subTableType === 'CHECK') {
                const config = cmp.props.fixedTableFieldMap[td.cellRef];
                // todo
                if (
                  (has(td, 'colIndex') && !has(td, 'rowIndex') && td.colIndex === 0) ||
                  (!has(td, 'colIndex') && has(td, 'rowIndex') && td.rowIndex === 0) ||
                  (has(td, 'colIndex') &&
                    has(td, 'rowIndex') &&
                    td.colIndex === 0 &&
                    td.rowIndex === 0)
                ) {
                  config.value = td.value;
                }

                td.isNewCheckTable2D = true;

                const realConfig = data.masterField2CheckTable?.[config.masterFieldKey] ?? {};

                if (has(td, 'colIndex') && !has(td, 'rowIndex')) {
                  td.fixedTableFieldId = realConfig.colField;
                  td.checkTableType = 'col';
                } else if (!has(td, 'colIndex') && has(td, 'rowIndex')) {
                  td.fixedTableFieldId = realConfig.field;
                  td.checkTableType = 'row';
                } else if (has(td, 'colIndex') && has(td, 'rowIndex')) {
                  td.fixedTableFieldId = realConfig.field;
                  td.checkTableType = 'child';
                }
              } else if (td.cellConfigRefId) {
                const config = cmp.props.fixedTableFieldMap[td.cellConfigRefId];
                // 新型固定表
                if (config && has(config, 'fixedTable') && config.fixedTable!.indexedTd) {
                  if (td.dataGroupIndex === 0) {
                    config.value = td.value;
                  }

                  const item: any = config!.fixedTable;
                  td.isNewFixedTable = true;
                  td.fixedTableFieldId = item.field;
                  cmp.props.fixedTableLenMap[item.field] = Math.max(
                    cmp.props.fixedTableLenMap[item.field] ?? 0,
                    td.dataGroupIndex,
                  );
                }
              }
            });
          });
        }
      });
    }

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
    $setAttr2TableProp('thead', 'theadIds');
  }
}

export default new Paper();
