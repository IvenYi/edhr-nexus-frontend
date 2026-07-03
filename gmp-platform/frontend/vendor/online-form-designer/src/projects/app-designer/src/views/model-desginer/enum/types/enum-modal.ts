export interface EnumModelInfo {
  enumModelId: string;
  sortNum: number;
  text: string;
  value: string;
  i18nConfig: string;
  textColor: string;
  icon: string;
  iconColor: string;
}

export interface NewEnumInfo {
  categoryId: string;
  description: string;
  key: string;
  name: string;
}

export const ColorPreset = [
  '#DBDBDB',
  '#FFE4E4',
  '#D1D1D1',
  '#838383',
  '#838383',
  '#FFEECB',
  '#D8E3FF',
  '#FF8888',
  '#FF8888',
  '#0DAA9C',
  '#3370FF',
];
