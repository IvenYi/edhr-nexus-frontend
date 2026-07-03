import { widthEditorInstall } from '@gct/runtime';
import { DesignEditorType } from '../../constant';
import { StyleSpacing } from './style-spacing';
import { StyleSpacingProvider } from './style-spacing.provider';

export default widthEditorInstall(
  DesignEditorType.STYLE_SPACING,
  () => new StyleSpacingProvider(),
  StyleSpacing,
);
