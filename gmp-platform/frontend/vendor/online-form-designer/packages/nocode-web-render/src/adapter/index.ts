import { NocodeAdapter } from '@gct/nocode-base';
import { McWebRender } from '../material-consume/mc-web-render';
import { MbWebRender } from '../material-balance/mb-web-render';

/**
 * 注入pc端的适配器实现
 * @export
 */
export function initWebNocodeAdapter() {
  NocodeAdapter.mcRender = new McWebRender();
  NocodeAdapter.mbRender = new MbWebRender();
}
