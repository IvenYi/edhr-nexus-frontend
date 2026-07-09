import { IReportSchema } from "../i-report-schema/i-report-schema";

/**
 * 运行时报表数据结构
 *
 * @export
 * @interface IRuntimeReportSchema
 * @extends {IReportSchema}
 */
export interface IRuntimeReportSchema extends IReportSchema {
  /**
   * 数据变更的标识，每次 json 更新后，uuid 重新生成。用于当时间戳，不是用于当唯一标识的
   *
   * @type {string}
   */
  _uuid: string;
}
