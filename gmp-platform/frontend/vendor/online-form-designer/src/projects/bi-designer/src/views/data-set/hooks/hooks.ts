import { emptyValueEnum, MENU_ACTION, sortTypeEnum, fieldTypeEnum } from '../interface/type';
import { IReportField, IFieldContextItem } from '../interface';

export function getFieldMenus(data: IReportField): IFieldContextItem[] {
  const items: IFieldContextItem[] = [
    {
      mode: 'action',
      label: '修改显示名称',
      name: MENU_ACTION.CHANGE_NAME,
    },
  ];

  if (data.fieldSql) {
    items.unshift({
      mode: 'action',
      label: '编辑计算字段',
      name: MENU_ACTION.EDIT,
    });
  }

  items.push({
    mode: 'select',
    label: '空值显示样式',
    name: 'EmptyValueDisplayStyle',
    fieldKey: 'emptyValue',
    children: [
      {
        mode: 'select-item',
        label: '展示为"--"',
        name: emptyValueEnum.A,
        value: emptyValueEnum.A,
      },
      {
        mode: 'select-item',
        label: '展示为"null"',
        name: emptyValueEnum.B,
        value: emptyValueEnum.B,
      },
      {
        mode: 'select-item',
        label: '展示为"N/A"',
        name: emptyValueEnum.C,
        value: emptyValueEnum.C,
      },
      {
        mode: 'select-item',
        label: '不展示',
        name: emptyValueEnum.D,
        value: emptyValueEnum.D,
      },
      {
        mode: 'select-item',
        label: '自定义',
        name: emptyValueEnum.E,
        value: emptyValueEnum.E,
      },
    ],
  });

  items.push({
    mode: 'select',
    label: '排序',
    name: 'SortType',
    fieldKey: 'sortType',
    children: [
      {
        mode: 'select-item',
        label: '不排序',
        name: sortTypeEnum.NO,
        value: sortTypeEnum.NO,
      },
      {
        mode: 'select-item',
        label: '升序',
        name: sortTypeEnum.ASC,
        value: sortTypeEnum.ASC,
      },
      {
        mode: 'select-item',
        label: '降序',
        name: sortTypeEnum.DESC,
        value: sortTypeEnum.DESC,
      },
    ],
  });

  items.push({
    mode: 'group',
    label: '字段类型转换',
    name: 'fieldTypeConvert',
    fieldKey: 'fieldType',
    children: [
      {
        mode: 'group-item',
        label: '维度类型',
        name: 'dim',
        children: [
          {
            mode: 'action',
            label: '文本',
            name: fieldTypeEnum.DIMTEXT,
            icon: 'icon-str',
            value: fieldTypeEnum.DIMTEXT,
          },
          {
            mode: 'action',
            label: '数字',
            name: fieldTypeEnum.DIMNUMBER,
            icon: 'icon-shuzi',
            value: fieldTypeEnum.DIMNUMBER,
          },
          {
            mode: 'action',
            label: '日期',
            name: fieldTypeEnum.DIMDATE,
            icon: 'icon-riqi2',
            value: fieldTypeEnum.DIMDATE,
          },
          {
            mode: 'action',
            label: '图片（URL链接）',
            name: fieldTypeEnum.DIMIMG,
            icon: 'icon-tupian_wudaima',
            value: fieldTypeEnum.DIMIMG,
          },
        ],
      },
      {
        mode: 'group-item',
        label: '转化为度量',
        name: 'meas',
        children: [
          {
            mode: 'action',
            label: '文本',
            name: fieldTypeEnum.MEASTEXT,
            icon: 'icon-str',
            value: fieldTypeEnum.MEASTEXT,
          },
          {
            mode: 'action',
            label: '数字',
            name: fieldTypeEnum.MEASNUMBER,
            icon: 'icon-shuzi',
            value: fieldTypeEnum.MEASNUMBER,
          },
        ],
      },
    ],
  });

  // 只有维度的 数字和文本支持自定义排序
  if (
    data.type == 'dim' &&
    [fieldTypeEnum.DIMTEXT, fieldTypeEnum.DIMNUMBER].includes(data.fieldType)
  ) {
    items.forEach((i) => {
      if (i.name == 'SortType') {
        i.children?.push({
          mode: 'select-item',
          label: '自定义',
          name: sortTypeEnum.CUSTOM,
          value: sortTypeEnum.CUSTOM,
        });
      }
    });
  }

  if (data.fieldSql) {
    items.push({
      mode: 'action',
      label: '删除',
      name: MENU_ACTION.DELETE,
    });
  }
  return items;
}

export const getFileSize = (url) => {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        const blob = xhr.response;
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(blob.size);
        };
        reader.readAsText(blob);
      } else {
        reject(`Error ${xhr.status}: ${xhr.statusText}`);
      }
    };
    xhr.send();
  });
};

export const sizeParser = (size) => {
  if (size / 1024 < 1) return (size / 1024).toFixed(2) + 'K';
  if (size / 1024 / 10 < 1) return (size / 1024).toFixed(1) + 'K';
  if (size / 1024 / 1024 < 1) return (size / 1024).toFixed(0) + 'K';
  if (size / 1024 / 1024 / 10 < 1) return (size / 1024 / 1024).toFixed(2) + 'M';
  return (size / 1024 / 1024).toFixed(2) + 'M';
};

export const fieldTypeOpts =[
    {
      label: '维度',
      options: [
        {
          label: '文本',
          value: fieldTypeEnum.DIMTEXT,
        },
        {
          label: '数字',
          value: fieldTypeEnum.DIMNUMBER,
        },
        {
          label: '日期',
          value: fieldTypeEnum.DIMDATE,
        },
        {
          label: '图片（URL链接）',
          value: fieldTypeEnum.DIMIMG,
        },
      ],
    },
    {
      label: '度量',
      options: [
        {
          label: '文本',
          value: fieldTypeEnum.MEASTEXT,
        },
        {
          label: '数字',
          value: fieldTypeEnum.MEASNUMBER,
        },
      ],
    },
  ];
