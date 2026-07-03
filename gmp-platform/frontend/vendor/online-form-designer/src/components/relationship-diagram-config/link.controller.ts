import { Connection, uuid } from '@jsplumb/browser-ui';
import { LinkType } from './constant';
import { IRelationshipDiagramLink } from './interface';
import { RelationshipDiagramConfigController } from './relationship-diagram-config.controller';

/**
 * 连线控制器
 *
 * @author zhanghanrui
 * @date 2024-06-25 14:06:19
 * @export
 * @class LinkController
 */
export class LinkController {
  constructor(protected readonly c: RelationshipDiagramConfigController) {}

  /**
   * 创建连线
   *
   * @author zhanghanrui
   * @date 2024-06-26 16:06:24
   * @param {IData} data
   * @return {*}  {IRelationshipDiagramLink}
   */
  create(data: IData): IRelationshipDiagramLink {
    // 最新线的下标
    const i = this.c.state.links.length;
    const link = {
      id: uuid(),
      i,
      type: LinkType.DEFAULT,
      reverse: false,
      return: (i + 1) % this.c.config.lineCount === 0,
      startLine: Math.floor(i / 3) + 1,
      dashed: false,
      ...(data as any),
    };
    this.c.state.links.push(link);
    setTimeout(() => {
      this.c.connect(link);
    }, 0);
    return link;
  }

  /**
   * 更新连线数据
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:51
   * @param {IRelationshipDiagramLink} link
   */
  update(link: IRelationshipDiagramLink): void {
    const data = this.get(link.id);
    if (data) {
      this.clearLinks([link]);
      Object.assign(data, link);
      this.c.connect(link);
    }
  }

  /**
   * 获取连线数据
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:43
   * @param {string} id
   * @return {*}  {(IRelationshipDiagramLink | null)}
   */
  get(id: string): IRelationshipDiagramLink | null {
    return this.c.state.links.find((link) => link.id === id) ?? null;
  }

  /**
   * 根据起始节点查找连线
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:19
   * @param {string} source
   * @return {*}  {(IRelationshipDiagramLink | null)}
   */
  getBySource(source: string): IRelationshipDiagramLink | null {
    return this.c.state.links.find((link) => link.source === source) ?? null;
  }

  /**
   * 根据结束节点查找连线
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:50
   * @param {string} target
   * @return {*}  {(IRelationshipDiagramLink | null)}
   */
  getByTarget(target: string): IRelationshipDiagramLink | null {
    return this.c.state.links.find((link) => link.target === target) ?? null;
  }

  /**
   * 删除连线数据，删除当前指定连线后所有数据
   *
   * @author zhanghanrui
   * @date 2024-06-25 14:06:48
   * @param {string} id
   */
  delete(id: string): void {
    const i = this.c.state.links.findIndex((link) => link.id === id);
    if (i !== -1) {
      const links = this.c.state.links.splice(i, this.c.state.links.length);
      this.clearLinks(links);
    }
  }

  /**
   * 清除已经绘制的连线
   *
   * @author zhanghanrui
   * @date 2024-06-27 13:06:08
   * @protected
   * @param {IRelationshipDiagramLink[]} links
   */
  protected clearLinks(links: IRelationshipDiagramLink[]): void {
    const connections = this.c.plumb.getConnections() as Connection<any>[];
    connections.forEach((item) => {
      const link = links.find((_) => item.data.id === _.id);
      if (link) {
        this.c.plumb.deleteConnection(item);
      }
    });
  }
}
