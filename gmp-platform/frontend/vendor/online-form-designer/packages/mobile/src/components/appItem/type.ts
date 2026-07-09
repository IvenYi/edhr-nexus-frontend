import { LogoTypeEnum } from '@mobile/type';

export interface AppMueus {
  appId: string;
  menuId?: string;
  type?: 'APP' | 'MENU';
  name: string;
  sortNum?: number;
  children?: AppMueus[];
  linkPage?: string;
  invalid?: number;
  logo?: string;
  suiteKey?: string;
  logoType?: LogoTypeEnum;
  /**展开收起 */
  open?: boolean;
}

export interface Menus {
  id: string;
  name: string;
  children?: Menus[];
  logo: string;
  logoType: LogoTypeEnum;
}
