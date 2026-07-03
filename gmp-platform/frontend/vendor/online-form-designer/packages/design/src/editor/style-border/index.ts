import { widthEditorInstall } from '@gct/runtime';
import { DesignEditorType } from '../../constant';
import { StyleBorder } from './style-border';
import { StyleBorderProvider } from './style-border.provider';

export default widthEditorInstall(
  DesignEditorType.STYLE_BORDER,
  () => new StyleBorderProvider(),
  StyleBorder,
);
