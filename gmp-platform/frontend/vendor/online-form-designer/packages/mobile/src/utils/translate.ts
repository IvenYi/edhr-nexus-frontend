export interface IRes {
  data: IData;
  dict: IData;
}
/**
 * 根据后台返回的数据格式，得到翻译后的值
 *
 * @export
 * @param res
 * @param field
 */
export function getTranslateValue(res: IRes, field: string) {
  const fieldVal = res.data[field];
  const fieldDict = res.dict[field];
  return fieldDict?.[fieldVal];
}
