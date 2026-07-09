export enum PRINT_ELE_TYPE {
  RECTANGLE = 'RECTANGLE',
  HORIZONTAL_LINE = 'HORIZONTAL_LINE',
  VERTICAL_LINE = 'VERTICAL_LINE',
  TEXT = 'TEXT',
  BAR_CODE = 'BAR_CODE',
  QR_CODE = 'QR_CODE',
  IMAGE = 'IMAGE',
  ICON = 'ICON',
  RICH_TEXT = 'RICH_TEXT',
}

export enum DATA_TYPE {
  FIXED = 'FIXED',
  VAR = 'VAR',
}

export enum CONTENT_TYPE {
  MODEL = 'model',
  EXPRESSION = 'expr',
  LABEL_PARAMS = 'label_params',
}

export enum QR_CODE_TYPE {
  QR_CODE = 'QR_CODE',
  GS1_DATA_MATRIX = 'GS1_DATA_MATRIX',
}

const symbolElements = [
  {
    label: 'sys.printDesigner.basic',
    children: [
      {
        alias: '',
        iconName: 'juxing',
        displayName: 'sys.printDesigner.rect',
        type: PRINT_ELE_TYPE.RECTANGLE,
        width: 100,
        height: 50,
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
        displayName: 'sys.printDesigner.horizontalLine',
        type: PRINT_ELE_TYPE.HORIZONTAL_LINE,
        width: 200,
        height: 24,
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
        displayName: 'sys.printDesigner.verticalLine',
        type: PRINT_ELE_TYPE.VERTICAL_LINE,
        width: 24,
        height: 200,
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
        iconName: 'wenben1',
        displayName: 'sys.text',
        type: PRINT_ELE_TYPE.TEXT,
        width: 100,
        height: 40,
        isEdit: false,
        attrs: {
          text: {
            label: 'sys.text',
            value: '',
            type: DATA_TYPE.FIXED,
          },
        },
        styles: {
          'text-align': 'left',
          'vertical-align': 'top',
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
        iconName: 'tupian_wudaima',
        displayName: 'sys.image',
        type: PRINT_ELE_TYPE.IMAGE,
        width: 80,
        height: 80,
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
    ],
  },
  {
    label: 'sys.printDesigner.advanced',
    children: [
      // {
      //   alias: '',
      //   iconName: 'fuwenben',
      //   displayName: '富文本',
      //   type: PRINT_ELE_TYPE.RICH_TEXT,
      //   width: 560,
      //   height: 80,

      //   attrs: {
      //     text: {
      //       label: '',
      //       value: '',
      //       type: DATA_TYPE.FIXED,
      //     },
      //   },
      //   styles: {
      //     'text-align': 'left',
      //     'vertical-align': 'top',
      //   },
      //   classes: {},
      //   rotate: 0,
      //   hasPos: true,
      //   hasRotate: true,
      //   rotateWidth: 0,
      //   rotateHeight: 0,
      // },
      {
        alias: '',
        iconName: 'tiaoma',
        displayName: 'sys.printDesigner.barcode.index',
        type: PRINT_ELE_TYPE.BAR_CODE,
        width: 167,
        height: 40,
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
        iconName: 'erweima2',
        displayName: 'sys.printDesigner.qrCode.index',
        type: PRINT_ELE_TYPE.QR_CODE,
        width: 102,
        height: 102,
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
        iconName: 'tubiao',
        displayName: 'sys.appDesigner.icon',
        type: PRINT_ELE_TYPE.ICON,
        width: 72,
        height: 72,
        attrs: {
          icon: {
            value: 'icon-park:aiming',
          },
          logoColor: {
            value: '#ffffff',
          },
          logoBgColor: {
            value: '#3370FF',
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
    ],
  },
];

export default symbolElements;
