import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import RdoNameText from './RdoNameText.vue';

export class RdoNameTextProvider implements IEditorProvider {
  component = 'rdo-name-text';
}

export default widthEditorInstall('rdo-name-text', () => new RdoNameTextProvider(), RdoNameText);
