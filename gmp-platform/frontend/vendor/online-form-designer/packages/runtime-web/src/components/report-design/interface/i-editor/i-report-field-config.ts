import { IEditorBasic } from "@gct-paas/core";
import { dimensionEnum } from "../../schema";

export interface IReportFieldConfig extends IEditorBasic {
  /**
   * 所属的维度
   *
   * @type {dimensionEnum}
   */
  dimension: dimensionEnum;
  /**
   * 标识所属分组
   *
   * @type {string}
   */
  group: string;
  /**
   * 添加按钮文本
   *
   * @type {string}
   */
  btnText?: string;
}
