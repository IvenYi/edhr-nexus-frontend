import { defineStore } from 'pinia';
import {
  IFieldData,
  ILinkData,
  INodeData,
  IReportDataSetActions,
  IReportDataSetGetters,
  IReportDataSetState,
} from '../interface';
import { Edge, Graph, Model } from '@antv/x6';
import { createUUID } from 'qx-util';
import { DATA_PREVIEW_CONNECTOR, SHAPE_TYPE } from '../constants';
import { Dnd } from '@antv/x6-plugin-dnd';
import { FIELD_TYPE, FieldMetaDTO } from '@gct/runtime';
import {
  getReportDataSetInfo,
  postReportDataSet,
  postReportDataSetPreview,
  postReportDataSetUpdateName,
  putReportDataSetById,
} from '/@/apis/gct-apaas/ReportDataSetController';
import { ReportDataSetState } from '../state';
import {
  ModelFieldInfo,
  ReportDataSetConditionDTO,
  ReportDataSetRequest,
  ReportSingleJoin,
} from '/@/apis/gct-apaas/model';
import { SqlLinkModeEnum } from '../enums';
import { message } from 'ant-design-vue';
import { getModelMetaDetail } from '/@/apis/gct-apaas/ModelMetaController';
import { filterReportFields } from '../../report-design/utils';
import { getLabelSvgCfg } from '../utils';
import { getDatabaseColumnInformation } from '/@/apis/gct-platform/DatabaseController';
import { ColumnInformationSchema } from '/@/apis/gct-platform/model';
import { getBiDataSetInfo, postBiDataSetPreview } from '/@/apis/gct-platform/BiDataSetController';
import { BIFieldTypeEnum } from '/@/projects/bi-designer/src/views/data-set/interface/type';

/**
 * 报表数据源设计状态
 *
 * @export
 * @interface IReportDataSetState
 * @extends {StateTree}
 */
export const useReportDataSetDesignStore = defineStore<
  'reportDataSet',
  IReportDataSetState,
  IReportDataSetGetters,
  IReportDataSetActions
