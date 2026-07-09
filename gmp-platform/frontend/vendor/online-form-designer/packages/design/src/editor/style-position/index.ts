import { widthEditorInstall } from '@gct/runtime';
import { DesignEditorType } from '../../constant';
import { StylePosition } from './style-position';
import { StylePositionProvider } from './style-position.provider';

export default widthEditorInstall(
  DesignEditorType.STYLE_POSITION,
  () => new StylePositionProvider(),
  StylePosition,
);
