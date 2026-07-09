import { UserServiceType } from '/@app-designer/enum';

export const UserServiceTypeOptions = [
  {
    value: UserServiceType.SCRIPT_SERVICE,
    label: 'sys.model.scriptService',
  },
  // {
  //   value: UserServiceType.SO_SERVICE,
  //   label: 'sys.model.soService',
  // },
  // {
  //   value: UserServiceType.SQL_SERVICE,
  //   label: 'sys.model.sqlService',
  // },
];

export const UserServiceTypeOptionsMap = UserServiceTypeOptions.concat({
  value: UserServiceType.BUILTIN_SERVICE,
  label: 'sys.model.builtinService',
}).reduce((map, item) => {
  map[item.value] = item;
  return map;
}, {});
