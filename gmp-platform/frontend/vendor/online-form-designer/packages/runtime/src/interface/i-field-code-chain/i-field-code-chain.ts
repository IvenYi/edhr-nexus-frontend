/**
 * 字段代码链接配置参数
 *
 * @author chitanda
 * @date 2025-06-22 14:06:55
 * @export
 * @interface IFieldCodeChain
 */
export interface IFieldCodeChain {
  modelKey: string;
  bindFieldKey: string;
  bindModelKey: string;
  belongModelKey: string;
  modelLink: string[];
  fieldLink: string[];
  refOriginFieldType: string;
}
