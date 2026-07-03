import { defineComponent, ref } from 'vue';
import { FIELD_TYPE, IModalData } from '@gct/runtime';
import {
  BaseField,
  emptyValueLabel,
  ReportTable,
  SummaryCalculationMethod,
  runCalculationByName,
  RowHeightSettingEnum,
  NumberFormattingEnum,
  NUMBER_FORMAT_TIME_TYPE_ENUM,
  transformSchemaByData,
  summaryCalculationNameMap,
} from '../../schema';
import BigNumber from 'bignumber.js';
import FileCom from './components/file-list.vue';
import reportRender from './components/report-render.vue';
import SignatureRender from './components/signature-render.vue';
import { REPORT_LINK_TYPE, REPORT_LINK_OPEN_MODE } from '../../constants';
import { throttle } from 'lodash-es';
import { getReportHeader } from './report-hooks';
import { genUrl } from '/@/utils';
import { useEnv } from '/@/hooks/develop/useEnv';
import { DataSetReturnTypeEnum } from '/@/components/Expression';
import { isBoolean } from '/@/utils/is';

// import dayjs from 'dayjs';
export function useReportRender(
  reportWidget: ReportTable,
  { vxeTable, drillingClick, drillingLinkList },
) {
  const apiConfig = getReportHeader();
  const {
    _field_proto_map,
    rowHeightSetting = {},
    linkStyle = {},
    calculationMethod,
    row_calculationMethod,
  } = reportWidget;

  /**最大多少行 */
  const lineClamp =
    rowHeightSetting.type === RowHeightSettingEnum.LINE ? 1 : rowHeightSetting.maxRow;
  /**单元格class */
  const cellClass = rowHeightSetting.type !== RowHeightSettingEnum.ALL ? ['gct-truncate'] : [];
  /**跳转颜色*/
  const linkColor = linkStyle?.color;
  /**跳转样式 */
  const linkClass = linkClassList
    .reduce(
      (pre, curr) => {
        if (linkStyle?.[curr.value]) pre.push(curr.class);
        return pre;
      },
      [linkStyle?.theme ? 'gct-theme-color' : 'gct-link-color'],
    )
    .join(' ');
  /**跳转颜色class */
  const linkColorClass = linkStyle?.theme ? 'theme-color' : 'link-color';
  const Render = (
    props: { widget: object; row: any; fieldKey: string; columnIndex: number },
    { emit },
  ) => {
    const { widget, row, fieldKey, columnIndex } = props;
    if (widget._is_total && row._is_total) {
      const val = getRowByColTotal(widget, row, _field_proto_map);
      return () =>
        renderCell(
          getTotalLabel(val, widget, { _is_total_function: row._is_total_function }) ?? '--',
        );
    }
    const val = row._DICT?.[fieldKey] || row[fieldKey];
    if (widget._is_total || row._is_total) {
      return () => renderCell(getTotalLabel(val, widget) ?? '--');
    }
    return () =>
      transformValue(val, { ...widget, _protoValue_: row[fieldKey], _columnIndex_: columnIndex });
  };
  /**数据处理 */
  function transformValue(value, widget: BaseField, isCell = false) {
    let fieldType: string = widget.fieldType;
    const { field, emptyValue, numberFormat } = widget;
    if (value === undefined || value === null || value === '') {
      return emptyValueLabel[emptyValue];
    }
    if (isBoolean(value)) {
      return value.toString();
    }
    const { mappingType, specificConfig = {} } = _field_proto_map[field] || {};
    if ([FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(fieldType)) {
      /**公式识别返回格式 */
      fieldType = mappingType;
    }

    if (
      [FIELD_TYPE.DECIMAL, FIELD_TYPE.LONG, FIELD_TYPE.INTEGER, FIELD_TYPE.DOUBLE].includes(
        fieldType,
      ) ||
      (fieldType === FIELD_TYPE.FUNCTION && mappingType === DataSetReturnTypeEnum.Double)
    ) {
      /**数值显示格式 */
      value = getNumberCell(
        value,
        fieldType,
        numberFormat,
        specificConfig,
        widget.polymerization_function,
      );
    } else if (fieldType === FIELD_TYPE.BOOLEAN) {
      /**布尔值翻译 */
      value = specificConfig[!!value];
    }

    if (fieldType === FIELD_TYPE.IMAGE) {
      /**图片 */
      const imglist = value.split(',');
      return imglist.map((path) => {
        return (
          <a-image src={import.meta.env.VITE_MINIO_PATH + path} width="22px" height="22px">
            {{
              previewMask: () => <zoom-in-outlined />,
            }}
          </a-image>
        );
      });
    } else if (fieldType === FIELD_TYPE.ATTACHMENT) {
      /**附件 */
      const fileList = value.split(',');
      return (
        <a-popover trigger="click" placement="bottomLeft">
          {{
            content: () => {
              return <FileCom fileList={fileList}></FileCom>;
            },
            default: () => {
              return (
                <div class="highlight">
                  <i class="iconfont icon-PaperClip"></i>
                  <span>{fileList.length} 个文件</span>
                </div>
              );
            },
          }}
        </a-popover>
      );
    } else if (fieldType === FIELD_TYPE.SIGNATURE) {
      return (
        <SignatureRender
          modelValue={value}
          widget={widget}
          getPopupContainer={(triggerNode) => triggerNode.parentNode}
        />
      );
    }
    /**不需要返回单元格样式 */
    if (isCell) return value;
    return renderCell(value, widget);
  }
  const fieldRender = defineComponent(Render, {
    props: ['widget', 'row', 'fieldKey', 'columnIndex'],
  });

  /**处理总计下面 小数精度问题 */
  /**
   * _is_total_function 列小计 汇总计算方式   在遇到行总计的时候 列小计的逻辑优先
   */
  function getTotalLabel(
    value,
    params,
    { totalData, numFormat = true, _is_total_function }: any = {},
  ) {
    if (totalData && params._is_total) {
      //行列总计交叉
      const { _parentKeys } = params;
      /**去除总计 total_ 拼接影响 */
      const fieldKey = (params.fieldKey || params.field).replace('total_', '');
      const fun_key = fieldKey + '_function';
      const fun = totalData[fun_key];
      /** _parentKeys 不存在 就是 行和列总计交叉显示场景*/
      const total_list =
        _parentKeys !== undefined ? totalData[_parentKeys] : totalData.total_row_col;
      const list = total_list?.map((row) => row[fieldKey]) || [];
      value = runCalculationByName(list, fun, fieldKey, _field_proto_map);
    }
    /**总计空也会走这边 */
    if (value === undefined || value === null || value === '') return;
    const field = params.fieldKey || params.field;
    const { mappingType, specificConfig = {}, type } = _field_proto_map[field] || {};
    const fieldType = [FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION].includes(type) ? mappingType : type;
    if (fieldType === FIELD_TYPE.DOUBLE && !isNaN(value) && value !== null && value !== '') {
      value = Number(value);
    }
    if (
      numFormat &&
      ![SummaryCalculationMethod.COUNT, SummaryCalculationMethod.NO_REPEAT_COUNT].includes(
        params.col_function,
      ) &&
      [FIELD_TYPE.DECIMAL, FIELD_TYPE.LONG, FIELD_TYPE.INTEGER, FIELD_TYPE.DOUBLE].includes(
        fieldType,
      )
    ) {
      value = getNumberCell(
        value,
        type,
        params.numberFormat,
        specificConfig,
      );
    }
    /**列总计自定义场景的逻辑 正常情况下 列小计会存在 _parentKeys  所以根据_parentKeys 是否存在判断是不是列总计*/
    /**排除行列交叉的地方重复处理 */
    if (
      params._is_total &&
      !params._parentKeys &&
      !totalData &&
      row_calculationMethod?.function === SummaryCalculationMethod.CUSTOM
    ) {
      //_is_total_function 列小计 汇总计算方式   在遇到行总计的时候 列小计的逻辑优先
      value = `${summaryCalculationNameMap[_is_total_function || params.row_function]}: ${value}`;
    }
    return value;
  }

  /**单元格样式 包括上下左右对齐 */
  function renderCell(value, widget?: BaseField) {
    let renderValue = value;
    /**存在跳转 */
    const hasLink = !!widget?.linkSetting;
    /**存在钻取 */
    // const lastNode = drillingLinkList.at(-1);
    const hasDrilling = !!widget?.drillAttrs?.length || widget?.drillReport;
    const cellNodeClass = [...cellClass];
    if (hasLink && hasDrilling) {
      renderValue = linkAdnDrillingRender(value, widget, {
        drillingClick,
        vxeTable,
        linkColorClass,
        linkClick,
      });
      cellNodeClass.push(linkClass);
    } else if (hasLink) {
      /**跳转 */
      renderValue = linkRender(value, widget, { linkColorClass, linkClick });
      cellNodeClass.push(linkClass);
    } else if (hasDrilling) {
      /**钻取 */
      renderValue = drillingRender(value, widget, { drillingClick });
      cellNodeClass.push('gct-theme-color');
    }
    return context(renderValue, value, { cellNodeClass, vxeTable });
  }
  function renderTotal(value, params, { totalData, numFormat = true }: any = {}) {
    const total = getTotalLabel(value, params, { totalData, numFormat }) || '';
    /**行总计的特殊逻辑 */
    if (
      calculationMethod?.function === SummaryCalculationMethod.CUSTOM &&
      params.col_function &&
      total !== ''
    ) {
      return `${summaryCalculationNameMap[params.col_function]}: ${total}`;
    }

    return total;
  }
  /**底部总计 */
  const footerRender = defineComponent({
    props: {
      value: { type: [String, Number, Object], required: true },
      params: { type: Object, required: true },
      totalData: { type: Object, required: false, default: undefined },
    },
    setup(props) {
      return () => {
        if (!props.params) return;
        const value = renderTotal(props.value, props.params, { totalData: props.totalData });
        return context(value, value, { cellNodeClass: 'ell', vxeTable });
      };
    },
  });

  /**根据字段配置返回显示格式 导出的时候会用到*/
  function transformValueByField(
    widget: object,
    row: any,
    fieldKey: string,
    { numFormat }: { numFormat: boolean },
  ) {
    if (widget._is_total && row._is_total) {
      const val = getRowByColTotal(widget, row, _field_proto_map);
      return getTotalLabel(val, widget, { _is_total_function: row._is_total_function }) ?? '--';
    }
    let val = row._DICT?.[fieldKey] || row[fieldKey];
    if (widget._is_total || row._is_total) {
      return getTotalLabel(val, widget) ?? '--';
    }
    let fieldType: string = widget.fieldType;
    const { field, emptyValue, numberFormat } = widget;
    if (val === undefined || val === null || val === '') {
      return emptyValueLabel[emptyValue];
    }
    const { mappingType, specificConfig = {} } = _field_proto_map[field] || {};
    if ([FIELD_TYPE.AGG, FIELD_TYPE.EXPRESSION, FIELD_TYPE.FUNCTION].includes(fieldType)) {
      /**公式识别返回格式 */
      fieldType = mappingType;
    }

    if (
      numFormat &&
      [
        FIELD_TYPE.DECIMAL,
        FIELD_TYPE.LONG,
        FIELD_TYPE.INTEGER,
        FIELD_TYPE.DOUBLE,
        DataSetReturnTypeEnum.Double,
      ].includes(fieldType)
    ) {
      /**数值显示格式 */
      val = getNumberCell(
        val,
        fieldType,
        numberFormat,
        specificConfig,
        widget?.polymerization_function,
      );
    } else if (fieldType === FIELD_TYPE.BOOLEAN) {
      /**布尔值翻译 */
      val = specificConfig[!!val];
    }
    return val;
  }
  const linkClick = throttle(
    async (linkSetting) => {
      if (linkSetting?.openMode === REPORT_LINK_OPEN_MODE.MODAL) {
        const renderData: any = {
          reportName: ' ',
          schema: '',
          url: '',
          appId: apiConfig.appId,
        };
        if (linkSetting?.type === REPORT_LINK_TYPE.LINK) {
          renderData.url = linkSetting.url;
        } else {
          renderData.schema = await transformSchemaByData(linkSetting?.report, apiConfig);
          renderData.reportName = renderData.schema.reportName;
        }
        await gct.openUtil.modal<IModalData>(reportRender, renderData, {
          width: 800,
          title: renderData.reportName,
          okButtonProps: { style: { display: 'none' } },
          cancelText: '关闭',
        });
      } else {
        if (linkSetting?.type === REPORT_LINK_TYPE.LINK) {
          window.open(linkSetting.url);
        } else {
          const { isAppRun } = useEnv();
          const appId = apiConfig.appId;
          //isAppRun 不在应用前台 就只能自己拼路径了
          const url = isAppRun
            ? window.$router.resolve({
                name: 'ReportPreview',
                params: { id: linkSetting?.report },
              }).href
            : genUrl(`${location.origin}${import.meta.env.VITE_PATHNAME_WEB_APP}`, {
                aid: appId,
              }) + `#/ReportPreview/${linkSetting?.report}?appId=${appId}`;
          window.open(url, '_blank');
        }
      }
    },
    1000,
    { trailing: false },
  );
  return {
    fieldRender,
    transformValue,
    footerRender,
    lineClamp,
    linkColor,
    renderTotal,
    transformValueByField,
  };
}
const context = (VNode, value, { cellNodeClass, vxeTable }) => (
  <div
    class={cellNodeClass}
    onMouseenter={(e) => {
      const el = e.target!;
      if (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)
        vxeTable.value.openTooltip(el, value);
    }}
    onMouseleave={(e) => {
      vxeTable.value.closeTooltip();
    }}
  >
    {VNode}
  </div>
);
/**跳转和钻取并行 */
function linkAdnDrillingRender(
  value,
  widget: BaseField,
  { drillingClick, linkClick, vxeTable, linkColorClass },
) {
  return (
    <a-popover
      placement="rightTop"
      overlayClassName="report-popover"
      getPopupContainer={() => vxeTable.value.$el}
    >
      {{
        default: () => value,
        content: () => {
          return (
            <div>
              <div onClick={() => drillingClick(value, widget)} class="cell">
                <span class={[linkColorClass, 'iconfont  icon-a-zuanqu2 ']}></span> 钻取
              </div>
              <div onClick={() => linkClick(widget.linkSetting)} class="cell">
                <span class={[linkColorClass, 'iconfont icon-tiaozhuan']}></span> 跳转
              </div>
            </div>
          );
        },
      }}
    </a-popover>
  );
}
/**跳转自定义渲染 */
function linkRender(value, widget: BaseField, { linkColorClass, linkClick }) {
  return (
    <a-tooltip
      mouseEnterDelay={0}
      placement="rightTop"
      overlayClassName="report-tooltip-link"
      getPopupContainer={(element) => element.parentNode}
    >
      {{
        default: () => {
          return <span onClick={() => linkClick(widget.linkSetting)}>{value}</span>;
        },
        title: () => {
          return <span class={[linkColorClass, 'iconfont icon-tiaozhuan']}></span>;
        },
      }}
    </a-tooltip>
  );
}

/**钻取渲染*/
function drillingRender(value, widget: BaseField, { drillingClick }) {
  return (
    <a-tooltip
      mouseEnterDelay={0}
      placement="rightTop"
      overlayClassName="report-tooltip-link"
      getPopupContainer={(element) => element.parentNode}
    >
      {{
        default: () => {
          return <span onClick={() => drillingClick(value, widget)}>{value}</span>;
        },
        title: () => {
          return <span class="gct-theme-color iconfont icon-a-zuanqu2"></span>;
        },
      }}
    </a-tooltip>
  );
}

/**单元格通用渲染 */

/**小计交叉处单元格显示方式 */
function getRowByColTotal(params, row, _field_proto_map) {
  const { _parentKeys } = params;
  const fieldKey = (params.fieldKey || params.field).replace('total_', '');
  const total_list = _parentKeys ? row._is_total_map?.[_parentKeys] : row.total_row_col;
  const data_list = total_list?.map((row) => row[fieldKey]) || [];
  return runCalculationByName(data_list, row._is_total_function, fieldKey, _field_proto_map);
}
/**数值展示方式显示逻辑 */
function getNumberCell(
  value,
  fieldType,
  numberFormat = {},
  specificConfig = {},
  polymerization = '',
): string {
  // console.log(value, fieldType, numberFormat, specificConfig);
  /**百分比 */
  if (numberFormat?.type === NumberFormattingEnum.PERCENTAGE) {
    value = new BigNumber(value).times(100);
  }
  if (fieldType === FIELD_TYPE.DECIMAL || ![undefined, null].includes(numberFormat?.precision)) {
    /**精度小数处理 */
    const digits =
      polymerization === SummaryCalculationMethod.COUNT || polymerization === SummaryCalculationMethod.NO_REPEAT_COUNT
        ? 0
        : numberFormat.precision ?? specificConfig.digits ?? 0;

    value = new BigNumber(value).toFixed(Number(digits), 1);
  }
  if (!numberFormat?.type) {
    /**初始化默认千分位*/
    return formatNumberWithCommas(value);
  }

  const { type, timeType, prefix = '', suffix = '', thousand } = numberFormat;
  if (type === NumberFormattingEnum.NUMERICAL_VALUE) {
    value = thousand ? formatNumberWithCommas(value) : value;
    return `${prefix}${value}${suffix}`;
  }
  if (type === NumberFormattingEnum.PERCENTAGE) {
    return `${value}%`;
  }

  if (type === NumberFormattingEnum.TIME) {
    return formatMillisecondsToDHMS(value, timeType);
  }
  return '';
}

/**千分位处理 */
function formatNumberWithCommas(number): string {
  // 将数字转为字符串，并按小数点分割
  const parts = number.toString().split('.');
  // 对整数部分添加千分位逗号
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

/**天时分秒转化 */
function formatMillisecondsToDHMS(milliseconds, timeType: NUMBER_FORMAT_TIME_TYPE_ENUM): string {
  const seconds = Math.floor(milliseconds);
  if (timeType === NUMBER_FORMAT_TIME_TYPE_ENUM['秒']) {
    return `${seconds}秒`;
  }
  const { f_days, f_hours, f_minutes, f_secs, minutes_fun, hours_fun } = formatDHMSMap[timeType];
  const days = Math.floor(seconds / 86400);
  const hours = hours_fun ? hours_fun(seconds) : Math.floor((seconds % 86400) / 3600);
  const minutes = minutes_fun ? minutes_fun(seconds) : Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days >= 0 && f_days) parts.push(`${days}天`);
  if (hours >= 0 && f_hours) parts.push(`${hours}小时`);
  if (minutes >= 0 && f_minutes) parts.push(`${minutes}分钟`);
  if (f_secs && (secs >= 0 || parts.length === 0)) parts.push(`${secs}秒`);
  return parts.join('');
}

const formatDHMSMap = {
  [NUMBER_FORMAT_TIME_TYPE_ENUM['天']]: {
    f_days: true,
  },
  [NUMBER_FORMAT_TIME_TYPE_ENUM['天 : 时']]: {
    f_days: true,
    f_hours: true,
  },
  [NUMBER_FORMAT_TIME_TYPE_ENUM['天 : 时 : 分']]: {
    f_days: true,
    f_hours: true,
    f_minutes: true,
  },
  [NUMBER_FORMAT_TIME_TYPE_ENUM['天 : 时 : 分 : 秒']]: {
    f_days: true,
    f_hours: true,
    f_minutes: true,
    f_secs: true,
  },
  [NUMBER_FORMAT_TIME_TYPE_ENUM['分']]: {
    f_minutes: true,
    minutes_fun: (seconds) => Math.floor(seconds / 60),
  },
  [NUMBER_FORMAT_TIME_TYPE_ENUM['分 : 秒']]: {
    f_minutes: true,
    f_secs: true,
    minutes_fun: (seconds) => Math.floor(seconds / 60),
  },
  [NUMBER_FORMAT_TIME_TYPE_ENUM['时']]: {
    f_hours: true,
    hours_fun: (seconds) => Math.floor(seconds / 3600),
  },
  [NUMBER_FORMAT_TIME_TYPE_ENUM['时 : 分']]: {
    f_hours: true,
    f_minutes: true,
    hours_fun: (seconds) => Math.floor(seconds / 3600),
  },
};

const linkClassList = [
  {
    value: 'bold',
    class: 'gct-bold',
  },
  {
    value: 'italic',
    class: 'gct-italic',
  },
  {
    value: 'underline',
    class: 'gct-underline',
  },
];
