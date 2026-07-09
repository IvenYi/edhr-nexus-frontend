import { FormComponents } from '/@page-designer/enum';

const basicActions = [
  {
    value: 'getValue',
    label: '获取值',
    dynamicProps: ['outputToVariable'],
  },
  {
    value: 'setValue',
    label: '设置值',
    dynamicProps: ['inputVariable'],
  },
];
const getOptionValueAction = {
  value: 'getOptionValue',
  label: '获取选项值',
  dynamicProps: ['outputToVariable'],
};

export const widgetActions = {
  modal: [
    {
      value: 'open',
      label: '打开',
    },
    {
      value: 'close',
      label: '关闭',
    },
  ],
  [FormComponents.Form]: [
    ...basicActions,
    {
      value: 'addValue',
      label: '添加值',
      dynamicProps: ['inputVariable'],
    },
    {
      value: 'submit',
      label: '提交',
    },
    {
      value: 'reset',
      label: '重置',
    },
  ],
  [FormComponents.DataTable]: [
    {
      value: 'reload',
      label: '刷新',
    },
    {
      value: 'getCheckedValue',
      label: '获取选中项',
      dynamicProps: ['outputToVariable'],
    },
  ],
  [FormComponents.Checkbox]: [...basicActions, getOptionValueAction],
  [FormComponents.Datepicker]: [...basicActions],
  [FormComponents.DateTimepicker]: [...basicActions],
  [FormComponents.Department]: [...basicActions, getOptionValueAction],
  [FormComponents.Input]: [...basicActions],
  [FormComponents.Inputmoney]: [...basicActions],
  [FormComponents.Inputnumber]: [...basicActions],
  [FormComponents.Radio]: [...basicActions, getOptionValueAction],
  [FormComponents.Select]: [...basicActions, getOptionValueAction],
  [FormComponents.Switch]: [...basicActions],
  [FormComponents.Textarea]: [...basicActions],
  [FormComponents.Timepicker]: [...basicActions],
  [FormComponents.Userpicker]: [...basicActions],
};
