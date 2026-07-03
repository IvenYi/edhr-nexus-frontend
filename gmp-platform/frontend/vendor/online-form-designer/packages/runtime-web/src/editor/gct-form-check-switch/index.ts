import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormCheckSwitchProvider } from './gct-form-check-switch.provider';
import { GctFormCheckSwitch } from './gct-form-check-switch';

export default widthEditorInstall(
  EditorType.CHECK_SWITCH,
  () => new GctFormCheckSwitchProvider(),
  GctFormCheckSwitch,
);
