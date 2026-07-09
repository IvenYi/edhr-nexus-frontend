import { StateTree } from 'pinia';
import { type Graph } from '@antv/x6';
import { INodeData } from '../entity/i-node-data';
import { ILinkData } from '../entity/i-link-data';
import { DagreLayout } from '@antv/layout';
import { Dnd } from '@antv/x6-plugin-dnd';
import { ModelMetaDTO } from '@gct/runtime';
import { ReportDataSetStep, ReportDataSetStepBI } from '../../enums';
import { ReportDataSetResponse } from '/@/apis/gct-apaas/model';
import { IFieldData } from '../entity/i-field-data';
import { AsyncSeriesHook } from 'qx-util';

/**
 * 报表数据源设计状态
 *
 * @export
 * @interface IReportDataSetState
 * @extends {StateTree}
 */
export interface IReportDataSetState extends StateTree {
  hooks: {
    active: {
      // type: 激活类型, id: 激活的节点或连线 ID
      before: AsyncSeriesHook<[type: 'link' | 'node', id: string], { isOk: boolean }>;
    };
  };
  /**
   * 是否为新建数据
   *
   * @type {boolean}
   */
  isNew: boolean;
  /**
   * 界面是否加载完毕
   *
   * @default false
   * @type {boolean}
   */
  isLoaded: boolean;
  /**
   * 设计界面数据是否已经变更，主要用于判断返回时的脏检查
   *
   * @default false
   * @type {boolean}
   */
  isChanged: boolean;
  /**
   * 是否正在拖拽中
   *
   * @type {boolean}
   */
  isDragging: boolean;
  /**
   * 是否为预览模式
   */
  isPreview: boolean;
  /**
   * 当前设计步骤
   *
   * @default ReportDataSetStep.MODEL_CONFIG
   * @type {ReportDataSetStep, ReportDataSetStepBI}
   */
  step: ReportDataSetStep | ReportDataSetStepBI;
  /**
   * 图实例
   *
   * @type {Graph | null}
   */
  graph: Graph | null;
  /**
   * 当前选中激活的数据项
   *
   * @type {string}
   */
  active: string;
  /**
   * 当前选中激活的连线 ID
   *
   * @type {string}
   */
  activeLink: string;
  /**
   * 节点数据
   *
   * @type {INodeData[]}
   */
  nodes: INodeData[];
  /**
   * 节点连线数据
   *
   * @type {ILinkData[]}
   */
  links: ILinkData[];
  /**
   * 选中的字段数据配置
   *
   * @type {IFieldData[]}
   */
  fields: IFieldData[];
  /**
   * 选中模型字段（非自建公式字段）
   *
   * @type {IFieldData[]}
   */
  modelFields: IFieldData[];
  /**
   * X6 布局工具
   *
   * @type {DagreLayout}
   */
  x6Layout: DagreLayout;
  /**
   * 拖拽实例
   *
   * @type {Dnd | null}
   */
  dnd: Dnd | null;
  /**
   * 模型缓存映射表
   *
   * @type {Map<string, ModelMetaDTO>}
   */
  modelMap: Map<string, ModelMetaDTO>;
  /**
   * 后台数据
   *
   * @type {ReportDataSetResponse}
   */
  data: ReportDataSetResponse;
}
