import { type MCRender } from '../hooks/material-consume';
import { type MBRender } from '../hooks/material-balance/mb-render';

export class NocodeAdapter {
  /** 物料消耗表业务用 */
  static mcRender?: MCRender;
  /** 物料平衡表业务用 */
  static mbRender?: MBRender;
}
