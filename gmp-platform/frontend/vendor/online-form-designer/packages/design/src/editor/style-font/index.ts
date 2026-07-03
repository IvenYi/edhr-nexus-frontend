import { widthEditorInstall } from '@gct/runtime';
import { DesignEditorType } from '../../constant';
import { StyleFont } from './style-font';
import { StyleFontProvider } from './style-font.provider';

export default widthEditorInstall(
  DesignEditorType.STYLE_FONT,
  () => new StyleFontProvider(),
  StyleFont,
);
