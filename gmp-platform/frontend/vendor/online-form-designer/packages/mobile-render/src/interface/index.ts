import { LogoTypeEnum } from '../constant';

export interface MenuItem {
  id: string;
  name: string;
  color: string;
  children?: MenuItem[];
  logo: string;
  logoType: LogoTypeEnum;
}
