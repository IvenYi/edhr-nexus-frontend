import { computed } from 'vue';
import { LowCodeWidget } from '../types/widget-basic-types';
import { notNeedPxStyle } from '../schema/common-config/common-style';
import { isEmpty, isNil, pick } from 'lodash-es';
import { isEmptyStr } from '/@/utils/is';

function pxToVw(pxValue) {
  if (import.meta.env.VITE_APP_ENV === 'mobile') {
    return (pxValue / 375) * 100 + 'vw';
  } else {
    return pxValue + 'px';
  }
}
const cmpStyle: any = {
  fontAttrs: ['fontWeight', 'fontSize', 'color', 'textDecorationLine', 'textAlign'],
  mapAttrs: {
    bold: {
      attr: 'fontWeight',
      callback: (value) => {
        return value ? 700 : 400;
      },
    },
    italic: {
      attr: 'fontStyle',
      callback: (value) => {
        return value ? 'italic' : 'normal';
      },
    },
    textDecoration: {
      attr: 'textDecorationLine',
    },
    fontSize: {
      attr: 'fontSize',
      callback: (value) => {
        return value ? pxToVw(value) : '';
      },
    },
    align: {
      attr: 'textAlign',
    },
  },
  // 获取font样式，
  font(font) {
    if (!font) return {};

    const o = {};

    Object.assign(o, pick(font, cmpStyle.fontAttrs));

    if (typeof cmpStyle.mapAttrs === 'object') {
      Object.keys(cmpStyle.mapAttrs).forEach((k) => {
        const { attr, callback } = cmpStyle.mapAttrs[k];
        o[attr] = typeof callback === 'function' ? callback(font[k]) : font[k];
      });
    }
    return o;
  },
};

export function useStyle(widget: LowCodeWidget.BasicSchema) {
  const { style = {}, ignoringStyle = [] } = widget || {};
  const wStyle = computed(() => {
    return propsToStyle(style);
  });
  const wrapperStyle = computed(() => {
    // 辅助函数：处理带 px 单位的样式
    const addPxUnit = (value: any) => (isEmpty(value) ? '' : `${value}px !important`);
    
    // 辅助函数：处理不带单位的样式
    const addImportant = (value: any) => (isEmpty(value) ? '' : `${value} !important`);
    
    // 辅助函数：处理边框样式
    const formatBorder = (border: any) => {
      if (!border || isEmpty(border.borderWidth)) return '';
      return `${border.borderWidth}px ${border.borderStyle || 'solid'} ${border.borderColor || 'transparent'} !important`;
    };

    // 基础位置和尺寸样式
    const positionStyles = {
      position: addImportant(style.position),
      top: addPxUnit(style.top),
      left: addPxUnit(style.left),
      right: addPxUnit(style.right),
      bottom: addPxUnit(style.bottom),
      width: addPxUnit(style.width),
      height: addPxUnit(style.height),
    };

    // 背景和间距样式
    const spacingStyles = {
      backgroundColor: addImportant(style.backgroundColor),
      marginTop: addPxUnit(style.marginTop),
      marginRight: addPxUnit(style.marginRight),
      marginBottom: addPxUnit(style.marginBottom),
      marginLeft: addPxUnit(style.marginLeft),
      paddingTop: addPxUnit(style.paddingTop),
      paddingRight: addPxUnit(style.paddingRight),
      paddingBottom: addPxUnit(style.paddingBottom),
      paddingLeft: addPxUnit(style.paddingLeft),
    };

    // 边框样式
    const borderStyles = {
      borderLeft: formatBorder(style.borderLeft),
      borderRight: formatBorder(style.borderRight),
      borderBottom: formatBorder(style.borderBottom),
      borderTop: formatBorder(style.borderTop),
      borderTopRightRadius: addPxUnit(style.borderTopRightRadius),
      borderTopLeftRadius: addPxUnit(style.borderTopLeftRadius),
      borderBottomRightRadius: addPxUnit(style.borderBottomRightRadius),
      borderBottomLeftRadius: addPxUnit(style.borderBottomLeftRadius),
    };

    // 合并所有样式
    const styleData = { ...positionStyles, ...spacingStyles, ...borderStyles };

    // 移除忽略的样式和空值
    ignoringStyle.forEach((key) => delete styleData[key]);
    Object.keys(styleData).forEach((key) => {
      if (isEmptyStr(styleData[key])) {
        delete styleData[key];
      }
    });
    return styleData;
  });

  const labelFont = computed(() => {
    return cmpStyle.font(style.labelFont);
  });

  const contentFont = computed(() => {
    return cmpStyle.font(style.contentFont);
  });

  return {
    wrapperStyle,
    wStyle,
    labelFont,
    contentFont,
  };
}
export const schemaToStyle = (schema) => cmpStyle.font(schema);

export function propsToStyle(styleProps: any = {}) {
  const wStyle: any = {};
  for (const prop in styleProps) {
    wStyle[prop] = makeStyleProp(prop, styleProps[prop]);
  }
  return wStyle;
}
function makeStyleProp(prop, value) {
  if (isNil(value) || isEmptyStr(value)) {
    return '';
  }
  if (notNeedPxStyle.includes(prop)) {
    return value + ' !important';
  }
  return value + 'px !important';
}

export const transAlign2flex = {
  left: 'flex-start',
  center: 'center',
  right: 'flex-end',
  justify: 'space-between',
};
