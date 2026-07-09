import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { CustomCalcMethod } from './custom-calc-method';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'custom-calc-method';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.CUSTOM_CALC_METHOD, () => new Provider(), CustomCalcMethod);
