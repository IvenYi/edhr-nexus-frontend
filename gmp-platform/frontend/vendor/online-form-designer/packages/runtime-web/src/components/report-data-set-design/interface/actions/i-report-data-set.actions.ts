import { Edge, Graph } from '@antv/x6';
import { INodeData } from '../entity/i-node-data';
import { ILinkData } from '../entity/i-link-data';
import { ReportDataSetConditionDTO, ReportDataSetRequest } from '/@/apis/gct-apaas/model';
import { FieldMetaDTO, ModelPageableRow } from '@gct/runtime';
import { IFieldData } from '../entity/i-field-data';

/**
 * 报表数据源设计状态
 *
 * @export
 * @interface IReportDataSetActions
 */
export interface IReportDataSetActions {
  /**
   * 设置当前激活的节点 ID
   *
   * @param {string} id 节点 ID
   */
  setActive(id: string): Promise<void>;
  /**
   * 设置当前激活的连线 ID
   *
   * @param {string} id
   */
  setActiveLink(id: string): Promise<void>;
  /**
   * 设置节点，根据节点是否已经存在自适应添加或更新
   *
   * @param {INodeData} data
   * @param {boolean} [updateLayout=true] 是否更新界面布局，默认更新
   */
  setNode(data: INodeData, updateLayout?: boolean): Promise<void>;
  /**
   * 设置连线，根据连线是否已经存在自适应添加或更新
   *
   * @param {ILinkData} data
   * @param {boolean} [updateLayout=false] 是否更新界面布局，默认不更新
   */
  setLink(data: ILinkData, updateLayout?: boolean): Promise<void>;
  /**
   * 删除节点
   *
   * @param {string} id 节点 ID
   * @param {boolean} [updateLayout=true] 是否更新界面布局，默认更新
   */
  removeNode(id: string, updateLayout?: boolean): void;
  /**
   * 添加设计图实例
   *
   * @param {Graph} graph
   */
  setGraph(graph: Graph): void;
  /**
   * 根据目标节点查找连线
   *
   * @param {string} target
   * @returns {*}  {(ILinkData | null)}
   */
  findLinkByTarget(target: string): ILinkData | null;
  /**
   * 更新 X6 布局
   *
   */
  updateX6Layout(): void;
  /**
   * 显示拖拽布局
   *
   */
  showDropLayout(): void;
  /**
   * 隐藏拖拽布局
   *
   */
  hideDropLayout(): void;
  /**
   * 更新指定连线的 label 状态
   *
   * @param {string} id
   */
  updateLineLabelState(id: string): void;
  /**
   * 获取连线的 label 图标
   *
   * @param {(string | IObject)} data
   * @returns {*}  {IObject}
   */
  getLineLabelCfg(data: string | IObject): Edge.Label;
  /**
   * 销毁 X6 实例并且删除 store 缓存
   * @deprecated 请使用 store.$reset() 方法
   */
  destroy(): void;
  /**
   * 加载模型字段
   *
   * @param {string} modelKey 模型的 key
   * @param {boolean} [isFilter=true] 是否根据报表相同过滤字段，默认 true
   * @returns {*}  {Promise<FieldMetaDTO[]>}
   */
  loadModelFields(modelKey: string, isFilter?: boolean): Promise<FieldMetaDTO[]>;
  /**
   * 加载报表数据集设计
   *
   * @param {string} key
   * @returns {*}  {Promise<void>}
   */
  load(key: string): Promise<void>;
  /**
   * 加载报表数据集设计
   *
   * @param {string} key
   * @returns {*}  {Promise<void>}
   */
  loadBI(key: string): Promise<void>;
  /**
   * 保存
   *
   * @returns {*}  {Promise<void>}
   */
  save(): Promise<void>;
  /**
   * 单独保存数据集名称
   *
   * @returns {*}  {Promise<void>}
   */
  saveName(): Promise<void>;
  /**
   * 获取当前设计的数据保存结构
   *
   * @returns {*}  {ReportDataSetRequest}
   */
  getSavaData(): ReportDataSetRequest;
  /**
   * 获取预览数据
   *
   * @param {string} nodeKey 选中的节点 key，如果选中的是连线则从目标节点作为终点
   * @param {string} [linkKey]
   * @returns {*}  {(Promise<ReportDataSetConditionDTO | null>)}
   */
  getPreviewData(nodeKey: string, linkKey?: string): Promise<ReportDataSetConditionDTO | null>;
  /**
   * 生成后端需要的配置
   *
   * @param {INodeData[]} nodes
   * @param {ILinkData[]} links
   * @param {IFieldData[]} fields
   * @returns {*}  {(IObject | null)}
   */
  getConfigBackendData(
    nodes: INodeData[],
    links: ILinkData[],
    fields: IFieldData[],
    isPreview?: boolean,
  ): IObject | null;
  /**
   * 根据 ID 获取指定的节点
   *
   * @param {string} id
   * @returns {*}  {(INodeData | null)}
   */
  getNode(id: string): INodeData | null;
  /**
   * 根据 ID 获取指定的连线
   *
   * @param {string} id
   * @returns {*}  {(ILinkData | null)}
   */
  getLink(id: string): ILinkData | null;
  /**
   * 新增字段
   *
   * @param {INodeData} node
   * @param {string[]} fields
   */
  addFields(node: INodeData, fields: string[]): void;
  /**
   * 移除字段
   *
   * @param {INodeData} node
   * @param {string[]} fields
   */
  removeFields(node: INodeData, fields: string[]): void;
  /**
   * 加载预览数据
   *
   * @description 给定 nodeKey，根据 key 加载预览数据，如果没有给定 key 则加载所有数据。如果给定了 linkKey，则只加载与该连线相关的数据
   * @param {string} [nodeKey]
   * @param {string} [linkKey]
   * @returns {*}  {Promise<ModelPageableRow | null>}
   */
  loadPreviewData(nodeKey?: string, linkKey?: string): Promise<ModelPageableRow | null>;
  /**
   * 验证连线配置是否通过
   *
   * @returns {*}  {Promise<boolean>}
   */
  validateLinks(): Promise<boolean>;

  /**
   * BI的不知道逻辑是什么，类型报错硬补
   */
  getDatabasePageListBI(nodeKey: string, data: any): any;

  /**
   * BI的不知道逻辑是什么，类型报错硬补
   */
  uniqueByKey(arr: any[], key: string): any[];

  /**
   * BI的不知道逻辑是什么，类型报错硬补
   */
  loadModelFieldsBI(modelKey: string, isFilter: boolean): any;

  /**
   * BI的不知道逻辑是什么，类型报错硬补
   */
  fieldTypeMapping(type: string): any;
  /**
   * 获取已选字段中的模型字段
   */
  setModelFields();
}
