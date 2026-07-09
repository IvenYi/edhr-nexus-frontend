import { widthEditorInstall, IEditorProvider } from '@gct/runtime';
import { DesignEditorType } from '../../constant';
import { SystemPageSelect } from './system-page-select';

export class SystemPageSelectProvider implements IEditorProvider {
  component = 'SystemPageSelect';
}

export default widthEditorInstall(
  DesignEditorType.SYSTEM_PAGE_SELECT,
  () => new SystemPageSelectProvider(),
  SystemPageSelect,
);

export type { ISystemPageSelectModel } from './i-system-page-select';
