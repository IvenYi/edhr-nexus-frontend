export enum DataBaseType {
  mysql = 'mysql',
  postgres = 'postgres',
  oracle = 'oracle',
  sqlserver = 'sqlserver',
}

export enum MenuClickEvent {
  EDIT = 'edit',
  DELETE = 'delete',
}

export enum DataSourceType {
  DATABASE = 'DB',
  APPLICATION = 'APP',
  FILE = 'FILE',
  API = 'API'
}

export enum TableType {
  DATA = 'data',
  VIEW = 'view',
}

export enum DatasetType {
  SQL = 'sql',
  TABLE = 'table',
  FILE = 'file',
  CONF = 'conf',
  API = 'api',
}

export enum DataSourceEnv {
  Dev = 'dev',
  Test = 'test',
  Prod = 'prod',
}

export const envOptions = Object.values(DataSourceEnv).map((key) => ({
  key,
  i18n: `sys.integration.env.${key}`,
}));
