import { widthEditorInstall, EditorType } from '@gct/runtime';
import { GctFormLengthUnit } from './gct-form-length-unit';
import { GctFormLengthUnitProvider } from './gct-form-length-unit.provider';

export default widthEditorInstall(
  EditorType.LENGTH_UNIT,
  () => new GctFormLengthUnitProvider(),
  GctFormLengthUnit,
);
