<script lang="ts">
  import comps from '../components/widgets';
  import MrEl from '../components/mr-vue/MrEl.vue';
  import { h } from 'vue';
  import { PRINT_ELE_TYPE } from '../constants/CommonPrintElems';

  export default {
    name: 'StageEl',
    components: { ...comps },
    props: ['elem', 'tableData'],
    data() {
      return {
        currentSize: {
          width: this.elem.width,
          height: this.elem.height,
        },
      };
    },
    computed: {},
    watch: {
      'elem.width'(nv) {
        this.currentSize.width = nv;
      },
      'elem.height'(nv) {
        this.currentSize.height = nv;
      },
    },
    methods: {
      updateElementSize(width, height) {
        this.currentSize = { width: parseInt(width), height: parseInt(height) };
      },
      updatePBarcodeSize({ width, rotateWidth, height }) {
        this.$emit('updatePBarcodeWidth', {
          width: parseInt(width),
          rotateWidth: parseInt(rotateWidth),
          height: parseInt(height),
          elId: this.elem.id,
        });
      },
    },
    render: function () {
      let elementO = this.elem;

      let styles = elementO.styles;

      if (elementO.rotate === 90) {
        styles.transform = `rotate(${elementO.rotate}deg)`;
        styles.height = elementO.width + 'px';
        styles.width = elementO.height + 'px';
        styles.transformOrigin = `${parseInt(styles.height) / 2}px ${
          parseInt(styles.height) / 2
        }px`;
      } else {
        styles.height = '100%';
        styles.width = '100%';
        styles.transform = 'none';
        styles.transformOrigin = 'none';
      }

      let attrs = {};

      for (let key in elementO.attrs) {
        attrs[key] = elementO.attrs[key]['value'];
      }

      let props = {};
      if (elementO.type === PRINT_ELE_TYPE.BAR_CODE) {
        props = {
          elId: elementO.id,
          ...elementO.attrs,
          height: elementO.rotate === 90 ? this.currentSize.width : this.currentSize.height,
          rotate: elementO.rotate,
        };
      } else if (elementO.type === PRINT_ELE_TYPE.QR_CODE) {
        props = {
          ...elementO.attrs,
        };
      } else if (
        elementO.type === PRINT_ELE_TYPE.HORIZONTAL_LINE ||
        elementO.type === PRINT_ELE_TYPE.VERTICAL_LINE ||
        elementO.type === PRINT_ELE_TYPE.RECTANGLE
      ) {
        props = {
          'border-width': styles['border-width'],
          color: styles['color'],
        };
      } else if (elementO.type === PRINT_ELE_TYPE.TEXT) {
        props = {
          'font-size': styles['font-size'],
          'bg-color': styles['bg-color'],
          'border-top': styles['border-top'],
          'border-right': styles['border-right'],
          'border-bottom': styles['border-bottom'],
          'border-left': styles['border-left'],
          type: elementO.attrs.text.type,
          label: elementO.attrs.text.label,
        };
      }
      let event = {};
      if (elementO.type === PRINT_ELE_TYPE.BAR_CODE) {
        event = {
          onBarcodeChange: this.updatePBarcodeSize,
        };
      }
      const data = {
        class: elementO.classes,
        style: styles,
        id: elementO.id,
        ownId: elementO.ownId,
        // 'data-containegg': elementO.containegg,
        'el-width': this.currentSize.width,
        'el-height': this.currentSize.height,
        ...JSON.parse(JSON.stringify(attrs)), //防止attr中包含的复杂的对象和数组结构直接引用过来
        ...props,
        ...event,
      };

      let stageElem;

      let mrElProps = {
        id: elementO.id,
        type: elementO.type,
        internal: elementO.internal,
        events: elementO.events,
        left: elementO.left,
        top: elementO.top,
        right: elementO.right,
        bottom: elementO.bottom,
        zIndex: elementO.zIndex,
        width: elementO.width,
        height: elementO.height,
        rotate: elementO.rotate,
        minWidth: elementO.minWidth,
        minHeight: elementO.minHeight,
        elem: this.elem,
      };
      if (elementO.type === PRINT_ELE_TYPE.QR_CODE) {
        mrElProps = { ...mrElProps, handles: null };
      } else if (elementO.type === PRINT_ELE_TYPE.BAR_CODE) {
        if (elementO.rotate === 90) {
          mrElProps = { ...mrElProps, handles: ['ml', 'mr'] };
        } else {
          mrElProps = { ...mrElProps, handles: ['mt', 'mb'] };
        }
      } else {
        mrElProps = mrElProps;
      }
      stageElem = h(
        MrEl,
        {
          ...mrElProps,
        },
        [h(comps[elementO.type] || elementO.type, data)],
      );
      return stageElem;
    },
  };
</script>
