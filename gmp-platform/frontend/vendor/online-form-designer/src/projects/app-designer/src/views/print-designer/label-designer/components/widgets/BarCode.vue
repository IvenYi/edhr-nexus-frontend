<template>
  <div class="p-barcode" ref="pBarcodeRef">
    <img
      v-show="elId"
      :id="'barcode_' + id"
      @load="loadImg()"
      class="p-img-element"
      ref="barcodeRef"
    />
    <!-- <canvas
      v-show="type.value == 'GS1_128'"
      class="important-w-full important-h-full"
      ref="canvasRef"
    ></canvas> -->
  </div>
</template>

<script lang="ts" setup name="BAR_CODE">
  import jsbarcode from 'jsbarcode';
  import bwipjs from 'bwip-js';
  import { ref, computed, watch, onMounted, nextTick } from 'vue';

  const props = defineProps({
    elId: {
      type: String,
      require: true,
    },
    content: {
      type: Object,
      default: () => ({
        type: 'text',
        val: 'Barcode Text',
        var: '',
      }),
    },
    type: {
      type: Object,
      default: () => ({
        val: 'CODE_128',
      }),
    },
    dot: {
      type: Object,
      default: () => ({
        val: 4,
      }),
    },
    showText: {
      type: Object,
      default: () => ({
        val: true,
      }),
    },
    varLength: {
      type: Object,
      default: () => ({
        val: 10,
      }),
    },
    height: {
      type: Number,
      default: 40,
    },
    rotate: {
      type: Number,
      default: 0,
    },
  });
  const emit = defineEmits(['barcodeChange']);

  const barcodeRef = ref();
  const pBarcodeRef = ref();
  const canvasRef = ref();
  const codeTpeMap = {
    CODE_128: 'CODE128',
    CODE_39: 'CODE39',
    EAN_13: 'EAN13',
    GS1_128: 'CODE128',
  };

  const id = computed(() => {
    return props.elId ? props.elId.split('.')[1] : '';
  });

  watch(
    () => [props.content.value, props.height],
    () => {
      console.log(props.content.value);
      createBarcode();
    },
  );

  onMounted(() => {
    createBarcode();
  });

  async function createBarcode() {
    await nextTick();
    const content = props.content.type === 'FIXED' ? props.content.value : '(01)00000000000000';
    // if (props.type.value !== 'GS1_128') {
    const barcodeID = `#barcode_${id.value}`;
    jsbarcode(barcodeID, content, {
      format: codeTpeMap[props.type.value],
      margin: 3,
      width: props.dot.value,
      height: props.height,
      displayValue: props.showText.value === true,
      textAlign: 'center',
      textMargin: 0,
      background: '#FFFFFF',
      font: 'Arial',
      fontOptions: '',
      fontSize: 16,
      lineColor: '#000000',
    });
    // } else {
    //   try {
    //     bwipjs.toCanvas(canvasRef.value, {
    //       bcid: codeTpeMap[props.type.value], // 条码类型：code128
    //       text: content, // 条码内容
    //       scale: props.dot.value, // 条码缩放比例
    //       includetext: props.showText.value === true,
    //       textxalign: 'center',
    //     });
    //   } catch (err) {
    //     console.warn(err);
    //   }
    // }
  }

  function loadImg() {
    const width = barcodeRef.value && barcodeRef.value.naturalWidth;
    const height = barcodeRef.value && barcodeRef.value.naturalHeight;
    const warpWidth = pBarcodeRef.value && pBarcodeRef.value.getAttribute('el-width');
    emit('barcodeChange', {
      width: width,
      rotateWidth: warpWidth,
      height: height,
    });
  }

  function generatetext(num) {
    let text = '';
    for (let i = 0; i < num; i++) {
      text += 'X';
    }
    return text;
  }
</script>

<style scoped lang="css">
  .p-barcode {
    display: flex;
    flex-direction: column;

    /* overflow: hidden; */
  }

  .p-barcode img {
    /* height: auto; */
    flex: 1;
    width: 100%;
  }

  p {
    margin: 0;

    /* flex: 1; */
  }
</style>
