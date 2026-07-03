import { ConnectParams } from '@jsplumb/browser-ui';
import { IRelationshipDiagramLink } from '../../interface';
import { RelationshipDiagramConfigController } from '../../relationship-diagram-config.controller';
import { DefaultLinkProvider } from '../default-link-provider/default-link-provider';

/**
 * 虚拟连线
 *
 * @author zhanghanrui
 * @date 2024-06-27 16:06:04
 * @export
 * @class VirtualLinkProvider
 * @extends {DefaultLinkProvider}
 */
export class VirtualLinkProvider extends DefaultLinkProvider {
  override options(
    c: RelationshipDiagramConfigController,
    link: IRelationshipDiagramLink,
  ): ConnectParams<Element> {
    const opts = super.options(c, link);

    opts.paintStyle = { strokeWidth: 1, stroke: '#C3C3C3', dashstyle: '4 4' };
    opts.endpointStyle = { fill: '#C3C3C3' };

    return opts;
  }
}
