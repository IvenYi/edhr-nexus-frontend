import { widthEditorInstall, EditorType, IEditorProvider } from '@gct/runtime';
import { GctFormPixelConfig } from './gct-form-pixel-config';

export class Provider implements IEditorProvider {
  component = 'gct-form-pixel-config';
}

export default widthEditorInstall(EditorType.PIXEL_CONFIG, () => new Provider(), GctFormPixelConfig);
