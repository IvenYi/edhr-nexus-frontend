import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormI18nProvider } from './gct-form-i18n.provider';
import { GctFormI18n } from './gct-form-i18n';

export default widthEditorInstall(EditorType.I18N, () => new GctFormI18nProvider(), GctFormI18n);
