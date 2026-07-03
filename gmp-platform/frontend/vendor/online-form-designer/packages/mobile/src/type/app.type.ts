import { LogoTypeEnum } from '@gct/runtime-mobile-render';
import type { ShortcutMenuDtoResponse } from '@mobile/apis/gct-platform/model';

// 应用
export interface IApp {
  id: string;
  name: string;
  logo?: string;
  logoType: LogoTypeEnum;
  color?: string;
  bgColor?: string;
  authState?: number;
}

// 应用下菜单
export interface IAppMenu extends ShortcutMenuDtoResponse {
  name: string;
  appId: string;
  linkPage: string;
  logoType: LogoTypeEnum;
  logo: string;
  color: string;
  bgColor: string;
}
