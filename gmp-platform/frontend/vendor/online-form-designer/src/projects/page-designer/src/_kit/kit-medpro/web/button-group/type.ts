export enum btnGroupType {
  CREATE = 'create',
  COPY = 'copy',
  COPYVERSION = 'copyVersion',
  DELETE = 'delete',
  MODELING = 'modeling',
  USEINFO = 'useInfo',
}

export enum schemaType {
  CREATE = 'medpro-create-version',
  COPY = 'medpro-copy',
  COPYVERSION = 'medpro-copy-version',
  DELETE = 'medpro-delete',
  MODELING = 'medpro-modeling',
  USEINFO = 'medpro-useinfo',
}

export const btnGroupData = [
  {
    name: 'sys.app.version.create',
    type: btnGroupType.CREATE,
    schemaType: schemaType.CREATE,
  },
  {
    name: 'sys.pageDesigner.toolkitButton.copy',
    type: btnGroupType.COPY,
    schemaType: schemaType.COPY,
  },
  {
    name: 'sys.pageDesigner.versionCopy',
    type: btnGroupType.COPYVERSION,
    schemaType: schemaType.COPYVERSION,
  },
  {
    name: 'sys.pageDesigner.toolkitButton.delete',
    type: btnGroupType.DELETE,
    schemaType: schemaType.DELETE,
  },
  {
    name: 'sys.appDesigner.modelTrace',
    type: btnGroupType.MODELING,
    schemaType: schemaType.MODELING,
  },
  {
    name: 'sys.pageDesigner.useinfo',
    type: btnGroupType.USEINFO,
    schemaType: schemaType.USEINFO,
  },
];
