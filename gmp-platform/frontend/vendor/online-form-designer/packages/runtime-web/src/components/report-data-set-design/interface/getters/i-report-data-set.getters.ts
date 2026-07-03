import { _GettersTree } from "pinia";
import { IReportDataSetState } from "../state/i-report-data-set.state";
import { ILinkData } from "../entity/i-link-data";
import { INodeData } from "../entity/i-node-data";

export interface IReportDataSetGetters extends _GettersTree<IReportDataSetState> {
  /**
   * 获取当前激活节点的数据
   *
   * @returns {*}
   */
  getActiveNodeData: () => INodeData | null;

  /**
   * 获取当前激活连线的数据
   *
   */
  getActiveLinkData: () => ILinkData | null;
}
