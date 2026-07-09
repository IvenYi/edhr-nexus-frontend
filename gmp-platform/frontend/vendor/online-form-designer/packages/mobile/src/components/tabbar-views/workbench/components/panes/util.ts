import { LogoTypeEnum } from '@gct/runtime-mobile-render';
import type { AppResponse, ShortcutMenuDtoResponse } from '@mobile/apis/gct-platform/model';
import type { IApp, IAppMenu } from '@mobile/type';

export const getAppList = (list: AppResponse[], isTest: boolean) => {
  return list.map((o) => {
    const data = o.mobileJson ? JSON.parse(o.mobileJson) : {};
    const color = isTest ? o.logoColor : data.logoColor;

    // const logo = isTest ? o.logo : o.logoType === LogoTypeEnum.Image ? o.logoThumbnail : o.logo;

    const logo = o.logoType === LogoTypeEnum.Image ? o.logoThumbnail : o.logo;

    // const bgColor = isTest
    //   ? o.logoBgColor
    //   : o.logoType === LogoTypeEnum.Image
    //     ? null
    //     : data.logoBgColor;

    const bgColor = o.logoType === LogoTypeEnum.Image ? null : data.logoBgColor;

    const app: IApp = {
      id: o.id!,
      name: o.name!,
      logo,
      logoType: o.logoType! as LogoTypeEnum,
      color,
      bgColor,
      authState: o.authState,
    };
    return app;
  });
};

export const getAppMenuList = (list: ShortcutMenuDtoResponse[]) => {
  return list.map((o) => {
    const appMenu: IAppMenu = {
      ...o,
      name: o.menuName!,
      appId: o.appId!,
      linkPage: o.linkPage || '',
      logo: o.logo || '',
      logoType: LogoTypeEnum.Icon,
      color: '#FFFFFF',
      bgColor: o.color || '',
    };
    return appMenu;
  });
};
