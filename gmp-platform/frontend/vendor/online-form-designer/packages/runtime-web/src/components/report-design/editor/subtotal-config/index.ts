import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { SubtotalConfig } from './subtotal-config';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'subtotal-config';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.SUBTOTAL_CONFIG, () => new Provider(), SubtotalConfig);
