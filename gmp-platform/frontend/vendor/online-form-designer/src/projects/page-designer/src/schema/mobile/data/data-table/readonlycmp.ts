// import {
//   FormComponents,
//   StyleGroup,
//   TagTypeEnum,
//   fixedAlignENUM,
//   tableColumnWidthEnum,
// } from '/@page-designer/enum';
// import { ReadonlyCmp } from '/@page-designer/types/web';
// import { LowCodeWidget } from '/@page-designer/types/widget-basic-types';
// // import columnEditorConfig from '../../../common-config/column-editor-config';
// import { columncommonStyle } from './__common';
// import {
//   displayEditor as editor,
//   displayProps,
// } from '../../../common-config/display-editor-config';
// import commonFieldEditorConfig from '../../../common-config/common-field-editor-config';
// import { FIELD_TYPE } from '/@/enums/appEnum';

// //以下定义的的变量名称都不可改变(widget/propEditorList/eventList/runCallback)
// export const widget: PartialByKeys<ReadonlyCmp, 'platform'> = {
//   id: '',
//   platform: undefined,
//   name: '',
//   alias: '',
//   type: FormComponents.ReadonlyCmp,
//   icon: '',
//   props: {
//     field: '',
//     fieldId: '',
//     label: '',
//     modelKey: '',
//     fieldType: undefined,
//     bindModelKey: undefined,
//     disabled: false,
//     explain: '',
//     showExplain: false,
//     displayLabelText: true,
//     readonly: true,
//     fieldReadonly: true,
//     fixedAlign: fixedAlignENUM.NONE /**列宽配置 */,
//     ...displayProps,
//   },
//   style: {
//     ...columncommonStyle,
//   },
//   events: {},
//   formItem: false,
//   i18n: {},
// };

// export const propEditorList: LowCodeWidget.PropEditor[] = [
//   ...commonFieldEditorConfig.basicFieldEditor,
//   // ...columnEditorConfig.fixedAlignEditor,
//   ...editor,
// ];

// export const styleEditorList: LowCodeWidget.StyleEditor[] = [
//   {
//     component: 'column-width-editor',
//     name: { percentage: 'columnwidth', type: 'columnwidthConfigure' },
//     label: '',
//     group: StyleGroup.LAYOUT,
//     hidden: (widget) => {
//       return !!widget.preLocation?.includes(FIELD_TYPE.MASTERSLAVE);
//     },
//     _config: {
//       columnWidthEnum: [tableColumnWidthEnum.ATUO, tableColumnWidthEnum.PERCENTAGE],
//     },
//   },
//   {
//     component: 'font-editor',
//     name: 'labelFont',
//     label: 'sys.name',
//     group: StyleGroup.STYLE,
//     hidden: (widget) => {
//       return !widget.preLocation?.includes(FIELD_TYPE.MASTERSLAVE);
//     },
//   },
//   {
//     component: 'font-editor',
//     name: 'contentFont',
//     label: 'sys.content',
//     group: StyleGroup.STYLE,
//   },
//   {
//     component: 'boolean-editor',
//     name: 'tagStyleOpen',
//     label: 'sys.pageDesigner.tagStyle',
//     group: StyleGroup.STYLE,
//     _config: {
//       showType: 'checkbox',
//       options: [
//         {
//           label: 'sys.pageDesigner.configureContentAsLabelStyle',
//           value: true,
//         },
//       ],
//     },
//     changeCallback: (widget, value) => {
//       if (value && !widget.style.tagStyle) {
//         widget.style.tagStyle = {
//           color: '',
//           tagType: TagTypeEnum.RADIUS,
//         };
//       }
//     },
//   },
//   {
//     component: 'tag-editor',
//     name: 'tagStyle',
//     group: StyleGroup.STYLE,
//     hidden: (widget) => {
//       return !widget.style.tagStyleOpen;
//     },
//   },
// ];

// export const eventList: LowCodeWidget.EventsType[] = [];

// export const runCallback: LowCodeWidget.RunCallback = (_node) => {};

// // export const beforeCreate = (_node: Input) => {};
// export const designerConfig: LowCodeWidget.DesignerConfig = {
//   basicProps: {
//     alias_hidden: true,
//     key_hidden: true,
//   },
// };
