import {
  BrowserJsPlumbInstance,
  ConnectParams,
  Connection,
  EVENT_CONNECTION_CLICK,
  newInstance,
} from '@jsplumb/browser-ui';
import { RelationshipDiagramConfigState } from './relationship-diagram-config.state';
import { NodeController } from './node.controller';
import { LinkController } from './link.controller';
import { IRelationshipDiagramLink, IRelationshipDiagramOptions } from './interface';
import { RegisterUtil } from './utils';
import { ModelMetaDTO } from '/@/apis/gct-apaas/model';
import {
  getModelMetaDetail,
  getModelMetaListModelReferencedBy,
} from '/@/apis/gct-apaas/ModelMetaController';

/**
 * 图形内控制器
 *
 * @author zhanghanrui
 * @date 2024-06-25 09:06:30
 * @export
 * @class RelationshipDiagramConfigController
 */
export class RelationshipDiagramConfigController {
  /**
   * 组件绘制完成后设置
   *
   * @author zhanghanrui
   * @date 2024-06-25 15:06:08
   * @type {HTMLDivElement}
   */
  container!: HTMLDivElement;

  /**
   * 界面状态
   *
   * @author zhanghanrui
   * @date 2024-06-25 09:06:41
   * @type {RelationshipDiagramConfigState}
   */
  state: RelationshipDiagramConfigState = new RelationshipDiagramConfigState();

  /**
   * 画线工具实例
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:11
   * @type {BrowserJsPlumbInstance}
   */
  plumb!: BrowserJsPlumbInstance;

  readonly node = new NodeController(this);

  readonly link = new LinkController(this);

  /**
   * 组件配置
   *
   * @author zhanghanrui
   * @date 2024-06-28 15:06:35
   * @type {IRelationshipDiagramOptions}
   */
  readonly config: IRelationshipDiagramOptions = {
    lineCount: 3,
    oneDirection: true,
  };

  /**
   * 临时窗口内加载的模型缓存
   *
   * @author zhanghanrui
   * @date 2024-06-28 10:06:43
   * @protected
   * @type {IData}
   */
  protected modelMap: IData = {};

  /**
   * 临时窗口内加载的引用模型清单缓存
   *
   * @author zhanghanrui
   * @date 2024-06-28 10:06:55
   * @protected
   * @type {IData}
   */
  protected modelListMap: IData = {};

  /**
   * 初始化画线工具
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:25
   * @param {HTMLDivElement} el
   */
  initPlumb(el: HTMLDivElement): void {
    this.container = el;
    this.plumb = newInstance({
      container: el,
      // 禁止连线解除
      connectionsDetachable: false,
      // 禁止元素拖动
      elementsDraggable: false,
    });
    this.plumb.bind(EVENT_CONNECTION_CLICK, (conn) => {
      if (conn) {
        const data = conn.data as IRelationshipDiagramLink;
        const p = RegisterUtil.getLink(data.type);
        if (p && p.click) {
          p.click(this, data);
        }
      }
    });
  }

  connectAll(): void {
    this.plumb.deleteEveryConnection();
    this.state.links.forEach((link) => {
      this.connect(link);
    });
  }

  connect(link: IRelationshipDiagramLink): void {
    const linkProvider = RegisterUtil.getLink(link.type);

    if (!linkProvider) {
      console.error(`未找到连线适配器类型：[${link.type}]`);
      return;
    }

    const items = Array.from(this.container.children);
    let source = items.find((el) => el.id === link.source);
    let target = items.find((el) => el.id === link.target);

    if (!source || !target) {
      console.error(`未找到连线源或目标节点：[${link.source}]、[${link.target}]`);
      return;
    }

    if (linkProvider.sourceHandle) {
      source = source.getElementsByClassName(linkProvider.sourceHandle)[0];
    }

    if (linkProvider.targetHandle) {
      target = target.getElementsByClassName(linkProvider.targetHandle)[0];
    }

    const _opts = linkProvider.options(this, link);

    const opts: ConnectParams<Element> = {
      data: link,
      source,
      target,
      ..._opts,
    };

    this.plumb.connect(opts);
  }

  /**
   * 断开连线
   *
   * @author zhanghanrui
   * @date 2024-06-27 17:06:43
   * @param {IRelationshipDiagramLink} link
   */
  disconnect(link: IRelationshipDiagramLink) {
    const connections = this.plumb.getConnections() as Connection<any>[];
    const connection = connections.find((c) => c.data.id === link.id);
    if (connection) {
      this.plumb.deleteConnection(connection);
    }
  }

  /**
   * 重绘连线
   *
   * @author zhanghanrui
   * @date 2024-06-26 17:06:31
   */
  redraw(count: number = 0): void {
    if (count > 10) {
      console.error('重绘失败');
      return;
    }
    setTimeout(() => {
      if (this.state.nodes.length === this.state.nodeCount) {
        this.connectAll();
      } else {
        this.redraw(count);
      }
    }, 100);
  }

  /**
   * 根据标识查询具体模型，并携带属性
   *
   * @author zhanghanrui
   * @date 2024-06-26 13:06:55
   * @param {string} modelKey
   * @return {*}  {Promise<ModelMetaDTO>}
   */
  async getModel(modelKey: string): Promise<ModelMetaDTO> {
    if (this.modelMap[modelKey]) {
      return this.modelMap[modelKey];
    }
    const data = await getModelMetaDetail({ modelKey });
    if (data) {
      this.modelMap[modelKey] = data;
      return data;
    }
    return Promise.reject(new Error(`${modelKey} model not found`));
  }

  /**
   * 获取引用了指定模型的模型列表
   *
   * @author zhanghanrui
   * @date 2024-06-29 18:06:47
   * @param {string} modelKey
   * @param {string} [fieldKey='']
   * @return {*}  {Promise<ModelMetaDTO[]>}
   */
  async getModelList(modelKey: string, fieldKey: string = ''): Promise<ModelMetaDTO[]> {
    const tag = `${modelKey}:${fieldKey}`;
    if (this.modelListMap[tag]) {
      return this.modelListMap[tag];
    }
    const data = await getModelMetaListModelReferencedBy({ modelKey });
    if (data) {
      this.modelListMap[tag] = data;
      return data;
    }
    return Promise.reject(new Error(`${tag} model list not found`));
  }

  /**
   * 清空所有
   *
   * @author zhanghanrui
   * @date 2024-06-29 17:06:11
   */
  clearAll(): void {
    this.state.links = [];
    this.state.nodes = [];
    if (this.plumb) {
      this.plumb.deleteEveryConnection();
    }
  }
}
