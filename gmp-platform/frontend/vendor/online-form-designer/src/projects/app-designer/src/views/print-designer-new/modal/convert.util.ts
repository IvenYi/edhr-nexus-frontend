export type MappingFieldType = 'fixed' | 'model' | 'expression' | 'label_params';

export interface IMappingField {
  id: string;
  key: string;
  type: MappingFieldType;
  value: any; // string | ExpObj
  label?: string;
}

export const fieldTypeOptions: { label: string; value: MappingFieldType }[] = [
  { label: '固定值', value: 'fixed' },
  { label: '模型字段', value: 'model' },
  { label: '表达式', value: 'expression' },
];

export const edhrFieldTypeOptions = [
  { label: '固定值', value: 'fixed' },
  { label: '标签参数', value: 'label_params' },
  { label: '表达式', value: 'expression' },
];

export const fields2page = (fields: IMappingField[]) => {
  return fields.map(({ id, key, type, value, label }) => {
    if (type === 'fixed') {
      return {
        id,
        attrs: {
          [key]: {
            type: 'FIXED',
            value,
          },
        },
      };
    } else if (type === 'model' || type === 'label_params') {
      return {
        id,
        attrs: {
          [key]: {
            type: 'VAR',
            value,
            label,
            sourceType: type,
          },
        },
      };
    } else if (type === 'expression') {
      return {
        id,
        attrs: {
          [key]: {
            type: 'VAR',
            sourceType: 'expr',
            exp: value,
            // exp: {
            //   exp: '',
            //   expression: '',
            //   relationColumns: [],
            // },
          },
        },
      };
    }
  });
};

export const page2fields = (page: any[]) => {
  return page.map(({ id, attrs }) => {
    const entry: any = Object.entries(attrs)[0] || {};

    const [key, { type, value, label, exp, sourceType }] = entry;

    const fieldType: MappingFieldType =
      type === 'FIXED'
        ? 'fixed'
        : exp
          ? 'expression'
          : sourceType === 'label_params'
            ? 'label_params'
            : 'model';

    const field: IMappingField = {
      id,
      key,
      type: fieldType,
      value: fieldType === 'expression' ? exp : value,
      label,
    };

    return field;
  });
};
