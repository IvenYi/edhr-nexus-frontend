import { DefaultDateTypeConst, FIELD_TYPE, GetAppResponse, isMultipleOperator } from '@gct/runtime';
import dayjs from 'dayjs';
import { getDesignerCommonGetCanBeUsedOrgUser } from '/@/apis/gct-apaas/DesignerCommonController';
import { getUserInfo } from '/@/apis/gct-platform/UserController';
import { getTenantUserInfo } from '/@/apis/gct-platform/TenantController';

interface IParams {
  // 应用参数
  appInfo?: GetAppResponse;
}

// 根据属性类型计算搜索默认值
export const defaultValMap: Map<string, (widget: any, params?: IParams) => Promise<any>> =
  new Map();

/**
 * 组织选择默认值
 *
 * @author zhanghanrui
 * @date 2024-09-11 17:09:35
 * @param {*} widget
 * @param {*} [_params={}]
 * @return {*}  {Promise<any>}
 */
async function org_and_org_multi(widget: any, _params: IParams = {}): Promise<any> {
  const { defaultValue } = widget.props;
  if (!defaultValue) {
    return null;
  }
  if (Array.isArray(defaultValue)) {
    if (!defaultValue.includes('CURRENT_ORG')) {
      return null;
    }
  } else if (defaultValue !== 'CURRENT_ORG') {
    return null;
  }
  const orgInfo = await getTenantUserInfo();
  if (orgInfo) {
    const multiple = isMultipleOperator(widget.props.ope);
    if (defaultValue === 'CURRENT_ORG') {
      if (!orgInfo.masterOrgId) {
        return null;
      }
      return multiple ? [orgInfo.masterOrgId] : orgInfo.masterOrgId;
    }
    const res = await getDesignerCommonGetCanBeUsedOrgUser({
      pageNo: 1,
      pageSize: 999999999,
    });
    if (res) {
      const arr = res.data;
      if (arr) {
        const i = arr.findIndex((item) => item.masterOrgId === orgInfo.masterOrgId);
        if (i !== -1) {
          return multiple ? [orgInfo.masterOrgId] : orgInfo.masterOrgId;
        }
      }
    }
    return null;
  }
}
defaultValMap.set(FIELD_TYPE.ORG, org_and_org_multi);
defaultValMap.set(FIELD_TYPE.ORG_MULTI, org_and_org_multi);

/**
 * 人员选择默认值
 *
 * @author zhanghanrui
 * @date 2024-09-11 17:09:20
 * @param {*} widget
 * @param {*} [_params={}]
 * @return {*}  {Promise<any>}
 */
async function user_and_user_multi(widget: any, _params: any = {}): Promise<any> {
  const { defaultValue } = widget.props;
  if (!defaultValue) {
    return null;
  }
  if (Array.isArray(defaultValue)) {
    if (!defaultValue.includes('CURRENT_USER')) {
      return null;
    }
  } else if (defaultValue !== 'CURRENT_USER') {
    return null;
  }
  const userInfo = await getUserInfo();
  if (userInfo) {
    const multiple = isMultipleOperator(widget.props.ope);
    if (defaultValue === 'CURRENT_USER') {
      if (!userInfo.userId) {
        return null;
      }
      return multiple ? [userInfo.userId] : userInfo.userId;
    }
    const res = await getDesignerCommonGetCanBeUsedOrgUser({
      pageNo: 1,
      pageSize: 999999999,
    });
    if (res) {
      const arr = res.data;
      if (arr) {
        const i = arr.findIndex((item) => item.id === userInfo.userId);
        if (i !== -1) {
          return multiple ? [userInfo.userId] : userInfo.userId;
        }
      }
    }
    return null;
  }
}
defaultValMap.set(FIELD_TYPE.USER, user_and_user_multi);
defaultValMap.set(FIELD_TYPE.USER_MULTI, user_and_user_multi);

/**
 * 枚举选择默认值
 *
 * @author zhanghanrui
 * @date 2024-09-12 20:09:57
 * @param {*} widget
 * @param {*} [_params={}]
 * @return {*}  {Promise<any>}
 */
