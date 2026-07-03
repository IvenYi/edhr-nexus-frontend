import {
  AnchorSpec,
  ConnectParams,
  DotEndpoint,
  DotEndpointParams,
  FlowchartConnector,
  FlowchartConnectorOptions,
} from '@jsplumb/browser-ui';
import { ILinkProvider, IRelationshipDiagramLink, IRelationshipDiagramNode } from '../../interface';
import { ArrowEndpoint, ArrowEndpointParams } from '../../plumb-plugin';
import { ConnectionDirection, LinkType, NodeType } from '../../constant';
import { RelationshipDiagramConfigController } from '../../relationship-diagram-config.controller';
import { useNamespace } from '@gct/runtime';
import { Modal } from 'ant-design-vue';
import './default-link-provider.scss';

/**
 * 默认连线适配器
 *
 * @author zhanghanrui
 * @date 2024-06-25 19:06:34
 * @export
 * @class DefaultLinkProvider
 * @implements {ILinkProvider}
 */
export class DefaultLinkProvider implements ILinkProvider {
  type = LinkType.DEFAULT;

  protected ns = useNamespace('diagram-config-default-link');

  sourceHandle: string = 'handle-select';

  deleteMessage: string = 'sys.pageDesigner.dataLinkage.confirm.title';

  protected reverse(c: RelationshipDiagramConfigController, link: IRelationshipDiagramLink): void {
    let data: IRelationshipDiagramNode | null = null;
    if (link.reverse) {
      data = c.node.get(link.target, 0, true);
    } else {
      data = c.node.get(link.source, 0, true);
    }
    if (data) {
      // 连线时正向时，采用正向连线相同方式备份
      if (link.reverse !== true) {
        c.node.cache.reverseClear(data, ConnectionDirection.FORWARD);
      } else {
        c.node.cache.reverseClear(data, ConnectionDirection.REVERSE);
      }
      // 先将前置的节点选择信息清空
      c.node.update(
        Object.assign(data, {
          value: null,
          label: null,
          noSelectField: link.reverse === true ? false : true,
        }),
      );
      if (!link.reverse) {
        // 目前是正的，恢复反的缓存
        if (c.node.cache.reverseReset(data, ConnectionDirection.REVERSE)) {
          return;
        }
      } else {
        // 目前是反的，恢复正的缓存
        if (c.node.cache.reverseReset(data, ConnectionDirection.FORWARD)) {
          return;
        }
      }
      if (!link.reverse) {
        // 建立后续的反转节点
        c.node.create(
          {
            type: NodeType.REVERSE,
            reverse: true,
          },
          {
            type: LinkType.VIRTUAL,
            reverse: true,
            dashed: true,
          },
        );
      }
    }
  }

  options(
    c: RelationshipDiagramConfigController,
    link: IRelationshipDiagramLink,
  ): ConnectParams<Element> {
    const t = (window as any).$t;
    // 默认从左往右画线 // [x, y, ox, oy]
    let anchors: [AnchorSpec, AnchorSpec] = link.reverse
      ? ['Left', [1, 0.5, 0, 0, 0, 14]]
      : ['Right', [0, 0.5, 0, 0, 0, 14]];
    if (link.return) {
      // 每行最后的线特殊画
      anchors = link.startLine % 2 === 1 ? ['Right', 'Right'] : ['Left', 'Left'];
    } else if (link.startLine % 2 === 0) {
      // topI 下标 +1 为当前行，双数行从右往左画线
      anchors = link.reverse ? ['Right', [0, 0.5, 0, 0, 0, 14]] : ['Left', [1, 0.5, 0, 0, 0, 14]];
    }

    let direction = 'right';
    if (link.startLine % 2 === 1) {
      direction = link.return || link.reverse ? 'left' : 'right';
    } else {
      direction = link.return || link.reverse ? 'right' : 'left';
    }

    const opts: ConnectParams<Element> = {
      hoverClass: this.ns.e('line-hover'),
      paintStyle: { strokeWidth: 1, stroke: '#3168EC', dashstyle: '0' },
      endpointStyle: { fill: '#3168EC' },
      anchors,
      connector: {
        type: FlowchartConnector.type,
        options: {
          stub: [0, 25],
          cornerRadius: 10,
        } as FlowchartConnectorOptions,
      },
      endpoints: [
        { type: DotEndpoint.type, options: { radius: 3 } as DotEndpointParams },
        {
          type: ArrowEndpoint.type,
          options: {
            direction,
          } as ArrowEndpointParams,
        },
      ],
      overlays: [
        {
          type: 'Custom',
          options: {
            id: 'change',
            location: 0.5,
            create: () => {
              const div = document.createElement('div');
              div.classList.add(this.ns.b('custom-overlay-line'));
              if (link.return === true) {
                div.classList.add(this.ns.be('custom-overlay-line', 'special-line'));
              } else {
                div.classList.add(this.ns.be('custom-overlay-line', 'not-special-line'));
              }
              return div;
            },
          },
        },
        {
          type: 'Custom',
          options: {
            id: 'delete',
            location: 0.5,
            create: () => {
              // 容器
              const div = document.createElement('div');
              div.classList.add(this.ns.b('custom-overlay'));
              if (link.return === true) {
                div.classList.add(this.ns.be('custom-overlay', 'special-line'));
              } else {
                div.classList.add(this.ns.be('custom-overlay', 'not-special-line'));
              }
              if (link.type !== LinkType.VIRTUAL || link.reverse === true) {
                // 删除按钮
                const iEl = document.createElement('i');
                iEl.className = 'iconfont icon-caiqie1 delete-action';
                iEl.onclick = (e: MouseEvent) => {
                  e.stopPropagation();
                  Modal.confirm({
                    title: t(this.deleteMessage),
                    content: t('sys.pageDesigner.dataLinkage.confirm.content'),
                    onOk: () => {
                      if (link.reverse !== true) {
                        const sourceNode = c.node.get(link.source, 0, true);
                        if (sourceNode) {
                          c.node.cache.clear(sourceNode);
                          c.node.update(Object.assign(sourceNode, { value: null, label: null }));
                        }
                      } else {
                        const targetNode = c.node.get(link.target, 0, true);
                        if (targetNode) {
                          c.node.cache.reverseClear(targetNode);
                          c.node.update(
                            Object.assign(targetNode, {
                              value: null,
                              label: null,
                              noSelectField: false,
                            }),
                          );
                        }
                      }
                    },
                  });
                };
                div.appendChild(iEl);
              }
              // 如果是单方向的只有第一条线可以有反转按钮
              if (
                (c.config.oneDirection === true && link.i === 0) ||
                (c.config.oneDirection === false &&
                  (c.config.reverseCount == null || link.i >= c.config.reverseCount))
              ) {
                const iEl2 = document.createElement('i');
                iEl2.className = 'iconfont icon-qiehuan1 reverse-action';
                iEl2.onclick = (e: MouseEvent) => {
                  e.stopPropagation();
                  this.reverse(c, link);
                };
                div.appendChild(iEl2);
              }
              return div;
            },
          },
        },
      ],
    };

    return opts;
  }

  click(c: RelationshipDiagramConfigController, link: IRelationshipDiagramLink): void {
    if (
      (c.config.oneDirection === true && link.i === 0) ||
      (c.config.oneDirection === false &&
        (c.config.reverseCount == null || link.i >= c.config.reverseCount))
    ) {
      this.reverse(c, link);
    }
  }
}
