import { defineComponent, ref, nextTick, computed } from 'vue';
import { DrillTypeEnum, transformSchemaByData, BaseField, ReportTable } from '../../schema';
import { SEARCH_SEVICE } from '@gct/runtime';
import { throttle } from 'lodash-es';
import { watchDebounced } from '@vueuse/core';
import { cloneDeep } from 'lodash-es';

/**钻取相关逻辑 */
export function useDrillingHook(propSchema: ReportTable) {
  const drillingLinkList = ref<LinkItem[]>([]);
  const reportSchema = ref(propSchema);
  const drillMap = computed(() => reportSchema.value.drillMap)
  const fieldMap = computed(() => reportSchema.value.fieldMap)

  /**点击下钻字段 */
  async function drillingClick(value, widget: BaseField) {
    console.log('drillingClick', widget);
    const { drillMode, drillReport, inDimension, drillAttrs, id, _protoValue_, _columnIndex_ } = widget;
    if (drillMode === DrillTypeEnum.CUSTOM && drillReport) {
      /**自定义下钻 */
      const schema = await transformSchemaByData(drillReport);
      if (!drillingLinkList.value.length) {
        const root = new LinkItem({ _root: true, title: reportSchema.value.reportName, lineWidget: widget, reportSchema: cloneDeep(reportSchema.value) });
        drillingLinkList.value.push(root);
      }
      const lastLinkItem = drillingLinkList.value.findLast(i => true)
      const exp_key = `${widget?.field}.eq`
      const exp_args = [...(lastLinkItem?.exp_args || []), exp_key]
      const query_args = { ...(lastLinkItem?.query_args || {}), [exp_key]: _protoValue_ || value }
      const node = new LinkItem({ title: schema!.reportName, reportSchema: cloneDeep(schema), exp_args, query_args });
      drillingLinkList.value.push(node);
      reportSchema.value = schema;
    } else if (drillAttrs?.length) {
      //默认下钻
      if (!drillingLinkList.value.length) {
        const root = new LinkItem({ _root: true, title: widget.fieldName, lineWidget: widget, reportSchema: cloneDeep(reportSchema.value) });
        drillingLinkList.value.push(root);
      }
      const lastLinkItem = drillingLinkList.value.findLast(i => true)
      const drillFieldWidget = drillMap.value[drillAttrs[0]]
      const lineWidget = { ...drillFieldWidget, drillMode, drillAttrs: drillAttrs!.slice(1), id, inDimension, reportSchema: cloneDeep(reportSchema.value) }
      const exp_key = `${widget?.field}.eq`
      const exp_args = [...(lastLinkItem?.exp_args || []), exp_key]
      const query_args = { ...(lastLinkItem?.query_args || {}), [exp_key]: _protoValue_ || value }
      const node = new LinkItem({ title: drillFieldWidget.fieldName, lineWidget, exp_args, query_args, _columnIndex: widget._columnIndex_, reportSchema: cloneDeep(reportSchema.value) });
      drillingLinkList.value.push(node);
      fieldMap.value[id] = lineWidget
    }
    reportSchema.value._uuid = Math.random() + ''
  }

  async function crumbsClick(item: LinkItem, index: number) {
    // console.log('crumbsClick', item.reportSchema)
    item.reportSchema && (reportSchema.value = item.reportSchema)
    reportSchema.value._uuid = Math.random() + ''
    if (item._root) {
      drillingLinkList.value = []
    } else {
      drillingLinkList.value.splice(index + 1)
    }
    if (item.lineWidget) {
      fieldMap.value[item.lineWidget.id] = item.lineWidget
    }
  }

  return { drillingClick: throttle(drillingClick, 1000, { trailing: false }), reportSchema, drillingLinkList, crumbsClick };
}


const isArrayOpe = [
  SEARCH_SEVICE.CONTAINALL,
  SEARCH_SEVICE.CONTAINANY,
  SEARCH_SEVICE.IN,
  SEARCH_SEVICE.NOTIN,
];
function getMultipleChoiceToArray(value, ope: SEARCH_SEVICE) {
  if (isArrayOpe.indexOf(ope) > -1 && typeof value === 'string') {
    return value.split(',');
  } else {
    return value;
  }
}
export class LinkItem {
  /**链路标题 */
  title: string = '';
  lineWidget?: BaseField;
  /**自定义钻取表格的Schema*/
  reportSchema?: string;
  /**钻取查询 */
  query_args: object = {};
  /**查询条件 */
  exp_args: string[] = [];
  /**根路径 */
  _root: boolean = false;
  /**列索引 */
  _columnIndex?: number
  constructor(data: object) {
    for (const i in data) {
      this[i] = data[i];
    }
  }
}
