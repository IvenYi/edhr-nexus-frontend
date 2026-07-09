import { computed, ref, inject } from 'vue';
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
import RichEditorModal from '../modal/rich-editor-modal.vue';

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
    label: $t('sys.appDesigner.show'),
    value: true,
  },
  {
    label: $t('sys.appDesigner.hidden'),
    value: false,
  },
];
const { selectedElements } = useDesigner();
const { project, isEdhr } = usePage();
const { createMessage } = useMessage();

const dhrFlag = computed(() => {
  return isEdhr.value;
});

function getTextContentTypes(isEdhr = dhrFlag.value) {
  if (isEdhr) {
    return [
      { label: $t('sys.printDesigner.labelParams'), value: CONTENT_TYPE.LABEL_PARAMS },
      { label: $t('sys.model.expression'), value: CONTENT_TYPE.EXPRESSION },
    ];
  }
  return [
    { label: $t('sys.model.modelFields'), value: CONTENT_TYPE.MODEL },
    { label: $t('sys.model.expression'), value: CONTENT_TYPE.EXPRESSION },
  ];
}

export function useProp(context) {
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
          text: 'sys.pageDesigner.basicProp',
          show: !selectedItem.value.internal,
          children: [
            // {
            //   type: 'alias-input',
            //   props: {
            //     alias: alias.value,
            //   },
            //   changeEvent(val) {
            //     emitChanges('alias', val);
            //   },
            // },
            {
              type: 'dim-pos',
              props: {
                height: height.value,
                heightMM: heightMM.value,
                width: width.value,
                widthMM: widthMM.value,
                top: top.value,
                topMM: topMM.value,
                bottom: bottom.value,
                bottomMM: bottomMM.value,
                left: left.value,
                leftMM: leftMM.value,
                right: right.value,
                rightMM: rightMM.value,
                rotate: rotate.value,
                hasRotate: hasRotate.value,
                heightDisabled: heightDisabled.value,
                widthDisabled: widthDisabled.value,
                rotateWidth: rotateWidth.value,
                rotateHeight: rotateHeight.value,
                // 'hasDim': true
              },
              changeEvent(data) {
                emitChanges(data.type, data.value);
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

  const emitChanges = (_type, value, prop?) => {
    context.emit('propchange', { type: _type, value, prop });
  };
  const onStyleChanges = (prop, value) => {
    const style = { ...sty.value };
    style[prop] = value;
    emitChanges('styles', style, prop);
  };
  // const onAttrs = (prop, value) => {
  //   const attrs = { ...att.value };
  //   attrs[prop] = value;
  //   emitChanges('attrs', attrs, prop);
  // };
  const onAttrsContent = (prop, value) => {
    const attrs = { ...att.value };
    attrs.content[prop] = value;
    console.log('attrs.content---change---', prop, value, attrs.content);
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
  const heightMM = computed(() => {
    return selectedItem.value.heightMM;
  });
  const width = computed(() => {
    return selectedItem.value.width;
  });
  const widthMM = computed(() => {
    return selectedItem.value.widthMM;
  });
  const top = computed(() => {
    return selectedItem.value.top;
  });
  const topMM = computed(() => {
    return selectedItem.value.topMM;
  });
  const left = computed(() => {
    return selectedItem.value.left;
  });
  const leftMM = computed(() => {
    return selectedItem.value.leftMM;
  });
  const bottom = computed(() => {
    return selectedItem.value.bottom;
  });
  const bottomMM = computed(() => {
    return selectedItem.value.bottomMM;
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
  const rightMM = computed(() => {
    return selectedItem.value.rightMM;
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
                text: 'sys.printDesigner.appearance',
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
                text: $t('sys.printDesigner.horizontalLineSetting'),
                children: [
                  {
                    type: 'input-content',
                    props: {
                      type: 'number',
                      label: $t('sys.printDesigner.horizontalLine') + $t('sys.height'),
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
                text: $t('sys.printDesigner.verticalLineSetting'),
                children: [
                  {
                    type: 'input-content',
                    props: {
                      type: 'number',
                      label: $t('sys.printDesigner.verticalLine') + $t('sys.width'),
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
                text: $t('sys.pageDesigner.style'),
                isStyle: true,
                children: [
                  {
                    type: 'font-family',
                    props: {
                      type: 'number',
                      min: 6,
                      max: Infinity,
                      value: parseInt(sty.value['font-size']) || 14,
                      color: sty.value['color'] || '#000000',
                      fontFamily: sty.value['font-family'] || 'Roboto, sans-serif',
                    },
                    changeEvent(newValue) {
                      onStyleChanges('font-family', newValue);
                    },
                    change2Event(val) {
                      onStyleChanges('font-size', val);
                    },
                    change3Event(val) {
                      onStyleChanges('color', val);
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
                  // {
                  //   type: 'text-vertical-align',
                  //   props: {
                  //     verticalAlign: sty.value['vertical-align'],
                  //     disabled: false,
                  //   },
                  //   changeEvent(newValue) {
                  //     onStyleChanges('vertical-align', newValue);
                  //   },
                  // },
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
                ],
              },
              {
                text: $t('sys.pageDesigner.background') ,
                isStyle: true,
                children: [
                  {
                    type: 'color-picker',
                    props: {
                      label: $t('sys.pageDesigner.backgroundColor'),
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
                text: $t('sys.pageDesigner.border'),
                isStyle: true,
                children: [
                  {
                    type: 'border-radius',
                    props: {
                      isLabelPrint: true,
                      value: {
                        borderAllRadius: sty.value['border-radius'],
                        borderTopLeftRadius: sty.value['border-top-left-radius'],
                        borderTopRightRadius: sty.value['border-top-right-radius'],
                        borderBottomLeftRadius: sty.value['border-bottom-left-radius'],
                        borderBottomRightRadius: sty.value['border-bottom-right-radius'],
                      },
                    },
                    changeEvent(val) {
                      onStyleChanges('border-radius', val.borderAllRadius);
                      onStyleChanges('border-top-left-radius', val.borderTopLeftRadius);
                      onStyleChanges('border-top-right-radius', val.borderTopRightRadius);
                      onStyleChanges('border-bottom-left-radius', val.borderBottomLeftRadius);
                      onStyleChanges('border-bottom-right-radius', val.borderBottomRightRadius);
                    },
                  },
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
                text: $t('sys.pageDesigner.textProp'),
                children: [
                  {
                    type: 'radio-select',
                    props: {
                      label: $t('sys.pageDesigner.dataType'),
                      value: att.value['text'].type,
                      options: [
                        { label: $t('sys.pageDesigner.fixed'), value: DATA_TYPE.FIXED },
                        { label: $t('sys.pageDesigner.variable'), value: DATA_TYPE.VAR },
                      ],
                    },
                    changeEvent(newValue) {
                      att.value['text'].value = '';
                      if (newValue === DATA_TYPE.VAR) {
                        att.value['text'].sourceType = getTextContentTypes()[0].value;
                      }
                      onAttrsTypeChanges('text', newValue);
                      emitChanges('isEdit', false);
                    },
                  },
                  att.value['text'].type === DATA_TYPE.FIXED
                    ? {
                        type: 'input-content',
                        props: {
                          label: $t('sys.printDesigner.textContent'),
                          value: att.value['text'].value,
                          type: 'textArea',
                        },
                        changeEvent(val) {
                          onAttrsChanges('text', val);
                        },
                      }
                    : {
                        type: 'variable-select',
                        props: {
                          label: $t('sys.printDesigner.textContent'),
                          value: att.value['text'].value,
                          exp: att.value['text'].exp,
                          type: att.value['text'].sourceType || getTextContentTypes()[0].value,
                          options: getTextContentTypes(),
                        },
                        changeEvent({ val, label, type, exp }) {
                          if (label) {
                            att.value['text'].label = label;
                          }
                          if (val) {
                            onAttrsChanges('text', val);
                          }
                          if (type) {
                            onAttrsText('sourceType', type);
                            att.value['text'].label = label;
                            onAttrsChanges('text', val);
                          }
                          if (exp) {
                            onAttrsText('exp', exp);
                          }
                        },
                      },
                ],
              },
            ]
          : [],
      [PRINT_ELE_TYPE.BAR_CODE]:
        type.value === PRINT_ELE_TYPE.BAR_CODE
          ? [
              {
                text: $t('sys.printDesigner.barcode.setting'),
                children: [
                  {
                    type: 'select-content',
                    props: {
                      label: $t('sys.type'),
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
                      label: $t('sys.printDesigner.dot'),
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
                      label: $t('sys.printDesigner.showUnderText'),
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
                text: $t('sys.printDesigner.barcode.content'),
                children: [
                  {
                    type: 'radio-select',
                    props: {
                      label: $t('sys.pageDesigner.dataType'),
                      value: att.value['content'].type,
                      options: [
                        { label: $t('sys.pageDesigner.fixed'), value: DATA_TYPE.FIXED },
                        { label: $t('sys.pageDesigner.variable'), value: DATA_TYPE.VAR },
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
                      } else {
                        att.value['content'].value = undefined;
                      }
                      if ( att.value['content'].type === DATA_TYPE.FIXED && newValue === DATA_TYPE.VAR) { 
                        att.value['content'].value = '';
                      }
                      att.value['content'].label = '';
                      att.value['content'].sourceType = getTextContentTypes()[0].value;
                      onAttrsTypeChanges('content', newValue);
                    },
                  },
                  att.value['content'].type === DATA_TYPE.FIXED
                    ? {
                        type: 'input-content',
                        props: {
                          label: $t('sys.content'),
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
                              createMessage.error($t('sys.printDesigner.barcode.errorMsg1'));
                              return false;
                            } else if (
                              att.value['type'].value === 'EAN_13' &&
                              (val.search(/^[0-9]{13}$/) === -1 || +val[12] !== checksum(val))
                            ) {
                              createMessage.error($t('sys.printDesigner.barcode.EAN_13'));
                              return false;
                            } else if (
                              att.value['type'].value === 'CODE_39' &&
                              val.search(/^[0-9A-Z\-\.\ \$\/\+\%]+$/) === -1
                            ) {
                              createMessage.error($t('sys.printDesigner.barcode.CODE_39'));
                              return false;
                            } else if (
                              att.value['type'].value === 'CODE-128' &&
                              !/^[\x00-\x7F\xC8-\xD3]+$/.test(val)
                            ) {
                              createMessage.error($t('sys.printDesigner.barcode.CODE_128'));
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
                              createMessage.error($t('sys.printDesigner.barcode.GS1_128'));
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
                          label: $t('sys.content'),
                          value: getTextContentTypes()[0].value,
                          options: getTextContentTypes(),
                        },
                        changeEvent(newValue) {
                          onAttrsContent('sourceType', newValue);
                        },
                      },
                  att.value['content'].type === DATA_TYPE.VAR
                    ? att.value['content'].sourceType !== CONTENT_TYPE.EXPRESSION
                      ? att.value['content'].sourceType === CONTENT_TYPE.LABEL_PARAMS
                        ? {
                            type: 'label-params-select',
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
                    : { type: '占位'  },
                ],
              },
            ]
          : [],
      [PRINT_ELE_TYPE.QR_CODE]:
        type.value === PRINT_ELE_TYPE.QR_CODE
          ? [
              {
                text: $t('sys.printDesigner.qrCode.setting'),
                children: [
                  {
                    type: 'input-content',
                    props: {
                      type: 'number',
                      label: $t('sys.printDesigner.magnification'),
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
                      label: $t('sys.type'),
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
                text: $t('sys.printDesigner.qrCode.content'),
                children: [
                  {
                    type: 'radio-select',
                    props: {
                      label: $t('sys.pageDesigner.dataType'),
                      value: att.value['content'].type,
                      options: [
                        { label: $t('sys.pageDesigner.fixed') , value: DATA_TYPE.FIXED },
                        { label: $t('sys.pageDesigner.variable'), value: DATA_TYPE.VAR },
                      ],
                    },
                    changeEvent(newValue) {
                      console.log('newValue', newValue);
                      if (
                        newValue === DATA_TYPE.FIXED &&
                        att.value['content'].type === DATA_TYPE.VAR
                      ) {
                        att.value['content'].value =
                          att.value['type']?.value == QR_CODE_TYPE.QR_CODE
                            ? 'QR code Text'
                            : 'GS1 Data Matrix Text';
                      } else {
                        att.value['content'].value = undefined;
                      }
                      att.value['content'].label = '';
                      att.value['content'].sourceType = getTextContentTypes()[0].value;
                      onAttrsTypeChanges('content', newValue);
                    },
                  },
                  att.value['content'].type === DATA_TYPE.FIXED
                    ? {
                        type: 'input-content',
                        props: {
                          label: $t('sys.content'),
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
                          label: $t('sys.content'),
                          value: att.value['content'].sourceType || getTextContentTypes()[0].value,
                          options: getTextContentTypes(),
                        },
                        changeEvent(newValue) {
                          onAttrsContent('sourceType', newValue);
                        },
                      },
                  att.value['content'].type === DATA_TYPE.VAR
                    ? att.value['content'].sourceType !== CONTENT_TYPE.EXPRESSION
                      ? att.value['content'].sourceType === CONTENT_TYPE.LABEL_PARAMS
                        ? {
                            type: 'label-params-select',
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
                text: $t('sys.printDesigner.imageSrc'),
                children: [
                  {
                    type: 'image-data',
                    props: {
                      label: $t('sys.pageDesigner.address'),
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
      [PRINT_ELE_TYPE.ICON]:
        type.value === PRINT_ELE_TYPE.ICON
          ? [
              {
                text: $t('sys.printDesigner.iconStyle'),
                children: [
                  {
                    type: 'icon-style',
                    props: {
                      icon: att.value['icon'].value,
                      logoColor: att.value['logoColor'].value,
                      logoBgColor: att.value['logoBgColor'].value,
                    },
                    changeEvent(val) {
                      onAttrsChanges('icon', val.value);
                      onAttrsChanges('logoColor', val.logoColor);
                      onAttrsChanges('logoBgColor', val.logoBgColor);
                    },
                  },
                ],
              },
            ]
          : [],
      [PRINT_ELE_TYPE.RICH_TEXT]:
        type.value === PRINT_ELE_TYPE.RICH_TEXT
          ? [
              {
                text: $t('sys.printDesigner.richTextConfig'),
                children: [
                  {
                    type: 'rich-btn',
                    props: {
                      label: $t('sys.printDesigner.richTextContent'),
                      value: att.value['text'].value,
                    },
                    async changeEvent(val) {
                      const res = await gct.openUtil.modal(
                        RichEditorModal,
                        { value: att.value['text'].value },
                        {
                          title: $t('sys.printDesigner.richTextContent'),
                          width: 850,
                          height: 'auto',
                        },
                      );
                      if (res.ok) {
                        onAttrsChanges('text', res.params.value);
                      }
                    },
                  },
                ],
              },
              {
                text: $t('sys.pageDesigner.background'),
                isStyle: true,
                children: [
                  {
                    type: 'color-picker',
                    props: {
                      label: $t('sys.pageDesigner.backgroundColor'),
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
                text: $t('sys.pageDesigner.border'),
                isStyle: true,
                children: [
                  {
                    type: 'border-radius',
                    props: {
                      isLabelPrint: true,
                      value: {
                        borderAllRadius: sty.value['border-radius'],
                        borderTopLeftRadius: sty.value['border-top-left-radius'],
                        borderTopRightRadius: sty.value['border-top-right-radius'],
                        borderBottomLeftRadius: sty.value['border-bottom-left-radius'],
                        borderBottomRightRadius: sty.value['border-bottom-right-radius'],
                      },
                    },
                    changeEvent(val) {
                      onStyleChanges('border-radius', val.borderAllRadius);
                      onStyleChanges('border-top-left-radius', val.borderTopLeftRadius);
                      onStyleChanges('border-top-right-radius', val.borderTopRightRadius);
                      onStyleChanges('border-bottom-left-radius', val.borderBottomLeftRadius);
                      onStyleChanges('border-bottom-right-radius', val.borderBottomRightRadius);
                    },
                  },
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

  const getComponentPropertiesByType = (pjd, isDHR?) => {
    const pjdValue = pjd.attrs['content'] || pjd.attrs['text'];
    const obj = {
      [PRINT_ELE_TYPE.BAR_CODE]: {
        text: $t('sys.printDesigner.barcode.content'),
        children: [
          {
            type: 'radio-select',
            props: {
              label: $t('sys.pageDesigner.dataType'),
              value: pjdValue.type,
              options: [
                { label: $t('sys.pageDesigner.fixed'), value: DATA_TYPE.FIXED },
                { label: $t('sys.pageDesigner.variable'), value: DATA_TYPE.VAR },
              ],
            },
            changeEvent(newValue) {
              // if (pjdValue.type === DATA_TYPE.VAR && newValue === DATA_TYPE.FIXED) {
              //   const defaultValue = {
              //     CODE_128: 'Barcode Text',
              //     CODE_39: 'BARCODETEXT',
              //     EAN_13: '1111111111116',
              //     GS1_128: '(01)00000000000000',
              //   };
              //   pjdValue = defaultValue[pjd.attrs['type']];
              // }
              pjdValue.sourceType = getTextContentTypes(isDHR)[0].value;
              pjdValue.label = '';
              pjdValue.type = newValue;
              // onAttrsTypeChanges('content', newValue);
            },
          },
          pjdValue.type === DATA_TYPE.FIXED
            ? {
                type: 'input-content',
                props: {
                  label: $t('sys.content'),
                  value: pjdValue.value,
                  filter: (val) => {
                    let newVal = val;
                    if (pjd.attrs['type'] === 'EAN_13') {
                      newVal = val.replace(/\s/g, '').replace(/[^0-9]/, '');
                      if (newVal.search(/^[0-9]{12}$/) !== -1) {
                        newVal += checksum(val);
                      }
                    } else if (pjd.attrs['type'] === 'CODE_39') {
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
                      createMessage.error($t('sys.printDesigner.barcode.errorMsg1'));
                      return false;
                    } else if (
                      pjd.attrs['type'] === 'EAN_13' &&
                      (val.search(/^[0-9]{13}$/) === -1 || +val[12] !== checksum(val))
                    ) {
                      createMessage.error($t('sys.printDesigner.barcode.EAN_13'));
                      return false;
                    } else if (
                      pjd.attrs['type'] === 'CODE_39' &&
                      val.search(/^[0-9A-Z\-\.\ \$\/\+\%]+$/) === -1
                    ) {
                      createMessage.error($t('sys.printDesigner.barcode.CODE_39'));
                      return false;
                    } else if (
                      pjd.attrs['type'] === 'CODE-128' &&
                      !/^[\x00-\x7F\xC8-\xD3]+$/.test(val)
                    ) {
                      createMessage.error($t('sys.printDesigner.barcode.CODE_128'));
                      return false;
                    } else if (
                      pjd.attrs['type'] === 'GS1_128' &&
                      !/^[0-9A-Za-z\(\)]+$/.test(val)
                      // ^(\(?01\)?\d{14})(\(?(11|17)\)?(\d{2}[0-1]\d[0-3]\d)){0,2}(\(?(10|21)\)?([^\x1D]{1,20})){0,2}$
                      // 01 全球贸易项目代码（GTIN） N2+N14
                      // 10 批号（BATCH/LOT） N2+X..20（数据长度为1到20个字符，不包括分隔符\x1D）
                      // 11 生产日期 N2+N6(YYMMDD)
                      // 17 保质期 N2+N6(YYMMDD)
                      // 21 系列号 N2+X..20
                    ) {
                      createMessage.error($t('sys.printDesigner.barcode.GS1_128'));
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
                    val = defaultValue[pjd.attrs['type']];
                  }
                  // onAttrsChanges('content', val);
                  pjdValue.value = val;
                },
              }
            : {
                type: 'select-content',
                props: {
                  label: $t('sys.content'),
                  value: pjdValue.sourceType || getTextContentTypes(isDHR)[0].value,
                  options: getTextContentTypes(isDHR),
                },
                changeEvent(newValue) {
                  // onAttrsContent('sourceType', newValue);
                  pjdValue['sourceType'] = newValue;
                },
              },
          pjdValue.type === DATA_TYPE.VAR
            ? pjdValue.sourceType !== CONTENT_TYPE.EXPRESSION
              ? pjdValue.sourceType === CONTENT_TYPE.LABEL_PARAMS
                ? {
                    type: 'label-params-select',
                    props: {
                      label: '',
                      value: pjdValue.value,
                    },
                    changeEvent({ val, label }) {
                      pjdValue.label = label;
                      pjdValue.value = val;
                    },
                  }
                : {
                    type: 'field-content',
                    props: {
                      label: '',
                      value: pjdValue.value,
                    },
                    changeEvent({ val, label }) {
                      console.log('change', pjdValue);
                      pjdValue.label = label;
                      // onAttrsChanges('content', val);
                      pjdValue.value = val;
                    },
                  }
              : {
                  type: 'expression-content',
                  props: {
                    value: pjdValue.exp,
                  },
                  changeEvent(val) {
                    // onAttrsContent('exp', val);
                    pjdValue['exp'] = val;
                  },
                }
            : { type: '占位' },
        ],
      },
      [PRINT_ELE_TYPE.QR_CODE]: {
        text: $t('sys.printDesigner.qrCode.content'),
        children: [
          {
            type: 'radio-select',
            props: {
              label: $t('sys.pageDesigner.dataType'),
              value: pjdValue.type,
              options: [
                { label: $t('sys.pageDesigner.fixed'), value: DATA_TYPE.FIXED },
                { label: $t('sys.pageDesigner.variable'), value: DATA_TYPE.VAR },
              ],
            },
            changeEvent(newValue) {
              // if (newValue === DATA_TYPE.FIXED && pjdValue.type === DATA_TYPE.VAR) {
              //   pjdValue =
              //     pjd.attrs['type'] == QR_CODE_TYPE.QR_CODE
              //       ? 'QR code Text'
              //       : 'GS1 Data Matrix Text';
              // }

              pjdValue.label = '';
              pjdValue.type = newValue;
              pjdValue.sourceType = getTextContentTypes(isDHR)[0].value;
              // onAttrsTypeChanges('content', newValue);
            },
          },
          pjdValue.type === DATA_TYPE.FIXED
            ? {
                type: 'input-content',
                props: {
                  label: $t('sys.content'),
                  value: pjdValue.value,
                  filter: (val) => {
                    let newVal = val;
                    if (pjd.attrs['type'] === 'GS1_DATA_MATRIX') {
                      newVal = val.replace(/\s/g, '').replace(/[^0-9A-Za-z\(\)]/g, '');
                    }
                    return newVal;
                  },
                },
                changeEvent(val) {
                  // onAttrsChanges('content', val);
                  pjdValue.value = val;
                },
              }
            : {
                type: 'select-content',
                props: {
                  label: $t('sys.content'),
                  value: pjdValue.sourceType || getTextContentTypes(isDHR)[0].value,
                  options: getTextContentTypes(isDHR),
                },
                changeEvent(newValue) {
                  // onAttrsContent('sourceType', newValue);
                  pjdValue['sourceType'] = newValue;
                },
              },
          pjdValue.type === DATA_TYPE.VAR
            ? pjdValue.sourceType !== CONTENT_TYPE.EXPRESSION
              ? pjdValue.sourceType === CONTENT_TYPE.LABEL_PARAMS
                ? {
                    type: 'label-params-select',
                    props: {
                      label: '',
                      value: pjdValue.value,
                    },
                    changeEvent({ val, label }) {
                      pjdValue.label = label;
                      pjdValue.value = val;
                    },
                  }
                : {
                    type: 'field-content',
                    props: {
                      label: '',
                      value: pjdValue.value,
                    },
                    changeEvent({ val, label }) {
                      pjdValue.label = label;
                      // onAttrsChanges('content', val);
                      pjdValue.value = val;
                    },
                  }
              : {
                  type: 'expression-content',
                  props: {
                    value: pjdValue.exp,
                  },
                  changeEvent(val) {
                    // onAttrsContent('exp', val);
                    pjdValue['exp'] = val;
                  },
                }
            : { type: '占位' },
        ],
      },

      [PRINT_ELE_TYPE.TEXT]: {
        text: $t('sys.printDesigner.textContent'),
        children: [
          {
            type: 'radio-select',
            props: {
              label: $t('sys.pageDesigner.dataType'),
              value: pjdValue?.type,
              options: [
                { label: $t('sys.pageDesigner.fixed'), value: DATA_TYPE.FIXED },
                { label: $t('sys.pageDesigner.variable'), value: DATA_TYPE.VAR },
              ],
            },
            changeEvent(newValue) {
              pjdValue.label = '';
              pjdValue.type = newValue;
              pjdValue.sourceType = getTextContentTypes(isDHR)[0].value;
              // onAttrsTypeChanges('text', newValue);
            },
          },
          pjdValue.type === DATA_TYPE.FIXED
            ? {
                type: 'input-content',
                props: {
                  label: $t('sys.content'),
                  value: pjdValue.value,
                },
                changeEvent(val) {
                  // onAttrsChanges('text', val);
                  pjdValue.value = val;
                },
              }
            : {
                type: 'select-content',
                props: {
                  label: $t('sys.content'),
                  value: pjdValue.sourceType || getTextContentTypes(isDHR)[0].value,
                  options: getTextContentTypes(isDHR),
                },
                changeEvent(newValue) {
                  pjdValue['sourceType'] = newValue;
                  // onAttrsText('sourceType', newValue);
                },
              },
          pjdValue.type === DATA_TYPE.VAR
            ? pjdValue.sourceType !== CONTENT_TYPE.EXPRESSION
              ? pjdValue.sourceType === CONTENT_TYPE.LABEL_PARAMS
                ? {
                    type: 'label-params-select',
                    props: {
                      label: '',
                      value: pjdValue.value,
                    },
                    changeEvent({ val, label }) {
                      pjdValue.label = label;
                      pjdValue.value = val;
                    },
                  }
                : {
                    type: 'field-content',
                    props: {
                      label: '',
                      value: pjdValue.value,
                    },
                    changeEvent({ val, label }) {
                      pjdValue.label = label;
                      pjdValue.value = val;
                      // onAttrsChanges('text', val);
                    },
                  }
              : {
                  type: 'expression-content',
                  props: {
                    value: pjdValue.exp,
                  },
                  changeEvent(val) {
                    pjdValue['exp'] = val;
                    // onAttrsText('exp', val);
                  },
                }
            : { type: '占位' },
        ],
      },
    };
    return obj[pjd.type];
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
    heightMM,
    width,
    widthMM,
    top,
    topMM,
    left,
    leftMM,
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
    getComponentPropertiesByType,
  };
}
