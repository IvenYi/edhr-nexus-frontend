import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { RowColumnConversion } from './row-column-conversion';
import { REPORT_EDITOR_TYPE } from '../../constants';

export class Provider implements IEditorProvider {
  component = 'row-column-conversion';
}

export default widthEditorInstall(REPORT_EDITOR_TYPE.ROW_COLUMN_CONVERSION, () => new Provider(), RowColumnConversion);
