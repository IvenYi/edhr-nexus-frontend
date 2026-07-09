export enum DeveloperTypeEnum {
  APPLICATION_ADMIN = 'APPLICATION_ADMIN',
  ORDINARY_DEVELOPER = 'ORDINARY_DEVELOPER',
}

export const DeveloperTypeOptions = [
  {
    value: DeveloperTypeEnum.APPLICATION_ADMIN,
    label: '应用管理员',
    i18nKey: 'sys.developer.appAdmin',
  },
  {
    value: DeveloperTypeEnum.ORDINARY_DEVELOPER,
    label: '普通开发者',
    i18nKey: 'sys.developer.ordinaryDeveloper',
  },
];

export const DeveloperTypeOptionsMap = DeveloperTypeOptions.reduce((map, item) => {
  map[item.value] = item;
  return map;
}, {});