>('reportDataSet', {
  state: () => {
    return new ReportDataSetState();
  },
  getters: {
    getActiveNodeData() {
      return this.active ? this.nodes.find((node) => node.id === this.active) || null : null;
    },
    getActiveLinkData() {
      // 新增：获取当前选中的连线数据
      return this.activeLink
        ? this.links.find((link) => link.id === this.activeLink) || null
        : null;
    },
  },
  actions: {
    async setActive(id: string) {
      if (this.isPreview === true) {
        return; // 预览模式下不允许选中节点
      }
      if (id && this.activeLink) {
        const activeLink = this.activeLink;
        await this.setActiveLink('');
        this.updateLineLabelState(activeLink);
      }
      this.active = id;
    },
    async setActiveLink(id: string) {
      // 新增：设置当前选中的连线
      if (this.isPreview === true) {
        return; // 预览模式下不允许选中节点
      }
      this.activeLink = id;
      if (id && this.active) {
        // 如果选中了连线，且有节点被选中
        this.active = ''; // 取消节点选中
        if (this.graph) {
          this.graph.cleanSelection(); // 清除X6画布上的节点选中（如果API支持）
        }
      }
      if (this.graph) {
        this.graph.getEdges().forEach((edge) => {
          if (edge.shape === SHAPE_TYPE.EMPTY_LINK) {
            edge.setAttrs({
              line: {
                stroke: 'transparent',
              },
            });
            return;
          }
          if (edge.id === id) {
            edge.setAttrs({
              line: {
                stroke: 'var(--gct-color-primary)',
              },
            });
            edge.setZIndex(5);
          } else {
            edge.setAttrs({
              line: {
                stroke: 'rgba(217, 217, 217, 1)',
              },
            });
            edge.setZIndex(1);
          }
        });
      }
      this.links
        .filter((link) => {
          return link.type !== SHAPE_TYPE.EMPTY_LINK;
        })
        .forEach((link) => {
          this.updateLineLabelState(link.id);
        });
    },
    setModelFields() {
      this.modelFields = this.fields.filter((i) => i.modelKey);
    },
    setGraph(graph: Graph) {
      this.graph = graph as any;
      if (!this.graph) {
        return;
      }
      this.dnd = new Dnd({
        target: graph,
        delegateGraphOptions: {},
      }) as any;
      const _start = (this.dnd as any).start;
      const _onDropped = (this.dnd as any).onDropped;
      const _onDragEnd = (this.dnd as any).onDragEnd;
      (this.dnd as any).start = (...args) => {
        this.isDragging = true;
        return _start.call(this.dnd, ...args);
      };
      (this.dnd as any).onDropped = (...args) => {
        this.isDragging = false;
        return _onDropped.call(this.dnd, ...args);
      };
      (this.dnd as any).onDragEnd = (args) => {
        const res = _onDragEnd.call(this.dnd, args);
        this.isDragging = false;
        this.hideDropLayout();
        return res;
      };
      // 配置高亮样式
      this.graph.on('node:highlight', ({ node }) => {
        node.setAttrs({
          body: {
            class: 'node-empty-highlight',
          },
        });
      });
      this.graph.on('node:unhighlight', ({ node }) => {
        node.setAttrs({
          body: {
            class: '',
          },
        });
      });

      // 监听连线点击
      this.graph.on('edge:click', ({ edge }) => {
        const data = edge.getData<ILinkData>();
        if (data.type === SHAPE_TYPE.EMPTY_LINK) {
          return;
        }
        this.setActiveLink(edge.id);
      });

      // 监听画布空白处点击，取消所有选中
      this.graph.on('blank:click', async () => {
        if (this.active) {
          await this.setActive(''); // 取消节点选中
        }
        if (this.activeLink) {
          const activeLink = this.activeLink;
          await this.setActiveLink(''); // 取消连线选中
          this.updateLineLabelState(activeLink); // 更新连线标签状态
        }
        graph.cleanSelection();
      });
    },
    async setNode(data: INodeData, updateLayout: boolean = true) {
      const i = this.nodes.findIndex((item) => item.id === data.id);
      if (i > -1) {
        this.nodes[i] = data;
      } else {
        this.nodes.push(data);
        data.fields = [];
        data.databaseId && (this.databaseId = data.databaseId);
        const fields = await this.loadModelFields(data.modelKey);
        const fieldIds = fields.map((field) => field.id!);
        this.addFields(data, fieldIds);
        data.fields = fieldIds;
      }
      this.isChanged = true;

      // 遍历所有节点，检查并补充空节点
      this.nodes.forEach((currentNode) => {
        if (currentNode.type === SHAPE_TYPE.EMPTY) {
          return; // 空节点不需要后置空节点
        }

        // 1. 过滤出当前节点为起点的所有连线
        const linksFromCurrentNode = this.links.filter((item) => item.source === currentNode.id);
        let needsEmptyNode = true;

        if (linksFromCurrentNode.length > 0) {
          // 连线存在，过滤出所有的目标节点
          const targetIds = linksFromCurrentNode.map((item) => item.target);
          const targetNodes = this.nodes.filter((item) => targetIds.includes(item.id));
          // 2. 如果目标节点中存在空的节点，则不需要添加
          const hasEmptyTargetNode = targetNodes.some((item) => item.type === SHAPE_TYPE.EMPTY);
          if (hasEmptyTargetNode) {
            needsEmptyNode = false;
          }
        }

        if (needsEmptyNode) {
          const emptyNode: INodeData = {
            id: createUUID(),
            type: SHAPE_TYPE.EMPTY,
            modelKey: '',
            modelName: '',
            modelCategory: '',
            fields: [],
          };
          this.nodes.push(emptyNode);
          this.links.push({
            id: createUUID(),
            source: currentNode.id,
            target: emptyNode.id,
            type: SHAPE_TYPE.EMPTY_LINK,
            joinType: SqlLinkModeEnum.LEFT,
            fields: [],
            sourceFilter: {},
            targetFilter: {},
          });
        }
      });

      if (updateLayout) {
        this.updateX6Layout();
      }
    },
    async setLink(data: ILinkData, updateLayout: boolean = false) {
      const i = this.links.findIndex((item) => item.id === data.id);
      if (i > -1) {
        this.links[i] = data;
      } else {
        this.links.push(data);
      }
      if (updateLayout) {
        this.updateX6Layout();
      }
    },

    /**
     * 递归删除指定节点及其所有下游节点和相关连线。
     * “下游节点”指的是从初始节点开始，通过一系列出向连线可以到达的所有节点。
     * 此操作会：
     * 1. 识别并收集初始节点及其所有可达的下游节点。
     * 2. 从状态中移除所有这些被识别的节点。
     * 3. 从状态中移除所有与这些被删除节点相关的连线（即，连线的源或目标是被删除的节点）。
     * 4. （可选）更新图形用户界面布局以反映这些更改。
     * 5. 如果当前激活的节点是被删除的节点之一，则清除激活状态。
     *
     * @param {string} id 要删除的初始节点的 ID。
     * @param {boolean} [updateLayout=true] 是否在删除后更新图形布局，默认为 true。
     * @returns {void}
     */
    removeNode(id: string, updateLayout: boolean = true): void {
      const initialNodeId: string = id;

      // 检查初始节点是否存在于当前节点列表中
      const initialNodeExists: boolean = this.nodes.some((node) => node.id === initialNodeId);
      if (!initialNodeExists) {
        // 如果初始节点不存在，则不执行任何操作并直接返回
        return;
      }

      // 步骤 1: 收集所有需要递归删除的节点 ID (广度优先搜索)
      const allNodeIdsToRemove: Set<string> = new Set<string>(); // 存储所有待删除节点的 ID
      const queue: string[] = []; // BFS 队列

      // 将初始节点加入待删除集合和队列
      allNodeIdsToRemove.add(initialNodeId);
      queue.push(initialNodeId);

      let head: number = 0; // 队列头部指针，避免频繁 unshift 操作带来的性能开销
      while (head < queue.length) {
        const currentNodeId: string = queue[head++]; // 从队列中取出一个节点 ID

        // 找到从当前节点出发的所有出向连线
        const outgoingLinks: ILinkData[] = this.links.filter(
          (link) => link.source === currentNodeId,
        );

        for (const link of outgoingLinks) {
          const targetNodeId: string = link.target;
          // 如果目标节点尚未被标记为待删除，则将其加入集合和队列，以便进一步处理其下游节点
          if (!allNodeIdsToRemove.has(targetNodeId)) {
            allNodeIdsToRemove.add(targetNodeId);
            queue.push(targetNodeId);
          }
        }
      }

      // 步骤 2: 更新节点列表 (this.nodes)
      // 通过过滤移除所有在 allNodeIdsToRemove 集合中的节点，保留未被删除的节点
      this.nodes = this.nodes.filter((node) => !allNodeIdsToRemove.has(node.id));

      // 步骤 3: 更新连线列表 (this.links)
      // 移除任何其源节点或目标节点在 allNodeIdsToRemove 集合中的连线
      // 这样可以确保图中不保留指向已删除节点或从已删除节点出发的悬空连线
      this.links = this.links.filter(
        (link) => !allNodeIdsToRemove.has(link.source) && !allNodeIdsToRemove.has(link.target),
      );

      // 在更新 links 之后，检查 activeLink 是否仍然有效
      if (this.activeLink && !this.links.some((link) => link.id === this.activeLink)) {
        this.activeLink = ''; // 如果选中的连线被删除了，则清除选中状态
      }

      // 步骤 4: 如果需要更新图形布局 (updateLayout 为 true)
      if (updateLayout) {
        this.updateX6Layout(); // 调用 updateX6Layout 方法重新渲染整个图形

        // 检查当前激活的节点是否在被删除的节点集合中
        if (this.active && allNodeIdsToRemove.has(this.active)) {
          this.active = ''; // 清除 store 中的 active 状态
          if (this.graph) {
            this.graph.cleanSelection(); // 清除 X6 画布上的选中状态（如果 graph 实例存在）
          }
        }
      }

      // 步骤 5: 删除所有被删除节点的相关字段
      this.fields = this.fields.filter((field) => !allNodeIdsToRemove.has(field.modelKey));
      this.setModelFields();
    },

    updateX6Layout() {
      if (!this.graph) {
        return;
      }
      const data: Model.FromJSONData = {
        edges: [],
        nodes: [],
      };
      this.nodes.forEach((item) => {
        let shape = SHAPE_TYPE.NODE;
        if (item.type === SHAPE_TYPE.EMPTY) {
          shape = SHAPE_TYPE.EMPTY;
        }
        data.nodes!.push({
          id: item.id,
          shape,
          zIndex: 10,
          data: item,
        });
      });
      this.links.forEach((item) => {
        let shape = SHAPE_TYPE.LINK;
        if (item.type === SHAPE_TYPE.EMPTY_LINK) {
          shape = SHAPE_TYPE.EMPTY_LINK;
        }
        const cfg: Edge.Metadata = {
          id: item.id,
          shape,
          source: {
            cell: item.source,
            port: `${item.source}-out`,
          },
          target: {
            cell: item.target,
            port: `${item.target}-in`,
          },
          data: item,
        };
        if (item.type === SHAPE_TYPE.LINK) {
          cfg.labels = [this.getLineLabelCfg(item)];
        }
        data.edges!.push(cfg);
      });
      const json = this.x6Layout.layout(data as any);
      this.graph.fromJSON(json);
    },
    showDropLayout() {
      if (this.graph) {
        this.graph.getEdges().forEach((edge) => {
          if (edge.shape === SHAPE_TYPE.EMPTY_LINK) {
            edge.setAttrs({
              line: {
                stroke: 'rgba(217, 217, 217, 1)',
              },
            });
          }
        });
      }
    },
    hideDropLayout() {
      if (this.graph) {
        this.graph.getEdges().forEach((edge) => {
          if (edge.shape === SHAPE_TYPE.EMPTY_LINK) {
            edge.setAttrs({
              line: {
                stroke: 'transparent',
              },
            });
          }
        });
      }
    },
    findLinkByTarget(target: string) {
      const i = this.links.findIndex((item) => item.target === target);
      if (i > -1) {
        return this.links[i];
      }
      return null;
    },
    updateLineLabelState(id) {
      const link = this.graph?.getEdges().find((edge) => edge.id === id);
      if (link) {
        link.setLabels([this.getLineLabelCfg(id)]);
      }
    },
    getLineLabelCfg(data: string | IObject) {
      if (typeof data === 'string') {
        data = this.getLink(data) as ILinkData;
      }
      const link = data as ILinkData;
      const isActive = this.activeLink === link.id;
      const isError =
        link.fields.length === 0 ||
        link.fields.findIndex((item) => {
          const [left, right] = item;
          return !left || !right;
        }) > -1;

      return getLabelSvgCfg(isActive, isError, link.joinType);
    },
    destroy() {
      // 界面销毁时重置界面状态
      this.$state = new ReportDataSetState() as any;
    },
    async loadModelFields(modelKey: string, isFilter: boolean = true): Promise<FieldMetaDTO[]> {
      /**
       * bi模式下的方法兼容
       * loadModelFieldsBI
       * author: cuihuidong
       */
      if (this.isBI) {
        const DataBI = await this.loadModelFieldsBI(modelKey, isFilter);
        return DataBI || [];
      }
      if (this.modelMap.has(modelKey)) {
        const data = this.modelMap.get(modelKey)!;
        if (data.fieldMetaList && data.fieldMetaList.length > 0 && isFilter) {
          return filterReportFields(data.fieldMetaList);
        }
        return data.fieldMetaList || [];
      }
      const data = await getModelMetaDetail({ modelKey });
      if (data) {
        // 支持的字段列表和报表一致，这里过滤一下
        const items = data.fieldMetaList || [];
        this.modelMap.set(modelKey, data);
        if (items.length > 0 && isFilter) {
          return filterReportFields(items);
        }
        return items || [];
      }
      return [];
    },
    async load(key: string): Promise<void> {
      /**
       * bi模式下的接口兼容
       * loadBI
       * author: cuihuidong
       */
      if (this.isBI) {
        this.loadBI(key);
        return;
      }
      const data = await getReportDataSetInfo({ id: key });
      if (data) {
        this.data = data;
        if (data.models) {
          const json = JSON.parse(data.models);
          this.nodes = json.nodes;
          this.links = json.links;
          this.fields = json.fields;
          this.isNew = false;
        }
      }
      this.setModelFields();
      this.isLoaded = true;
    },
    async save(): Promise<void> {
      // 保存前，确保所有模型都已加载，避免保存内容时格式错误
      const hasModleKeyList = this.fields.filter((i) => i.modelKey);
      for (let i = 0; i < hasModleKeyList.length; i++) {
        const item = hasModleKeyList[i];
        let model = this.modelMap.get(item.modelKey);
        if (!model) {
          await this.loadModelFields(item.modelKey);
          model = this.modelMap.get(item.modelKey)!;
        }
      }
      if (this.data.id) {
        await putReportDataSetById({ id: this.data.id }, this.getSavaData());
      } else {
        await postReportDataSet(this.getSavaData());
      }
      message.success('保存成功');
      this.isChanged = false;
    },
    async saveName(): Promise<void> {
      if (this.data.id) {
        await postReportDataSetUpdateName({
          id: this.data.id,
          name: this.data.name,
          description: this.data.description,
        });
      }
      message.success('名称保存成功');
    },
    getConfigBackendData(
      nodes: INodeData[],
      links: ILinkData[],
      fields: IFieldData[],
      isPreview?: boolean,
    ): IObject | null {
      const data = {} as IObject;
      links = links.filter((link) => {
        if (link.fields.filter((item) => item[0] && item[1]).length === 0) {
          // 如果连线没有配置属性映射，则认为是空连线，不参与关联
          return false;
        }
        return link.type !== SHAPE_TYPE.EMPTY_LINK;
      });
      data.fieldConfig = {
        fields: fields.map<ModelFieldInfo>((item) => {
          if (item.fieldType === FIELD_TYPE.FUNCTION) {
            return {
              fieldKey: item.fieldKey,
              fieldName: item.label,
              fieldType: FIELD_TYPE.FUNCTION,
              // 传后台转义过后的表达式
              expression: item.compileExpr,
              functionName: item.functionName,
              originFieldKey: '',
              originModelKey: '',
              originModelType: '',
              mappingType: item.mappingType || item.expression?.mappingType,
            };
          }
          // 标准模型
          const model = this.modelMap.get(item.modelKey)!;
          const field = model.fieldMetaList!.find((_) => _.id === item.id)! as any;
          let key = item.key || field.key;
          if (isPreview) {
            key = `${model.key?.toLowerCase()}${DATA_PREVIEW_CONNECTOR}${field.key?.toLowerCase()}`;
          }
          if (model.modelCategory === 'view') {
            return {
              fieldKey: key,
              fieldName: item.label,
              fieldType: field.type,
              originFieldKey: field.originFieldKey,
              originModelKey: field.originModelKey,
              originModelType: model.modelCategory,
              viewFieldKey: field.key,
              viewModelKey: model.key,
            };
          }
          return {
            fieldKey: key,
            fieldName: item.label,
            fieldType: field.type,
            originFieldKey: field.key,
            originModelKey: model.key,
            originModelType: model.modelCategory,
          };
        }),
      };
      const mainNode = nodes[0];
      if (mainNode && links.length > 0) {
        const mainModel = this.modelMap.get(mainNode.modelKey)!;
        data.joinConfig = {
          mainModelKey: mainModel.key,
          mainModelType: mainModel.modelCategory,
          joins: links.map<ReportSingleJoin>((link) => {
            const sourceModel = this.modelMap.get(link.source)!;
            const targetModel = this.modelMap.get(link.target)!;
            return {
              modelKey: targetModel.key,
              modelType: targetModel.modelCategory,
              rightFilterConfig: link.targetFilter?.dataRule,
              sourceModelKey: sourceModel.key,
              sourceModelType: sourceModel.modelCategory,
              leftFilterConfig: link.sourceFilter?.dataRule,
              type: link.joinType,
              onExpressions: link.fields
                .filter((field) => field[0] && field[1])
                .map((item) => {
                  const [left, target] = item;
                  const leftField = sourceModel.fieldMetaList!.find((_) => _.id === left)!;
                  const rightField = targetModel.fieldMetaList!.find((_) => _.id === target)!;

                  const data: any = {
                    operator: '=',
                  };

                  if (leftField) {
                    data.leftFieldKey = leftField.key;
                    data.leftModelKey = sourceModel.key;
                  }

                  if (rightField) {
                    data.rightFieldKey = rightField.key;
                    data.rightModelKey = targetModel.key;
                  }

                  return data;
                })
                .filter((item) => {
                  // 过滤掉无效的连接条件
                  return item.leftFieldKey && item.rightFieldKey;
                }),
            };
          }),
        };
      }
      return data;
    },
    getSavaData() {
      const data = this.data as ReportDataSetRequest;
      data.models = JSON.stringify({
        nodes: this.nodes,
        links: this.links,
        fields: this.fields,
      });
      const cfgData = this.getConfigBackendData(this.nodes, this.links, this.fields);
      if (cfgData) {
        Object.assign(data, cfgData);
      }
      return data;
    },
    /**
     * 获取预览数据配置
     *
     * @description 根据节点和连线配置生成预览需要的后台配置数据
     * @param {string} nodeKey - 节点键
     * @param {string} [linkKey] - 连线键，可选
     * @returns {Promise<ReportDataSetConditionDTO | null>} 预览数据配置或null
     */
    async getPreviewData(
      nodeKey: string,
      linkKey?: string,
    ): Promise<ReportDataSetConditionDTO | null> {
      const node = this.getNode(nodeKey);
      if (!node) {
        console.warn(`Node with key ${nodeKey} not found.`);
        return null;
      }

      const data = { pageNo: 1, pageSize: 100 } as ReportDataSetConditionDTO;
      const nodes: INodeData[] = [];
      const links: ILinkData[] = [];

      if (linkKey) {
        // 如果给了 linkKey，则包含 link 里的 source 和 target 两个节点
        const link = this.getLink(linkKey);
        if (!link) {
          console.warn(`Link with key ${linkKey} not found.`);
          return null;
        }

        // 检查连线是否配置了属性映射
        if (link.fields.length <= 0) {
          console.warn('连线未配置属性映射，请先配置属性映射。');
          return null;
        }

        const sourceNode = this.getNode(link.source);
        const targetNode = this.getNode(link.target);

        if (!sourceNode || !targetNode) {
          console.warn(`Source node ${link.source} or target node ${link.target} not found.`);
          return null;
        }

        // 添加节点和连线
        nodes.push(sourceNode, targetNode);
        links.push(link);

        // 加载节点的模型数据
        await this.loadModelFields(sourceNode.modelKey);
        await this.loadModelFields(targetNode.modelKey);

        // 生成配置数据，过滤出与该连线相关的字段
        const cfgData = this.getConfigBackendData(
          nodes,
          links,
          this.fields.filter((field) => {
            return field.modelKey === link.source || field.modelKey === link.target;
          }),
          true,
        );

        if (cfgData) {
          Object.assign(data, cfgData);
        }
      } else {
        // 如果只给了 nodeKey，只使用指定的节点数据
        nodes.push(node);

        // 加载节点的模型数据
        await this.loadModelFields(node.modelKey);

        // 生成配置数据，只包含该节点的字段
        const cfgData = this.getConfigBackendData(
          nodes,
          links,
          this.fields.filter((field) => {
            return field.modelKey === node.modelKey;
          }),
          true,
        );

        if (cfgData) {
          Object.assign(data, cfgData);
        }
      }

      return data;
    },
    getNode(id) {
      const i = this.nodes.findIndex((item) => item.id === id);
      if (i > -1) {
        return this.nodes[i];
      }
      return null;
    },
    getLink(id) {
      const i = this.links.findIndex((item) => item.id === id);
      if (i > -1) {
        return this.links[i];
      }
      return null;
    },
    async addFields(node: INodeData, keys: string[]) {
      const fields = this.modelMap.get(node.modelKey)?.fieldMetaList;
      if (!fields) {
        if (node.databaseId && !this.databaseId) {
          this.databaseId = node.databaseId;
        }
        const items = await this.loadModelFields(node.modelKey);
        if (items.length > 0) {
          return this.addFields(node, keys);
        }
      }
      if (fields) {
        const selectedFields = fields.filter((item) => keys.includes(item.id!));
        selectedFields.forEach((item) => {
          this.fields.push({
            id: item.id!,
            label: ``,
            key: item.key!,
            fieldKey: item.key!,
            fieldType: item.type!,
            modelKey: node.modelKey,
            modelCategory: node.modelCategory,
          });
        });
      }
      this.setModelFields();
    },
    removeFields(_node: INodeData, keys: string[]) {
      keys.forEach((key) => {
        const i = this.fields.findIndex((item) => item.id === key);
        if (i > -1) {
          this.fields.splice(i, 1);
        }
      });
      this.setModelFields();
    },
    async loadPreviewData(nodeKey?: string, linkKey?: string) {
      let data: IObject | null = null;
      if (nodeKey) {
        data = await this.getPreviewData(nodeKey, linkKey);
      } else {
        data = this.getConfigBackendData(this.nodes, this.links, this.fields);
        if (data) {
          Object.assign(data, { pageNo: 1, pageSize: 100 });
        }
      }
      if (
        data &&
        data.fieldConfig &&
        data.fieldConfig.fields &&
        data.fieldConfig.fields.length > 0
      ) {
        /**
         * bi模式下的接口兼容
         * author: cuihuidong
         * postBiDataSetPreview
         */
        if (this.isBI) {
          return await this.getDatabasePageListBI(nodeKey!, data);
        }
        const res = await postReportDataSetPreview(data);
        if (res) {
          const items = res.data || [];
          const dict = res.dict;
          // if (dict && items.length > 0) {
          //   const keys = Object.keys(dict);
          //   items.forEach((item) => {
          //     keys.forEach((key) => {
          //       const val = item[key];
          //       if (val) {
          //         item[key] = dict[key][val] || val;
          //       }
          //     });
          //     return item;
          //   });
          // }
          return res;
        }
      }
      return null;
    },
    async validateLinks(): Promise<boolean> {
      if (this.links.length > 0) {
        const linkItem = this.links
          .filter((link) => {
            if (link.type === SHAPE_TYPE.EMPTY_LINK) {
              return false; // 跳过空连线
            }
            return true; // 其他情况认为配置完整
          })
          .find((link) => {
            if (link.fields && link.fields.length > 0) {
              for (let index = 0; index < link.fields.length; index++) {
                const element = link.fields[index];
                if (!element[0] || !element[1]) {
                  return true;
                }
              }
            }
            if (link.fields.length === 0) {
              return true;
            }
            return false;
          });
        if (linkItem) {
          message.error(window.$t('sys.dataSet.dataSetModelConfigError'));
          return false;
        }
      }
      return true;
    },
    /**
     * BI相关方法
     * author: cuihuidong
     */
    async loadBI(key: string): Promise<void> {
      const data = await getBiDataSetInfo({ id: key });
      if (data) {
        this.data = data as any;
        if (data.models) {
          const json = JSON.parse(data.models);
          this.nodes = json.nodes;
          this.links = json.links;
          this.fields = json.fields;
          this.isNew = false;
        }
      }
      this.isLoaded = true;
      this.setModelFields();
      if (this.links.length == 1 && this.links?.[0].type == 'data-set-design-empty-link') {
        this.setActive(this.nodes?.[0].id);
      } else {
        this.setActiveLink(this.links?.[0].id);
        setTimeout(() => {
          this.setActiveLink(this.links?.[0].id);
        }, 200);
      }
    },

    async getDatabasePageListBI(nodeKey: string, data: any) {
      const newFields = this.uniqueByKey(data.fieldConfig.fields, 'fieldKey');
      data.fieldConfig.fields = newFields;
      const res =
        (await postBiDataSetPreview({
          ...data,
          pnDataset: { databaseId: this.databaseId },
        })) || {};
      const configData = {
        totalCount: res.total,
        data: res.sqlResult?.rows || [],
      };
      return configData;
    },

    uniqueByKey(arr, key) {
      const map = new Map();
      return arr.filter((item) => {
        // 如果 map 中没有该 key，则添加并保留当前项
        if (!map.has(item[key])) {
          map.set(item[key], true);
          return true;
        }
        return false;
      });
    },

    async loadModelFieldsBI(modelKey: string, isFilter: boolean = true) {
      if (this.modelMap.has(modelKey)) {
        const data = this.modelMap.get(modelKey)!;
        if (data.fieldMetaList && data.fieldMetaList.length > 0 && isFilter) {
          // return filterReportFields(data.fieldMetaList);
          return data.fieldMetaList;
        }
        return data.fieldMetaList || [];
      }
      const res: ColumnInformationSchema[] =
        (await getDatabaseColumnInformation({
          id: this.databaseId,
          tbName: modelKey,
        })) || [];
      if (res?.length) {
        const fieldMetaList = res?.map((i) => {
          return {
            id: modelKey + '&' + i.column + '&' + i.columnType,
            key: i.column,
            type: this.fieldTypeMapping(i.columnType!),
            columnType: i.columnType,
            name: i.column,
            modelKey,
          };
        });

        const data = {
          key: modelKey,
          name: modelKey,
          databaseId: this.databaseId,
          modelCategory: '',
          fieldMetaList,
        };

        // 支持的字段列表和报表一致，这里过滤一下
        const items = data.fieldMetaList || [];
        this.modelMap.set(modelKey, data);
        if (items.length > 0 && isFilter) {
          // return filterReportFields(items);
          return items;
        }
        return items || [];
      }
      return [];
    },

    fieldTypeMapping(type: string) {
      let fieldType = BIFieldTypeEnum.TEXT;
      if (['integer', 'long', 'int4', 'int8', 'bytea', 'float8', 'numeric'].includes(type)) {
        fieldType = BIFieldTypeEnum.NUMBER;
      } else if (['date', 'timestamp'].includes(type)) {
        fieldType = BIFieldTypeEnum.DATE;
      } else {
        fieldType = BIFieldTypeEnum.TEXT;
      }
      return fieldType;
    },
  },
});
