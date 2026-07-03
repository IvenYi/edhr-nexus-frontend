import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { ContentTagStyle } from './content-tag-style';
import { DesignEditorType } from '../../constant';

export class Provider implements IEditorProvider {
  component = 'ContentTagStyle';
}

export default widthEditorInstall(
  DesignEditorType.CONTENT_TAG_STYLE,
  () => new Provider(),
  ContentTagStyle,
);
