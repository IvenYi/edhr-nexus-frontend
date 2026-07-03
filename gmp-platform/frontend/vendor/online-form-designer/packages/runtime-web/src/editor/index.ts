import { App } from 'vue';
import { EditorRegister, EditorType } from '@gct/runtime';
import { FormDateRangeProvider } from './form-date-range/form-date-range.provider';
import { FormSpanProvider } from './form-span/form-span.provider';
import { FormTextProvider } from './form-text/form-text.provider';
import { FormSelectProvider } from './form-select/form-select.provider';
import { FormDateRange } from './form-date-range/form-date-range';
import { FormSpan } from './form-span/form-span';
import { FormText } from './form-text/form-text';
import { FormSelect } from './form-select/form-select';

// 导入编辑器
import GctFromAction from './gct-form-action';
import GctFormDateFormatSelect from './gct-form-date-format-select';
import GctFormLengthUnit from './gct-form-length-unit';
import GctFormColor from './gct-form-color';
import GctFormDate from './gct-form-date';
import gctFormFormula from './gct-form-formula';
import GctFormCheckSwitch from './gct-form-check-switch';
import GctFromGroupSelect from './gct-form-group-select';
import GctFormI18n from './gct-form-i18n';
import GctFormIconSelect from './gct-form-icon-select';
import GctFormNumber from './gct-form-number';
import GctFormPicker from './gct-form-picker';
import GctFormPixelConfig from './gct-form-pixel-config';
import GctFormSelect from './gct-form-select';
import GctFormSpan from './gct-form-span';
import GctFormSwitch from './gct-form-switch';
import GctFormText from './gct-form-text';
import GctFormEmpty from './gct-form-empty';
import GctFormTextarea from './gct-form-textarea';
import GctFormRadio from './gct-form-radio';
import GctFormInfo from './gct-form-info';
import GctFormCheckbox from './gct-form-checkbox';
import GctFromModelSelect from './gct-form-model-select';
import GctFormMultipleChoice from './gct-form-multiple-choice';
import GctFormTable from './gct-form-table';
import GctSelectFormTable from './gct-select-form-table';

// 导入表格编辑器
import GctTableSpan from './gct-table-span';
import GctTableText from './gct-table-text';
import GctTableDate from './gct-table-date';

export default {
  install(app: App) {
    EditorRegister.register(EditorType.DATE_RANGE, () => new FormDateRangeProvider());
    EditorRegister.register(EditorType.SPAN, () => new FormSpanProvider());
    EditorRegister.register(EditorType.TEXT, () => new FormTextProvider());
    EditorRegister.register(EditorType.SELECT, () => new FormSelectProvider());

    app.component(FormDateRange.name!, FormDateRange);
    app.component(FormSpan.name!, FormSpan);
    app.component(FormText.name!, FormText);
    app.component(FormSelect.name!, FormSelect);

    // 注册编辑器
    app
      .use(GctFormLengthUnit)
      .use(GctFormColor)
      .use(GctFormDateFormatSelect)
      .use(GctFormDate)
      .use(gctFormFormula)
      .use(GctFormCheckSwitch)
      .use(GctFormI18n)
      .use(GctFromGroupSelect)
      .use(GctFormIconSelect)
      .use(GctFormNumber)
      .use(GctFormPicker)
      .use(GctFormPixelConfig)
      .use(GctFormSelect)
      .use(GctFormSpan)
      .use(GctFormSwitch)
      .use(GctFormText)
      .use(GctFormTextarea)
      .use(GctFormRadio)
      .use(GctFormInfo)
      .use(GctFormCheckbox)
      .use(GctFormDate)
      .use(GctFromModelSelect)
      .use(GctFormMultipleChoice)
      .use(GctFormTable)
      .use(GctSelectFormTable)
      .use(GctFromAction)
      .use(GctFormEmpty);

    // 注册表格编辑器
    app.use(GctTableSpan).use(GctTableText).use(GctTableDate);
  },
};