async function enum_and_enum_multi(widget: any, _params: any = {}): Promise<any> {
  const { defaultValue } = widget.props;
  if (!defaultValue || defaultValue.length === 0) {
    return null;
  }
  return defaultValue;
}
defaultValMap.set(FIELD_TYPE.ENUM, enum_and_enum_multi);
defaultValMap.set(FIELD_TYPE.ENUM_MULTI, enum_and_enum_multi);

/**
 * 数值默认值
 *
 * @author zhanghanrui
 * @date 2024-09-12 20:09:57
 * @param {*} widget
 * @param {*} [_params={}]
 * @return {*}  {Promise<any>}
 */
async function number(widget: any, _params: any = {}): Promise<any> {
  const { defaultValue } = widget.props;
  if (defaultValue == null) {
    return null;
  }
  return defaultValue;
}
defaultValMap.set(FIELD_TYPE.INTEGER, number);
defaultValMap.set(FIELD_TYPE.LONG, number);
defaultValMap.set(FIELD_TYPE.DOUBLE, number);
defaultValMap.set(FIELD_TYPE.DECIMAL, number);

/**
 * 文本默认值
 *
 * @author zhanghanrui
 * @date 2024-09-12 20:09:57
 * @param {*} widget
 * @param {*} [_params={}]
 * @return {*}  {Promise<any>}
 */
async function text(widget: any, _params: any = {}): Promise<any> {
  const { defaultValue } = widget.props;
  if (!defaultValue) {
    return null;
  }
  return defaultValue;
}
defaultValMap.set(FIELD_TYPE.TEXT, text);
defaultValMap.set(FIELD_TYPE.LONG_TEXT, number);

/**
 * 数值选择默认值
 *
 * @author zhanghanrui
 * @date 2024-09-12 20:09:57
 * @param {*} widget
 * @param {*} [_params={}]
 * @return {*}  {Promise<any>}
 */
async function boolean(widget: any, _params: any = {}): Promise<any> {
  const { defaultValue } = widget.props;
  if (defaultValue == null || defaultValue === '') {
    return null;
  }
  return defaultValue;
}
defaultValMap.set(FIELD_TYPE.BOOLEAN, boolean);

/**
 * 日期选择默认值
 *
 * @author zhanghanrui
 * @date 2024-09-12 20:09:57
 * @param {*} widget
 * @param {*} [_params={}]
 * @return {*}  {Promise<any>}
 */
async function date(widget: any, _params: any = {}): Promise<any> {
  return date_and_date_time(widget, 'YYYY-MM-DD');
}
defaultValMap.set(FIELD_TYPE.DATE, date);

/**
 * 日期时间选择默认值
 *
 * @author zhanghanrui
 * @date 2024-09-12 20:09:57
 * @param {*} widget
 * @param {*} [_params={}]
 * @return {*}  {Promise<any>}
 */
async function date_time(widget: any, _params: any = {}): Promise<any> {
  return date_and_date_time(widget, 'YYYY-MM-DD 00:00:00');
}
defaultValMap.set(FIELD_TYPE.DATE_TIME, date_time);

/**
 * 日期时间+日期默认值初始化
 *
 * 举例：当前时间为2024-9-20
 * 近0天：当天，2024-9-20至2024-9-20
 * 近0周：本周，2024-9-16至2024-9-22
 * 近0月：本月，2024-9-1至2024-9-30
 * 近0年：本年，2024-1-1至2024-12-31
 * 近1天：2024-9-19至 2024-9-19
 * 近1周：2024-9-9至 2024-9-15
 * 近1月：2024-8-1至 2024-8-31
 * 近1年：2023-1-1至 2023-12-31
 * 近2天：2024-9-18至 2024-9-19
 * 近2周：2024-9-2至 2024-9-15
 * 近2月：2024-7-1至 2024-8-31
 * 近2年：2022-1-1至 2023-12-31
 *
 * @author zhanghanrui
 * @date 2024-09-13 15:09:49
 * @param {*} widget
 * @param {string} format
 * @param {*} [_params={}]
 * @return {*}  {*}
 */
