const searchFieldModules: Record<string, any> = import.meta.glob(
  ['./!index.ts', '!./utils.ts', '!./BaseSearch.ts', '!./BaseDate.ts', './*.ts'],
  {
    eager: true,
  },
);

const searchFieldWidgetSchema = {};
const searchFieldWidgetPropEditors = {};
const searchFieldWidgetConfig = {};
for (const path in searchFieldModules) {
  const fileNameWithExtension = path.split('/').pop()!;
  const fileNameWithoutExtension = fileNameWithExtension.split('.').slice(0, -1).join('.');

  searchFieldWidgetSchema[`${fileNameWithoutExtension}`] = searchFieldModules[path].widget;

  searchFieldWidgetPropEditors[`${fileNameWithoutExtension}`] =
    searchFieldModules[path].propEditorList;
  searchFieldWidgetConfig[fileNameWithoutExtension] = {
    basicProps: {
      alias_hidden: true,
    },
  };
}

export const searchFieldCmpSchema = searchFieldWidgetSchema;
export const searchFieldCmpEditors = searchFieldWidgetPropEditors;
export const searchDesignerConfig = searchFieldWidgetConfig;
