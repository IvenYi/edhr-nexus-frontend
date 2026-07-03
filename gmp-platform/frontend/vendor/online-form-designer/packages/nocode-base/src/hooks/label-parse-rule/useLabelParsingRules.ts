import dayjs from 'dayjs';
import { uuid2 } from '../../_utils_';
import { IRuleParseData, Config_Fields, IRuleConfig } from './type';
import {
  getModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as getApi,
  postModelComprehensiveBizServiceByModelCategoryByModelKeyByBsKey as postApi,
} from '/@/apis/gct-apaas/ModelComprehensiveController';

/**
 * 获取扫码解析规则的详情
 * @export
 * @param params
 */
export async function getParseRuleInfo(params: { id: string }) {
  const res = (await getApi(
    {
      bsKey: 'rdoGetVersionById',
      modelKey: 'em_barcode_parsing_rules',
      modelCategory: 'entity',
    },
    params,
  )) as any;
  return res.data;
}

/**
 * 处理老数据
 * @export
 * @param config
 * @return {*}
 */
export function handleOldConfig(config: IRuleConfig) {
  if (config.list && !config.fieldList) {
    config.fieldList = config.list.map((type) => {
      return {
        type,
        key: type === Config_Fields.other ? uuid2(32) : type,
      };
    });
    delete config.list;
  }

  // 修正数据
  config.fieldList.forEach((item) => {
    if (!item.key) {
      item.key = item.type === Config_Fields.other ? uuid2(32) : item.type;
    }
  });

  return config;
}

/**
 * 解析规则
 * @export
 * @param labelStr
 * @param labelRule
 * @return {*}
 */
export function getParseRuleValue(labelStr: string, labelRule: string) {
  if (!labelRule) {
    throw new Error('请传入解析规则');
  }
  const ruleObj = JSON.parse(labelRule);
  const ruleConfig = handleOldConfig(ruleObj);

  const { separator, nullSymbol, fieldList } = ruleConfig;
  const labelArr = labelStr.split(separator);
  return labelArr.reduce((obj, e, idx) => {
    const field = fieldList[idx];
    if (field) {
      let val: any = nullSymbol && e === nullSymbol ? null : e;
      if (val !== null) {
        switch (field.type) {
          case Config_Fields.qty:
            val = Number(val);
            break;
          case Config_Fields.expiration:
            val = dayjs(val, field.format!).format('YYYY-MM-DD HH:mm:ss');
            break;
          // todo 根据配置转换有效期
          default:
            break;
        }
      }
      obj[field.key] = val;
    }
    return obj;
  }, {}) as IRuleParseData;
}

/**
 * 请求并解析获得规则配置对象
 * @export
 * @param id
 * @return {*}
 */
export async function getParseRuleConfig(id: string) {
  const res = await getParseRuleInfo({ id });
  if (res?.rules_) {
    const ruleObj = JSON.parse(res.rules_);
    const ruleConfig = handleOldConfig(ruleObj);
    return ruleConfig;
  }
}
