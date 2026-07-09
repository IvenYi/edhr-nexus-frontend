import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormSwitchProvider } from './gct-form-switch.provider';
import { GctFormSwitch } from './gct-form-switch';

export default widthEditorInstall(
  EditorType.SWITCH,
  () => new GctFormSwitchProvider(),
  GctFormSwitch,
);
