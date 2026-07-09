import { App } from 'vue';
import { EndpointFactory } from '@jsplumb/browser-ui';
import {
  DefaultLinkProvider,
  VirtualLinkProvider,
  DefaultNodeProvider,
  VirtualNodeProvider,
  ReverseNodeProvider,
} from './providers';
import { RelationshipDiagramConfig } from './relationship-diagram-config';
import { register, ArrowEndpointHandler } from './plumb-plugin';
import { RegisterUtil } from './utils';
import { LinkType, NodeType } from './constant';
import {
  DiagramConfigItem,
  DiagramConfigItemVirtual,
  DiagramConfigItemReverse,
} from './components';

export default {
  install(app: App) {
    RegisterUtil.registerLink(LinkType.DEFAULT, new DefaultLinkProvider());
    RegisterUtil.registerLink(LinkType.VIRTUAL, new VirtualLinkProvider());
    RegisterUtil.registerNode(NodeType.DEFAULT, new DefaultNodeProvider());
    RegisterUtil.registerNode(NodeType.VIRTUAL, new VirtualNodeProvider());
    RegisterUtil.registerNode(NodeType.REVERSE, new ReverseNodeProvider());

    register();
    EndpointFactory.registerHandler(ArrowEndpointHandler);
    app.component(RelationshipDiagramConfig.name!, RelationshipDiagramConfig);
    app.component(DiagramConfigItem.name!, DiagramConfigItem);
    app.component(DiagramConfigItemVirtual.name!, DiagramConfigItemVirtual);
    app.component(DiagramConfigItemReverse.name!, DiagramConfigItemReverse);
  },
};

export * from './interface';
