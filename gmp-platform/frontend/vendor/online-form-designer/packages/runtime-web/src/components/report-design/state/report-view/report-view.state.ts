import { IReportConfig, IReportSchema, IRuntimeReportSchema } from '../../interface';

/**
 * 报表视图状态
 *
 * @export
 * @class ReportViewState
 */
export class ReportViewState {
  /**
   * 变更计数
   *
   * @type {number}
   */
  count: number = 0;
  /**
   * 界面是否加载完毕
   *
   * @type {boolean}
   */
  loaded: boolean = false;
  /**
   * 报表数据是否正在加载中
   *
   * @type {boolean}
   */
  loading: boolean = false;
  /**
   * 是否正在保存中
   *
   * @type {boolean}
   */
  saving: boolean = false;
  /**
   * 当前设计界面是否修改过
   *
   * @type {boolean}
   */
  modified: boolean = false;
  /**
   * 是否正在保存名称中
   *
   * @type {boolean}
   */
  savingName: boolean = false;
  /**
   * 报表设计界面配置模型
   *
   * @type {IReportSchema}
   */
  schema: IReportSchema = {} as unknown as IReportSchema;
  /**
   * 报表运行时界面配置模型，通过设计时模型转换而来，用于递给中间的预览程序用
   *
   * @type {IRuntimeReportSchema}
   */
  runtimeSchema: IRuntimeReportSchema = {} as unknown as IRuntimeReportSchema;
  /**
   * 报表数据
   *
   * @type {IReportConfig}
   */
  data: IReportConfig = {} as unknown as IReportConfig;
}
