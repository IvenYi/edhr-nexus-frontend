export enum PRINT_ELE_TYPE {
  RECTANGLE = 'RECTANGLE',
  HORIZONTAL_LINE = 'HORIZONTAL_LINE',
  VERTICAL_LINE = 'VERTICAL_LINE',
  TEXT = 'TEXT',
  BAR_CODE = 'BAR_CODE',
  QR_CODE = 'QR_CODE',
  IMAGE = 'IMAGE',
}

export enum DATA_TYPE {
  FIXED = 'FIXED',
  VAR = 'VAR',
}

export enum CONTENT_TYPE {
  MODEL = 'model',
  EXPRESSION = 'expr',
}

export enum QR_CODE_TYPE {
  QR_CODE = 'QR_CODE',
  GS1_DATA_MATRIX = 'GS1_DATA_MATRIX',
}

const symbolElements = [
  {
    alias: '',
    iconName: 'juxing',
    displayName: '矩形',
    type: PRINT_ELE_TYPE.RECTANGLE,
    width: 100,
    height: 50,
    minWidth: 20,
    minHeight: 20,
    attrs: {},
    styles: {
      'border-color': '#333',
      'border-style': 'solid',
      'border-width': 2,
      //背景色改成透明
      background: 'transparent',
    },
    classes: {},
    rotate: 0,
    hasPos: true,
  },
  {
    alias: '',
    iconName: 'hengxian',
    displayName: '横线',
    type: PRINT_ELE_TYPE.HORIZONTAL_LINE,
    width: 200,
    height: 24,
    minWidth: 1,
    minHeight: 1,
    styles: {
      color: '#333',
      'border-width': 2,
    },
    classes: {},
    rotate: 0,
    hasPos: true,
  },
  {
    alias: '',
    iconName: 'shuxian',
    displayName: '竖线',
    type: PRINT_ELE_TYPE.VERTICAL_LINE,
    width: 24,
    height: 200,
    minWidth: 1,
    minHeight: 1,
    attrs: {},
    styles: {
      color: '#333',
      'border-width': 2,
    },
    classes: {},
    rotate: 0,
    hasPos: true,
  },
  {
    alias: '',
    iconName: 'wenben',
    displayName: '文本',
    type: PRINT_ELE_TYPE.TEXT,
    width: 100,
    height: 40,
    minWidth: 30,
    minHeight: 20,
    attrs: {
      text: {
        label: '文本',
        value: '文本',
        type: DATA_TYPE.FIXED,
      },
    },
    styles: {
      'text-align': 'left',
      'vertical-align': 'middle',
      color: '#000',
      'font-size': 18,
      'font-family': '微软雅黑',
    },
    classes: {},
    rotate: 0,
    hasPos: true,
    hasRotate: true,
    rotateWidth: 0,
    rotateHeight: 0,
  },
  {
    alias: '',
    iconName: 'tiaoxingma',
    displayName: '条码',
    type: PRINT_ELE_TYPE.BAR_CODE,
    width: 167,
    height: 40,
    minWidth: 1,
    minHeight: 1,
    attrs: {
      content: {
        label: 'Barcode Text',
        value: 'Barcode Text',
        type: DATA_TYPE.FIXED,
      },
      type: {
        value: 'CODE_128',
      },
      dot: {
        value: 1,
      },
      showText: {
        value: true,
      },
      varLength: {
        value: 10,
      },
    },
    styles: {},
    classes: {},
    rotate: 0,
    hasPos: true,
    hasRotate: true,
    rotateWidth: 0,
    rotateHeight: 0,
  },
  {
    alias: '',
    iconName: 'erweima',
    displayName: '二维码',
    type: PRINT_ELE_TYPE.QR_CODE,
    width: 102,
    height: 102,
    minWidth: 20,
    minHeight: 20,
    attrs: {
      content: {
        label: 'QR code Text',
        value: 'QR code Text',
        type: DATA_TYPE.FIXED,
      },
      type: {
        value: 'QR_CODE',
      },
      magnification: {
        value: 4,
      },
    },
    styles: {},
    classes: {},
    rotate: 0,
    hasPos: true,
  },
  {
    alias: '',
    iconName: 'tupian',
    displayName: '图片',
    type: PRINT_ELE_TYPE.IMAGE,
    width: 80,
    height: 80,
    minWidth: 20,
    minHeight: 20,
    attrs: {
      src: {
        value: '',
      },
    },
    styles: {},
    classes: {},
    rotate: 0,
    hasPos: true,
    hasRotate: true,
    rotateWidth: 0,
    rotateHeight: 0,
  },
];

export default symbolElements;
