import {
  webRunPropEditor,
  runStyleEditor,
  mobileRunSubTableStyleEditor,
} from '../data-table-column';
import { MaterialEnum } from '/@/enums/appEnum';
import { runPropEditor as runTableSelectPropEditor } from '../../web/other/table-select';
import {
  runStyleEditor as runCardListStyleEditor,
  runPropEditor as runCardListPropEditor,
  runEventEditor as runCardListEventEditor,
} from '../card-list-field';
import {
  runStyleEditor as runDescStyleEditor,
  runPropEditor as runDescPropEditor,
  runEventEditor as runDescEventEditor,
} from '../descriptions-field';
import { Platform, SUB_TABLE_EDIT_MODE } from '/@page-designer/enum';
import { padVTableSupportEditFieldTypes } from './utils';

const fieldModules: Record<string, any> = import.meta.glob(
  [
    './!index.ts',
    '!./utils.ts',
    './*.ts',
    '../dynamic-form-type.ts',
    '../dynamic-form-value.ts',
    '../dynamic-form-options.ts',
    '../dynamic-form-show-type.ts',
  ],
  {
    eager: true,
  },
);

const fieldWidgetSchema = {};
const fieldWidgetEvents = {};
const fieldWidgetPropEditors = {};
const fieldWidgetStyleEditors = {};

const fieldWidgetCallback = {};
const fieldWidgetBeforeCreate = {};
const fieldWidgetLoopCallback = {};
const fieldWidgetDesignerConfig = {};
for (const path in fieldModules) {
  const fileNameWithExtension = path.split('/').pop()!;
  const fileNameWithoutExtension = fileNameWithExtension.split('.').slice(0, -1).join('.');
  fieldWidgetDesignerConfig[`${fileNameWithoutExtension}`] = fieldModules[path].designerConfig;
  fieldWidgetSchema[`${fileNameWithoutExtension}`] = fieldModules[path].widget;
  fieldWidgetEvents[`${fileNameWithoutExtension}`] = (selectedRef) => {
    const { materialType } = selectedRef;
    const fieldReadonly = selectedRef.props.fieldReadonly;
    const widget = fieldModules[path].eventList;
    if (fieldReadonly) {
      // 只读情况下，仅保留点击事件
      return widget?.filter((item) => item.name === 'onClick') ?? [];
    }
    if (materialType === MaterialEnum.cardListFormField) {
      return runCardListEventEditor();
    }
    if (materialType === MaterialEnum.DescriptionsFormField) {
      return runDescEventEditor();
    }

    return widget;
  };
  fieldWidgetPropEditors[`${fileNameWithoutExtension}`] = (selectedRef, preCompInfo) => {
    const { materialType, platform } = selectedRef;
    const propEditorList = fieldModules[path].propEditorList;

    if (
      materialType === MaterialEnum.MaterialTableField ||
      materialType === MaterialEnum.MaterialEmbedTableField
    ) {
      if (platform === Platform.PAD) {
        const fieldType = selectedRef.props.fieldType;
        if (padVTableSupportEditFieldTypes.includes(fieldType)) {
          return webRunPropEditor(propEditorList);
        }
        return runCardListPropEditor(selectedRef, propEditorList, false);
      }
      return platform === Platform.WEB
        ? webRunPropEditor(propEditorList)
        : runCardListPropEditor(selectedRef, propEditorList, false);
    }

    if (materialType === MaterialEnum.MaterialSubTableField) {
      if (preCompInfo && preCompInfo.props?.editMode === SUB_TABLE_EDIT_MODE.MODAL) {
        return runTableSelectPropEditor(selectedRef, 'subTable2Field');
      }
      if (platform === Platform.PAD) {
        const fieldType = selectedRef.props.fieldType;
        if (padVTableSupportEditFieldTypes.includes(fieldType)) {
          return webRunPropEditor(propEditorList);
        }
        return runCardListPropEditor(selectedRef, propEditorList, false);
      }

      if (platform === Platform.WEB) {
        return webRunPropEditor(propEditorList);
      }
    }

    if (materialType === MaterialEnum.MaterialTableSelectField) {
      return runTableSelectPropEditor(selectedRef);
    }
    if (materialType === MaterialEnum.cardListFormField) {
      return runCardListPropEditor(selectedRef, propEditorList, true);
    }
    if (materialType === MaterialEnum.DescriptionsFormField) {
      return runDescPropEditor(selectedRef, propEditorList);
    }
    return propEditorList;
  };
  fieldWidgetStyleEditors[`${fileNameWithoutExtension}`] = (selectedRef) => {
    const { materialType, platform } = selectedRef;
    const widget = fieldModules[path].styleEditorList;

    if (
      materialType === MaterialEnum.MaterialTableField ||
      materialType === MaterialEnum.MaterialTableSelectField ||
      materialType === MaterialEnum.MaterialEmbedTableField
    ) {
      return runStyleEditor();
    }

    if (materialType === MaterialEnum.MaterialSubTableField) {
      return platform === Platform.WEB ? runStyleEditor() : mobileRunSubTableStyleEditor();
    }

    if (materialType === MaterialEnum.cardListFormField) {
      return runCardListStyleEditor();
    }
    if (materialType === MaterialEnum.DescriptionsFormField) {
      return runDescStyleEditor(selectedRef, widget);
    }
    return widget;
  };

  fieldWidgetCallback[fileNameWithoutExtension] = fieldModules[path]?.runCallback;
  fieldWidgetBeforeCreate[fileNameWithoutExtension] = fieldModules[path]?.beforeCreate;
  fieldWidgetLoopCallback[fileNameWithoutExtension] = fieldModules[path]?.loopCallback;
}

export const fieldFormSchema = fieldWidgetSchema;
export const fieldFormEvents = fieldWidgetEvents;
export const fieldFormEditors = fieldWidgetPropEditors;
export const fieldFormStyles = fieldWidgetStyleEditors;
export const fieldFormBeforeCreate = fieldWidgetBeforeCreate;
export const fieldFormCallback = fieldWidgetCallback;
export const fieldFormLoopCallback = fieldWidgetLoopCallback;
export const fieldFormDesignerConfig = fieldWidgetDesignerConfig;