function date_and_date_time(widget: any, format: string, _params: any = {}): any {
  const { defaultValueType, defaultValue } = widget.props;
  if (defaultValueType == null || defaultValueType == '') {
    return null;
  }
  const { isRang, fieldType } = widget.props;
  // 非范围模式
  if (!isRang) {
    const format = fieldType === FIELD_TYPE.DATE ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss';
    switch (defaultValueType) {
      case DefaultDateTypeConst.SystemDate:
        return dayjs(new Date()).format(format);
    }
  }
  // 范围模式
  if (isRang) {
    // 起始日期格式化
    const fs = fieldType === FIELD_TYPE.DATE ? 'YYYY-MM-DD' : 'YYYY-MM-DD 00:00:00';
    // 结束日期格式化
    const fe = fieldType === FIELD_TYPE.DATE ? 'YYYY-MM-DD' : 'YYYY-MM-DD 23:59:59';
    const num = defaultValue != null ? Number(defaultValue) : 0;
    const now = dayjs();
    switch (defaultValueType) {
      case DefaultDateTypeConst.SystemDate:
        return isRang ? [now.format(fs), now.format(fe)] : now.format(fs);
      case DefaultDateTypeConst.PastDays: {
        const d = now.subtract(num, 'day');
        return [d.format(fs), now.subtract(num > 0 ? 1 : 0, 'day').format(fe)];
      }
      case DefaultDateTypeConst.PastWeeks: {
        const d = now.subtract(num, 'week');
        return [
          d.startOf('isoWeek').format(fs),
          now
            .subtract(num > 0 ? 1 : 0, 'week')
            .endOf('isoWeek')
            .format(fe),
        ];
      }
      case DefaultDateTypeConst.PastMonths: {
        const d = now.subtract(num, 'month');
        return [
          d.startOf('month').format(fs),
          now
            .subtract(num > 0 ? 1 : 0, 'month')
            .endOf('month')
            .format(fe),
        ];
      }
      case DefaultDateTypeConst.PastYears: {
        const d = now.subtract(num, 'year');
        return [
          d.startOf('year').format(fs),
          now
            .subtract(num > 0 ? 1 : 0, 'year')
            .endOf('year')
            .format(fe),
        ];
      }
      case DefaultDateTypeConst.Yesterday:
        const yester = now.subtract(1, 'day');
        return [yester.format(fs), yester.format(fe)];
      case DefaultDateTypeConst.Past7Days:
        return [now.subtract(6, 'day').format(fs), now.format(fe)];
      case DefaultDateTypeConst.Past30Days:
        return [now.subtract(29, 'day').format(fs), now.format(fe)];
      case DefaultDateTypeConst.ThisWeek:
        return [now.startOf('isoWeek').format(fs), now.endOf('isoWeek').format(fe)];
      case DefaultDateTypeConst.LastWeek:
        const lastWeek = now.subtract(1, 'week');
        return [lastWeek.startOf('isoWeek').format(fs), lastWeek.endOf('isoWeek').format(fe)];
      case DefaultDateTypeConst.ThisMonth:
        return [now.startOf('month').format(fs), now.endOf('month').format(fe)];
      case DefaultDateTypeConst.LastMonth:
        const lastMonth = now.subtract(1, 'month');
        return [lastMonth.startOf('month').format(fs), lastMonth.endOf('month').format(fe)];
      case DefaultDateTypeConst.ThisYear:
        return [now.startOf('year').format(fs), now.endOf('year').format(fe)];
      case DefaultDateTypeConst.LastYear:
        const lastYear = now.subtract(1, 'year');
        return [lastYear.startOf('year').format(fs), lastYear.endOf('year').format(fe)];
      default:
        return null;
    }
  }
  return null;
}

/**
 * 打印机
 * @param widget
 * @param _params
 * @returns
 */
async function printer(widget: any, _params: any = {}): Promise<any> {
  const { defaultValue } = widget.props;
  if (!defaultValue || defaultValue.length === 0) {
    return null;
  }
  return defaultValue;
}
defaultValMap.set(FIELD_TYPE.PRINTER, printer);
