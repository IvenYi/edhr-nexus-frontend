import {
  defineComponent,
  provide,
  inject,
  PropType,
  onMounted,
  ref,
  nextTick,
  computed,
} from 'vue';
import { pick } from 'lodash-es';
import { NCB_PROVIDE } from '../emit';
import { CellType, ComponentTypeEnum, RenderModeEnum } from '../constant';
import { setSelectMobileTdId } from '../hooks';
import type { FormTmplBomController } from '../hooks/material-consume';
import BorderTD from './border-td.vue';
import DocumentSubTable from './document-sub-table';
import { waitDomStable, mergeMarkedTd } from '../hooks/useMergeSameCells';

import type {
  BaseCoreComponent,
  IPaper,
  ITd,
  IPageData,
  IBasicInfoItem,
  ISubTable,
} from '../types';

import '../css/paper.less';
import MaterialConsumeTable from './material-consume/material-consume-table';

export default defineComponent({
  name: 'NocodeDocumentPaper',
  props: {
    /** 页面内容信息 */
    page: {
      type: Object as PropType<IPageData>,
      required: true,
    },
    /** 映射信息 */
    basicInfo: {
      type: Object as PropType<IBasicInfoItem>,
      required: true,
    },
    /** 表单数据 */
    formState: {
      type: Object as PropType<Record<string, any>>,
      required: true,
    },
    /** 模板数据中心 */
    widgetCenter: {
      type: Object as PropType<Record<string, BaseCoreComponent.BasicSchema>>,
      required: true,
    },
    /** 是否是移动端渲染 */
    isMobile: {
      type: Boolean,
    },
  },
  setup(props, { expose, slots }) {
    provide(NCB_PROVIDE.DATA_RELATION_SHIP, props.basicInfo);
    const tmplBomCMap = inject<any>(NCB_PROVIDE.TMPL_BOM_CONTROLLER_MAP);
    /** 当前页面对应的控制器 */
    const tmplBomController = computed<FormTmplBomController | undefined>(
      () => tmplBomCMap.value?.[props.basicInfo?.uniqueId],
    );

    const mainTableRef = ref();
    const isPdfMode = inject(NCB_PROVIDE.IS_PDF, false);
    const openFillFieldsModal = inject<any>(NCB_PROVIDE.MOBILE_FILL_FIELDS_POPUP);
    const widget = props.widgetCenter?.[ComponentTypeEnum.PAPER] as IPaper;

    const { pageMargins, pageSize, pageWidth, pageHeight, colsWidth, subTable2DList } =
      widget.props;

    const size = [pageWidth, pageHeight];
    const sortSize = size.slice().sort();
    const isLandscape = JSON.stringify(size) !== JSON.stringify(sortSize);
    const orientation = isLandscape ? 'landscape' : 'portrait';
    const resultSize = isLandscape && isPdfMode ? sortSize : size;
    const paddings = pageMargins?.split(' ');

    const config = {
      cls: orientation,
      style: { width: `${resultSize[0]}mm`, height: `${resultSize[1]}mm` },
    };

    const paperStyles = {
      width: `${pageWidth}mm`,
      minWidth: `${pageWidth}mm`,
      height: `${pageHeight}mm`,
      padding: pageMargins,
      '--pageWidth': `-${pageWidth}mm`,
    };

    const overlayStyle = {
      ['--offset-top']: paddings?.[0] || '0px',
      ['--offset-right']: paddings?.[1] || '0px',
      ['--offset-bottom']: paddings?.[2] || '0px',
      ['--offset-left']: paddings?.[3] || '0px',
    };

    const getWidgetAttrs = (tdInfo) => {
      const attrInfo = {
        formData: props.formState,
      };
      const field = tdInfo.props.fixedTableFieldId ?? '';

      if (tdInfo.props.isNewFixedTableTd) {
        const cellFixedTableDataIdx = tdInfo.cellFixedTableDataIdx ?? 0;
        Object.assign(attrInfo, {
          formData: props.formState?.[field]?.[cellFixedTableDataIdx] ?? {},
          subtableFieldId: field,
          realRowIndex: cellFixedTableDataIdx,
          pageRowIndex: cellFixedTableDataIdx,
        });
      } else if (tdInfo.props.isNewCheckTable2D) {
        const { checkTableType } = tdInfo.props;
        const rowIdx = tdInfo.cellCheckTableDataRowIdx ?? 0;
        const colIdx = tdInfo.cellCheckTableDataColIdx ?? 0;

        const baseInfo: any = {
          subtableFieldId: field,
          realRowIndex: rowIdx,
          pageRowIndex: rowIdx,
        };

        switch (checkTableType) {
          case 'col':
            baseInfo.formData = props.formState?.[field]?.[colIdx] ?? {};
            baseInfo.realRowIndex = colIdx;
            baseInfo.pageRowIndex = colIdx;
            break;
          case 'row':
            baseInfo.formData = props.formState?.[field]?.[rowIdx] ?? {};

            break;
          case 'child':
            baseInfo.formData = props.formState?.[field]?.[rowIdx]?.['_2DTABLE_']?.[colIdx] ?? {};
            baseInfo.childSubTableDataIndex = colIdx;
            break;
        }

        Object.assign(attrInfo, baseInfo);
      }

      return attrInfo;
    };

    onMounted(async () => {
      if (props.basicInfo.renderModeType === RenderModeEnum.ViewMode) {
        await waitDomStable(mainTableRef.value);
        mergeMarkedTd();
      }
    });

    return () => (
      <div
        class={['cmp-paper-wrapper', pageSize, config.cls, { 'print-view': isPdfMode }]}
        style={{ ...config.style, ...overlayStyle }}
        data-nocode-orientation={config.cls}
        data-nocode-width={pageWidth}
        data-nocode-height={pageHeight}
      >
        <div class="cmp-paper" style={paperStyles}>
          <div class="cmp-paper-overlay">
            {slots.annotation?.()}
            {widget.headerWidgets && (
              <div class="paper-header">
                {slots.overlay?.({
                  widgets: widget.headerWidgets,
                })}
              </div>
            )}
            {widget.footerWidgets && (
              <div class="paper-footer">
                {slots.overlay?.({
                  widgets: widget.footerWidgets,
                })}
              </div>
            )}
            {widget.watermarks && (
              <div class="paper-watermark">
                {slots.overlay?.({
                  widgets: widget.watermarks,
                })}
              </div>
            )}
          </div>
          <div class="cmp-paper-container">
            <table ref={mainTableRef} class="main-table-wrapper" cellpadding="0" cellspacing="0">
              <colgroup>
                {colsWidth.map((cw, cwIdx) => (
                  <col key={cwIdx} width={cw} />
                ))}
              </colgroup>
              <tbody>
                {props.page.containerIds.map((trId, trIdx) => {
                  const trInfo = props.widgetCenter[trId];
                  const tdIds = trInfo.nextIds;
                  const height = props.page.dynamicRowHeights?.[trId] || trInfo.props.height;

                  return (
                    <tr key={`${trId}_${trIdx}`} height={height}>
                      {tdIds.map((tdId, tdIdx) => {
                        const tdInfo = props.widgetCenter[tdId] as ITd;

                        const tdAttrs = {
                          key: tdId,
                          id: tdId,
                          hidden: tdInfo.cellHidden,
                          borderAttrs: tdInfo.props.sourceBorderAttrs,
                          autoMerge:
                            tdInfo.fillDirection === 'x' ? tdInfo.xAutoMerge : tdInfo.autoMerge,
                          fillDirection: tdInfo.fillDirection,
                          ...pick(tdInfo.props, ['rowspan', 'colspan', 'class']),
                        };

                        const realTdAttrInfo = props.page.mergeBlock?.[tdId];
                        const dynamicConfig: any = {};

                        if (realTdAttrInfo) {
                          Object.assign(tdAttrs, {
                            ...pick(realTdAttrInfo, ['rowspan', 'colspan', 'borderAttrs']),
                            hidden: false,
                          });

                          Object.assign(dynamicConfig, {
                            ...pick(realTdAttrInfo, ['visibleText', 'sourceTdId', 'isDynRo']),
                          });
                        }

                        // 渲染子表
                        const subInfo = props.page.subTableMap?.[tdId];
                        if (subInfo && subInfo.wrapperTdId === tdId) {
                          const subWidget = props.widgetCenter[subInfo.widgetId] as ISubTable;

                          const field = subWidget.props.field ?? '';
                          const relationObj = props.page.relation![field] ?? {};

                          const subTable2dItem = subTable2DList.find(
                            (item) => item.subTable2d && item.rowSubFieldKey === field,
                          );

                          // 渲染物料消耗表
                          if (subWidget.props.isMaterialConsumeTable) {
                            const tableController =
                              tmplBomController.value?.tableControllers[
                                subWidget.props.materialConsumeTableId!
                              ];
                            if (tableController) {
                              // 没有控制器不绘制该组件，如模板预览等情况，就绘制动态表组件
                              return (
                                <td style={tdInfo.style} {...tdAttrs}>
                                  <MaterialConsumeTable
                                    subInfo={subInfo}
                                    widget={subWidget}
                                    formData={props.formState}
                                    widgetCenter={props.widgetCenter}
                                    start={relationObj?.start}
                                    end={relationObj.end}
                                    isMobile={props.isMobile}
                                    tableController={tableController}
                                  >
                                    {{
                                      widget: (subProps) => slots.widget?.(subProps),
                                      subAction: (subProps) => slots.subAction?.(subProps),
                                    }}
                                  </MaterialConsumeTable>
                                </td>
                              );
                            }
                          }

                          return (
                            <td style={tdInfo.style} {...tdAttrs}>
                              <DocumentSubTable
                                subInfo={subInfo}
                                widget={subWidget}
                                subTable2dItem={subTable2dItem}
                                formData={props.formState}
                                widgetCenter={props.widgetCenter}
                                start={relationObj?.start}
                                end={relationObj.end}
                                isMobile={props.isMobile}
                              >
                                {{
                                  widget: (subProps) => slots.widget?.(subProps),
                                  subAction: (subProps) => slots.subAction?.(subProps),
                                }}
                              </DocumentSubTable>
                            </td>
                          );
                        }
                        if (tdInfo.cellValueType) {
                          const widgetAttrs = getWidgetAttrs(tdInfo);

                          if (props.isMobile) {
                            Object.assign(tdAttrs, {
                              onClick: setSelectMobileTdId.bind(
                                null,
                                tdInfo,
                                props.basicInfo,
                                props.widgetCenter,
                                openFillFieldsModal,
                                -1,
                              ),
                            });
                          }
                          return (
                            <BorderTD style={tdInfo.style} {...tdAttrs} isEmpty={true}>
                              {tdInfo.cellValueType !== CellType.Default ||
                              tdInfo.cellWidget.props.value
                                ? slots.widget?.({ tdInfo, ...widgetAttrs, dynamicConfig })
                                : null}
                            </BorderTD>
                          );
                        }
                        if (realTdAttrInfo && tdInfo.cellHidden) {
                          const sourceTdInfo = props.widgetCenter[dynamicConfig?.sourceTdId] as ITd;
                          return (
                            <BorderTD style={tdInfo.style} {...tdAttrs} isEmpty={true}>
                              {dynamicConfig?.isDynRo
                                ? slots.widget?.({ tdInfo: sourceTdInfo, dynamicConfig })
                                : null}
                            </BorderTD>
                          );
                        }
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  },
});
