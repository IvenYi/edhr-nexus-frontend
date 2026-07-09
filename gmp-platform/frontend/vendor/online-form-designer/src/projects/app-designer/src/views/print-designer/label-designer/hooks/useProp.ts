import { computed } from 'vue';
import { useDesigner } from './useDesigner';
import { usePage } from './usePage';
import { cloneDeep } from 'lodash-es';
import { useMessage } from '/@/hooks/web/useMessage';
import {
  CONTENT_TYPE,
  DATA_TYPE,
  PRINT_ELE_TYPE,
  QR_CODE_TYPE,
} from '../constants/CommonPrintElems';

const barcodeTypeEnum = [
  {
    label: 'CODE_128',
    value: 'CODE_128',
  },
  {
    label: 'CODE_39',
    value: 'CODE_39',
  },
  {
    label: 'GS1_128',
    value: 'GS1_128',
  },
  // {
  //   label: 'EAN_13',
  //   value: 'EAN_13'
  // }
];

const showTextEnum = [
  {
    label: '显示',
    value: true,
  },
  {
    label: '隐藏',
    value: false,
  },
];
const { selectedElements } = useDesigner();
const { project } = usePage();
const { createMessage } = useMessage();
export function useProp(context?) {
  const selectedItem: any = computed(() => {
    if (selectedElements.value.length === 0) {
      return project.value;
    } else if (selectedElements.value.length > 1) {
      return selectedElements.value;
    } else {
      return selectedElements.value[0];
    }
  });

  //////////////properties///////////////
  const basicProperties = computed(() => {
    return {
      basic: [
        {
          text: '元素',
          show: !selectedItem.value.internal,
          children: [
            {
              type: 'alias-input',
              props: {
                alias: alias.value,
              },
              changeEvent(val) {
                emitChanges('alias', val);
              },
            },
            {
              type: 'dim-pos',
              props: {
                height: height.value,
                width: width.value,
                top: top.value,
                bottom: bottom.value,
                left: left.value,
                right: right.value,
                rotate: rotate.value,
                hasRotate: hasRotate.value,
                heightDisabled: heightDisabled.value,
                widthDisabled: widthDisabled.value,
                minWidth: minWidth.value,
                minHeight: minHeight.value,
                rotateWidth: rotateWidth.value,
                rotateHeight: rotateHeight.value,
                // 'hasDim': true
              },
              changeEvent({ type, value }) {
                emitChanges(type, value);
              },
            },
            {
              type: 'stack-order',
              props: {
                zIndex: zIndex.value,
              },
              changeEvent: function (newValue) {
                emitChanges('zIndex', newValue);
              },
            },
          ],
        },
      ],
    };
  });

  const emitChanges = (type, value, prop?) => {
    context.emit('propchange', { type, value, prop });
  };
  const onStyleChanges = (prop, value) => {
    const style = { ...sty.value };
    style[prop] = value;
    emitChanges('styles', style, prop);
  };
  const onAttrs = (prop, value) => {
    const attrs = { ...att.value };
    attrs[prop] = value;
    emitChanges('attrs', attrs, prop);
  };
  const onAttrsContent = (prop, value) => {
    const attrs = { ...att.value };
    attrs.content[prop] = value;
    emitChanges('attrs', attrs, prop);
  };
  const onAttrsText = (prop, value) => {
    const attrs = { ...att.value };
    attrs.text[prop] = value;
    emitChanges('attrs', attrs, prop);
  };
  /**
   * 修改属性里的val字段
   * @param prop
   * @param value
   */
  const onAttrsChanges = (prop, value) => {
    // this.att[prop] = value;
    const attrs = { ...att.value };
    // if(value.constructor===Array){//二级结构，直接传数组进来
    //   att[prop] = value;
    // } else {//一级结构，正常情况，传发生变化之后的值
    //   att[prop] = { ...att[prop], val: value };
    // }
    attrs[prop] = { ...attrs[prop], value: value };
    emitChanges('attrs', attrs, prop);
  };
  /**
   * 修改属性里的type字段，打印系统专用
   * @param prop
   * @param newValue 值为text或var
   */
  const onAttrsTypeChanges = (prop, newValue) => {
    const newAtt = { ...att.value };
    newAtt[prop].type = newValue;
    emitChanges('attrs', newAtt);
  };
  /**
   * 修改属性里的var字段，打印系统专用
   * @param prop
   * @param newValue
   */
  const onAttrsVarChanges = (prop, newValue) => {
    const newAtt = { ...att.value };
    newAtt[prop].var = newValue;
    emitChanges('attrs', newAtt);
    onAttrsChanges(prop, newValue);
  };
  const alias = computed(() => {
    return selectedItem.value.alias;
  });
  const height = computed(() => {
    return selectedItem.value.height;
  });
  const width = computed(() => {
    return selectedItem.value.width;
  });
  const top = computed(() => {
    return selectedItem.value.top;
  });
  const left = computed(() => {
    return selectedItem.value.left;
  });
  const bottom = computed(() => {
    return selectedItem.value.bottom;
  });
  const name = computed(() => {
    return selectedItem.value.name;
  });
  const type = computed(() => {
    return selectedItem.value.type;
  });
  const right = computed(() => {
    return selectedItem.value.right;
  });
  const zIndex = computed(() => {
    return selectedItem.value.zIndex;
  });
  const rotate = computed(() => {
    return selectedItem.value.rotate;
  });
  const sty = computed(() => {
    return cloneDeep(selectedItem.value.styles);
  });
  const att = computed(() => {
    return cloneDeep(selectedItem.value.attrs);
  });
  const child = computed(() => {
    return selectedItem.value.children;
  });
  const heightDisabled = computed(() => {
    if (selectedItem.value?.attrs?.type?.value == 'GS1_128') return false;
    if (selectedItem.value.rotate === 90) {
      return (
        selectedItem.value.type === PRINT_ELE_TYPE.BAR_CODE ||
        selectedItem.value.type === PRINT_ELE_TYPE.QR_CODE
      );
    } else {
      return selectedItem.value.type === PRINT_ELE_TYPE.QR_CODE;
    }
  });
  const widthDisabled = computed(() => {
    if (selectedItem.value?.attrs?.type?.value == 'GS1_128') return false;
    if (selectedItem.value.rotate === 90) {
      return selectedItem.value.type === PRINT_ELE_TYPE.QR_CODE;
    } else {
      return (
        selectedItem.value.type === PRINT_ELE_TYPE.BAR_CODE ||
        selectedItem.value.type === PRINT_ELE_TYPE.QR_CODE
      );
    }
  });
  const hasRotate = computed(() => {
    return !!selectedItem.value.hasRotate;
  });
  const minHeight = computed(() => {
    return selectedItem.value.minHeight;
  });
  const minWidth = computed(() => {
    return selectedItem.value.minWidth;
  });
  const rotateWidth = computed(() => {
    return selectedItem.value.rotateWidth;
  });
  const rotateHeight = computed(() => {
    return selectedItem.value.rotateHeight;
  });
  const componentProperties = computed(() => {
    return {
      // 打印服务专属属性
      [PRINT_ELE_TYPE.RECTANGLE]:
        type.value === PRINT_ELE_TYPE.RECTANGLE
          ? [
              {
                text: '外观',
                children: [
                  //填充暂时没用 因为只能打印黑色
                  // {
                  //   type: 'color-picker',
                  //   props: {
                  //     label: '填充',
                  //     value: sty.value['background'],
                  //   },
                  //   changeEvent(val) {
                  //     onStyleChanges('background', val);
                  //   },
                  // },
                  {
                    type: 'border',
                    props: {
                      borderColor: sty.value['border-color'],
                      borderStyle: sty.value['border-style'],
                      borderWidth: sty.value['border-width'],
                      type: 'style',
                    },
                    changeEvent({ style, val }) {
                      onStyleChanges(style, val);
                    },
                  },
                ],
              },
            ]
          : [],
      //横线
      [PRINT_ELE_TYPE.HORIZONTAL_LINE]:
        type.value === PRINT_ELE_TYPE.HORIZONTAL_LINE
          ? [
              {
                text: '横线设置',
                children: [
                  {
                    type: 'input-content',
                    props: {
                      type: 'number',
                      label: '横线高度',
                      min: 1,
                      value: sty.value['border-width'] ? parseInt(sty.value['border-width']) : 2,
                      defaultValue: 2,
                    },
                    changeEvent(val) {
                      onStyleChanges('border-width', val ?? 2);
                    },
                  },
                ],
              },
            ]
          : [],
      //竖线
      [PRINT_ELE_TYPE.VERTICAL_LINE]:
        type.value === PRINT_ELE_TYPE.VERTICAL_LINE
          ? [
              {
                text: '竖线设置',
                children: [
                  {
                    type: 'input-content',
                    props: {
                      type: 'number',
                      label: '竖线宽度',
                      min: 1,
                      value: sty.value['border-width'] ? parseInt(sty.value['border-width']) : 2,
                      defaultValue: 2,
                    },
                    changeEvent(val) {
                      onStyleChanges('border-width', val ?? 2);
                    },
                  },
                ],
              },
            ]
          : [],
      // 打印服务专属属性
      [PRINT_ELE_TYPE.TEXT]:
        type.value === PRINT_ELE_TYPE.TEXT
          ? [
              {
                text: '文本',
                children: [
                  {
                    type: 'font-family',
                    props: {
                      value: sty.value['font-family'] || 'Roboto, sans-serif',
                    },
                    changeEvent(newValue) {
                      onStyleChanges('font-family', newValue);
                    },
                  },
                  {
                    type: 'text-align',
                    props: {
                      textAlign: sty.value['text-align'],
                      disabled: false,
                    },
                    changeEvent(newValue) {
                      onStyleChanges('text-align', newValue);
                    },
                  },
                  {
                    type: 'text-vertical-align',
                    props: {
                      verticalAlign: sty.value['vertical-align'],
                      disabled: false,
                    },
                    changeEvent(newValue) {
                      onStyleChanges('vertical-align', newValue);
                    },
                  },
                  {
                    type: 'font-style',
                    props: {
                      fontWeight: sty.value['font-weight'],
                      fontStyle: sty.value['font-style'],
                      textDecoration: sty.value['text-decoration'],
                    },
                    changeEvent({ prop, value }) {
                      onStyleChanges(prop, value);
                    },
                  },
                  {
                    type: 'font-size-and-color',
                    props: {
                      type: 'number',
                      label: '字号',
                      min: 6,
                      max: Infinity,
                      value: parseInt(sty.value['font-size']) || 14,
                      color: sty.value['color'] || '#000000',
                    },
                    changeEvent(val) {
                      onStyleChanges('font-size', val);
                    },
                    change2Event(val) {
                      onStyleChanges('color', val);
                    },
                  },
                  {
                    type: 'color-picker',
                    props: {
                      label: '背景色',
                      type: 'solid',
                      alpha: false,
                      value: sty.value['bg-color'],
                    },
                    changeEvent(val) {
                      onStyleChanges('bg-color', val);
                    },
                  },
                ],
              },
              {
                text: '边框',
                children: [
                  {
                    type: 'border-config',
                    props: {
                      isLabelPrint: true,
                      value: {
                        borderAll: sty.value['border-all'],
                        borderTop: sty.value['border-top'],
                        borderRight: sty.value['border-right'],
                        borderBottom: sty.value['border-bottom'],
                        borderLeft: sty.value['border-left'],
                      },
                    },
                    changeEvent(val) {
                      onStyleChanges('border-all', val.borderAll);
                      onStyleChanges('border-top', val.borderTop);
                      onStyleChanges('border-right', val.borderRight);
                      onStyleChanges('border-bottom', val.borderBottom);
                      onStyleChanges('border-left', val.borderLeft);
                    },
                  },
                ],
              },
              {
                text: '文本内容',
                children: [
                  {
                    type: 'select-content',
                    props: {
                      label: '类型',
                      value: att.value['text'].type,
                      options: [
                        { label: '变量', value: DATA_TYPE.VAR },
                        { label: '固定数据', value: DATA_TYPE.FIXED },
                      ],
                    },
                    changeEvent(newValue) {
                      att.value['text'].label = '';
                      onAttrsTypeChanges('text', newValue);
                    },
                  },
                  att.value['text'].type === DATA_TYPE.FIXED
                    ? {
                        type: 'input-content',
                        props: {
                          label: '内容',
                          value: att.value['text'].value,
                        },
                        changeEvent(val) {
                          onAttrsChanges('text', val);
                        },
                      }
                    : {
                        type: 'select-content',
                        props: {
                          label: '内容',
                          value: att.value['text'].sourceType || CONTENT_TYPE.MODEL,
                          options: [
                            { label: '模型字段', value: CONTENT_TYPE.MODEL },
                            { label: '表达式', value: CONTENT_TYPE.EXPRESSION },
                          ],
                        },
                        changeEvent(newValue) {
                          onAttrsText('sourceType', newValue);
                        },
                      },
                  att.value['text'].type === DATA_TYPE.VAR
                    ? att.value['text'].sourceType !== CONTENT_TYPE.EXPRESSION
                      ? {
                          type: 'field-content',
                          props: {
                            label: '',
                            value: att.value['text'].value,
                          },
                          changeEvent({ val, label }) {
                            att.value['text'].label = label;
                            onAttrsChanges('text', val);
                          },
                        }
                      : {
                          type: 'expression-content',
                          props: {
                            value: att.value['text'].exp,
                          },
                          changeEvent(val) {
                            onAttrsText('exp', val);
                          },
                        }
                    : { type: '占位' },
                ],
              },
            ]
          : [],
      [PRINT_ELE_TYPE.BAR_CODE]:
        type.value === PRINT_ELE_TYPE.BAR_CODE
          ? [
              {
                text: '条码设置',
                children: [
                  {
                    type: 'select-content',
                    props: {
                      label: '类型',
                      value: att.value['type'].value,
                      options: barcodeTypeEnum,
                    },
                    changeEvent(newValue) {
                      const defaultValue = {
                        CODE_128: 'Barcode Text',
                        CODE_39: 'BARCODETEXT',
                        EAN_13: '1111111111116',
                        GS1_128: '(01)00000000000000',
                      };
                      onAttrsChanges('type', newValue);
                      onAttrsChanges('value', defaultValue[newValue]);
                      // if (!att.value['content'].value) {
                      onAttrsChanges('content', defaultValue[newValue]);
                      // }
                    },
                  },
                  {
                    type: 'input-content',
                    props: {
                      type: 'number',
                      label: '点',
                      min: 1,
                      max: 5,
                      value: att.value['dot'] ? parseInt(att.value['dot'].value) : 1,
                    },
                    changeEvent(newValue) {
                      if (!newValue) {
                        newValue = 1;
                      }
                      onAttrsChanges('dot', newValue);
                    },
                  },
                  {
                    type: 'select-content',
                    props: {
                      label: '是否显示下方文本',
                      value: att.value['showText'] ? att.value['showText'].value : true,
                      options: showTextEnum,
                    },
                    changeEvent(newValue) {
                      onAttrsChanges('showText', newValue);
                    },
                  },
                ],
              },
              {
                text: '条码内容',
                children: [
                  {
                    type: 'select-content',
                    props: {
                      label: '类型',
                      value: att.value['content'].type,
                      options: [
                        { label: '变量', value: DATA_TYPE.VAR },
                        { label: '固定数据', value: DATA_TYPE.FIXED },
                      ],
                    },
                    changeEvent(newValue) {
                      if (
                        att.value['content'].type === DATA_TYPE.VAR &&
                        newValue === DATA_TYPE.FIXED
                      ) {
                        const defaultValue = {
                          CODE_128: 'Barcode Text',
                          CODE_39: 'BARCODETEXT',
                          EAN_13: '1111111111116',
                          GS1_128: '(01)00000000000000',
                        };
                        att.value['content'].value = defaultValue[att.value['type'].value];
                      }
                      att.value['content'].label = '';
                      onAttrsTypeChanges('content', newValue);
                    },
                  },
                  att.value['content'].type === DATA_TYPE.FIXED
                    ? {
                        type: 'input-content',
                        props: {
                          label: '内容',
                          value: att.value['content'].value,
                          filter: (val) => {
                            let newVal = val;
                            if (att.value['type'].value === 'EAN_13') {
                              newVal = val.replace(/\s/g, '').replace(/[^0-9]/, '');
                              if (newVal.search(/^[0-9]{12}$/) !== -1) {
                                newVal += checksum(val);
                              }
                            } else if (att.value['type'].value === 'CODE_39') {
                              newVal = val
                                .replace(/\s/g, '')
                                .toLocaleUpperCase()
                                .replace(/[^0-9A-Z\-\.\ \$\/\+\%]/g, '');
                              newVal = newVal;
                            } else {
                              newVal = val.replace(/[^\x00-\x7F\xC8-\xD3]/g, '');
                              newVal = newVal;
                            }
                            return newVal;
                          },
                          validate: (val) => {
                            if (!val) {
                              createMessage.error('条码内容不能为空');
                              return false;
                            } else if (
                              att.value['type'].value === 'EAN_13' &&
                              (val.search(/^[0-9]{13}$/) === -1 || +val[12] !== checksum(val))
                            ) {
                              createMessage.error('条码内容不符合EAN13规则');
                              return false;
                            } else if (
                              att.value['type'].value === 'CODE_39' &&
                              val.search(/^[0-9A-Z\-\.\ \$\/\+\%]+$/) === -1
                            ) {
                              createMessage.error('条码内容不符合CODE39规则');
                              return false;
                            } else if (
                              att.value['type'].value === 'CODE-128' &&
                              !/^[\x00-\x7F\xC8-\xD3]+$/.test(val)
                            ) {
                              createMessage.error('条码内容不符合CODE128规则');
                              return false;
                            } else if (
                              att.value['type'].value === 'GS1_128' &&
                              !/^[0-9A-Za-z\(\)]+$/.test(val)
                              // ^(\(?01\)?\d{14})(\(?(11|17)\)?(\d{2}[0-1]\d[0-3]\d)){0,2}(\(?(10|21)\)?([^\x1D]{1,20})){0,2}$
                              // 01 全球贸易项目代码（GTIN） N2+N14
                              // 10 批号（BATCH/LOT） N2+X..20（数据长度为1到20个字符，不包括分隔符\x1D）
                              // 11 生产日期 N2+N6(YYMMDD)
                              // 17 保质期 N2+N6(YYMMDD)
                              // 21 系列号 N2+X..20
                            ) {
                              createMessage.error('条码内容不符合GS1-128规则');
                              return false;
                            } else {
                              return true;
                            }
                          },
                        },
                        changeEvent(val) {
                          const defaultValue = {
                            CODE_128: 'Barcode Text',
                            CODE_39: 'BARCODETEXT',
                            EAN_13: '1111111111116',
                            GS1_128: '(01)00000000000000',
                          };
                          if (!val) {
                            val = defaultValue[att.value['type'].value];
                          }
                          onAttrsChanges('content', val);
                        },
                      }
                    : {
                        type: 'select-content',
                        props: {
                          label: '内容',
                          value: att.value['content'].sourceType || CONTENT_TYPE.MODEL,
                          options: [
                            { label: '模型字段', value: CONTENT_TYPE.MODEL },
                            { label: '表达式', value: CONTENT_TYPE.EXPRESSION },
                          ],
                        },
                        changeEvent(newValue) {
                          onAttrsContent('sourceType', newValue);
                        },
                      },
                  att.value['content'].type === DATA_TYPE.VAR
                    ? att.value['content'].sourceType !== CONTENT_TYPE.EXPRESSION
                      ? {
                          type: 'field-content',
                          props: {
                            label: '',
                            value: att.value['content'].value,
                          },
                          changeEvent({ val, label }) {
                            att.value['content'].label = label;
                            onAttrsChanges('content', val);
                          },
                        }
                      : {
                          type: 'expression-content',
                          props: {
                            value: att.value['content'].exp,
                          },
                          changeEvent(val) {
                            onAttrsContent('exp', val);
                          },
                        }
                    : { type: '占位' },
                ],
              },
            ]
          : [],
      [PRINT_ELE_TYPE.QR_CODE]:
        type.value === PRINT_ELE_TYPE.QR_CODE
          ? [
              {
                text: '二维码设置',
                children: [
                  {
                    type: 'input-content',
                    props: {
                      type: 'number',
                      label: '放大率',
                      min: 1,
                      max: 10,
                      value: att.value['magnification']
                        ? parseInt(att.value['magnification'].value)
                        : 4,
                    },
                    changeEvent(newValue) {
                      if (!newValue) {
                        newValue = 1;
                      }
                      onAttrsChanges('magnification', newValue);
                      const sizeMap = {
                        1: 26,
                        2: 52,
                        3: 75,
                        4: 102,
                        5: 126,
                        6: 150,
                        7: 175,
                        8: 200,
                        9: 225,
                        10: 250,
                      };
                      emitChanges('height', sizeMap[newValue]);
                      emitChanges('width', sizeMap[newValue]);
                    },
                  },
                  {
                    type: 'select-content',
                    props: {
                      label: '类型',
                      value: att.value['type']?.value ?? 'QR_CODE',
                      options: [
                        { label: 'QR Code', value: QR_CODE_TYPE.QR_CODE },
                        { label: 'GS1 Data Matrix', value: QR_CODE_TYPE.GS1_DATA_MATRIX },
                      ],
                    },
                    changeEvent(newValue) {
                      let text = att.value['content'].type == DATA_TYPE.FIXED ? 'QR code Text' : '';
                      if (newValue == 'GS1_DATA_MATRIX') {
                        text =
                          att.value['content'].type == DATA_TYPE.FIXED
                            ? 'GS1 Data Matrix Text'
                            : '';
                      }
                      onAttrsChanges('content', text);
                      onAttrsChanges('type', newValue);
                    },
                  },
                ],
              },
              {
                text: '二维码内容',
                children: [
                  {
                    type: 'select-content',
                    props: {
                      label: '类型',
                      value: att.value['content'].type,
                      options: [
                        { label: '变量', value: DATA_TYPE.VAR },
                        { label: '固定数据', value: DATA_TYPE.FIXED },
                      ],
                    },
                    changeEvent(newValue) {
                      if (
                        newValue === DATA_TYPE.FIXED &&
                        att.value['content'].type === DATA_TYPE.VAR
                      ) {
                        att.value['content'].value =
                          att.value['type']?.value == QR_CODE_TYPE.QR_CODE
                            ? 'QR code Text'
                            : 'GS1 Data Matrix Text';
                      } else {
                        att.value['content'].value = '';
                      }
                      att.value['content'].label = '';
                      onAttrsTypeChanges('content', newValue);
                    },
                  },
                  att.value['content'].type === DATA_TYPE.FIXED
                    ? {
                        type: 'input-content',
                        props: {
                          label: '内容',
                          value: att.value['content'].value,
                          filter: (val) => {
                            let newVal = val;
                            if (att.value['type'].value === 'GS1_DATA_MATRIX') {
                              newVal = val.replace(/\s/g, '').replace(/[^0-9A-Za-z\(\)]/g, '');
                            }
                            return newVal;
                          },
                        },
                        changeEvent(val) {
                          onAttrsChanges('content', val);
                        },
                      }
                    : {
                        type: 'select-content',
                        props: {
                          label: '内容',
                          value: att.value['content'].sourceType || CONTENT_TYPE.MODEL,
                          options: [
                            { label: '模型字段', value: CONTENT_TYPE.MODEL },
                            { label: '表达式', value: CONTENT_TYPE.EXPRESSION },
                          ],
                        },
                        changeEvent(newValue) {
                          onAttrsContent('sourceType', newValue);
                        },
                      },
                  att.value['content'].type === DATA_TYPE.VAR
                    ? att.value['content'].sourceType !== CONTENT_TYPE.EXPRESSION
                      ? {
                          type: 'field-content',
                          props: {
                            label: '',
                            value: att.value['content'].value,
                          },
                          changeEvent({ val, label }) {
                            att.value['content'].label = label;
                            onAttrsChanges('content', val);
                          },
                        }
                      : {
                          type: 'expression-content',
                          props: {
                            value: att.value['content'].exp,
                          },
                          changeEvent(val) {
                            onAttrsContent('exp', val);
                          },
                        }
                    : { type: '占位' },
                ],
              },
            ]
          : [],
      [PRINT_ELE_TYPE.IMAGE]:
        type.value === PRINT_ELE_TYPE.IMAGE
          ? [
              {
                text: '图片地址',
                children: [
                  {
                    type: 'image-data',
                    props: {
                      label: '地址',
                      src: att.value['src'].value,
                    },
                    changeEvent(val) {
                      onAttrsChanges('src', val);
                    },
                  },
                ],
              },
            ]
          : [],
    };
  });
  const checksum = (number) => {
    const res = number
      .substr(0, 12)
      .split('')
      .map((n) => +n)
      .reduce((sum, a, idx) => (idx % 2 ? sum + a * 3 : sum + a), 0);

    return (10 - (res % 10)) % 10;
  };

  return {
    basicProperties,
    componentProperties,
    selectedItem,
    emitChanges,
    onAttrsChanges,
    onStyleChanges,
    onAttrsTypeChanges,
    onAttrsVarChanges,
    alias,
    height,
    width,
    top,
    left,
    bottom,
    right,
    name,
    type,
    zIndex,
    rotate,
    sty,
    att,
    child,
    heightDisabled,
    widthDisabled,
    hasRotate,
    minWidth,
    minHeight,
  };
}
