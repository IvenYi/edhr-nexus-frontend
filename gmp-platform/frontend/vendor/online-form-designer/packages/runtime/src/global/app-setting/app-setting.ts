import { IAppSetting } from '../../interface';

export class AppSetting implements IAppSetting {
  branchId = '';
  env = 'prod';
  emptyDisplay = '--';
}
