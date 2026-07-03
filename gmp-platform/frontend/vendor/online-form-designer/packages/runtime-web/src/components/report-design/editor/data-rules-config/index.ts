import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { DataRulesConfig } from './data-rules-config';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'data-rules-config';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.DATA_RULES_CONFIG, () => new Provider(), DataRulesConfig);
