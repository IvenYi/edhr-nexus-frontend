export enum btnGroupType {
  CREATE = 'create',
  COPY = 'copy',
  COPYVERSION = 'copyVersion',
  DELETE = 'delete',
  MODELING = 'modeling',
  USEINFO = 'useInfo',
}

export const btnGroupData = [
  {
    name: 'sys.app.version.create',
    type: btnGroupType.CREATE,
  },
  {
    name: 'sys.pageDesigner.toolkitButton.copy',
    type: btnGroupType.COPY,
  },
  {
    name: 'sys.pageDesigner.versionCopy',
    type: btnGroupType.COPYVERSION,
  },
  {
    name: 'sys.pageDesigner.toolkitButton.delete',
    type: btnGroupType.DELETE,
  },
  {
    name: 'sys.appDesigner.modelTrace',
    type: btnGroupType.MODELING,
  },
  {
    name: 'sys.pageDesigner.useinfo',
    type: btnGroupType.USEINFO,
  },
];
